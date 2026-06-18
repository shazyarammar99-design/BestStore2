'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, Lock, LogIn, ShoppingBag } from 'lucide-react';
import BrandMark from '@/components/store/BrandMark';
import CheckoutDetailsPanel from '@/components/checkout/CheckoutDetailsPanel';
import CheckoutOrderPanel, { useCheckoutHandler } from '@/components/checkout/CheckoutOrderPanel';
import { useAuth } from '@/context/AuthContext';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { useStore } from '@/context/StoreContext';
import { calculateCheckoutPricing } from '@/lib/checkout-pricing';
import { type PaymentMethod } from '@/lib/payment-methods';

function CheckoutSteps() {
  const { t } = useTranslation();
  const steps = [
    { label: t('checkout.steps.cart') },
    { label: t('checkout.steps.payment') },
    { label: t('checkout.steps.confirm') },
  ];

  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs font-heading font-semibold uppercase tracking-widest">
      {steps.map((step, i) => (
        <li key={step.label} className="flex items-center gap-2">
          <span className={i <= 1 ? 'text-best-cyan' : 'text-best-caption'}>{step.label}</span>
          {i < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-best-border" />}
        </li>
      ))}
    </ol>
  );
}

export default function CartCheckoutPage({
  paymentMethods,
}: {
  paymentMethods: PaymentMethod[];
}) {
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice, updateQuantity, removeItem } = useStore();
  const { t } = useTranslation();
  const formatPrice = useFormatCurrency();

  const [deliveryValues, setDeliveryValues] = useState<Record<string, string>>({});
  const [sellerNotes, setSellerNotes] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const pricing = useMemo(
    () => calculateCheckoutPricing(totalPrice, appliedPromo),
    [totalPrice, appliedPromo]
  );

  const handler = useCheckoutHandler({
    items,
    pricing,
    paymentMethods,
    deliveryValues,
    sellerNotes,
  });

  const handleDeliveryChange = (id: string, value: string) => {
    setDeliveryValues((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <main className="relative px-6 pb-32 pt-32 lg:pb-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,240,255,0.05)_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(176,38,255,0.05)_0%,_transparent_45%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 border-b border-best-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white">
              {t('checkout.title')}
            </h1>
            <div className="mt-4">
              <CheckoutSteps />
            </div>
          </div>
          <BrandMark size="sm" className="hidden sm:inline-block" />
        </div>

        {authLoading ? (
          <p className="mt-16 text-center text-best-muted">{t('cart.loading')}</p>
        ) : !user ? (
          <div className="mx-auto mt-16 max-w-md rounded-2xl border border-best-border bg-best-elevated/80 p-10 text-center shadow-card-glow backdrop-blur-sm">
            <LogIn className="mx-auto h-12 w-12 text-best-cyan" />
            <p className="mt-4 font-heading text-lg font-bold text-white">{t('cart.signInToCheckout')}</p>
            <p className="mt-2 text-sm text-best-muted">{t('cart.emptyHint')}</p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-xl bg-best-gold px-8 py-3 font-heading text-sm font-bold uppercase tracking-widest text-best-bg transition-transform hover:scale-[1.02] hover:shadow-gold-glow"
            >
              {t('nav.login')}
            </Link>
            <Link
              href="/signup"
              className="mt-4 block text-sm text-best-cyan hover:underline"
            >
              {t('auth.createAccount')}
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto mt-16 max-w-md rounded-2xl border border-best-border bg-best-elevated/80 p-12 text-center shadow-card-glow backdrop-blur-sm">
            <ShoppingBag className="mx-auto h-14 w-14 text-best-border" />
            <p className="mt-4 font-heading text-lg font-bold text-white">{t('checkout.emptyCart')}</p>
            <p className="mt-2 text-sm text-best-muted">{t('cart.emptyHint')}</p>
            <Link
              href="/#products"
              className="mt-8 inline-block rounded-xl bg-best-gold px-8 py-3 font-heading text-sm font-bold uppercase tracking-widest text-best-bg transition-transform hover:scale-[1.02] hover:shadow-gold-glow"
            >
              {t('checkout.continueShopping')}
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7">
                <CheckoutDetailsPanel
                  items={items}
                  deliveryValues={deliveryValues}
                  onDeliveryChange={handleDeliveryChange}
                  sellerNotes={sellerNotes}
                  onSellerNotesChange={setSellerNotes}
                  appliedPromo={appliedPromo}
                  onApplyPromo={setAppliedPromo}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
                <Link
                  href="/#products"
                  className="mt-6 inline-flex items-center gap-1 text-sm text-best-cyan hover:underline"
                >
                  {t('checkout.continueShopping')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="hidden lg:col-span-5 lg:block">
                <div className="sticky top-28">
                  <CheckoutOrderPanel
                    items={items}
                    pricing={pricing}
                    paymentMethods={paymentMethods}
                    deliveryValues={deliveryValues}
                    sellerNotes={sellerNotes}
                    selectedSlug={handler.selectedSlug}
                    setSelectedSlug={handler.setSelectedSlug}
                    loading={handler.loading}
                    useStripe={handler.useStripe}
                    handleCheckout={handler.handleCheckout}
                  />
                </div>
              </div>

              <div className="lg:col-span-5 lg:hidden">
                <CheckoutOrderPanel
                  items={items}
                  pricing={pricing}
                  paymentMethods={paymentMethods}
                  deliveryValues={deliveryValues}
                  sellerNotes={sellerNotes}
                  selectedSlug={handler.selectedSlug}
                  setSelectedSlug={handler.setSelectedSlug}
                  loading={handler.loading}
                  useStripe={handler.useStripe}
                  handleCheckout={handler.handleCheckout}
                />
              </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-best-border bg-best-bg/95 p-4 backdrop-blur-md lg:hidden">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                <div>
                  <p className="font-heading text-[10px] font-semibold uppercase tracking-widest text-best-muted">
                    {t('checkout.total')}
                  </p>
                  <p className="font-display text-xl font-black text-best-gold">
                    {formatPrice(pricing.total)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handler.handleCheckout()}
                  disabled={handler.loading}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-best-gold px-5 py-3 font-heading text-xs font-bold uppercase tracking-widest text-best-bg transition-all hover:shadow-gold-glow disabled:opacity-60"
                >
                  {handler.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {handler.useStripe ? t('cart.payWithStripe') : t('checkout.secureCheckout')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
