# CivicPulse Architecture

CivicPulse is planned as a full-stack Next.js App Router application backed by Supabase. Phase 0 created the local scaffolding, typed constants, reusable UI primitives, documentation, and CI workflow. Phase 1 added the SQL schema, RLS policies, seed data, Supabase helper files, manual database types, and Zod validators. Phase 2 added email/password auth actions, profile utilities, proxy session refresh, protected route shells, and role-aware navigation. Phase 3 added authenticated issue submission, an SSR-safe Leaflet map picker, optional Storage image upload, and a server-only Discord notification hook. Phase 4 adds public issue list/detail pages, filters, pagination, public comments, status timeline rendering, and a client-only map preview. Realtime subscriptions and full admin workflows are intentionally deferred to later phases.

## Target System

Browser and mobile browser clients render Next.js pages hosted on Vercel. Public pages will read approved civic issue data. Authenticated users will submit reports and view their own dashboard. Admins will manage every report, status update, and analytics view.

Supabase provides:

- Auth for email/password sessions.
- PostgreSQL for relational issue, profile, comment, status history, and notification tables.
- Row Level Security for database-enforced access rules.
- Storage for issue images.
- Realtime for live issue create/update events.

Leaflet and OpenStreetMap provide the public map and map picker without Google Maps billing. Recharts will render analytics once issue data exists.

## Current Boundaries

- No Supabase project is required for the app to build.
- Browser helper code only reads `NEXT_PUBLIC_*` Supabase values.
- Service-role and webhook secrets are referenced only from server-only helper code.
- Leaflet is mounted only through client-only dynamic imports for the report map picker and issue detail map preview.
- Public issue browsing is server-rendered and enforces `is_public = true` plus non-rejected visibility before showing public data.
- Protected routes use server-side checks, not client navigation state, before rendering dashboard/admin/report shells.

## Planned Data Flow

1. A signed-in user submits an issue with validated fields and optional image metadata.
2. Server-side logic verifies the session and writes to Supabase under RLS protection.
3. Images are uploaded to the `issue-images` bucket with a user and issue scoped path.
4. Public pages read approved public issues with filters and pagination.
5. Admin actions verify role server-side before updating status and writing history.
6. High or critical urgency reports can trigger a Discord webhook and log notification status.
7. Map, admin, and detail pages subscribe to relevant Supabase Realtime changes only while mounted.

## Repository Shape

- `app/` - App Router pages and route handlers.
- `components/` - reusable layout, issue, map, admin, analytics, and UI components.
- `lib/` - shared utilities, constants, validators, Supabase helpers, and actions.
- `supabase/migrations/` - SQL migrations for schema, RLS, and seed data.
- `tests/` - unit and component tests.
- `.github/workflows/` - CI validation.
