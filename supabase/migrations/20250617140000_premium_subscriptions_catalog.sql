-- Premium Subscriptions: rebrand in-game-currency category and replace products.

UPDATE public.categories
SET
  name = 'Premium Subscriptions',
  tag = 'Subscriptions',
  description = 'Premium AI, streaming, and social subscriptions — delivered instantly.'
WHERE slug = 'in-game-currency';

DELETE FROM public.product_variants
WHERE product_id IN (
  SELECT id FROM public.products
  WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'in-game-currency')
);

DELETE FROM public.products
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'in-game-currency');

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
  pd.name,
  pd.slug,
  pd.description,
  12000 + pd.price_offset,
  4.7,
  0,
  pd.popularity,
  true
FROM public.categories c
CROSS JOIN (
  VALUES
    ('gemini', 'Gemini', 'Google Gemini AI — premium access', 0, 95),
    ('chatgpt', 'ChatGPT', 'OpenAI ChatGPT — premium access', 1000, 94),
    ('claude', 'Claude', 'Anthropic Claude — premium access', 2000, 93),
    ('netflix', 'Netflix', 'Netflix streaming subscription', 3000, 92),
    ('discord', 'Discord', 'Discord Nitro and premium features', 4000, 91),
    ('youtube', 'YouTube', 'YouTube Premium subscription', 5000, 90),
    ('deepseek', 'DeepSeek', 'DeepSeek AI — premium access', 6000, 89)
) AS pd(slug, name, description, price_offset, popularity)
WHERE c.slug = 'in-game-currency'
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  rating = EXCLUDED.rating,
  popularity = EXCLUDED.popularity,
  is_featured = EXCLUDED.is_featured;

DELETE FROM public.product_variants
WHERE product_id IN (
  SELECT id FROM public.products
  WHERE slug IN ('gemini', 'chatgpt', 'claude', 'netflix', 'discord', 'youtube', 'deepseek')
);

INSERT INTO public.product_variants (product_id, plan_type, duration, price, stock)
SELECT
  p.id,
  vt.plan_type,
  vt.duration,
  vt.base_price + offsets.price_offset,
  999
FROM public.products p
JOIN public.categories c ON c.id = p.category_id
JOIN (
  VALUES
    ('gemini', 0),
    ('chatgpt', 1000),
    ('claude', 2000),
    ('netflix', 3000),
    ('discord', 4000),
    ('youtube', 5000),
    ('deepseek', 6000)
) AS offsets(slug, price_offset) ON offsets.slug = p.slug
CROSS JOIN (
  VALUES
    ('Subscription', '3 Months', 12000),
    ('Subscription', '6 Months', 22000),
    ('Subscription', '1 Year', 38000),
    ('Account', '3 Months', 15000),
    ('Account', '6 Months', 28000),
    ('Account', '1 Year', 45000)
) AS vt(plan_type, duration, base_price)
WHERE c.slug = 'in-game-currency';
