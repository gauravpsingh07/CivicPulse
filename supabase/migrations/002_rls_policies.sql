-- CivicPulse Phase 1: Row Level Security policies.
-- Admin checks are intentionally based on public.profiles.role = 'admin'.
-- Normal users cannot browse notifications or private admin comments.

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO service_role;

CREATE OR REPLACE FUNCTION public.protect_issue_restricted_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.current_user_is_admin() THEN
    RETURN NEW;
  END IF;

  IF OLD.reporter_id IS DISTINCT FROM NEW.reporter_id
    OR OLD.status IS DISTINCT FROM NEW.status
    OR OLD.urgency IS DISTINCT FROM NEW.urgency
    OR OLD.resolved_at IS DISTINCT FROM NEW.resolved_at THEN
    RAISE EXCEPTION
      'Only admins can change reporter_id, status, urgency, or resolved_at';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_issue_restricted_fields ON public.issues;
CREATE TRIGGER protect_issue_restricted_fields
BEFORE UPDATE ON public.issues
FOR EACH ROW
EXECUTE FUNCTION public.protect_issue_restricted_fields();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "profiles_insert_own_user_profile" ON public.profiles;
CREATE POLICY "profiles_insert_own_user_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid() AND role = 'user');

DROP POLICY IF EXISTS "profiles_update_own_user_profile" ON public.profiles;
CREATE POLICY "profiles_update_own_user_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND role = 'user');

DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (true);

DROP POLICY IF EXISTS "issues_select_public_own_or_admin" ON public.issues;
CREATE POLICY "issues_select_public_own_or_admin"
ON public.issues
FOR SELECT
TO anon, authenticated
USING (
  (is_public = true AND status <> 'rejected')
  OR reporter_id = auth.uid()
  OR public.current_user_is_admin()
);

DROP POLICY IF EXISTS "issues_insert_own_reports" ON public.issues;
CREATE POLICY "issues_insert_own_reports"
ON public.issues
FOR INSERT
TO authenticated
WITH CHECK (
  reporter_id = auth.uid()
  AND status = 'open'
  AND resolved_at IS NULL
);

DROP POLICY IF EXISTS "issues_update_own_open_reports" ON public.issues;
CREATE POLICY "issues_update_own_open_reports"
ON public.issues
FOR UPDATE
TO authenticated
USING (reporter_id = auth.uid() AND status = 'open')
WITH CHECK (reporter_id = auth.uid() AND status = 'open');

DROP POLICY IF EXISTS "issues_admin_update_all" ON public.issues;
CREATE POLICY "issues_admin_update_all"
ON public.issues
FOR UPDATE
TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (true);

DROP POLICY IF EXISTS "history_select_public_own_or_admin" ON public.issue_status_history;
CREATE POLICY "history_select_public_own_or_admin"
ON public.issue_status_history
FOR SELECT
TO anon, authenticated
USING (
  public.current_user_is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.issues
    WHERE issues.id = issue_status_history.issue_id
      AND (
        (issues.is_public = true AND issues.status <> 'rejected')
        OR issues.reporter_id = auth.uid()
      )
  )
);

DROP POLICY IF EXISTS "history_admin_insert" ON public.issue_status_history;
CREATE POLICY "history_admin_insert"
ON public.issue_status_history
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "comments_select_public_own_or_admin" ON public.issue_comments;
CREATE POLICY "comments_select_public_own_or_admin"
ON public.issue_comments
FOR SELECT
TO anon, authenticated
USING (
  public.current_user_is_admin()
  OR author_id = auth.uid()
  OR (
    is_public = true
    AND EXISTS (
      SELECT 1
      FROM public.issues
      WHERE issues.id = issue_comments.issue_id
        AND (
          (issues.is_public = true AND issues.status <> 'rejected')
          OR issues.reporter_id = auth.uid()
        )
    )
  )
);

DROP POLICY IF EXISTS "comments_insert_own_public_or_admin" ON public.issue_comments;
CREATE POLICY "comments_insert_own_public_or_admin"
ON public.issue_comments
FOR INSERT
TO authenticated
WITH CHECK (
  public.current_user_is_admin()
  OR (
    author_id = auth.uid()
    AND is_public = true
    AND EXISTS (
      SELECT 1
      FROM public.issues
      WHERE issues.id = issue_comments.issue_id
        AND issues.reporter_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "comments_update_own_public_or_admin" ON public.issue_comments;
CREATE POLICY "comments_update_own_public_or_admin"
ON public.issue_comments
FOR UPDATE
TO authenticated
USING (
  public.current_user_is_admin()
  OR (author_id = auth.uid() AND is_public = true)
)
WITH CHECK (
  public.current_user_is_admin()
  OR (author_id = auth.uid() AND is_public = true)
);

DROP POLICY IF EXISTS "notifications_admin_select" ON public.notifications;
CREATE POLICY "notifications_admin_select"
ON public.notifications
FOR SELECT
TO authenticated
USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "notifications_admin_update" ON public.notifications;
CREATE POLICY "notifications_admin_update"
ON public.notifications
FOR UPDATE
TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());
