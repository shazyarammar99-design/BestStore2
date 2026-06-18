-- Add 6th category (Digital Services) for homepage bento grid.
-- Rename slug/name here if you change SIXTH_CATEGORY_SLUG in src/config/category-images.ts

INSERT INTO public.categories (id, name, slug, description, tag, sort_order, icon_url)
VALUES (
  gen_random_uuid(),
  'Digital Services',
  'digital-services',
  'Streaming, apps, game keys, and premium digital subscriptions.',
  'New',
  6,
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  sort_order = EXCLUDED.sort_order;

-- Ensure in-game-currency sorts first if it exists
UPDATE public.categories SET sort_order = 1 WHERE slug = 'in-game-currency';
UPDATE public.categories SET sort_order = 2 WHERE slug = 'bypass-pubg';
UPDATE public.categories SET sort_order = 3 WHERE slug = 'steam-games';
UPDATE public.categories SET sort_order = 4 WHERE slug = 'discounted-games';
UPDATE public.categories SET sort_order = 5 WHERE slug = 'other-games';
