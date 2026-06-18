-- Gaming features: profiles, new releases, spin wheel, leaderboard purchases

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username text NOT NULL,
  avatar_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
BEGIN
  base_username := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1),
    'player'
  );
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    base_username,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- new_releases
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.new_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  description text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '/',
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS new_releases_active_sort_idx
  ON public.new_releases (active, sort_order);

ALTER TABLE public.new_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "new_releases_public_read"
  ON public.new_releases FOR SELECT
  USING (active = true);

-- ---------------------------------------------------------------------------
-- prizes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  probability_weight int NOT NULL CHECK (probability_weight > 0),
  image_url text,
  value numeric NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prizes_active_idx ON public.prizes (active);

ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prizes_public_read"
  ON public.prizes FOR SELECT
  USING (active = true);

-- ---------------------------------------------------------------------------
-- spins
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.spins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  spin_date date NOT NULL DEFAULT (timezone('utc', now()))::date,
  prize_id uuid NOT NULL REFERENCES public.prizes (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, spin_date)
);

CREATE INDEX IF NOT EXISTS spins_user_date_idx ON public.spins (user_id, spin_date DESC);

ALTER TABLE public.spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spins_select_own"
  ON public.spins FOR SELECT
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- inventory
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  prize_id uuid NOT NULL REFERENCES public.prizes (id),
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  won_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, prize_id)
);

CREATE INDEX IF NOT EXISTS inventory_user_idx ON public.inventory (user_id);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_select_own"
  ON public.inventory FOR SELECT
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- purchases (leaderboard)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  points_earned numeric NOT NULL CHECK (points_earned >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS purchases_monthly_idx
  ON public.purchases (created_at DESC, user_id);

CREATE INDEX IF NOT EXISTS purchases_user_idx ON public.purchases (user_id, created_at DESC);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases_select_own"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- seed data
-- ---------------------------------------------------------------------------
INSERT INTO public.new_releases (title, image_url, description, link, sort_order, active)
VALUES
  (
    'GTA VI Pre-Order Bundles',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    'Exclusive currency packs and premium accounts for the next-gen open world.',
    '/category/accounts',
    1,
    true
  ),
  (
    'Valorant Night Market DLC',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
    'Limited-time VP bundles with bonus skins — while supplies last.',
    '/category/currency',
    2,
    true
  ),
  (
    'PUBG Mobile Season Pass',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0e?w=800&q=80',
    'Unlock the new Royale Pass tier instantly with our fast delivery.',
    '/category/bypass',
    3,
    true
  ),
  (
    'Free Fire Diamond Event',
    'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80',
    'Double diamond weekends — stack savings on bulk top-ups.',
    '/',
    4,
    true
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.prizes (name, probability_weight, image_url, value, active)
VALUES
  ('10% Store Credit', 50, null, 10, true),
  ('500 IQD Bonus', 25, null, 500, true),
  ('Free Delivery Token', 15, null, 1, true),
  ('1000 IQD Bonus', 5, null, 1000, true),
  ('Rare Skin Voucher', 3, null, 2500, true),
  ('Grand Prize — 5000 IQD', 2, null, 5000, true)
ON CONFLICT DO NOTHING;
