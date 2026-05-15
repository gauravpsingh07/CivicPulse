# CivicPulse Deployment Guide

This guide prepares CivicPulse for a real Supabase + Vercel deployment. Do not commit real secrets. The app builds without Supabase credentials, but live data, Auth, Storage, Realtime, and Discord alerts require the setup below.

## 1. Create a Supabase Project

1. Create a new Supabase project.
2. Save the project URL.
3. Save the anon public key.
4. Keep the service-role key private. CivicPulse does not need it in browser code.

## 2. Run Database Migrations

Run these SQL files in order from `supabase/migrations`:

1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_seed_demo_data.sql`
4. `004_notification_issue_owner_insert.sql`
5. `005_admin_status_history_ownership.sql`

You can run them in the Supabase SQL editor or through the Supabase CLI after linking your project.

## 3. Create the `issue-images` Bucket

Create a Supabase Storage bucket:

- Name: `issue-images`
- Public bucket: yes for the MVP
- File size limit: `2097152` bytes
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

Optional bucket SQL:

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

## 4. Configure Storage Policies

The app uploads issue images from authenticated user sessions to:

```text
{userId}/{issueId}/{timestamp_filename}
```

Add Storage policies for `storage.objects` so authenticated users can upload and clean up files in their own prefix:

```sql
DROP POLICY IF EXISTS "issue_images_public_read" ON storage.objects;
CREATE POLICY "issue_images_public_read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'issue-images');

DROP POLICY IF EXISTS "issue_images_owner_insert" ON storage.objects;
CREATE POLICY "issue_images_owner_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'issue-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "issue_images_owner_update" ON storage.objects;
CREATE POLICY "issue_images_owner_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'issue-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'issue-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "issue_images_owner_delete" ON storage.objects;
CREATE POLICY "issue_images_owner_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'issue-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 5. Configure Auth

In Supabase Auth:

1. Enable email/password sign-in.
2. Set the Site URL:
   - Local: `http://localhost:3000`
   - Production: `https://your-vercel-domain.vercel.app`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-vercel-domain.vercel.app/auth/callback`

After registering your admin user, promote that profile:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'replace-with-auth-user-id';
```

## 6. Enable Supabase Realtime

In Supabase, open Database > Publications and enable Realtime for:

- `public.issues`
- `public.issue_status_history`
- `public.issue_comments`

Keep RLS enabled. Public clients rely on RLS and server-side visibility checks to avoid exposing private admin notes.

## 7. Add Environment Variables in Vercel

Add these Vercel environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
DISCORD_WEBHOOK_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL` are browser-visible.
- `DISCORD_WEBHOOK_URL` is server-only and optional.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and optional. Do not add a `NEXT_PUBLIC_` prefix.

## 8. Deploy via GitHub and Vercel

1. Push the repository to GitHub.
2. Import the GitHub repository in Vercel.
3. Keep the default Next.js build settings:
   - Install command: `npm install` or Vercel default
   - Build command: `npm run build`
   - Output: Next.js default
4. Add the environment variables.
5. Deploy.
6. After deployment, add the final Vercel URL to Supabase Auth redirect URLs.

## 9. Smoke Test Checklist

Run this checklist after deployment:

- Open `/api/health` and confirm `ok: true`.
- Open `/` and confirm landing page loads.
- Register a user.
- Log in.
- Create an issue from `/issues/new` with map coordinates.
- Create an issue with no image.
- Create an issue with a valid JPEG/PNG/WebP image under 2 MB.
- Confirm oversized or unsupported images are rejected.
- Open `/issues` and confirm public list data loads.
- Open `/issues/[id]` and confirm detail, timeline, comments, image, and map preview render.
- Open `/map` and confirm OpenStreetMap attribution is visible.
- Promote an admin profile in Supabase.
- Open `/admin` and confirm admin-only access.
- Update status on `/admin/issues/[id]`.
- Confirm public updates appear publicly and private notes remain admin-only.
- Confirm Realtime map updates or refresh prompts appear on relevant pages.
- Submit a high or critical issue and confirm Discord alert behavior if webhook is configured.
- Confirm notification log appears only in admin issue detail.
- Confirm admin analytics charts render with seeded/demo data.
- Run GitHub Actions validation on the pushed branch.
