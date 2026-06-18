'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UsernameWithBadge } from '@/components/AdminVerifiedBadge';
import type { LeaderboardEntry } from '@/types/leaderboard';
import { useTranslation } from '@/context/LocaleContext';

function LeaderboardCards({ entries }: { entries: LeaderboardEntry[] }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 md:hidden">
      {entries.map((entry) => {
        const initials = entry.username.slice(0, 2).toUpperCase();
        return (
          <div
            key={entry.userId}
            className="flex items-center justify-between rounded-xl border border-best-border bg-best-elevated/50 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="font-display text-lg font-bold text-best-gold">#{entry.rank}</span>
              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.avatarUrl ?? undefined} alt={entry.username} />
                <AvatarFallback className="bg-best-elevated text-xs text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <UsernameWithBadge
                username={entry.username}
                isAdmin={entry.isAdmin}
                className="font-heading font-semibold text-white"
              />
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-bold text-best-cyan">
                {entry.totalPoints.toLocaleString()}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-best-caption">
                {t('leaderboard.points')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  const { t } = useTranslation();

  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-best-border bg-best-elevated/50 py-12 text-center text-best-muted">
        {t('leaderboard.noRankingsYet')}
      </p>
    );
  }

  return (
    <>
      <LeaderboardCards entries={entries} />

      <div className="hidden overflow-hidden rounded-xl border border-best-border md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-best-border bg-best-elevated/80 font-heading text-xs uppercase tracking-widest text-best-muted">
              <th className="px-4 py-3 md:px-6">{t('leaderboard.rank')}</th>
              <th className="px-4 py-3 md:px-6">{t('leaderboard.player')}</th>
              <th className="px-4 py-3 text-right md:px-6">{t('leaderboard.points')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const initials = entry.username.slice(0, 2).toUpperCase();
              return (
                <tr
                  key={entry.userId}
                  className="border-b border-best-border/60 transition-colors hover:bg-best-elevated/40"
                >
                  <td className="px-4 py-4 font-display font-bold text-best-gold md:px-6">
                    #{entry.rank}
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={entry.avatarUrl ?? undefined} alt={entry.username} />
                        <AvatarFallback className="bg-best-elevated text-xs text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <UsernameWithBadge
                        username={entry.username}
                        isAdmin={entry.isAdmin}
                        className="font-heading font-semibold text-white"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-display font-bold text-best-cyan md:px-6">
                    {entry.totalPoints.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
