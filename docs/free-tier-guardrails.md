# Free-Tier Guardrails

CivicPulse is designed for portfolio-scale usage on free-friendly services. These guardrails come from the source-of-truth plan and should stay visible as the app grows.

## Services

- Supabase: use PostgreSQL, Auth, Storage, and Realtime carefully. Keep demo data small and avoid global realtime subscriptions.
- Vercel: keep server work short-lived and deployment-friendly.
- OpenStreetMap: show attribution, do not bulk download tiles, and keep map defaults reasonable.
- GitHub Actions: run focused validation commands only.
- Discord: use a webhook for high-priority alerts instead of paid email infrastructure.

## Product Limits

- Image uploads are capped at 2 MB.
- Accepted image types are JPEG, PNG, and WebP.
- Store image paths or public URLs in PostgreSQL, not image blobs.
- Paginate public issue lists and admin tables.
- Subscribe to Realtime only on pages that need live updates.
- Avoid paid Google Maps, paid geocoding, paid email providers, and paid background jobs.
- Keep Discord alerts optional so missing webhook configuration never blocks issue creation.

## Secret Handling

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only and optional.
- Never expose service-role credentials to client components or browser bundles.
- Document required environment variables in `.env.example`.
- Make the app build without real Supabase credentials.

## Deployment Reminder

Provider limits and pricing can change. Recheck Supabase, Vercel, OpenStreetMap, and GitHub Actions docs before final deployment.
