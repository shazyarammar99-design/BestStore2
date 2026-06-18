'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DUMMY_ADS } from '@/data/ads';
import type { AdPlacement, SiteAd } from '@/types/site-content';

function fallbackAds(): SiteAd[] {
  return DUMMY_ADS.map((ad, i) => ({
    id: ad.id,
    placement: 'navbar',
    image_url: ad.ad_image,
    link_url: ad.ad_link,
    alt_text: ad.alt_text,
    sort_order: i,
    active: true,
    created_at: new Date().toISOString(),
  }));
}

export function useSiteAds(placement: AdPlacement = 'navbar') {
  const [ads, setAds] = useState<SiteAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setAds(fallbackAds());
      setLoading(false);
      return;
    }

    supabase
      .from('site_ads')
      .select('*')
      .eq('placement', placement)
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error || !data?.length) {
          setAds(placement === 'navbar' ? fallbackAds() : []);
        } else {
          setAds(data as SiteAd[]);
        }
        setLoading(false);
      });
  }, [placement]);

  return { ads, loading };
}
