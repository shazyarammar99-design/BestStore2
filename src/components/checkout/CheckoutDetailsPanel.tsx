'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Minus, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { type CartItem } from '@/context/StoreContext';
import {
  getDeliveryFieldsForCategories,
  type DeliveryFieldDef,
} from '@/config/checkout-delivery-fields';
import { resolvePromoCode } from '@/lib/checkout-pricing';

const inputClass =
  'h-11 rounded-xl border-best-border bg-best-bg/60 font-sans text-sm text-white placeholder:text-best-caption focus:border-best-cyan focus:shadow-cyan-glow focus-visible:ring-0';

const cardClass =
  'rounded-2xl border border-best-border bg-best-elevated/80 p-6 shadow-card-glow backdrop-blur-sm';

export type CheckoutDetailsPanelProps = {
  items: CartItem[];
  deliveryValues: Record<string, string>;
  onDeliveryChange: (id: string, value: string) => void;
  sellerNotes: string;
  onSellerNotesChange: (value: string) => void;
  appliedPromo: string | null;
  onApplyPromo: (code: string | null) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  removeItem: (cartKey: string) => void;
};

export default function CheckoutDetailsPanel({
  items,
  deliveryValues,
  onDeliveryChange,
  sellerNotes,
  onSellerNotesChange,
  appliedPromo,
  onApplyPromo,
  updateQuantity,
  removeItem,
}: CheckoutDetailsPanelProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const formatPrice = useFormatCurrency();
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState(appliedPromo ?? '');
  const [promoError, setPromoError] = useState(false);

  const deliveryFields = useMemo(() => {
    const categoryIds = items.map((i) => i.categoryId).filter((id): id is string => !!id);
    return getDeliveryFieldsForCategories(categoryIds);
  }, [items]);

  const handleApplyPromo = () => {
    const promo = resolvePromoCode(promoInput);
    if (!promo) {
      setPromoError(true);
      onApplyPromo(null);
      return;
    }
    setPromoError(false);
    onApplyPromo(promoInput.trim().toUpperCase());
  };

  return (
    <div className="space-y-6">
      <section className={cardClass}>
        <h2 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
          {t('checkout.accountEmail')}
        </h2>
        <div className="mt-4">
          <Input
            type="email"
            readOnly
            value={user?.email ?? ''}
            className={`${inputClass} cursor-default opacity-90`}
          />
          <Link
            href="/account"
            className="mt-2 inline-block text-xs text-best-cyan transition-colors hover:underline"
          >
            {t('checkout.changeAccount')}
          </Link>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
          {t('checkout.orderSummary')}
        </h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item.cartKey}
              className="flex items-center justify-between gap-3 rounded-xl border border-best-border/60 bg-best-bg/40 px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-bold text-white">{item.name}</p>
                {item.variantLabel && (
                  <p className="truncate text-xs text-best-caption">{item.variantLabel}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                  aria-label={t('cart.quantity')}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-best-border text-best-muted transition-colors hover:border-best-cyan hover:text-best-cyan"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-sm font-semibold text-white">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                  aria-label={t('cart.quantity')}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-best-border text-best-muted transition-colors hover:border-best-cyan hover:text-best-cyan"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.cartKey)}
                  aria-label={`${t('cart.remove')} ${item.name}`}
                  className="ml-1 text-best-caption transition-colors hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="shrink-0 font-display text-sm font-bold text-best-gold">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={cardClass}>
        <h2 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
          {t('checkout.deliveryDetails')}
        </h2>
        <div className="mt-4 space-y-4">
          {deliveryFields.map((field: DeliveryFieldDef) => (
            <div key={field.id}>
              <label
                htmlFor={`delivery-${field.id}`}
                className="mb-1.5 block font-heading text-xs font-semibold text-best-muted"
              >
                {t(field.labelKey as 'deliveryFields.playerId')}
                {field.required && <span className="text-best-gold"> *</span>}
              </label>
              <Input
                id={`delivery-${field.id}`}
                type={field.inputType ?? 'text'}
                value={deliveryValues[field.id] ?? ''}
                onChange={(e) => onDeliveryChange(field.id, e.target.value)}
                placeholder={t(field.placeholderKey as 'deliveryFields.playerIdPlaceholder')}
                className={inputClass}
                required={field.required}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <button
          type="button"
          onClick={() => setPromoOpen((o) => !o)}
          className="flex w-full items-center justify-between font-heading text-xs font-bold uppercase tracking-[0.2em] text-best-muted"
        >
          {t('checkout.promoCode')}
          {promoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {promoOpen && (
          <div className="mt-4 flex gap-2">
            <Input
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value);
                setPromoError(false);
              }}
              placeholder={t('checkout.promoCode')}
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="shrink-0 rounded-xl border border-best-cyan/50 bg-best-cyan/10 px-4 font-heading text-xs font-bold uppercase tracking-wider text-best-cyan transition-all hover:border-best-cyan hover:shadow-cyan-glow"
            >
              {t('checkout.applyPromo')}
            </button>
          </div>
        )}
        {appliedPromo && (
          <p className="mt-2 text-xs font-semibold text-emerald-400">{t('checkout.promoApplied')}</p>
        )}
        {promoError && (
          <p className="mt-2 text-xs font-semibold text-red-400">{t('checkout.promoInvalid')}</p>
        )}
      </section>

      <section className={cardClass}>
        <h2 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
          {t('checkout.notesToSeller')}
        </h2>
        <Textarea
          value={sellerNotes}
          onChange={(e) => onSellerNotesChange(e.target.value.slice(0, 500))}
          placeholder={t('checkout.notesPlaceholder')}
          rows={4}
          className={`${inputClass} mt-4 min-h-[100px] resize-none`}
        />
      </section>
    </div>
  );
}
