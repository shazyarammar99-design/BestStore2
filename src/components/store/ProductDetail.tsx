'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Star, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { localizeCategory, localizeDuration, localizePlanType, localizeProduct } from '@/i18n/catalog';
import { type ProductWithVariants } from '@/lib/catalog';
import { getProductImageUrl } from '@/lib/product-media';
import ProductMediaGallery from '@/components/store/ProductMediaGallery';

function uniq(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v)));
}

export default function ProductDetail({ product: rawProduct }: { product: ProductWithVariants }) {
  const router = useRouter();
  const { addItem } = useStore();
  const { requireAuth } = useRequireAuth();
  const { locale, t } = useTranslation();
  const formatPrice = useFormatCurrency();
  const product = localizeProduct(rawProduct, locale);
  const imageUrl = getProductImageUrl(rawProduct);
  const category = rawProduct.category
    ? localizeCategory(rawProduct.category, locale)
    : null;

  const planTypes = useMemo(
    () => uniq(rawProduct.variants.map((v) => v.plan_type)),
    [rawProduct.variants]
  );
  const [activePlan, setActivePlan] = useState<string | null>(planTypes[0] ?? null);

  const durations = useMemo(() => {
    const pool = activePlan
      ? rawProduct.variants.filter((v) => v.plan_type === activePlan)
      : rawProduct.variants;
    return uniq(pool.map((v) => v.duration));
  }, [rawProduct.variants, activePlan]);
  const [activeDuration, setActiveDuration] = useState<string | null>(durations[0] ?? null);

  const selectedVariant = useMemo(() => {
    if (!rawProduct.variants.length) return null;
    return (
      rawProduct.variants.find(
        (v) =>
          (activePlan ? v.plan_type === activePlan : true) &&
          (activeDuration ? v.duration === activeDuration : true)
      ) ?? null
    );
  }, [rawProduct.variants, activePlan, activeDuration]);

  const price = selectedVariant ? selectedVariant.price : rawProduct.base_price;

  const handlePlanChange = (plan: string) => {
    setActivePlan(plan);
    const firstDuration = uniq(
      rawProduct.variants.filter((v) => v.plan_type === plan).map((v) => v.duration)
    )[0];
    setActiveDuration(firstDuration ?? null);
  };

  const variantLabel = [activePlan, activeDuration].filter(Boolean).join(' · ');

  const buyNow = () => {
    if (!requireAuth(t('cart.signInToCheckout'))) return;
    addItem({
      productId: rawProduct.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantLabel: variantLabel || undefined,
      price,
      imageUrl,
      categoryId: rawProduct.category_id,
      rating: rawProduct.rating,
      reviewCount: rawProduct.review_count,
    });
    router.push('/checkout');
  };

  const addToCart = () => {
    if (!requireAuth(t('cart.signInToCheckout'))) return;
    addItem({
      productId: rawProduct.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantLabel: variantLabel || undefined,
      price,
      imageUrl,
      categoryId: rawProduct.category_id,
      rating: rawProduct.rating,
      reviewCount: rawProduct.review_count,
    });
    toast.success(t('product.addToCart'), {
      description: product.name,
      action: {
        label: t('cart.goToCheckout'),
        onClick: () => router.push('/checkout'),
      },
    });
  };

  return (
    <>
    <div className="grid grid-cols-1 gap-10 pb-28 lg:grid-cols-2 lg:pb-0">
      {/* Visual */}
      <ProductMediaGallery
        mainImage={imageUrl}
        galleryImages={rawProduct.gallery_images ?? []}
        videoUrl={rawProduct.video_url ?? null}
        productName={product.name}
      />

      {/* Info + selection */}
      <div className="flex flex-col">
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="font-heading flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-best-cyan hover:text-glow-cyan"
          >
            {category.name}
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
        <h1 className="font-display mt-3 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
          {product.name}
        </h1>

        <div className="mt-3 flex items-center gap-3">
          <span className="flex items-center gap-1 text-best-gold">
            <Star className="h-4 w-4 fill-best-gold" />
            <span className="font-heading text-sm font-bold text-white">
              {product.rating.toFixed(1)}
            </span>
          </span>
          <span className="text-xs text-best-caption">
            {product.review_count > 0
              ? `${product.review_count} ${t('product.reviews')}`
              : t('product.newArrival')}
          </span>
        </div>

        {product.description && (
          <p className="mt-5 leading-relaxed text-best-muted">{product.description}</p>
        )}

        {/* Plan types */}
        {planTypes.length > 1 && (
          <div className="mt-8">
            <p className="font-heading mb-3 text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
              {t('product.planType')}
            </p>
            <div className="flex flex-wrap gap-2">
              {planTypes.map((plan) => (
                <button
                  key={plan}
                  onClick={() => handlePlanChange(plan)}
                  className={`rounded-lg border px-4 py-2.5 font-heading text-sm font-semibold transition-all duration-200 ${
                    activePlan === plan
                      ? 'border-best-cyan bg-best-cyan/10 text-best-cyan shadow-cyan-glow'
                      : 'border-best-border text-best-muted hover:border-best-cyan/50 hover:text-white'
                  }`}
                >
                  {localizePlanType(plan, locale)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Durations */}
        {durations.length > 0 && (
          <div className="mt-6">
            <p className="font-heading mb-3 text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
              {t('product.durationLabel')}
            </p>
            <div className="flex flex-wrap gap-2">
              {durations.map((duration) => (
                <button
                  key={duration}
                  onClick={() => setActiveDuration(duration)}
                  className={`rounded-lg border px-4 py-2.5 font-heading text-sm font-semibold transition-all duration-200 ${
                    activeDuration === duration
                      ? 'border-best-gold bg-best-gold/10 text-best-gold shadow-gold-glow'
                      : 'border-best-border text-best-muted hover:border-best-gold/50 hover:text-white'
                  }`}
                >
                  {localizeDuration(duration, locale)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price + actions */}
        <div className="mt-8 rounded-xl border border-best-border bg-best-elevated p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-heading text-[11px] uppercase tracking-widest text-best-caption">
                {t('product.totalPrice')}
              </p>
              <p className="font-display text-3xl font-black text-best-cyan">{formatPrice(price)}</p>
            </div>
            {selectedVariant && selectedVariant.stock > 0 && (
              <span className="font-heading rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                {t('product.inStock')}
              </span>
            )}
          </div>

          <div className="mt-5 hidden flex-col gap-3 sm:flex-row lg:flex">
            <button
              onClick={buyNow}
              className="flex-1 rounded-lg bg-best-gold px-6 py-3.5 font-heading text-sm font-bold uppercase tracking-widest text-best-bg transition-all duration-200 hover:scale-[1.02] hover:shadow-gold-glow"
            >
              {t('common.buyNow')}
            </button>
            <button
              onClick={addToCart}
              className="flex-1 rounded-lg border border-best-cyan/40 px-6 py-3.5 font-heading text-sm font-bold uppercase tracking-widest text-best-cyan transition-all duration-200 hover:border-best-cyan hover:shadow-cyan-glow"
            >
              {t('product.addToCart')}
            </button>
          </div>
        </div>

        {/* Trust */}
        <div className="mt-6 flex flex-wrap gap-5">
          <span className="flex items-center gap-2 text-sm text-best-muted">
            <Zap className="h-4 w-4 text-best-cyan" /> {t('product.instantDelivery')}
          </span>
          <span className="flex items-center gap-2 text-sm text-best-muted">
            <ShieldCheck className="h-4 w-4 text-best-purple" /> {t('product.verifiedSecure')}
          </span>
        </div>
      </div>
    </div>

    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-best-border bg-best-bg/95 p-4 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-[10px] uppercase tracking-widest text-best-caption">
            {t('product.totalPrice')}
          </p>
          <p className="font-display text-xl font-black text-best-cyan">{formatPrice(price)}</p>
        </div>
        <button
          onClick={addToCart}
          className="min-h-11 shrink-0 rounded-lg border border-best-cyan/40 px-4 py-3 font-heading text-xs font-bold uppercase tracking-widest text-best-cyan"
        >
          {t('product.addToCart')}
        </button>
        <button
          onClick={buyNow}
          className="min-h-11 shrink-0 rounded-lg bg-best-gold px-4 py-3 font-heading text-xs font-bold uppercase tracking-widest text-best-bg"
        >
          {t('common.buyNow')}
        </button>
      </div>
    </div>
    </>
  );
}
