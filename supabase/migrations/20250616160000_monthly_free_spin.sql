-- Monthly free spin: first credit 30 days after signup, then every 30 days

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS next_free_spin_at timestamptz;

UPDATE public.profiles p
SET next_free_spin_at = u.created_at + interval '30 days'
FROM auth.users u
WHERE p.id = u.id AND p.next_free_spin_at IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN next_free_spin_at SET DEFAULT (now() + interval '30 days');

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
  INSERT INTO public.profiles (id, username, avatar_url, next_free_spin_at)
  VALUES (
    NEW.id,
    base_username,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.created_at + interval '30 days'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
