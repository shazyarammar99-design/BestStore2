'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { type Product } from '@/lib/catalog';
import { getProductImageUrl } from '@/lib/product-media';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { localizeProduct } from '@/i18n/catalog';

function ProductCard({ product: raw }: { product: Product }) {
  const { locale, t } = useTranslation();
  const formatPrice = useFormatCurrency();
  const product = localizeProduct(raw, locale);
  const imageUrl = getProductImageUrl(raw);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-best-border bg-best-elevated transition-all duration-300 hover:-translate-y-1 hover:border-best-cyan hover:shadow-cyan-glow"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-best-purple/20 via-best-surface to-best-cyan/10">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="font-display px-4 text-center text-xl font-bold uppercase tracking-wide text-white/90">
            {product.name}
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-best-cyan/40 bg-best-bg/70 px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-best-cyan">
          {t('common.view')}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1 text-best-gold">
          <Star className="h-3.5 w-3.5 fill-best-gold" />
          <span className="font-heading text-xs font-semibold text-white">
            {product.rating.toFixed(1)}
          </span>
        </div>
        <h3 className="font-heading mt-2 text-lg font-bold leading-tight text-white">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-best-muted">{product.description}</p>
        )}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="font-heading text-[11px] uppercase tracking-widest text-best-caption">
              {t('product.from')}
            </p>
            <p className="font-display text-lg font-bold text-best-cyan">
              {formatPrice(product.base_price)}
            </p>
          </div>
          <span className="rounded-lg bg-best-gold px-4 py-2 font-heading text-xs font-bold uppercase tracking-widest text-best-bg transition-all duration-200 group-hover:shadow-gold-glow">
            {t('common.view')}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const { t } = useTranslation();

  if (!products.length) {
    return (
      <p className="py-20 text-center text-best-muted">{t('category.noProducts')}</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
