-- Unify four PUBG Bypass products into one product with duration variants (like best-chess).

DELETE FROM public.product_variants
WHERE product_id IN (
  SELECT id FROM public.products
  WHERE slug IN ('pubg-1day', 'pubg-1week', 'pubg-1month', 'pubg-lifetime')
);

DELETE FROM public.products
WHERE slug IN ('pubg-1day', 'pubg-1week', 'pubg-1month', 'pubg-lifetime');

INSERT INTO public.products (
  category_id,
  name,
  slug,
  description,
  base_price,
  rating,
  review_count,
  popularity,
  is_featured
)
SELECT
  c.id,
  'PUBG Bypass',
  'pubg-bypass',
  'Premium PUBG bypass with anti-detection',
  1500,
  4.8,
  420,
  90,
  true
FROM public.categories c
WHERE c.slug = 'bypass-pubg'
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  popularity = EXCLUDED.popularity,
  is_featured = EXCLUDED.is_featured;

DELETE FROM public.product_variants
WHERE product_id = (SELECT id FROM public.products WHERE slug = 'pubg-bypass');

INSERT INTO public.product_variants (product_id, plan_type, duration, price, stock)
SELECT p.id, NULL, v.duration, v.price, 999
FROM public.products p
CROSS JOIN (
  VALUES
    ('1 Day', 1500),
    ('1 Week', 12000),
    ('1 Month', 22000),
    ('Lifetime', 150000)
) AS v(duration, price)
WHERE p.slug = 'pubg-bypass';
