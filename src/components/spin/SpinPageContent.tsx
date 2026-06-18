'use client';

import SpinWheel from '@/components/spin/SpinWheel';
import { useTranslation } from '@/context/LocaleContext';

export default function SpinPageContent() {
  const { t } = useTranslation();

  return (
    <main className="px-4 pb-16 pt-6 md:px-6 md:pt-8">
      <div className="mx-auto max-w-6xl text-center">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-best-cyan">
          {t('spin.dailyRewards')}
        </p>
        <h1 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
          {t('spin.title')}
        </h1>
        <div className="mt-5 flex w-full justify-center">
          <SpinWheel />
        </div>
      </div>
    </main>
  );
}
