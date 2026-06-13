import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SOFTWARE_CATEGORIES } from '@/data';
import SectionHeader from '@/components/SectionHeader';
import {
  Crosshair,
  Eye,
  Layers,
  Unlock,
  Fingerprint,
  Gauge,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP: Record<string, LucideIcon> = {
  Crosshair,
  Eye,
  Layers,
  Unlock,
  Fingerprint,
  Gauge,
};

export default function CategoriesGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

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
          eyebrow="SOFTWARE CATEGORIES"
          headline="Find Your Edge"
          subtitle="Six categories of premium tools. One subscription away."
        />

        <div ref={gridRef} className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SOFTWARE_CATEGORIES.map((category) => {
            const Icon = ICON_MAP[category.icon] || Crosshair;
            return (
              <button
                key={category.id}
                onClick={scrollToProducts}
                className="category-card group relative overflow-hidden rounded-xl border border-best-border bg-best-elevated p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-best-purple/60 hover:shadow-purple-glow"
              >
                {/* Accent glow blob */}
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
                  style={{ background: category.accent }}
                />

                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: `${category.accent}1A`, color: category.accent }}
                >
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="font-heading mt-6 text-2xl font-bold text-white">{category.name}</h3>
                <p className="mt-2 text-sm text-best-muted">{category.description}</p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="font-heading text-xs font-semibold uppercase tracking-widest text-best-caption">
                    {category.count} products
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
