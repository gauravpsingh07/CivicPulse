-- CivicPulse Phase 1: small public demo seed.
-- The issues use reporter_id = NULL so this seed can run before real
-- Supabase Auth users and profiles exist.

INSERT INTO public.issues (
  id,
  reporter_id,
  title,
  description,
  category,
  urgency,
  status,
  latitude,
  longitude,
  address_label,
  image_path,
  is_public,
  created_at,
  updated_at,
  resolved_at
)
VALUES
  (
    '00000000-0000-4000-8000-000000000101',
    NULL,
    'Large pothole near library',
    'A deep pothole is forming near the main library entrance and drivers are swerving into the bike lane.',
    'pothole',
    'high',
    'open',
    40.713210,
    -74.006920,
    'Main Library frontage',
    NULL,
    true,
    now() - interval '5 days',
    now() - interval '5 days',
    NULL
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    NULL,
    'Broken streetlight at crosswalk',
    'The streetlight at the crosswalk has been dark for several nights and the intersection is hard to see.',
    'streetlight',
    'medium',
    'in_progress',
    40.715850,
    -74.003610,
    '3rd Avenue crosswalk',
    NULL,
    true,
    now() - interval '9 days',
    now() - interval '2 days',
    NULL
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    NULL,
    'Overflowing public trash bin',
    'Trash is overflowing from the public bin near the park entrance and has started spreading onto the sidewalk.',
    'trash',
    'low',
    'resolved',
    40.710340,
    -74.010380,
    'Riverside Park entrance',
    NULL,
    true,
    now() - interval '14 days',
    now() - interval '3 days',
    now() - interval '3 days'
  ),
  (
    '00000000-0000-4000-8000-000000000104',
    NULL,
    'Sidewalk ramp blocked by debris',
    'Construction debris is blocking the curb ramp, forcing wheelchair users into the street to pass the corner.',
    'accessibility',
    'critical',
    'open',
    40.718620,
    -74.011140,
    'North corner curb ramp',
    NULL,
    true,
    now() - interval '1 day',
    now() - interval '1 day',
    NULL
  ),
  (
    '00000000-0000-4000-8000-000000000105',
    NULL,
    'Duplicate water leak report',
    'This report is a duplicate of an existing water leak ticket and should remain hidden from public views.',
    'water_leak',
    'medium',
    'rejected',
    40.709410,
    -74.004210,
    'Market Street hydrant',
    NULL,
    false,
    now() - interval '7 days',
    now() - interval '6 days',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.issue_status_history (
  id,
  issue_id,
  changed_by,
  from_status,
  to_status,
  note,
  created_at
)
VALUES
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000101',
    NULL,
    NULL,
    'open',
    'Demo issue created.',
    now() - interval '5 days'
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000102',
    NULL,
    NULL,
    'open',
    'Demo issue created.',
    now() - interval '9 days'
  ),
  (
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000102',
    NULL,
    'open',
    'in_progress',
    'Crew assigned for demo workflow.',
    now() - interval '2 days'
  ),
  (
    '00000000-0000-4000-8000-000000000204',
    '00000000-0000-4000-8000-000000000103',
    NULL,
    NULL,
    'open',
    'Demo issue created.',
    now() - interval '14 days'
  ),
  (
    '00000000-0000-4000-8000-000000000205',
    '00000000-0000-4000-8000-000000000103',
    NULL,
    'open',
    'resolved',
    'Cleanup completed for demo workflow.',
    now() - interval '3 days'
  ),
  (
    '00000000-0000-4000-8000-000000000206',
    '00000000-0000-4000-8000-000000000104',
    NULL,
    NULL,
    'open',
    'Demo critical issue created.',
    now() - interval '1 day'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_comments (
  id,
  issue_id,
  author_id,
  body,
  is_public,
  created_at
)
VALUES
  (
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000102',
    NULL,
    'Public works has assigned a technician to inspect the light.',
    true,
    now() - interval '2 days'
  ),
  (
    '00000000-0000-4000-8000-000000000302',
    '00000000-0000-4000-8000-000000000103',
    NULL,
    'Cleanup was completed and the area is clear.',
    true,
    now() - interval '3 days'
  ),
  (
    '00000000-0000-4000-8000-000000000303',
    '00000000-0000-4000-8000-000000000104',
    NULL,
    'Private demo note: verify whether temporary barriers are still present.',
    false,
    now() - interval '20 hours'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.notifications (
  id,
  issue_id,
  channel,
  event_type,
  status,
  sent_at,
  created_at
)
VALUES
  (
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000101',
    'discord',
    'high_urgency_issue_created',
    'pending',
    NULL,
    now() - interval '5 days'
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-4000-8000-000000000104',
    'discord',
    'critical_issue_created',
    'pending',
    NULL,
    now() - interval '1 day'
  )
ON CONFLICT DO NOTHING;
