'use client';

import { Loader2, Trophy } from 'lucide-react';
import LeaderboardPodium from '@/components/leaderboard/LeaderboardPodium';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import StickyUserRank from '@/components/leaderboard/StickyUserRank';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useTranslation } from '@/context/LocaleContext';

export default function LeaderboardView() {
  const { data, loading, error } = useLeaderboard();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-best-cyan" aria-label={t('common.loading')} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center text-red-300">
        {error ?? t('leaderboard.unavailable')}
      </p>
    );
  }

  const topThree = data.entries.filter((e) => e.rank <= 3);
  const rest = data.entries.filter((e) => e.rank > 3);

  return (
    <>
      <div className="mb-8 flex items-center justify-center gap-3">
        <Trophy className="h-8 w-8 text-best-gold" />
        <div className="text-center">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
            {t('leaderboard.monthly')}
          </p>
          <p className="font-display text-lg font-bold text-white">{data.month}</p>
        </div>
      </div>

      <LeaderboardPodium topThree={topThree} />
      <LeaderboardTable entries={rest} />
      <StickyUserRank currentUser={data.currentUser} />
      <div className="h-20" aria-hidden />
    </>
  );
}
