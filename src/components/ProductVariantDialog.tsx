'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type Product } from '@/data';
import { useStore } from '@/context/StoreContext';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { localizeDuration, localizeProduct } from '@/i18n/catalog';

type Props = {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ProductVariantDialog({ product: rawProduct, open, onOpenChange }: Props) {
  const { addItem } = useStore();
  const { locale, t } = useTranslation();
  const formatPrice = useFormatCurrency();
  const product = localizeProduct({ ...rawProduct, slug: rawProduct.id }, locale);
  const variants = product.variants ?? [];
  const [selectedId, setSelectedId] = useState<string>(variants[0]?.id ?? '');

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  const handleAdd = () => {
    if (!selected) return;
    const duration = localizeDuration(selected.duration, locale);
    addItem({
      productId: product.id,
      variantId: selected.id,
      name: product.name,
      variantLabel: duration,
      price: selected.price,
    });
    toast.success(`${t('product.addToCart')}: ${product.name} — ${duration}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-best-border bg-best-elevated text-white">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-white">
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-best-muted">{product.description}</DialogDescription>
        </DialogHeader>

        <RadioGroup value={selectedId} onValueChange={setSelectedId} className="mt-2 gap-2">
          {variants.map((variant) => (
            <label
              key={variant.id}
              htmlFor={`variant-${product.id}-${variant.id}`}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-all duration-200 ${
                selectedId === variant.id
                  ? 'border-best-cyan bg-best-cyan/10 shadow-cyan-glow'
                  : 'border-best-border hover:border-best-cyan/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem
                  id={`variant-${product.id}-${variant.id}`}
                  value={variant.id}
                  className="border-best-border text-best-cyan"
                />
                <span className="font-heading text-sm font-semibold text-white">
                  {localizeDuration(variant.duration, locale)}
                </span>
              </div>
              <span className="font-display text-sm font-bold text-best-gold">
                {formatPrice(variant.price)}
              </span>
            </label>
          ))}
        </RadioGroup>

        <button
          onClick={handleAdd}
          className="mt-4 w-full rounded-lg bg-best-gold px-6 py-3 font-heading text-sm font-bold uppercase tracking-widest text-best-bg transition-transform duration-200 hover:scale-[1.02] hover:shadow-gold-glow"
        >
          {t('product.addToCart')}
          {selected ? ` — ${formatPrice(selected.price)}` : ''}
        </button>
      </DialogContent>
    </Dialog>
  );
}
