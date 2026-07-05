-- CivicPulse Phase 7: community upvotes ("I'm also affected").
-- One vote per user per issue. Counts are denormalized onto issues so public
-- reads and Realtime payloads carry them without extra queries. Vote rows are
-- private: users can only read their own votes; counts are the public signal.

CREATE TABLE IF NOT EXISTS public.issue_upvotes (
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (issue_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_issue_upvotes_issue_id
  ON public.issue_upvotes(issue_id);

ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS upvote_count INTEGER NOT NULL DEFAULT 0;

-- Recount runs as definer and marks itself so the restricted-fields trigger
-- can tell a trigger-driven count update apart from a direct client write.
CREATE OR REPLACE FUNCTION public.refresh_issue_upvote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_issue_id UUID;
BEGIN
  target_issue_id := coalesce(NEW.issue_id, OLD.issue_id);

  PERFORM set_config('civicpulse.upvote_recount', '1', true);

  UPDATE public.issues
  SET upvote_count = (
    SELECT count(*)
    FROM public.issue_upvotes
    WHERE issue_upvotes.issue_id = target_issue_id
  )
  WHERE id = target_issue_id;

  PERFORM set_config('civicpulse.upvote_recount', '', true);

  RETURN coalesce(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS refresh_issue_upvote_count ON public.issue_upvotes;
CREATE TRIGGER refresh_issue_upvote_count
AFTER INSERT OR DELETE ON public.issue_upvotes
FOR EACH ROW
EXECUTE FUNCTION public.refresh_issue_upvote_count();

-- Extend the Phase 1 field guard: only admins, the service role, or the
-- recount trigger may change upvote_count.
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

  IF OLD.upvote_count IS DISTINCT FROM NEW.upvote_count
    AND coalesce(current_setting('civicpulse.upvote_recount', true), '') <> '1' THEN
    RAISE EXCEPTION 'upvote_count is maintained by the upvote trigger';
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

-- Recreate the Phase 7 nearby function so its rows carry upvote_count too
-- (the return type changes, so the old signature must be dropped first).
DROP FUNCTION IF EXISTS public.nearby_public_issues;

CREATE FUNCTION public.nearby_public_issues(
  origin_lat DOUBLE PRECISION,
  origin_lng DOUBLE PRECISION,
  search_text TEXT DEFAULT NULL,
  filter_status public.issue_status DEFAULT NULL,
  filter_category public.issue_category DEFAULT NULL,
  filter_urgency public.issue_urgency DEFAULT NULL,
  max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  reporter_id UUID,
  title TEXT,
  description TEXT,
  category public.issue_category,
  urgency public.issue_urgency,
  status public.issue_status,
  latitude NUMERIC,
  longitude NUMERIC,
  address_label TEXT,
  image_path TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  upvote_count INTEGER,
  distance_meters DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    i.id,
    i.reporter_id,
    i.title,
    i.description,
    i.category,
    i.urgency,
    i.status,
    i.latitude,
    i.longitude,
    i.address_label,
    i.image_path,
    i.is_public,
    i.created_at,
    i.updated_at,
    i.resolved_at,
    i.upvote_count,
    2 * 6371000 * asin(
      sqrt(
        power(sin(radians((i.latitude::double precision - origin_lat) / 2)), 2)
        + cos(radians(origin_lat))
          * cos(radians(i.latitude::double precision))
          * power(sin(radians((i.longitude::double precision - origin_lng) / 2)), 2)
      )
    ) AS distance_meters
  FROM public.issues i
  WHERE i.is_public = true
    AND i.status <> 'rejected'
    AND (
      search_text IS NULL
      OR btrim(search_text) = ''
      OR i.search_tsv @@ websearch_to_tsquery('english', search_text)
    )
    AND (filter_status IS NULL OR i.status = filter_status)
    AND (filter_category IS NULL OR i.category = filter_category)
    AND (filter_urgency IS NULL OR i.urgency = filter_urgency)
  ORDER BY distance_meters ASC
  LIMIT LEAST(GREATEST(coalesce(max_results, 50), 1), 100);
$$;

REVOKE ALL ON FUNCTION public.nearby_public_issues FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.nearby_public_issues TO anon;
GRANT EXECUTE ON FUNCTION public.nearby_public_issues TO authenticated;
GRANT EXECUTE ON FUNCTION public.nearby_public_issues TO service_role;

ALTER TABLE public.issue_upvotes ENABLE ROW LEVEL SECURITY;

-- Vote privacy: users see only their own vote rows. Aggregate counts are
-- exposed through issues.upvote_count instead.
DROP POLICY IF EXISTS "upvotes_select_own" ON public.issue_upvotes;
CREATE POLICY "upvotes_select_own"
ON public.issue_upvotes
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "upvotes_insert_own_on_public_issues" ON public.issue_upvotes;
CREATE POLICY "upvotes_insert_own_on_public_issues"
ON public.issue_upvotes
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.issues
    WHERE issues.id = issue_upvotes.issue_id
      AND issues.is_public = true
      AND issues.status <> 'rejected'
  )
);

DROP POLICY IF EXISTS "upvotes_delete_own" ON public.issue_upvotes;
CREATE POLICY "upvotes_delete_own"
ON public.issue_upvotes
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
