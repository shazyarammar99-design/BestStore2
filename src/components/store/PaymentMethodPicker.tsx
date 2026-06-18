'use client';

import { useState } from 'react';
import {
  CreditCard,
  Bitcoin,
  Smartphone,
  MessageCircle,
  Banknote,
  Check,
  Copy,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '@/context/LocaleContext';
import { type PaymentMethod, isPlaceholderAccount } from '@/lib/payment-methods';

const ICONS: Record<string, LucideIcon> = {
  CreditCard,
  Bitcoin,
  Smartphone,
  MessageCircle,
  Banknote,
};

function CopyButton({ value }: { value: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex shrink-0 items-center gap-1.5 rounded-md border border-best-border px-2.5 py-1.5 text-xs font-semibold text-best-cyan transition-colors hover:border-best-cyan"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? t('payment.copied') : t('payment.copy')}
    </button>
  );
}

export default function PaymentMethodPicker({
  methods,
  selectedSlug,
  onSelect,
}: {
  methods: PaymentMethod[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  const { t } = useTranslation();
  const selected = methods.find((m) => m.slug === selectedSlug) ?? null;

  return (
    <div className="space-y-4">
      <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
        {t('payment.chooseMethod')}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {methods.map((method) => {
          const Icon = ICONS[method.icon] ?? CreditCard;
          const active = method.slug === selectedSlug;
          const unavailable = method.available === false;
          return (
            <button
              key={method.slug}
              type="button"
              disabled={unavailable}
              onClick={() => onSelect(method.slug)}
              aria-disabled={unavailable}
              className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-left transition-all duration-200 ${
                unavailable
                  ? 'cursor-not-allowed border-best-border bg-best-elevated/40 opacity-50'
                  : active
                    ? 'border-best-cyan bg-best-cyan/10 shadow-cyan-glow'
                    : 'border-best-border bg-best-elevated hover:border-best-cyan/50'
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  unavailable ? 'text-best-caption' : active ? 'text-best-cyan' : 'text-best-gold'
                }`}
              />
              <span className="min-w-0">
                <span
                  className={`block font-heading text-xs font-semibold leading-tight ${
                    active && !unavailable ? 'text-white' : 'text-best-muted'
                  }`}
                >
                  {method.label}
                </span>
                {unavailable && (
                  <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wider text-best-gold">
                    {t('payment.unavailable')}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {selected && selected.available !== false && (
        <div className="rounded-lg border border-best-border bg-best-bg/60 p-4">
          <p className="text-sm leading-relaxed text-best-muted">{selected.instructions}</p>

          {selected.account_value && !isPlaceholderAccount(selected.account_value) && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-best-border bg-best-elevated px-3 py-2.5">
              <span className="truncate font-mono text-sm text-white">{selected.account_value}</span>
              <CopyButton value={selected.account_value} />
            </div>
          )}

          {isPlaceholderAccount(selected.account_value) && selected.slug === 'crypto' && (
            <p className="mt-3 rounded-md border border-best-gold/30 bg-best-gold/10 px-3 py-2 text-xs text-best-gold">
              {t('payment.cryptoPending')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
