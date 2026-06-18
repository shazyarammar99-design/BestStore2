-- Admin CMS: is_admin, site_ads, cms_blocks, site-assets storage

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- ---------------------------------------------------------------------------
-- site_ads
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement text NOT NULL CHECK (placement IN ('navbar', 'sidebar', 'footer')),
  image_url text NOT NULL,
  link_url text NOT NULL DEFAULT '/',
  alt_text text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_ads_placement_active_idx
  ON public.site_ads (placement, active, sort_order);

ALTER TABLE public.site_ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_ads_public_read" ON public.site_ads;
CREATE POLICY "site_ads_public_read"
  ON public.site_ads FOR SELECT
  USING (active = true);

-- ---------------------------------------------------------------------------
-- cms_blocks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL CHECK (section IN ('hero', 'feature', 'step', 'testimonial', 'faq')),
  locale text NOT NULL CHECK (locale IN ('en', 'ku', 'ar')),
  payload jsonb NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cms_blocks_section_locale_idx
  ON public.cms_blocks (section, locale, active, sort_order);

ALTER TABLE public.cms_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cms_blocks_public_read" ON public.cms_blocks;
CREATE POLICY "cms_blocks_public_read"
  ON public.cms_blocks FOR SELECT
  USING (active = true);

-- ---------------------------------------------------------------------------
-- site-assets storage bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "site_assets_public_read" ON storage.objects;
CREATE POLICY "site_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

-- ---------------------------------------------------------------------------
-- seed site_ads (from static dummy ads)
-- ---------------------------------------------------------------------------
INSERT INTO public.site_ads (placement, image_url, link_url, alt_text, sort_order, active)
SELECT * FROM (
  VALUES
    ('navbar'::text, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80', '/category/in-game-currency', 'Double XP Weekend — top up game currency now', 0, true),
    ('navbar'::text, 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=1200&q=80', '/category/steam-games', 'Premium accounts — instant delivery', 1, true),
    ('navbar'::text, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&q=80', '/spin', 'Spin the wheel daily for free rewards', 2, true)
) AS v(placement, image_url, link_url, alt_text, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.site_ads LIMIT 1);

-- ---------------------------------------------------------------------------
-- seed cms_blocks — hero (en, ku, ar)
-- ---------------------------------------------------------------------------
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('hero', 'en', '{"eyebrow":"BEST STORE","headline":"Premium Gaming","headlineAccent":"Services & Tools","subtitle":"Accounts, in-game currency, bypass tools, and game bundles — delivered fast with 24/7 support.","primaryCtaLabel":"Browse Categories","primaryCtaHref":"#categories","secondaryCtaLabel":"View Products","secondaryCtaHref":"#products"}'::jsonb, 0, true),
    ('hero', 'ku', '{"eyebrow":"BEST STORE","headline":"خزمەتگوزارییە","headlineAccent":"پێشکەوتووی یاری","subtitle":"هەژمار، دراوی ناو یاری، ئامرازی بایپاس و پاکێجی یاری — بە خێرایی و پشتگیری ٢٤/٧.","primaryCtaLabel":"بینینی پۆلەکان","primaryCtaHref":"#categories","secondaryCtaLabel":"بینینی بەرهەمەکان","secondaryCtaHref":"#products"}'::jsonb, 0, true),
    ('hero', 'ar', '{"eyebrow":"BEST STORE","headline":"خدمات الألعاب","headlineAccent":"والأدوات المميزة","subtitle":"حسابات، عملات داخل اللعبة، أدوات تجاوز وحزم ألعاب — توصيل سريع ودعم على مدار الساعة.","primaryCtaLabel":"تصفح الفئات","primaryCtaHref":"#categories","secondaryCtaLabel":"عرض المنتجات","secondaryCtaHref":"#products"}'::jsonb, 0, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'hero' LIMIT 1);

-- seed FAQ en
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('faq', 'en', '{"question":"Is the software safe to use?","answer":"Every tool ships with anti-detection technology and is tested against the latest game patches before release."}'::jsonb, 0, true),
    ('faq', 'en', '{"question":"How do I install the software?","answer":"After purchase you receive an instant download link and a step-by-step guide. Most users are in-game within 5 minutes."}'::jsonb, 1, true),
    ('faq', 'en', '{"question":"What payment methods do you accept?","answer":"We accept local IQD payments, crypto, PayPal, and cards. Contact us on WhatsApp or Discord to complete your order securely."}'::jsonb, 2, true),
    ('faq', 'en', '{"question":"Do you offer refunds?","answer":"If a product does not work as described and our support cannot resolve it, we offer a full refund or replacement."}'::jsonb, 3, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'faq' LIMIT 1);

-- seed steps en
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('step', 'en', '{"number":"01","title":"Browse Products","description":"Explore categories — PUBG bypass, Steam games, bundles, and more."}'::jsonb, 0, true),
    ('step', 'en', '{"number":"02","title":"Place Your Order","description":"Choose your product and pay securely via WhatsApp or Discord."}'::jsonb, 1, true),
    ('step', 'en', '{"number":"03","title":"Instant Delivery","description":"Receive your product immediately after payment confirmation."}'::jsonb, 2, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'step' LIMIT 1);

-- seed features en
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('feature', 'en', '{"icon":"Zap","title":"Instant Delivery","description":"Get your products immediately after purchase. No waiting, no delays."}'::jsonb, 0, true),
    ('feature', 'en', '{"icon":"Shield","title":"Premium Quality","description":"All products are tested and verified before delivery to ensure reliability."}'::jsonb, 1, true),
    ('feature', 'en', '{"icon":"Headphones","title":"24/7 Support","description":"Our support team is available around the clock via Discord and WhatsApp."}'::jsonb, 2, true),
    ('feature', 'en', '{"icon":"Sliders","title":"Local IQD Payments","description":"Pay in Iraqi Dinar with secure local payment options tailored for gamers."}'::jsonb, 3, true),
    ('feature', 'en', '{"icon":"RefreshCw","title":"Verified Accounts","description":"Steam accounts and game bundles are checked and verified before handoff."}'::jsonb, 4, true),
    ('feature', 'en', '{"icon":"Layers","title":"Wide Selection","description":"From PUBG bypass tools to Steam accounts and discounted game bundles."}'::jsonb, 5, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'feature' LIMIT 1);

-- seed testimonials en
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('testimonial', 'en', '{"name":"Ahmed J.","handle":"Verified Customer","quote":"Best place to buy gaming tools in Iraq. Fast delivery and the support was really helpful when I had a question.","initials":"AJ","tag":"Works on latest patch","hasVideo":true}'::jsonb, 0, true),
    ('testimonial', 'en', '{"name":"Sara M.","handle":"Elite Member","quote":"Got my Steam account within 5 minutes. No regional locking issues and the price was unbeatable.","initials":"SM","tag":"Verified purchase","hasVideo":false}'::jsonb, 1, true),
    ('testimonial', 'en', '{"name":"Omar K.","handle":"Verified Customer","quote":"The PUBG bypass works flawlessly. Been using it for a month with zero issues. Highly recommend BEST STORE.","initials":"OK","tag":"Works on latest patch","hasVideo":true}'::jsonb, 2, true),
    ('testimonial', 'en', '{"name":"Layla H.","handle":"Verified Customer","quote":"Great deals on game bundles. Saved a lot compared to other stores. Support replied instantly on WhatsApp.","initials":"LH","tag":"Verified purchase","hasVideo":false}'::jsonb, 3, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'testimonial' LIMIT 1);
