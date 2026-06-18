-- Subscription product images, Spotify, and display order (popularity DESC).

INSERT INTO public.products (
  category_id,
  name,
  slug,
  description,
  base_price,
  base_image,
  rating,
  review_count,
  popularity,
  is_featured
)
SELECT
  c.id,
  'Spotify',
  'spotify',
  'Spotify Premium subscription',
  19000,
  '/products/spotify.png',
  4.7,
  0,
  101,
  true
FROM public.categories c
WHERE c.slug = 'in-game-currency'
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  base_image = EXCLUDED.base_image,
  rating = EXCLUDED.rating,
  popularity = EXCLUDED.popularity,
  is_featured = EXCLUDED.is_featured;

DELETE FROM public.product_variants
WHERE product_id = (SELECT id FROM public.products WHERE slug = 'spotify');

INSERT INTO public.product_variants (product_id, plan_type, duration, price, stock)
SELECT
  p.id,
  vt.plan_type,
  vt.duration,
  vt.base_price + 7000,
  999
FROM public.products p
CROSS JOIN (
  VALUES
    ('Subscription', '3 Months', 12000),
    ('Subscription', '6 Months', 22000),
    ('Subscription', '1 Year', 38000),
    ('Account', '3 Months', 15000),
    ('Account', '6 Months', 28000),
    ('Account', '1 Year', 45000)
) AS vt(plan_type, duration, base_price)
WHERE p.slug = 'spotify';

UPDATE public.products
SET base_image = '/products/' || slug || '.png'
WHERE slug IN (
  'discord', 'netflix', 'claude', 'youtube', 'gemini', 'chatgpt', 'deepseek', 'spotify'
);

UPDATE public.products
SET popularity = pd.popularity
FROM (
  VALUES
    ('discord', 108),
    ('netflix', 107),
    ('claude', 106),
    ('youtube', 105),
    ('gemini', 104),
    ('chatgpt', 103),
    ('deepseek', 102),
    ('spotify', 101)
) AS pd(slug, popularity)
WHERE products.slug = pd.slug;
