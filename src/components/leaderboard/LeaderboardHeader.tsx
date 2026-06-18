'use client';

import { useTranslation } from '@/context/LocaleContext';

export default function LeaderboardHeader() {
  const { t } = useTranslation();

  return (
    <header className="mb-10 text-center">
      <p className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-best-cyan">
        {t('leaderboard.compete')}
      </p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
        {t('leaderboard.title')}
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-best-muted">{t('leaderboard.description')}</p>
    </header>
  );
}
