'use client';

import { Clock } from 'lucide-react';
import { useTranslation } from '@/context/LocaleContext';

type ComingSoonPanelProps = {
  title?: string;
};

export default function ComingSoonPanel({ title }: ComingSoonPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-best-border bg-best-elevated p-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-best-cyan/10">
        <Clock className="h-7 w-7 text-best-cyan" />
      </div>
      <h2 className="font-heading text-lg font-bold text-white">
        {title ?? t('account.comingSoonTitle')}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-best-muted">{t('account.comingSoonBody')}</p>
    </div>
  );
}
