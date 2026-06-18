'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CATEGORIES, CATEGORY_COLORS } from '@/data';
import SectionHeader from '@/components/SectionHeader';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { localizeCategory } from '@/i18n/catalog';
import {
  Coins,
  ShieldOff,
  Gamepad2,
  Tags,
  Wrench,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP: Record<string, LucideIcon> = {
  Coins,
  ShieldOff,
  Gamepad2,
  Tags,
  Wrench,
  'bypass-pubg': ShieldOff,
  'steam-games': Gamepad2,
  'discounted-games': Tags,
  'other-games': Wrench,
};

export default function CategoriesGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useTranslation();
  const formatPrice = useFormatCurrency();

  useGSAP(
    () => {
      if (!gridRef.current) return;
      const cards = gridRef.current.querySelectorAll('.category-card');
      gsap.from(cards, {
        opacity: 0,
        y: 50,
        scale: 0.97,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 85%',
        },
      });
    },
    { scope: gridRef }
  );

  const scrollToProducts = () => {
    document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="categories" className="bg-best-elevated/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow={t('sections.categories').toUpperCase()}
          headline="Hot Drops"
          subtitle={t('sections.browseAll')}
        />

        <div ref={gridRef} className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((raw) => {
            const category = localizeCategory({ ...raw, slug: raw.id }, locale);
            const Icon = ICON_MAP[category.id] || Coins;
            const accent = CATEGORY_COLORS[category.id] || '#00F0FF';
            return (
              <button
                key={category.id}
                onClick={scrollToProducts}
                className="category-card group relative overflow-hidden rounded-xl border border-best-border bg-best-elevated p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-best-purple/60 hover:shadow-purple-glow"
              >
                {/* Accent glow blob */}
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
                  style={{ background: accent }}
                />

                <div className="flex items-start justify-between">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl"
                    style={{ background: `${accent}1A`, color: accent }}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-best-purple/30 bg-best-purple/10 px-2.5 py-1 font-heading text-[11px] font-semibold uppercase tracking-wider text-best-purple">
                    {category.tag}
                  </span>
                </div>

                <h3 className="font-heading mt-6 text-2xl font-bold text-white">{category.name}</h3>
                <p className="mt-2 text-sm text-best-muted">{category.description}</p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="font-heading text-xs font-semibold uppercase tracking-widest text-best-caption">
                    {t('product.from')} {formatPrice(category.fromPrice)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-best-caption transition-all duration-300 group-hover:translate-x-1 group-hover:text-best-cyan" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
