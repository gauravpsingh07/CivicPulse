-- CivicPulse Phase 7: full-text search and geospatial "near me" support.
-- Adds a generated tsvector column with a GIN index for websearch-style
-- queries, and a SECURITY INVOKER function that returns public issues ordered
-- by haversine distance so existing RLS policies keep applying.

ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS search_tsv tsvector
  GENERATED ALWAYS AS (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(address_label, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_issues_search_tsv
  ON public.issues USING GIN (search_tsv);

CREATE OR REPLACE FUNCTION public.nearby_public_issues(
  origin_lat DOUBLE PRECISION,
  origin_lng DOUBLE PRECISION,
  search_text TEXT DEFAULT NULL,
  filter_status public.issue_status DEFAULT NULL,
  filter_category public.issue_category DEFAULT NULL,
  filter_urgency public.issue_urgency DEFAULT NULL,
  max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  reporter_id UUID,
  title TEXT,
  description TEXT,
  category public.issue_category,
  urgency public.issue_urgency,
  status public.issue_status,
  latitude NUMERIC,
  longitude NUMERIC,
  address_label TEXT,
  image_path TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    i.id,
    i.reporter_id,
    i.title,
    i.description,
    i.category,
    i.urgency,
    i.status,
    i.latitude,
    i.longitude,
    i.address_label,
    i.image_path,
    i.is_public,
    i.created_at,
    i.updated_at,
    i.resolved_at,
    2 * 6371000 * asin(
      sqrt(
        power(sin(radians((i.latitude::double precision - origin_lat) / 2)), 2)
        + cos(radians(origin_lat))
          * cos(radians(i.latitude::double precision))
          * power(sin(radians((i.longitude::double precision - origin_lng) / 2)), 2)
      )
    ) AS distance_meters
  FROM public.issues i
  WHERE i.is_public = true
    AND i.status <> 'rejected'
    AND (
      search_text IS NULL
      OR btrim(search_text) = ''
      OR i.search_tsv @@ websearch_to_tsquery('english', search_text)
    )
    AND (filter_status IS NULL OR i.status = filter_status)
    AND (filter_category IS NULL OR i.category = filter_category)
    AND (filter_urgency IS NULL OR i.urgency = filter_urgency)
  ORDER BY distance_meters ASC
  LIMIT LEAST(GREATEST(coalesce(max_results, 50), 1), 100);
$$;

REVOKE ALL ON FUNCTION public.nearby_public_issues FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.nearby_public_issues TO anon;
GRANT EXECUTE ON FUNCTION public.nearby_public_issues TO authenticated;
GRANT EXECUTE ON FUNCTION public.nearby_public_issues TO service_role;
