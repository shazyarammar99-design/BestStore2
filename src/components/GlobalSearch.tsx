'use client';

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { CATEGORY_MENU, PRODUCT_MENU, type NavItem } from '@/data/navigation';
import { useTranslation } from '@/context/LocaleContext';
import { localizeNavItem } from '@/i18n/catalog';

const flattenItems = (items: NavItem[]): NavItem[] => {
  let result: NavItem[] = [];
  for (const item of items) {
    if (item.categoryId || item.productId) {
      result.push(item);
    }
    if (item.children) {
      result = result.concat(flattenItems(item.children));
    }
  }
  return result;
};

export default function GlobalSearch({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const rawCategories = flattenItems(CATEGORY_MENU).map((item) => localizeNavItem(item, locale));
  const rawProducts = flattenItems(PRODUCT_MENU).map((item) => localizeNavItem(item, locale));

  const uniqueCategories = Array.from(new Map(rawCategories.map((item) => [item.id, item])).values());
  const uniqueProducts = Array.from(new Map(rawProducts.map((item) => [item.id, item])).values());

  const filteredCategories = uniqueCategories.filter((cat) =>
    cat.label.toLowerCase().includes(query.toLowerCase())
  );
  const filteredProducts = uniqueProducts.filter((prod) =>
    prod.label.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults = filteredCategories.length > 0 || filteredProducts.length > 0;

  const openDropdown = () => setIsOpen(true);
  const closeDropdown = () => {
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
        if (isMobile) setIsMobileExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    const totalItems = filteredCategories.length + filteredProducts.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const item = allItems[selectedIndex];
      if (item) {
        handleSelect(item);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
      if (isMobile) setIsMobileExpanded(false);
    }
  };

  const handleSelect = (item: any) => {
    closeDropdown();
    if (isMobile) setIsMobileExpanded(false);
    setQuery('');
    if (item.productId) {
      router.push(`/product/${item.productId}`);
    } else if (item.categoryId) {
      router.push(`/category/${item.categoryId}`);
    }
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const allItems = [
    ...filteredCategories.map((item, idx) => ({ type: 'category', ...item, idx })),
    ...filteredProducts.map((item, idx) => ({ type: 'product', ...item, idx })),
  ];

  if (isMobile && !isMobileExpanded) {
    return (
      <button
        onClick={() => {
          setIsMobileExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        aria-label={t('nav.search') !== 'nav.search' ? t('nav.search') : 'Search'}
        className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-best-border bg-best-elevated/50 text-best-muted transition-all duration-200 hover:border-best-cyan hover:text-best-cyan"
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`z-50 transition-all duration-300 ${
        isMobile ? 'fixed inset-x-4 top-4' : 'relative w-full max-w-2xl mx-auto'
      }`}
    >
      <div
        className={`relative flex items-center w-full transition-all duration-300 ${
          isOpen ? 'ring-2 ring-best-cyan/70 shadow-lg shadow-best-cyan/20' : 'shadow-sm'
        } bg-best-bg/95 backdrop-blur-md rounded-full border border-best-border focus-within:border-best-cyan`}
      >
        <MagnifyingGlassIcon className="w-5 h-5 ml-4 text-best-muted flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder={t('nav.search') !== 'nav.search' ? t('nav.search') : 'Search for products, categories...'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length > 0) openDropdown();
            else closeDropdown();
          }}
          onFocus={() => {
            if (query.length > 0) openDropdown();
          }}
          onKeyDown={handleKeyDown}
          className="w-full py-3.5 px-3 bg-transparent text-white placeholder-best-muted focus:outline-none text-sm rounded-full"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="search-dropdown"
          role="combobox"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="mr-2 p-1.5 rounded-full hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Clear search"
          >
            <XMarkIcon className="w-5 h-5 text-best-muted hover:text-white" />
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => {
              setIsMobileExpanded(false);
              closeDropdown();
            }}
            className="mr-2 p-1.5 rounded-full hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-best-muted hover:text-white"
          >
            Cancel
          </button>
        )}
        {!isMobile && (
          <button 
            onClick={() => {
              if (selectedIndex >= 0) handleSelect(allItems[selectedIndex]);
              else if (allItems.length > 0) handleSelect(allItems[0]);
            }}
            className="hidden sm:block mr-1.5 px-6 py-2 bg-best-cyan hover:bg-best-cyan/80 text-black font-semibold rounded-full transition-all duration-200 text-sm shadow-sm hover:shadow-md hover:shadow-best-cyan/20 whitespace-nowrap"
          >
            {t('nav.search') !== 'nav.search' ? t('nav.search') : 'Search'}
          </button>
        )}
      </div>

      {isOpen && hasResults && (
        <div
          ref={dropdownRef}
          id="search-dropdown"
          className="absolute top-[calc(100%+8px)] left-0 right-0 bg-best-bg/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-best-border overflow-hidden z-50 transition-all duration-200 ease-out"
          role="listbox"
        >
          <div className="max-h-[70vh] overflow-y-auto p-2 space-y-1.5">
            {filteredProducts.length > 0 && (
              <div className="px-2 pt-2 pb-1">
                <h4 className="text-xs font-semibold text-best-muted uppercase tracking-wider mb-2">
                  {t('nav.products') !== 'nav.products' ? t('nav.products') : 'Products'}
                </h4>
                {filteredProducts.map((prod, idx) => {
                  const globalIdx = allItems.findIndex(
                    (item) => item.type === 'product' && item.idx === idx
                  );
                  return (
                    <div
                      key={prod.id}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                        selectedIndex === globalIdx
                          ? 'bg-best-cyan/15 text-best-cyan'
                          : 'hover:bg-best-elevated text-white/90'
                      }`}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      onMouseLeave={() => setSelectedIndex(-1)}
                      onClick={() => handleSelect(prod)}
                      role="option"
                      aria-selected={selectedIndex === globalIdx}
                    >
                      <span className="font-medium text-sm">{prod.label}</span>
                      <span className="text-xs font-semibold opacity-70">
                        Product
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {filteredCategories.length > 0 && (
              <div className="px-2 pt-2 pb-1">
                <h4 className="text-xs font-semibold text-best-muted uppercase tracking-wider mb-2">
                  {t('nav.categories') !== 'nav.categories' ? t('nav.categories') : 'Categories'}
                </h4>
                {filteredCategories.map((cat, idx) => {
                  const globalIdx = allItems.findIndex(
                    (item) => item.type === 'category' && item.idx === idx
                  );
                  return (
                    <div
                      key={cat.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                        selectedIndex === globalIdx
                          ? 'bg-best-cyan/15 text-best-cyan'
                          : 'hover:bg-best-elevated text-white/90'
                      }`}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      onMouseLeave={() => setSelectedIndex(-1)}
                      onClick={() => handleSelect(cat)}
                      role="option"
                      aria-selected={selectedIndex === globalIdx}
                    >
                      <span className="font-medium text-sm">{cat.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      
      {isMobileExpanded && (
        <div className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-sm" />
      )}
    </div>
  );
}
