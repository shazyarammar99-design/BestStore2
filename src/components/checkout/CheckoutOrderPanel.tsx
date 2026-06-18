'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreditCard, Loader2, Lock, Star } from 'lucide-react';
import CheckoutTrustBadges from '@/components/checkout/CheckoutTrustBadges';
import PaymentMethodPicker from '@/components/store/PaymentMethodPicker';
import { CHECKOUT_SELLER } from '@/config/checkout';
import { useAuth } from '@/context/AuthContext';
import { useBrandingSettings } from '@/hooks/useSiteSettings';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { useStore, type CartItem } from '@/context/StoreContext';
import { type CheckoutPricing } from '@/lib/checkout-pricing';
import { submitOrder } from '@/lib/orders/client';
import { buildDiscordPrefillMessage, getDiscordInviteUrl } from '@/lib/discord/orders';
import { shortOrderId } from '@/lib/orders/utils';
import { type PaymentMethod } from '@/lib/payment-methods';
import { isStripeEnabled, startStripeCheckout } from '@/lib/stripe-client';
import {
  getDeliveryFieldsForCategories,
  type DeliveryFieldDef,
} from '@/config/checkout-delivery-fields';

const CARD_SLUG = 'visa-mastercard';
const WHATSAPP_URL = 'https://wa.me/9647503220525';

const panelClass =
  'rounded-2xl border border-best-border bg-best-elevated/90 p-6 shadow-card-glow backdrop-blur-md md:p-7';

function ProductThumbnail({ item }: { item: CartItem }) {
  if (item.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.imageUrl}
        alt={item.name}
        className="h-14 w-14 shrink-0 rounded-xl border border-best-border object-cover"
      />
    );
  }
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-best-border bg-gradient-to-br from-best-purple/25 via-best-surface to-best-cyan/10 p-1">
      <span className="line-clamp-2 text-center font-heading text-[9px] font-bold uppercase leading-tight text-white">
        {item.name}
      </span>
    </div>
  );
}

export type CheckoutHandlerProps = {
  items: CartItem[];
  pricing: CheckoutPricing;
  paymentMethods: PaymentMethod[];
  deliveryValues: Record<string, string>;
  sellerNotes: string;
};

export function useCheckoutHandler({
  items,
  pricing,
  paymentMethods,
  deliveryValues,
  sellerNotes,
}: CheckoutHandlerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { clearCart } = useStore();
  const { t } = useTranslation();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    paymentMethods.find((m) => m.available !== false)?.slug ?? null
  );
  const [loading, setLoading] = useState(false);

  const useStripe = selectedSlug === CARD_SLUG && isStripeEnabled;

  const validateDelivery = (): boolean => {
    const categoryIds = items.map((i) => i.categoryId).filter((id): id is string => !!id);
    const fields = getDeliveryFieldsForCategories(categoryIds);
    const missing = fields.filter(
      (f: DeliveryFieldDef) => f.required && !(deliveryValues[f.id]?.trim())
    );
    if (missing.length > 0) {
      toast.error(t('checkout.deliveryRequired'));
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!user) return null;
    return submitOrder({
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      paymentMethodSlug: selectedSlug ?? undefined,
      delivery: deliveryValues,
      sellerNotes: sellerNotes || undefined,
      promoCode: pricing.promoCode ?? undefined,
    });
  };

  const handleCheckout = async () => {
    if (!user || items.length === 0) return;
    if (!validateDelivery()) return;
    if (paymentMethods.length > 0 && !selectedSlug) {
      toast.error(t('cart.paymentMethod'));
      return;
    }

    setLoading(true);
    const result = await placeOrder();
    if (!result || !result.ok) {
      toast.error(result?.ok === false ? result.error : 'Failed to place order.');
      setLoading(false);
      return;
    }

    const orderId = result.order.id;
    const shortId = shortOrderId(orderId);

    if (useStripe) {
      const error = await startStripeCheckout(
        items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          orderId,
        }))
      );
      if (error) {
        toast.error(error);
        setLoading(false);
      }
      return;
    }

    clearCart();
    const discordUrl = `${getDiscordInviteUrl()}?message=${buildDiscordPrefillMessage(orderId, shortId)}`;
    router.push(`/checkout/success?order=${orderId}&discord=${encodeURIComponent(discordUrl)}`);
  };

  return {
    selectedSlug,
    setSelectedSlug,
    loading,
    useStripe,
    handleCheckout,
    t,
  };
}

