'use client';

import {
  Coins,
  Gem,
  Gift,
  Percent,
  Sparkles,
  Trophy,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '@/context/LocaleContext';
import { localizePrizeName } from '@/i18n/catalog';
import { getPrizeIconKey } from '@/lib/spin/prize-icons';
import type { SpinPrizeRow } from '@/types/spin';

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  Percent,
  Coins,
  Truck,
  Gem,
  Sparkles,
  Trophy,
  Gift,
};

type Props = {
  prizes: SpinPrizeRow[];
  loading?: boolean;
};

export default function SpinPrizeList({ prizes, loading }: Props) {
  const { t, locale } = useTranslation();

  return (
    <div className="w-full rounded-xl border border-best-border bg-best-elevated/80 p-5 shadow-cyan-glow backdrop-blur-sm md:p-6">
      <h2 className="font-display text-2xl font-black uppercase tracking-tight text-best-cyan md:text-3xl">
        {t('spin.prizeOdds')}
      </h2>

      <ul className="mt-5 space-y-3">
        {loading && (
          <li className="py-6 text-center text-sm text-best-muted">{t('common.loading')}</li>
        )}
        {!loading && prizes.length === 0 && (
          <li className="py-6 text-center text-sm text-best-muted">{t('common.error')}</li>
        )}
        {!loading &&
          prizes.map((prize) => {
            const iconKey = getPrizeIconKey(prize.name);
            const Icon = ICON_COMPONENTS[iconKey] ?? Gift;
            const displayName = localizePrizeName(prize.name, locale);
            return (
              <li
                key={prize.id}
                className="flex items-center gap-3 rounded-lg border border-best-border/60 bg-best-bg/40 px-4 py-3 transition-colors hover:border-best-cyan/30 hover:bg-best-elevated"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-best-cyan/30 bg-best-bg/60">
                  <Icon className="h-4 w-4 text-best-cyan" aria-hidden />
                </span>
                <span className="font-heading font-semibold text-white">{displayName}</span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
