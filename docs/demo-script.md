# CivicPulse Demo Script

Use this script for a live walkthrough after Supabase, Storage, Realtime, and optional Discord alerts are configured. Do not claim a live demo exists until the deployment is actually available.

## 1. Open Landing Page

- Open `/`.
- Point out the project purpose, public-safe stats, feature framing, and free-tier stack.

## 2. Register or Log In

- Open `/register` and create a user, or open `/login` with an existing demo account.
- Show that protected routes require authentication.

## 3. Create an Issue

- Open `/issues/new`.
- Enter a title, description, category, urgency, optional address label, and map-selected location.
- Optionally upload a JPEG, PNG, or WebP image under 2 MB.
- Submit the report.

## 4. View Issue Detail

- After creation, open `/issues/[id]`.
- Show the issue image or empty image state, status badge, urgency, category, description, location metadata, status timeline, public updates, and map preview.

## 5. Open Public Issue List

- Open `/issues`.
- Demonstrate filters for status, category, urgency, date sort, and pagination.
- Note that private and rejected issues do not appear publicly.

## 6. Open Public Map

- Open `/map`.
- Demonstrate status/category/urgency filters.
- Open a marker popup and use the View Details link.
- Point out OpenStreetMap attribution and public-only marker visibility.

## 7. Admin Updates Status

- Sign in as an admin.
- Open `/admin`.
- Show summary cards, charts, recent activity, filters, pagination, and the mobile-friendly moderation queue if relevant.
- Open `/admin/issues/[id]`.
- Update the issue status and add a note.

## 8. Realtime Update or Refresh Prompt

- Keep `/map`, `/admin`, or `/issues/[id]` open in another tab.
- Create or update an issue.
- Show public map markers updating live, or show the refresh prompt on admin/detail pages.

## 9. High-Priority Discord Notification

- Create a high or critical urgency issue.
- If `DISCORD_WEBHOOK_URL` is configured, show the Discord alert.
- If no webhook is configured, show the skipped notification record in admin issue detail.

## 10. Admin Analytics Updates

- Return to `/admin`.
- Show open, in-progress, resolved/closed, high/critical, and average resolution cards.
- Show status, category, and urgency charts.
- Show recent status activity from `issue_status_history`.

## Wrap-Up

- Mention RLS and server-side admin checks.
- Mention build-safe missing-env behavior.
- Mention free-tier-friendly choices: OpenStreetMap, capped image uploads, pagination, scoped Realtime, and Discord webhook alerts.
