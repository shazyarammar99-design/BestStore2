import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_BRANDING_SETTINGS,
  DEFAULT_HOW_IT_WORKS_VIDEO,
  DEFAULT_SPIN_SETTINGS,
  type BrandingSettings,
  type HowItWorksVideoSettings,
  type SpinSettings,
} from '@/types/site-settings';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getClient() {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

async function fetchSetting<T>(key: string, fallback: T): Promise<T> {
  const client = getClient();
  if (!client) return fallback;

  const { data, error } = await client
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error || !data?.value) return fallback;
  return { ...fallback, ...(data.value as object) } as T;
}

export const getSpinSettings = cache(async () =>
  unstable_cache(
    () => fetchSetting('spin', DEFAULT_SPIN_SETTINGS),
    ['site-settings-spin'],
    { revalidate: 60 }
  )()
);

export const getBrandingSettings = cache(async () =>
  unstable_cache(
    () => fetchSetting('branding', DEFAULT_BRANDING_SETTINGS),
    ['site-settings-branding'],
    { revalidate: 60 }
  )()
);

export const getHowItWorksVideoSettings = cache(async () =>
  unstable_cache(
    () => fetchSetting('how_it_works_video', DEFAULT_HOW_IT_WORKS_VIDEO),
    ['site-settings-how-it-works-video'],
    { revalidate: 60 }
  )()
);

export async function fetchSiteSetting<T>(key: string, fallback: T): Promise<T> {
  return fetchSetting(key, fallback);
}
