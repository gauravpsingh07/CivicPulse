# Supabase Setup

Phase 1 adds the database schema, RLS policies, seed data, typed helpers, and validation layer. The app still builds without real Supabase credentials.

## 1. Create a Supabase Project

1. Create a new Supabase project from the Supabase dashboard.
2. Save the project URL and anon public key.
3. Keep the service-role key private. It must never be used in browser/client code.

## 2. Run Migrations

Run the SQL files in this order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_seed_demo_data.sql`
4. `supabase/migrations/004_notification_issue_owner_insert.sql`

You can run them through the Supabase SQL editor or the Supabase CLI after linking the project.

## 3. Enable Auth

Use Supabase Auth email/password for the MVP. Phase 2 will wire login, register, logout, profile creation, and route protection.

Recommended settings:

- Email/password provider enabled.
- Confirm email depending on your demo preference.
- Site URL set to your local or deployed app URL.
- Redirect URLs include local development and Vercel deployment URLs.
- Include the callback path used by Phase 2:
  - `http://localhost:3000/auth/callback`
  - `https://your-vercel-domain.vercel.app/auth/callback`

Phase 2 behavior:

- `/login` signs in with email/password.
- `/register` signs up with email/password and stores `full_name` in auth metadata.
- A profile row is created after signup when a session is available, or on the first authenticated request after login.
- `/dashboard` and `/issues/new` require an authenticated user.
- `/admin` requires a server-side profile check where `profiles.role = 'admin'`.
- Middleware refreshes the Supabase session and redirects protected routes when needed.

Phase 3 behavior:

- `/issues/new` is a protected report form.
- Reports insert into `public.issues` with `reporter_id = auth.uid()`, `status = open`, and `is_public = true`.
- Optional images upload to `issue-images` at `{userId}/{issueId}/{timestamp_filename}`.
- PostgreSQL stores only the `image_path` metadata.
- High and critical urgency reports call the server-only Discord helper.
- Missing `DISCORD_WEBHOOK_URL` records a skipped alert attempt when the notification insert policy is installed.

Phase 4 behavior:

- `/issues` reads public issues with `is_public = true` and `status <> rejected`.
- Public list filters support status, category, urgency, and newest/oldest date sort.
- Pagination limits public reads to a small page size.
- `/issues/[id]` re-checks visibility server-side before rendering detail data.
- Public issue details show status history and only public comments for normal visitors.
- Admin/private comments remain hidden from normal users.

Phase 5 behavior:

- `/map` reads public issues with `is_public = true` and `status <> rejected`.
- Public map filters support status, category, and urgency.
- Map marker queries are capped for free-tier usage.
- Leaflet renders public markers in the browser only; Supabase credentials are not required for build.

## 4. Create the `issue-images` Storage Bucket

Create a bucket named `issue-images`.

Recommended MVP settings:

- Public bucket: yes, for simple public civic issue images.
- Max intended file size: 2 MB.
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Path convention: `{userId}/{issueId}/{timestamp}.webp`.

If you prefer stronger privacy later, switch to a private bucket and render issue images through signed URLs.

Optional bucket SQL for Supabase projects that support storage table edits:

```sql
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'issue-images',
  'issue-images',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
```

## 5. Add Environment Variables

Local development:

1. Copy `.env.example` to `.env.local`.
2. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
3. Leave server-only values empty unless you need them:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DISCORD_WEBHOOK_URL`

Vercel:

1. Add the same public variables to the project environment.
2. Add server-only values only to server environments.
3. Never prefix service-role or Discord webhook secrets with `NEXT_PUBLIC_`.

## 6. Configure Discord Alerts

Discord alerts are optional. Issue creation still succeeds when no webhook is configured.

1. Create a Discord channel webhook.
2. Add the webhook URL as a server-only environment variable:
   - Local: `DISCORD_WEBHOOK_URL=...` in `.env.local`
   - Vercel: add `DISCORD_WEBHOOK_URL` without the `NEXT_PUBLIC_` prefix
3. Submit a high or critical urgency issue.
4. Check `public.notifications` as an admin to verify `sent`, `failed`, or `skipped` status.

## 7. Create an Admin User

After a user registers in Phase 2, promote that user manually from the Supabase SQL editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'replace-with-auth-user-id';
```

Verify:

```sql
SELECT id, full_name, role, created_at
FROM public.profiles
WHERE role = 'admin';
```

## 8. Replace Manual Types Later

Phase 1 includes manual TypeScript database types in `lib/types/database.ts`. After a real Supabase project exists, replace or verify them with generated types:

```bash
supabase gen types typescript --project-id your-project-id > lib/types/database.ts
```

Review generated output before replacing custom helper aliases.
