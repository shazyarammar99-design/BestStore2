'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  getCategoryById,
  type Product,
} from '@/data';
import { useStore } from '@/context/StoreContext';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { localizeCategory, localizeDuration, localizeProduct } from '@/i18n/catalog';
import ProductVariantDialog from '@/components/ProductVariantDialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export default function ProductCard({ product: rawProduct }: { product: Product }) {
  const { locale, t } = useTranslation();
  const formatPrice = useFormatCurrency();
  const product = localizeProduct({ ...rawProduct, slug: rawProduct.id }, locale);
  const rawCategory = getCategoryById(product.categoryId);
  const category = rawCategory
    ? localizeCategory({ ...rawCategory, slug: rawCategory.id }, locale)
    : null;
  const { addItem } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasVariants = Boolean(product.variants && product.variants.length > 1);

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
    <>
      <Card className="flex flex-col border-best-border bg-best-elevated transition-all duration-300 hover:-translate-y-1 hover:border-best-cyan/60 hover:shadow-cyan-glow">
        <CardHeader className="pb-3">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between">
            <CardTitle className="font-heading text-base font-bold text-white sm:text-lg">
              {product.name}
            </CardTitle>
            {category && (
              <Badge variant="outline" className="shrink-0 border-best-purple/40 text-[10px] sm:text-xs text-best-purple">
                {category.tag}
              </Badge>
            )}
          </div>
          <p className="font-heading text-xs uppercase tracking-wider text-best-caption">
            {category?.name}
          </p>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm leading-relaxed text-best-muted">{product.description}</p>
          <p className="font-heading mt-3 text-xs font-semibold uppercase tracking-wider text-best-caption">
            {hasVariants
              ? `${product.variants!.length} options`
              : localizeDuration(product.duration, locale)}
          </p>
        </CardContent>
        <CardFooter className="border-t border-best-border pt-4">
          <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-display text-base font-bold tracking-tight text-best-gold sm:text-lg">
              {displayPrice}
            </span>
            <button
              onClick={handleClick}
              className="min-h-11 w-full rounded-lg bg-best-cyan/10 px-4 py-2 font-heading text-[10px] font-bold uppercase tracking-widest text-best-cyan transition-all duration-200 hover:bg-best-cyan hover:text-best-bg hover:shadow-cyan-glow sm:w-auto sm:text-xs"
            >
              {hasVariants ? t('product.selectPlan') : t('product.addToCart')}
            </button>
          </div>
        </CardFooter>
      </Card>

      {hasVariants && (
        <ProductVariantDialog product={rawProduct} open={dialogOpen} onOpenChange={setDialogOpen} />
      )}
    </>
  );
}
