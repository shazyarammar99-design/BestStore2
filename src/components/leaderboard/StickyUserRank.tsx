'use client';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LocaleContext';
import type { LeaderboardResponse } from '@/types/leaderboard';

export default function StickyUserRank({
  currentUser,
}: {
  currentUser: LeaderboardResponse['currentUser'];
}) {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const rankLabel =
    currentUser && currentUser.rank > 0
      ? `#${currentUser.rank}`
      : t('leaderboard.unranked');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-best-border bg-best-bg/95 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-widest text-best-muted">
            {t('leaderboard.yourRank')}
          </p>
          <p className="font-display text-xl font-black text-best-gold">{rankLabel}</p>
        </div>
        <div className="text-right">
          <p className="font-heading text-xs font-bold uppercase tracking-widest text-best-muted">
            {t('leaderboard.monthlyPoints')}
          </p>
          <p className="font-display text-xl font-black text-best-cyan">
            {(currentUser?.totalPoints ?? 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
