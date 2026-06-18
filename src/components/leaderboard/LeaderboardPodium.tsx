'use client';

import { Crown, Trophy, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UsernameWithBadge } from '@/components/AdminVerifiedBadge';
import type { LeaderboardEntry } from '@/types/leaderboard';

const PODIUM_STYLES = [
  { order: 'order-2 md:order-1', height: 'md:mt-8', icon: Medal, color: 'text-slate-300' },
  { order: 'order-1 md:order-2', height: 'md:-mt-4', icon: Crown, color: 'text-best-gold' },
  { order: 'order-3', height: 'md:mt-12', icon: Trophy, color: 'text-amber-600' },
];

const RANK_ORDER = [2, 1, 3];

export default function LeaderboardPodium({ topThree }: { topThree: LeaderboardEntry[] }) {
  if (topThree.length === 0) return null;

  const byRank = new Map(topThree.map((e) => [e.rank, e]));

  return (
    <div className="mb-12 grid grid-cols-3 items-end gap-3 md:gap-6">
      {RANK_ORDER.map((rank, i) => {
        const entry = byRank.get(rank);
        const style = PODIUM_STYLES[i];
        const Icon = style.icon;
        if (!entry) {
          return <div key={rank} className={style.order} />;
        }
        const initials = entry.username.slice(0, 2).toUpperCase();
        return (
          <div
            key={entry.userId}
            className={`flex flex-col items-center text-center ${style.order} ${style.height}`}
          >
            <Icon className={`mb-2 h-6 w-6 md:h-8 md:w-8 ${style.color}`} aria-hidden />
            <Avatar className="h-14 w-14 border-2 border-best-border md:h-20 md:w-20">
              <AvatarImage src={entry.avatarUrl ?? undefined} alt={entry.username} />
              <AvatarFallback className="bg-best-elevated font-heading text-sm text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <UsernameWithBadge
              username={entry.username}
              isAdmin={entry.isAdmin}
              badgeSize="md"
              className="mt-3 max-w-[8rem] font-heading text-xs font-bold text-white md:text-sm"
            />
            <p className="font-display text-lg font-black text-best-cyan md:text-2xl">
              {entry.totalPoints.toLocaleString()}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-best-caption">pts</p>
            <div
              className={`mt-3 w-full rounded-t-lg bg-gradient-to-t from-best-cyan/20 to-best-elevated px-2 py-3 md:py-5 ${
                rank === 1 ? 'min-h-[100px]' : rank === 2 ? 'min-h-[72px]' : 'min-h-[56px]'
              }`}
            >
              <span className="font-display text-2xl font-black text-best-gold md:text-3xl">
                #{rank}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
