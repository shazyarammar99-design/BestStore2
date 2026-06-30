'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/context/LocaleContext';
import { type Product } from '@/lib/catalog';
import { formatPrice } from '@/lib/format-currency';
import SectionHeader from '@/components/SectionHeader';

const GRID_CLASSES = [
  "col-span-1 row-span-2",
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-3",
  "col-span-1 row-span-1",
  "col-span-2 row-span-3",
  "col-span-2 row-span-1",
  "col-span-2 row-span-2",
  "col-span-1 row-span-2",
  "col-span-1 row-span-2"
];

export type BentoItem = {
  product: Product;
  gridClasses: string;
};

export default function FeaturedBento({ 
  bentoItems = [],
  products = [] 
}: { 
  bentoItems?: BentoItem[],
  products?: Product[] 
}) {
  const { t } = useTranslation();
  
  // Use explicit bento items if provided, otherwise fallback to products + default grid classes
  const displayItems: BentoItem[] = bentoItems && bentoItems.length > 0 
    ? bentoItems 
    : (products || []).slice(0, 10).map((product, idx) => ({
        product,
        gridClasses: GRID_CLASSES[idx] || ''
      }));

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <section aria-label="Featured product showcase" className="relative isolate overflow-visible px-3 py-10 sm:px-5 sm:py-16 lg:px-8 lg:py-24">
      <div className="relative mx-auto w-full max-w-[96rem]">
        {/* Header Area */}
        <div className="mb-10 sm:mb-16">
          <SectionHeader
            eyebrow="FEATURED"
            headline="Featured Products"
            subtitle="A curated bento of standout products — hover any tile to dive in."
            centered={true}
          />
        </div>

        {/* Bento Grid */}
        <div className="relative mx-auto overflow-visible px-3 sm:px-4 lg:px-0 [perspective:1200px] [perspective-origin:50%_25%]">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[88%] -z-10 h-[28%] w-[78%] -translate-x-1/2 rounded-[60%] bg-black/80 blur-3xl"></div>
          <div className="mx-auto grid grid-flow-dense w-full max-w-[70rem] min-w-0 grid-cols-[repeat(6,minmax(0,1fr))] grid-rows-[repeat(5,minmax(54px,1fr))] auto-rows-min items-stretch justify-items-stretch gap-1 sm:gap-1.5 lg:gap-2 sm:grid-rows-[repeat(5,minmax(100px,1fr))] lg:grid-rows-[repeat(5,minmax(135px,1fr))] [transform-style:preserve-3d] [transform-origin:50%_0%] [transform:rotateX(18deg)_rotateY(4deg)_rotateZ(-2deg)] lg:[transform:rotateX(24deg)_rotateY(6deg)_rotateZ(-3deg)_translateY(-0.5rem)] transition-transform duration-700 ease-out hover:[transform:rotateX(10deg)_rotateY(2deg)_rotateZ(-1deg)] lg:hover:[transform:rotateX(10deg)_rotateY(2deg)_rotateZ(-1deg)_translateY(-0.25rem)]">
            {displayItems.map(({ product, gridClasses }) => {
              return (
                <Link 
                  key={product.id}
                  aria-label={`${product.name} — view product`}
                  href={`/product/${product.slug}`} 
                  className={`group relative isolate flex h-full min-h-0 min-w-0 overflow-hidden rounded-xl text-white lg:rounded-2xl bg-zinc-950 ring-1 ring-white/[0.1] shadow-[0_8px_22px_-12px_rgba(0,0,0,0.85)] sm:shadow-[0_12px_30px_-16px_rgba(0,0,0,0.95)] lg:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.95)] transition-all duration-500 ease-out will-change-transform hover:z-20 hover:-translate-y-0.5 hover:ring-2 hover:ring-violet-300/70 hover:shadow-[0_34px_70px_-22px_rgba(124,58,237,0.72),0_0_0_1px_rgba(255,255,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 active:scale-[0.98] active:ring-violet-300/60 ${gridClasses}`}
                >
                  <div className="absolute inset-0 overflow-hidden rounded-xl lg:rounded-2xl">
                    {product.base_image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={product.base_image} alt={product.name} loading="lazy" decoding="async" draggable="false" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] object-[center_18%] brightness-[0.92] saturate-[1.12] contrast-[1.05] group-hover:brightness-105" />
                    ) : (
                      <div className="h-full w-full bg-zinc-900/50 backdrop-blur-sm" />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(168,85,247,0.24),transparent_36%)] opacity-80 transition-opacity duration-500 group-hover:opacity-100"></div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/88 via-black/36 to-transparent"></div>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-black/42 to-transparent opacity-80"></div>
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.1]"></div>
                    <div className="pointer-events-none absolute inset-[1px] rounded-[15px] border border-white/[0.045]"></div>
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl lg:rounded-2xl">
                      <div className="absolute left-[-60%] top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-out will-change-transform group-hover:translate-x-[320%]"></div>
                    </div>
                  </div>
                  
                  <div className="pointer-events-none absolute inset-x-2 bottom-2 z-20 flex items-center justify-between gap-1.5 rounded-xl border border-white/10 bg-black/60 px-1.5 py-1 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] lg:inset-x-2.5 lg:bottom-2.5 lg:gap-2 lg:px-2 lg:py-1.5 translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-active:translate-y-0 group-active:opacity-100">
                    <div className="min-w-0">
                      <span className="block truncate text-xs font-bold text-white/90 sm:text-sm">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono tabular-nums">
                        <span className="font-black text-best-gold text-xs sm:text-[11px] lg:text-sm">
                          {formatPrice(product.base_price)}
                        </span>
                        {product.compare_at_price && product.compare_at_price > product.base_price && (
                          <span className="text-[10px] text-best-muted line-through lg:text-xs">
                            {formatPrice(product.compare_at_price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/20 bg-white text-zinc-950 shadow-[0_8px_20px_-12px_rgba(255,255,255,0.85)] transition-transform duration-300 group-hover:scale-105 h-7 w-7 sm:h-6 sm:w-6 lg:h-7 lg:w-7 sm:h-7 sm:w-7 lg:h-8 lg:w-8" aria-hidden="true">
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
