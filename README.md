# CivicPulse

Full-stack geospatial community issue reporting platform built with Next.js, TypeScript, Supabase, PostgreSQL, Leaflet, OpenStreetMap, Recharts, GitHub Actions, and Vercel.

## Problem

Local issue reporting is often scattered across phone calls, one-off forms, and disconnected status updates. Residents need a simple way to report civic problems with location context, while admins need a secure workflow for triage, public updates, history, analytics, and urgent alerts.

## Solution

CivicPulse lets authenticated users submit public civic reports with a title, description, category, urgency, optional image, and map-selected latitude/longitude. Public visitors can browse visible issues on a list and map. Admins can moderate every issue, update status, add public updates or private notes, view notification logs, and monitor analytics.

## Live Demo

Live demo: https://civic-pulse-sandy.vercel.app

GitHub repository: https://github.com/gauravpsingh07/CivicPulse

Note: the demo database runs on Supabase's free tier, which pauses projects after ~7 days without activity. A scheduled GitHub Actions workflow (`.github/workflows/keep-alive.yml`) pings `/api/health` twice a week to keep it awake. If data still fails to load, the project can be restored in about a minute from the Supabase dashboard.

## Features

- Email/password authentication with Supabase Auth.
- Protected issue submission at `/issues/new`.
- Zod validation for auth, issue fields, filters, coordinates, and images.
- Address, landmark, street, city, or ZIP search helper that recenters the map before the user clicks the exact issue location.
- Optional issue image upload to Supabase Storage with JPEG, PNG, WebP, and 2 MB limits.
- Public issue list with status, category, urgency, date sort, and pagination.
- Public issue detail pages with image, status timeline, public comments, metadata, and Leaflet map preview.
- Public `/map` with Leaflet, OpenStreetMap attribution, filters, marker popups, marker styling, stats, and scoped Realtime updates.
- Server-protected `/admin` dashboard with moderation queue, filters, pagination, analytics cards, Recharts visualizations, and recent activity.
- Admin issue detail with reporter info, status history, public comments, private notes, notification logs, map preview, and status update dialog.
- Server-side admin actions for status updates and comments.
- Discord webhook alert workflow for high and critical issues.
- Supabase Realtime refresh prompts for admin/detail pages and live marker updates for the public map.
- Health route at `/api/health` that reports app/public-env readiness plus a live database connectivity probe (HTTP 503 when the database is unreachable) without exposing secrets.
- Loading, empty, missing-env, unauthorized, and not-found states for major flows.
- GitHub Actions CI for lint, typecheck, tests, and build.

## Tech Stack

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS, local shadcn/ui-style primitives
- **Backend:** Next.js Server Actions and Route Handlers
- **Database:** Supabase PostgreSQL with SQL migrations and RLS policies
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Realtime:** Supabase Realtime
- **Maps:** Leaflet, react-leaflet, OpenStreetMap tiles
- **Validation:** Zod
- **Charts:** Recharts
- **Testing:** Vitest, React Testing Library, jsdom
- **CI/CD:** GitHub Actions, Vercel deployment
- **Notifications:** Discord webhook

## Architecture Overview

CivicPulse uses Next.js App Router for public pages, protected pages, server-rendered data fetching, and server actions. Supabase provides Auth, PostgreSQL, Storage, and Realtime. Browser code uses only `NEXT_PUBLIC_*` Supabase values. Server-only helpers read optional server secrets such as `DISCORD_WEBHOOK_URL` and `SUPABASE_SERVICE_ROLE_KEY`, and those values are never required for the app to build.

Core routes:

- `/` - landing page with public-safe aggregate stats.
- `/login` and `/register` - Supabase Auth forms.
- `/dashboard` - authenticated user entry point.
- `/issues` - public issue list.
- `/issues/[id]` - public issue detail with visibility checks.
- `/issues/new` - authenticated issue submission.
- `/map` - public issue map.
- `/admin` - server-protected admin dashboard.
- `/admin/issues/[id]` - server-protected moderation page.
- `/api/health` - basic JSON health check.

## Database Schema Summary

SQL migrations live in `supabase/migrations` and should be run in order.

