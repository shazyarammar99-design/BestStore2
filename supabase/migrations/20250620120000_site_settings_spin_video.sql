-- site_settings: spin wheel config, branding, how-it-works video

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read"
  ON public.site_settings FOR SELECT
  USING (true);

-- Seed defaults
INSERT INTO public.site_settings (key, value)
VALUES
  (
    'spin',
    '{"extraTurns": 7, "spinDurationMs": 3000, "minPurchaseIqd": 10000}'::jsonb
  ),
  (
    'branding',
    '{"logoUrl": "/brand/logo.png", "faviconUrl": null, "siteName": "BEST STORE"}'::jsonb
  ),
  (
    'how_it_works_video',
    '{"videoUrl": null, "videoType": "none", "label": "Watch: setup in under 2 minutes", "posterUrl": null}'::jsonb
  )
ON CONFLICT (key) DO NOTHING;

-- Extend site-assets bucket for video uploads
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm'
]
WHERE id = 'site-assets';
