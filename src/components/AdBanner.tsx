'use client';

import AdSlot from '@/components/AdSlot';
import { cn } from '@/lib/utils';

type AdBannerProps = {
  variant?: 'compact' | 'promo';
};

export default function AdBanner({ variant = 'compact' }: AdBannerProps) {
  if (variant === 'promo') {
    return (
      <section
        className={cn(
          'relative z-10 -mt-6 mb-2 md:-mt-10 md:mb-4',
          'mx-auto w-full max-w-7xl px-6'
        )}
        aria-label="Advertisement"
      >
        <AdSlot placement="navbar" variant="promo" />
      </section>
    );
  }

  return (
    <div
      className="shrink-0 border-b border-best-border/50 bg-best-bg/95 backdrop-blur-sm"
      aria-label="Advertisement"
    >
      <div className="mx-auto max-w-7xl px-4 py-2">
        <AdSlot placement="navbar" variant="compact" />
      </div>
    </div>
  );
}
