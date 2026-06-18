'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gift } from 'lucide-react';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { fetchMyInventory } from '@/lib/inventory/client';
import { formatPrizeEffectPreview } from '@/lib/spin/prize-effects';
import type { SpinRewardSelection } from '@/lib/checkout-pricing';
import type { InventoryItem } from '@/types/spin';
import { localizePrizeName } from '@/i18n/catalog';
import { cn } from '@/lib/utils';

type SpinRewardsPickerProps = {
  selectedInventoryId: string | null;
  onSelect: (reward: SpinRewardSelection | null) => void;
  disabled?: boolean;
};

export default function SpinRewardsPicker({
  selectedInventoryId,
  onSelect,
  disabled,
}: SpinRewardsPickerProps) {
  const { t, locale } = useTranslation();
  const formatPrice = useFormatCurrency();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyInventory().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const handleSelect = (item: InventoryItem | null) => {
    if (!item) {
      onSelect(null);
      return;
    }
    onSelect({
      inventoryId: item.inventoryId,
      prizeType: item.prize.prize_type,
      value: item.prize.value,
      label: localizePrizeName(item.prize.name, locale),
    });
  };

  return (
    <section className="rounded-2xl border border-best-border bg-best-elevated/80 p-6 shadow-card-glow backdrop-blur-sm">
      <h2 className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
        <Gift className="h-4 w-4 text-best-gold" />
        {t('checkout.spinRewards')}
      </h2>

      {loading ? (
        <p className="mt-4 text-sm text-best-caption">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-best-muted">
          {t('checkout.spinRewardsEmpty')}{' '}
          <Link href="/spin" className="text-best-cyan hover:underline">
            {t('nav.spinWin')}
          </Link>
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          <li>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(null)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                !selectedInventoryId
                  ? 'border-best-cyan/50 bg-best-cyan/10 text-white'
                  : 'border-best-border bg-best-bg/40 text-best-muted hover:border-best-cyan/30'
              )}
            >
              {t('checkout.spinRewardNone')}
            </button>
          </li>
          {items.map((item) => {
            const selected = selectedInventoryId === item.inventoryId;
            const preview = formatPrizeEffectPreview(
              item.prize.prize_type,
              item.prize.value,
              formatPrice
            );
            const name = localizePrizeName(item.prize.name, locale);
            return (
              <li key={item.inventoryId}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                    selected
                      ? 'border-best-gold/50 bg-best-gold/10 text-white'
                      : 'border-best-border bg-best-bg/40 text-best-muted hover:border-best-gold/30'
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{name}</p>
                    <p className="text-xs text-best-caption">{preview}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-best-elevated px-2 py-0.5 text-xs font-bold text-best-gold">
                    x{item.quantity}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
