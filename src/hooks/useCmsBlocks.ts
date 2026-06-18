'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CmsBlock, CmsSection } from '@/types/site-content';
import type { Locale } from '@/i18n/types';

export function useCmsBlocks(section: CmsSection, locale: Locale) {
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from('cms_blocks')
      .select('*')
      .eq('section', section)
      .eq('locale', locale)
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setBlocks(data as CmsBlock[]);
        setLoading(false);
      });
  }, [section, locale]);

  return { blocks, loading };
}
