'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, GripVertical, MoreVertical, Pencil } from 'lucide-react';
import type { CatalogCategory, CatalogProduct } from '@/types/admin-catalog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type ProductCardProps = {
  product: CatalogProduct;
  isMobile?: boolean;
  categories?: CatalogCategory[];
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveToCategory?: (productId: string, categoryId: string) => void;
  onMoveUp?: (productId: string) => void;
  onMoveDown?: (productId: string) => void;
};

export default function ProductCard({
  product,
  isMobile = false,
  categories = [],
  canMoveUp = false,
  canMoveDown = false,
  onMoveToCategory,
  onMoveUp,
  onMoveDown,
}: ProductCardProps) {
  const sortable = useSortable({
    id: product.id,
    data: { type: 'product', product },
    disabled: isMobile,
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const style = isMobile
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      };

  return (
    <div
      ref={isMobile ? undefined : setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border border-best-border bg-best-bg p-2"
    >
      {isMobile ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-8 shrink-0 text-best-caption"
              aria-label="Move product"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="border-best-border bg-best-elevated text-white">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to category</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="border-best-border bg-best-elevated text-white">
                {categories
                  .filter((c) => c.id !== product.category_id)
                  .map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => onMoveToCategory?.(product.id, c.id)}
                    >
                      {c.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!canMoveUp} onClick={() => onMoveUp?.(product.id)}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Move up
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!canMoveDown} onClick={() => onMoveDown?.(product.id)}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Move down
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <button
          type="button"
          className="min-h-11 min-w-8 shrink-0 cursor-grab touch-manipulation text-best-caption active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-best-border">
        {product.base_image && (
          <Image src={product.base_image} alt="" fill className="object-cover" unoptimized />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{product.name}</p>
        <p className="truncate text-xs text-best-caption">
          {product.base_price.toLocaleString()} IQD
        </p>
      </div>
      <Link
        href={`/admin/products/${product.slug}`}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-best-muted hover:bg-best-border/50 hover:text-best-cyan"
        aria-label="Edit product"
      >
        <Pencil className="h-4 w-4" />
      </Link>
    </div>
  );
}
