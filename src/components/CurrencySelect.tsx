'use client';

import { DollarSign } from 'lucide-react';
import { type CurrencyCode } from '@/config/currency';
import { useLocale } from '@/context/LocaleContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LABELS: Record<CurrencyCode, string> = {
  IQD: 'IQD',
  USD: '$ USD',
  EUR: '€ EUR',
  GBP: '£ GBP',
};

export default function CurrencySelect({ className }: { className?: string }) {
  const { currency, setCurrency, currencies } = useLocale();

  return (
    <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
      <SelectTrigger
        size="sm"
        aria-label="Select currency"
        className={
          className ??
          'hidden h-10 min-w-[5.5rem] rounded-lg border-best-border bg-transparent font-heading text-xs font-semibold text-best-muted shadow-none hover:border-best-cyan hover:text-best-cyan sm:flex'
        }
      >
        <DollarSign className="h-3.5 w-3.5 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        side="bottom"
        sideOffset={8}
        align="start"
        className="border-best-border bg-best-elevated text-white"
      >
        {currencies.map((c) => (
          <SelectItem key={c.code} value={c.code} className="text-sm focus:bg-best-cyan/10">
            {LABELS[c.code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
