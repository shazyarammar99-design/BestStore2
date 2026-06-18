'use client';

import Image from 'next/image';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { localizePrizeName } from '@/i18n/catalog';
import { getPrizeIconKey } from '@/lib/spin/prize-icons';
import type { SpinResult } from '@/types/spin';

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  Percent,
  Coins,
  Truck,
  Gem,
  Sparkles,
  Trophy,
  Gift,
};

type SpinResultDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: SpinResult | null;
};

export default function SpinResultDialog({ open, onOpenChange, result }: SpinResultDialogProps) {
  const { t, locale } = useTranslation();
  const formatPrice = useFormatCurrency();

  if (!result) return null;

  const iconKey = getPrizeIconKey(result.prize.name);
  const Icon = ICON_COMPONENTS[iconKey] ?? Gift;
  const prizeName = localizePrizeName(result.prize.name, locale);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-best-border bg-best-elevated text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-black uppercase tracking-tight text-best-gold">
            {t('spin.youWon')}
          </DialogTitle>
          <DialogDescription className="text-best-muted">
            {t('spin.claimPrize')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 rounded-xl border border-best-border bg-best-bg/60 p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-best-cyan/40 bg-best-elevated shadow-cyan-glow">
            {result.prize.image_url ? (
              <Image
                src={result.prize.image_url}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <Icon className="h-8 w-8 text-best-cyan" aria-hidden />
            )}
          </div>
          <p className="font-heading text-lg font-bold text-white">{prizeName}</p>
          {result.prize.value > 0 && (
            <p className="mt-2 font-display text-3xl font-black text-best-cyan">
              {formatPrice(result.prize.value)} {t('product.prizeValue')}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
