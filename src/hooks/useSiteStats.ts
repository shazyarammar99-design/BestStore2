'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SiteStats } from '@/lib/site-stats';

const POLL_MS = 30_000;

const DEFAULT_STATS: SiteStats = {
  activeUsers: 0,
  gamesSupported: 0,
  reviewCount: null,
};

export function useSiteStats() {
  const [stats, setStats] = useState<SiteStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/site-stats', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as SiteStats;
      setStats(data);
    } catch {
      // Keep last known values
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
    const id = setInterval(() => void fetchStats(), POLL_MS);
    return () => clearInterval(id);
  }, [fetchStats]);

  return { stats, loading };
}
