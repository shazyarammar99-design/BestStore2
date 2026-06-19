-- Add translation JSONB columns to categories and products

ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS name_translations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS description_translations JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS name_translations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS description_translations JSONB DEFAULT '{}'::jsonb;

-- Example JSON structure:
-- {
--   "ku": "یاریەکانی تر",
--   "ar": "ألعاب أخرى"
-- }