- `profiles` - user profile and role (`user` or `admin`).
- `issues` - civic reports with reporter, title, description, category, urgency, status, coordinates, optional address label, optional image path, public visibility, timestamps, and resolution timestamp.
- `issue_status_history` - status transitions with `from_status`, `to_status`, changed-by user, optional note, and timestamp.
- `issue_comments` - public updates and private admin notes.
- `notifications` - Discord alert attempts with channel, event type, status, error message, and sent timestamp.

## Security and RLS

- Public users can read only `issues.is_public = true` issues that are not rejected.
- Public issue details show only public comments.
- Private admin notes and notification internals are available only through server-protected admin routes.
- Admin pages call server-side `requireAdmin`, which verifies `profiles.role = admin`.
- Admin mutations re-check admin role server-side before changing status or writing notes.
- Issue creation requires an authenticated user and inserts `reporter_id = auth.uid()`.
- Browser/client code never uses the Supabase service-role key or Discord webhook URL.
- Realtime subscriptions are page-scoped and do not subscribe globally.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The app builds without real Supabase credentials. With empty Supabase env vars, data-backed flows show setup or disabled states instead of crashing.

## Environment Variables

See `.env.example` for the safe template.

Required for connected Supabase usage:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

Optional server-only values:

- `DISCORD_WEBHOOK_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Never prefix server-only secrets with `NEXT_PUBLIC_`.

## Supabase Setup

Detailed setup is in [docs/deployment.md](docs/deployment.md) and [docs/supabase-setup.md](docs/supabase-setup.md).

Short version:

1. Create a Supabase project.
2. Run migrations `001` through `005` from `supabase/migrations`.
3. Create the `issue-images` bucket.
4. Configure storage policies for authenticated user uploads.
5. Enable email/password Auth and callback URLs.
6. Enable Realtime for `public.issues`, `public.issue_status_history`, and `public.issue_comments`.
7. Add public Supabase env vars locally and in Vercel.
8. Register a user and promote that profile to `admin` for moderation.

## Discord Webhook Setup

Discord alerts are optional. Issue creation still succeeds without a webhook.

1. Create a Discord channel webhook.
2. Add `DISCORD_WEBHOOK_URL` as a server-only local/Vercel environment variable.
3. Set `NEXT_PUBLIC_APP_URL` so Discord links point to the deployed app.
4. Submit a high or critical issue.
5. Verify the alert in Discord and the notification row in `/admin/issues/[id]`.

## Realtime Setup

In Supabase, open Database > Publications and enable Realtime for:

- `public.issues`
- `public.issue_status_history`
- `public.issue_comments`

The app uses Realtime only on selected pages:

- `/map` updates public markers while mounted.
- `/admin` shows a refresh prompt for issue changes.
- `/issues/[id]` and `/admin/issues/[id]` show refresh prompts for selected issue changes.

## Deployment on Vercel

Use [docs/deployment.md](docs/deployment.md) for the full checklist.

High-level flow:

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Add the environment variables listed above.
4. Deploy.
5. Add deployed Auth callback URLs in Supabase.
6. Run the smoke test checklist.

Production deployment: https://civic-pulse-sandy.vercel.app

## Demo Flow

Detailed script: [docs/demo-script.md](docs/demo-script.md).

1. Open the landing page.
2. Register or log in.
3. Create an issue with map location and optional image.
4. View the issue detail page.
5. Browse the public issue list.
6. Open the public map.
7. Sign in as an admin and update status.
8. Observe map updates or refresh prompts from Realtime.
9. Submit a high-priority issue and confirm Discord notification behavior.
10. Review admin analytics.

## Screenshots

Screenshots are intentionally not included in this repository. The deployed app can be reviewed directly through the live demo.

## Testing and CI

Local validation:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

GitHub Actions runs the same validation commands on push and pull request. The workflow uses `npm ci`, project scripts, and no paid external services.

Current test coverage includes validators, auth helpers, image validation, filter parsing, status helpers, map marker helpers, realtime merge helpers, analytics calculations, Discord payload helpers, the health route, and core UI rendering.

## Future Improvements

- User dashboard for viewing a reporter's own submitted issues.
- Optional private storage bucket with signed image URLs.
- Marker clustering for larger public datasets.
- Richer analytics by neighborhood/date range once enough data exists.
- Additional notification adapters if a future deployment has approved infrastructure.
