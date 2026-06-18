-- Anonymous browser session presence for "users online now" stat

CREATE TABLE IF NOT EXISTS public.site_presence (
  session_id text PRIMARY KEY,
  last_seen timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_presence_last_seen_idx
  ON public.site_presence (last_seen DESC);

ALTER TABLE public.site_presence ENABLE ROW LEVEL SECURITY;

-- Accessed only via service role in API routes (service role bypasses RLS).
