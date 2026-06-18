'use client';

import { Globe } from 'lucide-react';
import { LOCALES, type Locale } from '@/i18n/types';
import { useLocale } from '@/context/LocaleContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LanguageSelect({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
      <SelectTrigger
        size="sm"
        aria-label="Select language"
        className={
          className ??
          'hidden h-10 min-w-[6.5rem] rounded-lg border-best-border bg-transparent font-heading text-xs font-semibold text-best-muted shadow-none hover:border-best-cyan hover:text-best-cyan sm:flex'
        }
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        side="bottom"
        sideOffset={8}
        align="start"
        className="border-best-border bg-best-elevated text-white"
      >
        {LOCALES.map((l) => (
          <SelectItem key={l.code} value={l.code} className="text-sm focus:bg-best-cyan/10">
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
