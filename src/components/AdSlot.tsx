'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSiteAds } from '@/hooks/useSiteAds';
import type { AdPlacement } from '@/types/site-content';
import { cn } from '@/lib/utils';

type AdVariant = 'compact' | 'promo';

type AdSlotProps = {
  placement: AdPlacement;
  variant?: AdVariant;
};

export default function AdSlot({ placement, variant = 'compact' }: AdSlotProps) {
  const { ads, loading } = useSiteAds(placement);
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adsenseSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
  const isPromo = variant === 'promo';

  useEffect(() => {
    if (!adsenseClient || !adsenseSlot) return;
    try {
      // @ts-expect-error adsbygoogle injected by AdSense script when enabled
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense not loaded */
    }
  }, [adsenseClient, adsenseSlot]);

  if (adsenseClient && adsenseSlot) {
    return (
      <div
        data-placement={placement}
        className={cn(
          'flex w-full items-center justify-center overflow-hidden',
          isPromo ? 'min-h-[140px] md:min-h-[200px]' : 'min-h-[90px] md:min-h-[120px]'
        )}
      >
        <ins
          className="adsbygoogle block w-full"
          style={{ display: 'block' }}
          data-ad-client={adsenseClient}
          data-ad-slot={adsenseSlot}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={cn(
          'animate-pulse rounded-lg bg-best-border/40',
          isPromo ? 'h-[140px] md:h-[200px]' : 'h-[90px] md:h-[120px]'
        )}
      />
    );
  }

  return <SiteAdCarousel ads={ads} placement={placement} variant={variant} />;
}

function SiteAdCarousel({
  ads,
  placement,
  variant,
}: {
  ads: { id: string; image_url: string; link_url: string; alt_text: string }[];
  placement: AdPlacement;
  variant: AdVariant;
}) {
  const [index, setIndex] = useState(0);
  const isPromo = variant === 'promo';

  useEffect(() => {
    if (ads.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % ads.length), 8000);
    return () => clearInterval(id);
  }, [ads.length]);

  const ad = ads[index];
  if (!ad) return null;

  return (
    <Link
      href={ad.link_url}
      data-placement={placement}
      className={cn(
        'group relative flex w-full items-center overflow-hidden border border-best-border/60 bg-best-elevated/80',
        isPromo
          ? 'h-[140px] justify-start rounded-2xl md:h-[200px]'
          : 'h-[90px] justify-center rounded-lg md:h-[120px]'
      )}
      aria-label={ad.alt_text}
    >
      <Image
        src={ad.image_url}
        alt={ad.alt_text}
        fill
        className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
        sizes="100vw"
        unoptimized
      />
      <div
        className={cn(
          'absolute inset-0',
          isPromo
            ? 'bg-gradient-to-r from-best-bg/85 via-best-bg/50 to-best-bg/20'
            : 'bg-gradient-to-r from-best-bg/70 via-best-bg/30 to-best-bg/70'
        )}
      />
      <span
        className={cn(
          'relative z-10 font-heading font-bold uppercase tracking-widest text-white',
          isPromo
            ? 'max-w-xl px-6 text-left text-sm md:px-10 md:text-base lg:text-lg'
            : 'max-w-lg px-4 text-center text-xs md:text-sm'
        )}
      >
        {ad.alt_text}
      </span>
      <span className="absolute right-2 top-2 rounded bg-best-bg/80 px-1.5 py-0.5 text-[10px] uppercase text-best-caption">
        Ad
      </span>
    </Link>
  );
}
