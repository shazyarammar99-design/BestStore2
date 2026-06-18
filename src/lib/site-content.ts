import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { DUMMY_ADS } from '@/data/ads';
import type { AdPlacement, CmsBlock, CmsSection, SiteAd } from '@/types/site-content';
import type { Locale } from '@/i18n/types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getClient() {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

async function fetchSiteAds(placement?: AdPlacement): Promise<SiteAd[]> {
  const client = getClient();
  if (!client) {
    return DUMMY_ADS.map((ad, i) => ({
      id: ad.id,
      placement: 'navbar' as const,
      image_url: ad.ad_image,
      link_url: ad.ad_link,
      alt_text: ad.alt_text,
      sort_order: i,
      active: true,
      created_at: new Date().toISOString(),
    }));
  }

  let query = client
    .from('site_ads')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (placement) query = query.eq('placement', placement);

  const { data, error } = await query;
  if (error || !data?.length) {
    if (placement === 'navbar' || !placement) {
      return DUMMY_ADS.map((ad, i) => ({
        id: ad.id,
        placement: 'navbar' as const,
        image_url: ad.ad_image,
        link_url: ad.ad_link,
        alt_text: ad.alt_text,
        sort_order: i,
        active: true,
        created_at: new Date().toISOString(),
      }));
    }
    return [];
  }

  return data as SiteAd[];
}

async function fetchCmsBlocks(section: CmsSection, locale: Locale): Promise<CmsBlock[]> {
  const client = getClient();
  if (!client) return [];

  const { data, error } = await client
    .from('cms_blocks')
    .select('*')
    .eq('section', section)
    .eq('locale', locale)
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as CmsBlock[];
}

export const getSiteAds = cache(async (placement?: AdPlacement) =>
  unstable_cache(() => fetchSiteAds(placement), ['site-ads', placement ?? 'all'], {
    revalidate: 60,
  })()
);

export const getCmsBlocks = cache(async (section: CmsSection, locale: Locale) =>
  unstable_cache(() => fetchCmsBlocks(section, locale), ['cms-blocks', section, locale], {
    revalidate: 60,
  })()
);
