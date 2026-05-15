-- CivicPulse Phase 3: allow the issue creation server action to record alert
-- attempts with the signed-in user's session. Reads stay admin-only.

DROP POLICY IF EXISTS "notifications_insert_for_owned_issue" ON public.notifications;
CREATE POLICY "notifications_insert_for_owned_issue"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  issue_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.issues
    WHERE issues.id = notifications.issue_id
      AND issues.reporter_id = auth.uid()
  )
);
