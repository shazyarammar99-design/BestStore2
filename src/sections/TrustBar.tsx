'use client';

import { Headphones, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/context/LocaleContext';
import { getTrustBadges } from '@/i18n/content';
import LiveSiteStats from '@/components/LiveSiteStats';

const BADGE_ICONS: Record<string, LucideIcon> = {
  Headphones,
  ShieldCheck,
};

export default function TrustBar() {
  const { locale } = useTranslation();
  const trustBadges = getTrustBadges(locale);

  return (
    <section className="border-y border-best-border bg-best-elevated/60">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <LiveSiteStats variant="trustbar" />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-best-border pt-8">
          {trustBadges.map((badge) => {
            const Icon = BADGE_ICONS[badge.icon] || ShieldCheck;
            return (
              <div key={badge.label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-best-purple" />
                <span className="font-heading text-xs font-semibold uppercase tracking-widest text-best-muted">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
