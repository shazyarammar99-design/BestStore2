-- Add video and gallery support to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}';

-- Update site-assets bucket to accept video MIME types and increase size limit
UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm'
  ],
  file_size_limit = 52428800  -- 50 MB
WHERE id = 'site-assets';
