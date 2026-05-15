-- CivicPulse Phase 6: the admin server action owns status-history writes.
-- Phase 1 created a database trigger as an early safety net. Phase 6 needs
-- exact changed_by/from/to/note values from the admin moderation action, so the
-- trigger is removed to avoid duplicate history rows.

DROP TRIGGER IF EXISTS record_issue_status_change ON public.issues;
