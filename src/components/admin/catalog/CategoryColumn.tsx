'use client';

import Image from 'next/image';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { CatalogCategory } from '@/types/admin-catalog';
import ProductCard from './ProductCard';

type CategoryColumnProps = {
  category: CatalogCategory;
  isMobile?: boolean;
  allCategories?: CatalogCategory[];
  onMoveToCategory?: (productId: string, categoryId: string) => void;
  onMoveUp?: (productId: string) => void;
  onMoveDown?: (productId: string) => void;
};

export default function CategoryColumn({
  category,
  isMobile = false,
  allCategories = [],
  onMoveToCategory,
  onMoveUp,
  onMoveDown,
}: CategoryColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: category.id,
    data: { type: 'category', category },
    disabled: isMobile,
  });

  const productIds = category.products.map((p) => p.id);

  const productList = category.products.map((product, index) => (
    <ProductCard
      key={product.id}
      product={product}
      isMobile={isMobile}
      categories={allCategories}
      canMoveUp={index > 0}
      canMoveDown={index < category.products.length - 1}
      onMoveToCategory={onMoveToCategory}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    />
  ));

  return (
    <div className="flex w-[min(100%,280px)] shrink-0 snap-center flex-col md:w-72">
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-best-border bg-best-elevated px-3 py-2">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-best-border">
          {category.icon_url && (
            <Image src={category.icon_url} alt="" fill className="object-cover" unoptimized />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-bold text-white">{category.name}</p>
          <p className="truncate text-xs text-best-caption">{category.slug}</p>
        </div>
        <span className="rounded-full bg-best-cyan/15 px-2 py-0.5 text-xs font-semibold text-best-cyan">
          {category.products.length}
        </span>
      </div>

      <div
        ref={isMobile ? undefined : setNodeRef}
        className={`min-h-[120px] flex-1 space-y-2 rounded-xl border border-dashed p-2 transition-colors ${
          !isMobile && isOver
            ? 'border-best-cyan bg-best-cyan/5'
            : 'border-best-border/60 bg-best-elevated/30'
        }`}
      >
        {isMobile ? (
          productList
        ) : (
          <SortableContext items={productIds} strategy={verticalListSortingStrategy}>
            {productList}
          </SortableContext>
        )}
        {category.products.length === 0 && (
          <p className="py-8 text-center text-xs text-best-caption">
            {isMobile ? 'No products' : 'Drop products here'}
          </p>
        )}
      </div>
    </div>
  );
}
