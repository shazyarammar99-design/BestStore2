'use client';

import Link from 'next/link';
import { Layers } from 'lucide-react';
import { type Category } from '@/lib/catalog';
import { useTranslation } from '@/context/LocaleContext';
import { localizeCategory } from '@/i18n/catalog';

export default function CategorySidebar({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  const { t, locale } = useTranslation();

  const links = categories.map((raw) => {
    const category = localizeCategory(raw, locale);
    const isActive = category.slug === activeSlug;
    return { category, isActive };
  });

  return (
    <>
      <div className="lg:hidden">
        <p className="font-heading mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
          <Layers className="h-4 w-4 text-best-cyan" />
          {t('category.sidebarTitle')}
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 snap-x snap-mandatory">
          {links.map(({ category, isActive }) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`shrink-0 snap-start rounded-full border px-4 py-2.5 font-heading text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-best-cyan bg-best-cyan/15 text-best-cyan'
                  : 'border-best-border text-best-muted hover:border-best-cyan/50 hover:text-white'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <aside className="hidden lg:block lg:sticky lg:top-28">
        <div className="rounded-xl border border-best-border bg-best-elevated p-4">
          <p className="font-heading mb-3 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
            <Layers className="h-4 w-4 text-best-cyan" />
            {t('category.sidebarTitle')}
          </p>
          <nav className="flex flex-col gap-1">
            {links.map(({ category, isActive }) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 font-heading text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-best-cyan/10 text-best-cyan shadow-cyan-glow'
                    : 'text-best-muted hover:translate-x-1 hover:bg-best-cyan/5 hover:text-best-cyan'
                }`}
              >
                {category.name}
                {category.tag && (
                  <span className="rounded-full border border-best-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-best-caption">
                    {category.tag}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
