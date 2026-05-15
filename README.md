# CivicPulse | Full-Stack Geospatial Issue Reporting Platform

CivicPulse is a portfolio-grade civic reporting platform for community issues such as potholes, broken streetlights, fallen trees, unsafe sidewalks, water leaks, trash overflow, and accessibility problems.

This repository is currently at **Phase 6**: project scaffold, shared UI, docs, CI, Supabase SQL migrations, RLS policies, seed data, safe Supabase helpers, manual database types, Zod validators, Supabase Auth, protected routes, authenticated issue submission, public browsing/map views, and server-protected admin moderation.

## Problem

Local issue reporting is often scattered across phone calls, forms, and disconnected status updates. Residents need a simple way to report problems with location context, while admins need a structured workflow for triage and public transparency.

## Solution

CivicPulse will combine map-selected reports, public tracking, authenticated dashboards, admin moderation, realtime updates, image storage, analytics, and high-priority alerts using free-tier-friendly services.

## Tech Stack

- Next.js App Router with TypeScript
- Tailwind CSS with shadcn/ui-inspired local components
- Supabase Auth, PostgreSQL, Storage, Realtime, and RLS
- Leaflet and OpenStreetMap
- Zod validation
- Recharts analytics
- Vitest, React Testing Library, and jsdom
- GitHub Actions CI
- Vercel deployment readiness
- Discord webhook notifications

## Free-Tier Strategy

- Use OpenStreetMap instead of paid map APIs.
- Cap image uploads at 2 MB and allow only JPEG, PNG, and WebP.
- Store image paths in PostgreSQL instead of image blobs.
- Use pagination or limits for growing issue lists.
- Subscribe to Supabase Realtime only on pages that need live updates.
- Keep high-priority alerts on Discord webhooks instead of paid email services.

## Planned Feature Checklist

- [x] Phase 0 project scaffold, UI foundation, docs, CI, and tests
- [x] Supabase schema, RLS policies, storage bucket notes, and seed data
- [x] Supabase Auth login/register/logout and protected dashboard
- [x] Issue report form with validation, map picker, and image upload guardrails
- [x] Public issue list, detail pages, filters, status badges, and timeline
- [x] Leaflet public map with OpenStreetMap attribution
- [x] Admin dashboard, status updates, history, and moderation workflow
- [ ] Supabase Realtime updates for map, admin, and issue detail pages
- [ ] Discord alert workflow for high and critical reports
- [ ] Analytics cards and charts
- [ ] Deployment docs, demo script, screenshots, and resume bullets

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The app builds without Supabase credentials. Copy `.env.example` to `.env.local` when you are ready to connect a real Supabase project.

## Supabase Setup

Supabase setup source files were added in Phase 1. Manual project setup still requires:

- Create a Supabase project.
- Run migrations in `supabase/migrations`.
- Create an `issue-images` storage bucket.
- Configure Auth.
- Add public URL and anon key to local and Vercel environment variables.
- Keep service-role keys server-only.
- Add `/auth/callback` to local and deployed Auth redirect URLs.
- Promote an admin by updating `profiles.role` manually in SQL after signup.
- Create the `issue-images` storage bucket.
- Optionally add `DISCORD_WEBHOOK_URL` server-side for high and critical issue alerts.

## Current Demo Flow

The current local demo flow can show:

1. Open the landing page.
2. Register or log in.
3. Create an issue from `/issues/new` with title, description, category, urgency, optional address label, optional image, and map-selected coordinates.
4. Redirect to the `/issues/[id]` detail page after successful creation.
5. Browse `/issues` with status, category, urgency, date sort, and pagination controls.
6. Open an issue detail page to view the image, public status timeline, public comments/updates, location metadata, and Leaflet map preview.
7. Open `/map` to view public, non-rejected issues as status/urgency styled markers with popups and filters.
8. Open `/admin` as an admin to filter the moderation queue and view summary cards.
9. Open `/admin/issues/[id]` to update status, write status history, post public updates, and save private admin notes.
10. Trigger a skipped, sent, or failed notification record for high and critical reports.

Later phases add realtime updates and analytics.

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

The GitHub Actions workflow runs the same validation commands on push and pull request.

## Documentation

- `docs/architecture.md` explains the target architecture and Phase 0 boundaries.
- `docs/free-tier-guardrails.md` records the cost-control rules from the source-of-truth plan.
- `docs/supabase-setup.md` explains how to run migrations, configure Auth, create the `issue-images` bucket, and promote an admin user.

## Public Browsing Flow

- `/issues` fetches only public, non-rejected issues from Supabase.
- Filters support status, category, urgency, and newest/oldest date sorting.
- Pagination limits reads so the public page stays free-tier friendly.
- `/issues/[id]` enforces visibility on the server before rendering details.
- Public visitors see only public comments and status history for visible issues.
- Private admin notes are not shown to normal users.

## Public Map Flow

- `/map` fetches only public, non-rejected issues from Supabase.
- Filters support status, category, and urgency.
- Marker color reflects status; high and critical urgency markers receive stronger emphasis.
- Popups show title, category, status, urgency, created date, and a detail-page link.
- Map reads are capped for free-tier safety and use OpenStreetMap attribution.

## Admin Moderation Flow

- `/admin` is protected by a server-side `profiles.role = admin` check.
- Admin filters support status, category, urgency, and date sorting.
- Summary cards show open, in-progress, resolved/closed, and high/critical counts.
- `/admin/issues/[id]` shows issue details, image, map preview, reporter, status history, public comments, and private admin notes.
- Status updates run through a server action that re-checks admin role before updating `issues`.
- The reopen rule is explicit: resolved/closed sets `resolved_at`; open/in-progress clears it; duplicate/rejected preserve it.
- Public updates are visible on public detail pages; private admin notes stay admin-only.

## Screenshot Checklist

Screenshots are not committed yet. Capture these after the app is connected to Supabase seed/demo data:

- `landing.png`
- `new-report.png`
- `issue-list.png`
- `issue-detail.png`
- `public-map.png`
- `admin-dashboard.png` after Phase 6
- `analytics.png` after Phase 9
- `discord-alert.png` when the optional webhook is configured

## Environment Variables

See `.env.example` for the safe variable template:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DISCORD_WEBHOOK_URL`
- `NEXT_PUBLIC_APP_URL`
