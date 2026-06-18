'use client';

import { Lock, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from '@/context/LocaleContext';

export default function CheckoutTrustBadges() {
  const { t } = useTranslation();

  const badges = [
    { icon: ShieldCheck, label: t('checkout.securePayment') },
    { icon: Lock, label: t('checkout.buyerProtection') },
    { icon: Zap, label: t('checkout.instantDeliveryBadge') },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      {badges.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-full border border-best-border/80 bg-best-bg/50 px-3 py-1.5 text-[10px] font-heading font-semibold uppercase tracking-wider text-best-caption transition-colors hover:border-best-cyan/40 hover:text-best-muted"
        >
          <Icon className="h-3.5 w-3.5 text-best-cyan" />
          {label}
        </span>
      ))}
    </div>
  );
}