export type CheckoutOrderPanelProps = CheckoutHandlerProps & {
  selectedSlug: string | null;
  setSelectedSlug: (slug: string) => void;
  loading: boolean;
  useStripe: boolean;
  handleCheckout: () => Promise<void>;
  compact?: boolean;
};

export default function CheckoutOrderPanel({
  items,
  pricing,
  paymentMethods,
  selectedSlug,
  setSelectedSlug,
  loading,
  useStripe,
  handleCheckout,
  compact = false,
}: CheckoutOrderPanelProps) {
  const { t } = useTranslation();
  const formatPrice = useFormatCurrency();
  const { settings: branding } = useBrandingSettings();

  const showFee = pricing.serviceFee > 0;
  const showDiscount = pricing.discount > 0;

  return (
    <div className={panelClass}>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.cartKey}
            className="flex gap-3 rounded-xl border border-best-border/60 bg-best-bg/40 p-3 transition-colors hover:border-best-cyan/30"
          >
            <ProductThumbnail item={item} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-sm font-bold text-white">{item.name}</p>
              {item.variantLabel && (
                <p className="truncate text-xs text-best-caption">{item.variantLabel}</p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-md bg-best-cyan/10 px-2 py-0.5 font-heading text-[10px] font-bold text-best-cyan">
                  x{item.quantity}
                </span>
                <span className="font-display text-sm font-bold text-best-gold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-best-border pt-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-best-cyan/30 bg-best-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={branding.logoUrl} alt="" className="h-8 w-auto object-contain" />
        </div>
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-wider text-best-muted">
            {t('checkout.seller')}
          </p>
          <p className="font-heading text-sm font-bold text-white">{CHECKOUT_SELLER.name}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-best-gold text-best-gold" />
            <span className="text-xs font-semibold text-white">
              {CHECKOUT_SELLER.rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-best-caption">
              ({CHECKOUT_SELLER.reviewCount}+ {t('product.reviews')})
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2.5 border-t border-best-border pt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-best-muted">{t('cart.subtotal')}</span>
          <span className="font-semibold text-white">{formatPrice(pricing.subtotal)}</span>
        </div>
        {showFee && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-best-muted">{t('checkout.serviceFee')}</span>
            <span className="font-semibold text-white">{formatPrice(pricing.serviceFee)}</span>
          </div>
        )}
        {showDiscount && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-best-muted">{t('checkout.discount')}</span>
            <span className="font-semibold text-emerald-400">
              -{formatPrice(pricing.discount)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-best-border pt-3">
          <span className="font-heading text-sm font-bold uppercase tracking-widest text-best-muted">
            {t('checkout.total')}
          </span>
          <span className="font-display text-2xl font-black text-best-gold">
            {formatPrice(pricing.total)}
          </span>
        </div>
      </div>

      {!compact && paymentMethods.length > 0 && (
        <div className="mt-6 border-t border-best-border pt-6">
          <PaymentMethodPicker
            methods={paymentMethods}
            selectedSlug={selectedSlug}
            onSelect={setSelectedSlug}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleCheckout()}
        disabled={loading || items.length === 0}
        className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-best-gold px-6 py-4 font-heading text-sm font-bold uppercase tracking-widest text-best-bg transition-all duration-200 hover:scale-[1.02] hover:shadow-gold-glow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : useStripe ? (
          <CreditCard className="h-5 w-5" />
        ) : (
          <Lock className="h-5 w-5" />
        )}
        {useStripe ? t('cart.payWithStripe') : t('checkout.secureCheckout')}
      </button>

      {!compact && (
        <>
          <p className="mt-4 text-center text-xs leading-relaxed text-best-caption">
            {t('checkout.paymentHint')}
          </p>
          <p className="mt-2 text-center text-xs text-best-caption">
            {t('checkout.supportHint')}{' '}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-best-cyan hover:underline"
            >
              {t('footer.whatsapp')}
            </a>
          </p>
          <CheckoutTrustBadges />
        </>
      )}
    </div>
  );
}
