'use client';

import { useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { toast } from 'sonner';
import {
  FEATURED_PRODUCTS,
  CATEGORY_COLORS,
  getProductById,
  getCategoryById,
  type Product,
} from '@/data';
import { useStore } from '@/context/StoreContext';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { localizeCategory, localizeDuration, localizeProduct } from '@/i18n/catalog';
import ProductVariantDialog from '@/components/ProductVariantDialog';
import SectionHeader from '@/components/SectionHeader';
import {
  Coins,
  ShieldOff,
  Gamepad2,
  Tags,
  Wrench,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Coins,
  ShieldOff,
  Gamepad2,
  Tags,
  Wrench,
  'bypass-pubg': ShieldOff,
  'steam-games': Gamepad2,
  'discounted-games': Tags,
  'other-games': Wrench,
};

function FeaturedCard({ product: rawProduct }: { product: Product }) {
  const { addItem } = useStore();
  const { locale, t } = useTranslation();
  const formatPrice = useFormatCurrency();
  const [dialogOpen, setDialogOpen] = useState(false);
  const product = localizeProduct({ ...rawProduct, slug: rawProduct.id }, locale);
  const rawCategory = getCategoryById(product.categoryId);
  const category = rawCategory
    ? localizeCategory({ ...rawCategory, slug: rawCategory.id }, locale)
    : null;
  const accent = CATEGORY_COLORS[product.categoryId] || '#00F0FF';
  const Icon = (category && ICON_MAP[category.id]) || Coins;
  const hasVariants = Boolean(product.variants && product.variants.length > 1);
  const optionLabel = hasVariants
    ? `${product.variants!.length} options`
    : localizeDuration(product.duration, locale);

  const displayPrice = hasVariants
    ? `${t('product.from')} ${formatPrice(Math.min(...product.variants!.map((v) => v.price)))}`
    : formatPrice(product.price);

  const handleClick = () => {
    if (hasVariants) {
      setDialogOpen(true);
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      variantLabel: localizeDuration(product.duration, locale),
      price: product.price,
    });
    toast.success(`${t('product.addToCart')}: ${product.name}`);
  };

  return (
    <div className="group min-w-0 flex-[0_0_85%] sm:flex-[0_0_46%] lg:flex-[0_0_31%]">
      <div className="flex h-full flex-col rounded-xl border border-best-border bg-best-elevated p-6 transition-all duration-300 hover:-translate-y-1 hover:border-best-cyan/60 hover:shadow-cyan-glow">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ background: `${accent}1A`, color: accent }}
          >
            <Icon className="h-6 w-6" />
          </div>
          {category && (
            <span className="flex items-center gap-1.5 rounded-full border border-best-purple/30 bg-best-purple/10 px-2.5 py-1 font-heading text-[11px] font-semibold uppercase tracking-wider text-best-purple">
              {category.tag}
            </span>
          )}
        </div>

        <h3 className="font-heading mt-5 text-xl font-bold text-white">{product.name}</h3>
        <p className="mt-1 text-sm text-best-caption">{product.description}</p>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3.5 w-3.5 ${
                  s <= 5 ? 'fill-best-gold text-best-gold' : 'fill-best-border text-best-border'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-best-muted">4.5</span>
        </div>

        {/* Options / duration */}
        <p className="mt-3 font-heading text-xs font-semibold uppercase tracking-wider text-best-caption">
          {optionLabel}
        </p>

        {/* Benefits */}
        <ul className="mt-3 space-y-1.5">
          {[
            t('benefits.oneTimePayment'),
            t('benefits.instantDelivery'),
            t('benefits.support247'),
          ].map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-xs text-best-muted">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              {benefit}
            </li>
          ))}
        </ul>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between border-t border-best-border pt-5">
          <span className="font-display text-lg font-bold text-best-gold">{displayPrice}</span>
          <button
            onClick={handleClick}
            className="rounded-lg bg-best-cyan/10 px-4 py-2 font-heading text-xs font-bold uppercase tracking-widest text-best-cyan transition-all duration-200 hover:bg-best-cyan hover:text-best-bg hover:shadow-cyan-glow"
          >
            {hasVariants ? t('product.selectPlan') : t('product.addToCart')}
          </button>
        </div>
      </div>

      {hasVariants && (
        <ProductVariantDialog product={rawProduct} open={dialogOpen} onOpenChange={setDialogOpen} />
      )}
    </div>
  );
}

export default function FeaturedCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });
  const { t } = useTranslation();

  const products = FEATURED_PRODUCTS.map((id) => getProductById(id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
  );

  return (
    <section id="software" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow={t('sections.featured').toUpperCase()}
          headline={t('sections.featured')}
          subtitle={`${products.length} items — ${t('sections.deliveredIqd')}`}
        />

        <div className="relative mt-14">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5">
              {products.map((product) => (
                <FeaturedCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous"
            className="absolute -left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-best-border bg-best-elevated text-best-muted transition-all hover:border-best-cyan hover:text-best-cyan hover:shadow-cyan-glow md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next"
            className="absolute -right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-best-border bg-best-elevated text-best-muted transition-all hover:border-best-cyan hover:text-best-cyan hover:shadow-cyan-glow md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
