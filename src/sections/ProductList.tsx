'use client';

import { useState, useMemo } from 'react';
import { CATEGORIES, PRODUCTS, getProductById, type Product } from '@/data';
import { useStore } from '@/context/StoreContext';
import { useTranslation } from '@/context/LocaleContext';
import { localizeCategory } from '@/i18n/catalog';
import SectionHeader from '@/components/SectionHeader';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

type FilterId = 'all' | string;
type SortId = 'popularity' | 'price-asc' | 'price-desc';

function getSortPrice(product: Product): number {
  if (product.variants?.length) {
    return Math.min(...product.variants.map((v) => v.price));
  }
  return product.price;
}

export default function ProductList() {
  const [sort, setSort] = useState<SortId>('popularity');
  const { t, locale } = useTranslation();
  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    productFilter,
    setProductFilter,
  } = useStore();

  const filters: { id: FilterId; label: string }[] = [
    { id: 'all', label: t('sections.allProducts') },
    ...CATEGORIES.map((c) => ({
      id: c.id,
      label: localizeCategory({ ...c, slug: c.id }, locale).name,
    })),
  ];

  const sorts: { id: SortId; label: string }[] = [
    { id: 'popularity', label: t('sections.sortPopularity') },
    { id: 'price-asc', label: t('sections.sortPriceAsc') },
    { id: 'price-desc', label: t('sections.sortPriceDesc') },
  ];

  const focusedProduct = productFilter ? getProductById(productFilter) : undefined;

  const selectFilter = (id: FilterId) => {
    setProductFilter(null);
    setCategoryFilter(id);
  };

  const visible = useMemo(() => {
    if (productFilter) {
      const p = getProductById(productFilter);
      return p ? [p] : [];
    }

    let result =
      categoryFilter === 'all'
        ? [...PRODUCTS]
        : PRODUCTS.filter((p) => p.categoryId === categoryFilter);

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sort === 'price-asc') return getSortPrice(a) - getSortPrice(b);
      if (sort === 'price-desc') return getSortPrice(b) - getSortPrice(a);
      return getSortPrice(b) - getSortPrice(a);
    });
    return result;
  }, [categoryFilter, productFilter, sort, searchQuery]);

  return (
    <section id="products" className="bg-best-elevated/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow={t('sections.featured').toUpperCase()}
          headline={t('sections.allProducts')}
          subtitle={t('sections.everyProduct')}
        />

        <div className="mx-auto mt-10 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-best-caption" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or description..."
              className="h-11 border-best-border bg-best-elevated pl-10 text-sm text-white placeholder:text-best-caption focus-visible:border-best-cyan focus-visible:ring-0"
            />
          </div>
        </div>

        {focusedProduct && (
          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-full border border-best-cyan/40 bg-best-cyan/10 px-4 py-2 text-sm text-best-cyan">
            Showing: <span className="font-semibold">{focusedProduct.name}</span>
            <button
              onClick={() => setProductFilter(null)}
              aria-label="Clear product filter"
              className="ml-1 rounded-full p-0.5 hover:bg-best-cyan/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => selectFilter(f.id)}
              className={`rounded-full border px-4 py-2 font-heading text-sm font-semibold transition-all duration-200 ${
                !productFilter && categoryFilter === f.id
                  ? 'border-best-cyan bg-best-cyan/10 text-best-cyan shadow-cyan-glow'
                  : 'border-best-border text-best-muted hover:border-best-cyan/50 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {sorts.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`rounded-full border px-4 py-2 font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                sort === s.id
                  ? 'border-best-gold bg-best-gold/10 text-best-gold'
                  : 'border-best-border text-best-caption hover:border-best-gold/50 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="mt-12 text-center text-best-muted">
            No products match your search.
          </p>
        )}
      </div>
    </section>
  );
}
