# Final QA Checklist

Use this checklist before a final push, deployment, or demo recording. Do not mark an item complete unless it has been verified against a real local or deployed app with appropriate Supabase demo data.

## Core Smoke Tests

- [ ] Landing loads at `/`.
- [ ] `/api/health` returns `ok: true` and does not expose server-only secrets.
- [ ] Register works with Supabase Auth.
- [ ] Login works with Supabase Auth.
- [ ] Logout clears the user session and updates navigation.
- [ ] Protected routes redirect unauthenticated users to login.
- [ ] Non-admin users cannot open `/admin` and land on `/unauthorized`.

## Issue Submission

- [ ] Create an issue from `/issues/new` with title, description, category, urgency, optional address label, and map-selected coordinates.
- [ ] Create an issue without an image.
- [ ] Create an issue with a valid JPEG, PNG, or WebP image under 2 MB.
- [ ] Oversized images are rejected before upload.
- [ ] Unsupported image types are rejected before upload.
- [ ] Successful issue creation redirects to `/issues/[id]`.

## Public Views

- [ ] Public issue list loads at `/issues`.
- [ ] Public issue list filters by status, category, urgency, and date sort.
- [ ] Public issue list pagination works.
- [ ] Rejected or private issues are not visible publicly.
- [ ] Issue detail shows status badge, urgency, category, description, timestamps, timeline, public comments, and map preview.
- [ ] Private admin notes are not visible on public issue detail pages.

## Map

- [ ] Public map loads at `/map` without SSR errors.
- [ ] OpenStreetMap attribution is visible.
- [ ] Public marker styling reflects status and high/critical urgency.
- [ ] Marker popup shows title, category, status, urgency, created date, and View Details link.
- [ ] Map filters by status, category, and urgency.
- [ ] Map empty and missing-env states are clear.

## Admin Workflow

- [ ] Admin dashboard loads only for admin users.
- [ ] Admin queue filters by status, category, urgency, and date sort.
- [ ] Admin queue pagination works.
- [ ] Admin issue detail shows reporter info, image, map preview, timeline, comments, private notes, and notification log.
- [ ] Admin status update writes an `issue_status_history` row.
- [ ] Moving to resolved or closed sets `resolved_at`.
- [ ] Reopening to open or in progress clears `resolved_at`.
- [ ] Public admin updates appear on public issue detail.
- [ ] Private admin notes stay admin-only.

## Realtime

- [ ] `/map` updates public markers or removes private/rejected markers while mounted.
- [ ] `/admin` shows a refresh prompt when issue rows change.
- [ ] `/issues/[id]` shows a refresh prompt when selected issue data changes.
- [ ] `/admin/issues/[id]` shows a refresh prompt when selected issue data changes.
- [ ] Realtime indicators show connected, reconnecting, or disabled states correctly.

## Notifications

- [ ] High urgency issue attempts a Discord notification.
- [ ] Critical urgency issue attempts a Discord notification.
- [ ] Missing `DISCORD_WEBHOOK_URL` records `skipped` and does not block issue creation.
- [ ] Failed webhook requests record `failed` with an error message.
- [ ] Successful webhook requests record `sent` with `sent_at`.
- [ ] Notification logs are visible only on admin issue detail pages.

## Analytics

- [ ] Admin summary cards show open, in-progress, resolved/closed, high/critical, and average resolution time.
- [ ] Status chart renders with demo data.
- [ ] Category chart renders with demo data.
- [ ] Urgency chart renders with demo data.
- [ ] Recent activity feed shows issue title, status transition, actor, safe note, and timestamp.

## Mobile and Accessibility

- [ ] Landing page is usable on mobile.
- [ ] Issue form is usable on mobile.
- [ ] Public map page is usable on mobile.
- [ ] Admin table switches to mobile card layout.
- [ ] Issue detail pages do not overflow on mobile.
- [ ] Keyboard focus is visible on buttons, links, inputs, selects, and textareas.
- [ ] Dialogs and forms can be operated with a keyboard.
- [ ] Issue images have meaningful alt text.

## Vercel Deployment Smoke Test

- [ ] Vercel build succeeds.
- [ ] Production environment variables are set in Vercel.
- [ ] Supabase Auth production callback URL is configured.
- [ ] `/api/health` works in production.
- [ ] Landing, issue list, map, login, register, issue creation, and admin dashboard load in production.
- [ ] No service-role key, Discord webhook URL, or other server-only secret is visible in browser code, page source, logs, screenshots, or public docs.
