import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTS as STATIC_PRODUCTS } from '@/data';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDiscordVouchCount } from '@/lib/discord/vouches';

export type SiteStats = {
  activeUsers: number;
  gamesSupported: number;
  reviewCount: number | null;
};

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

function fallbackGamesCount(): number {
  return new Set(STATIC_PRODUCTS.map((p) => p.name.trim().toLowerCase())).size;
}

async function fetchGamesSupported(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return fallbackGamesCount();

  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await client.from('products').select('name');

  if (error || !data?.length) return fallbackGamesCount();

  const names = new Set(
    data.map((row) => String(row.name ?? '').trim().toLowerCase()).filter(Boolean)
  );
  return names.size || fallbackGamesCount();
}

const getCachedGamesSupported = unstable_cache(fetchGamesSupported, ['site-stats-games'], {
  revalidate: 60,
});

async function fetchActiveUsers(): Promise<number> {
  const admin = createAdminClient();
  if (!admin) return 0;

  const since = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();
  const { count, error } = await admin
    .from('site_presence')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', since);

  if (error) return 0;
  return count ?? 0;
}

export async function getSiteStats(): Promise<SiteStats> {
  const [activeUsers, gamesSupported, reviewCount] = await Promise.all([
    fetchActiveUsers(),
    getCachedGamesSupported(),
    getDiscordVouchCount(),
  ]);

  return { activeUsers, gamesSupported, reviewCount };
}
