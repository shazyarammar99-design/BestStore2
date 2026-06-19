'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Package, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSearchableCatalog, type SearchableItem } from '@/app/actions/catalog-actions';
import { useTranslation } from '@/context/LocaleContext';

export default function GlobalSearchMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { locale, t } = useTranslation();
  const [items, setItems] = useState<SearchableItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      if (items.length === 0) {
        setLoading(true);
        getSearchableCatalog().then((res) => {
          setItems(res);
          setLoading(false);
        });
      }
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, items.length]);

  if (!open) return null;

  // Search matching logic (language agnostic)
  const filteredItems = items.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();

    // Check English baseline
    if (item.name.toLowerCase().includes(q)) return true;
    if (item.description?.toLowerCase().includes(q)) return true;

    // Check all available translations dynamically
    if (item.name_translations) {
      for (const val of Object.values(item.name_translations)) {
        if (typeof val === 'string' && val.toLowerCase().includes(q)) return true;
      }
    }
    if (item.description_translations) {
      for (const val of Object.values(item.description_translations)) {
        if (typeof val === 'string' && val.toLowerCase().includes(q)) return true;
      }
    }

    return false;
  });

  const categories = filteredItems.filter((i) => i.type === 'category');
  const products = filteredItems.filter((i) => i.type === 'product');

  const handleSelect = (item: SearchableItem) => {
    onClose();
    if (item.type === 'product') {
      router.push(`/product/${item.slug}`);
    } else {
      router.push(`/category/${item.slug}`);
    }
  };

  const getDisplayName = (item: SearchableItem) => {
    if (locale !== 'en' && item.name_translations?.[locale]) {
      return item.name_translations[locale];
    }
    return item.name;
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-best-bg/95 backdrop-blur-xl">
      {/* Header Search Area */}
      <div className="relative flex h-24 items-center border-b border-best-border px-6 lg:px-12">
        <Search className="h-8 w-8 text-best-cyan opacity-80" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('nav.search') || 'Search products and categories...'}
          className="h-full flex-1 bg-transparent px-6 font-display text-2xl text-white outline-none placeholder:text-best-muted lg:text-4xl"
        />
        <button
          onClick={onClose}
          className="rounded-full bg-best-cyan/10 p-3 text-best-cyan transition-colors hover:bg-best-cyan hover:text-best-bg"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-12">
        {loading && (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-best-cyan border-t-transparent"></div>
          </div>
        )}

        {!loading && query && filteredItems.length === 0 && (
          <div className="py-20 text-center font-heading text-lg text-best-muted">
            No results found for "{query}".
          </div>
        )}

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          {/* Categories */}
          {(!query || categories.length > 0) && !loading && (
            <div className="space-y-6">
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-best-cyan">
                {t('nav.categories') || 'Categories'}
              </h3>
              <div className="grid gap-3">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className="group flex items-center gap-4 rounded-xl border border-best-border bg-best-bg p-4 text-left transition-all hover:border-best-cyan/50 hover:bg-best-cyan/5"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-best-cyan/10 text-best-cyan">
                      <LayoutGrid className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-heading text-base font-bold text-white group-hover:text-best-cyan">
                        {getDisplayName(c)}
                      </h4>
                      {c.description && (
                        <p className="line-clamp-1 text-sm text-best-muted">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {(!query || products.length > 0) && !loading && (
            <div className="space-y-6">
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-best-gold">
                {t('nav.products') || 'Products'}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="group flex items-center gap-4 rounded-xl border border-best-border bg-best-bg p-4 text-left transition-all hover:border-best-gold/50 hover:bg-best-gold/5"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-best-gold/10 text-best-gold overflow-hidden">
                      {p.base_image ? (
                        <img src={p.base_image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="truncate font-heading text-base font-bold text-white group-hover:text-best-gold">
                        {getDisplayName(p)}
                      </h4>
                      {p.base_price && (
                        <p className="font-heading text-sm font-semibold text-best-muted">
                          ${p.base_price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
