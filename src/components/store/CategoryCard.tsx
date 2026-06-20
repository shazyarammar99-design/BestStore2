'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ShieldOff,
  Gamepad2,
  Tags,
  Wrench,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORY_COLORS } from '@/data';
import { type Category } from '@/lib/catalog';
import { getCategoryImageUrl } from '@/lib/category-media';
import { useTranslation } from '@/context/LocaleContext';
import { localizeCategory } from '@/i18n/catalog';

const ICON_MAP: Record<string, LucideIcon> = {
  'in-game-currency': Sparkles,
  'bypass-pubg': ShieldOff,
  'steam-games': Gamepad2,
  'discounted-games': Tags,
  'other-games': Wrench,
  'digital-services': Sparkles,
};

const HERO_HEIGHT = {
  vertical: 'min-h-[300px] sm:min-h-[360px] lg:min-h-[440px]',
  horizontal: 'min-h-[160px] sm:min-h-[200px] lg:min-h-[240px]',
} as const;

export default function CategoryCard({
  category: raw,
  variant = 'horizontal',
}: {
  category: Category;
  variant?: 'vertical' | 'horizontal';
}) {
  const { t, locale } = useTranslation();
  const category = localizeCategory(raw, locale);
  const accent = CATEGORY_COLORS[category.id] ?? CATEGORY_COLORS[category.slug] ?? '#00F0FF';
  const Icon = ICON_MAP[category.slug] ?? ICON_MAP[category.id] ?? Sparkles;
  const imageUrl = getCategoryImageUrl(category);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = imageUrl && !imgFailed;

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-best-border bg-best-elevated transition-all duration-300 hover:-translate-y-1 hover:border-best-cyan hover:shadow-cyan-glow"
    >
      <div className={`relative w-full shrink-0 overflow-hidden ${HERO_HEIGHT[variant]}`}>
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover object-center"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-best-purple/20 via-best-surface to-best-cyan/10"
              style={{
                boxShadow: `inset 0 -40px 60px -20px ${accent}22`,
              }}
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 shadow-lg"
                style={{ background: `${accent}22`, color: accent }}
              >
                <Icon className="h-10 w-10" />
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-best-elevated/90 via-best-elevated/20 to-transparent" />
        </div>
        <div className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-best-border/80 bg-best-bg/60 text-best-caption backdrop-blur-sm transition-all duration-300 group-hover:border-best-cyan group-hover:text-best-cyan">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 pt-4">
        {category.tag && (
          <span className="inline-block w-fit rounded-full border border-best-purple/40 bg-best-purple/10 px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-best-purple">
            {category.tag}
          </span>
        )}
        <h3 className="font-display mt-3 text-base font-bold uppercase tracking-tight text-white sm:text-xl lg:text-2xl">
          {category.name}
        </h3>
        {category.description && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-best-muted">{category.description}</p>
        )}
        <span className="font-heading mt-5 inline-block text-xs font-bold uppercase tracking-widest text-best-cyan">
          {t('category.browseCategory')} →
        </span>
      </div>
    </Link>
  );
}
