'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  DEFAULT_BRANDING_SETTINGS,
  DEFAULT_HOW_IT_WORKS_VIDEO,
  DEFAULT_SPIN_SETTINGS,
  type BrandingSettings,
  type HowItWorksVideoSettings,
  type SpinSettings,
} from '@/types/site-settings';

function mergeSetting<T extends object>(fallback: T, value: unknown): T {
  if (!value || typeof value !== 'object') return fallback;
  return { ...fallback, ...(value as object) };
}

export function useBrandingSettings() {
  const [settings, setSettings] = useState<BrandingSettings>(DEFAULT_BRANDING_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'branding')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setSettings(mergeSetting(DEFAULT_BRANDING_SETTINGS, data.value));
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}

export function useHowItWorksVideoSettings() {
  const [settings, setSettings] = useState<HowItWorksVideoSettings>(DEFAULT_HOW_IT_WORKS_VIDEO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'how_it_works_video')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setSettings(mergeSetting(DEFAULT_HOW_IT_WORKS_VIDEO, data.value));
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}

export function useSpinSettings() {
  const [settings, setSettings] = useState<SpinSettings>(DEFAULT_SPIN_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'spin')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setSettings(mergeSetting(DEFAULT_SPIN_SETTINGS, data.value));
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}
