'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LeaderboardResponse } from '@/types/leaderboard';

const REFRESH_MS = 30_000;

export function useLeaderboard() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Failed to load leaderboard.');
        return;
      }
      setData(json as LeaderboardResponse);
      setError(null);
    } catch {
      setError('Network error loading leaderboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const id = setInterval(fetchLeaderboard, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchLeaderboard]);

  return { data, loading, error, refresh: fetchLeaderboard };
}
