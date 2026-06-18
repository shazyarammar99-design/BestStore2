'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TESTIMONIALS } from '@/data';
import { useCmsBlocks } from '@/hooks/useCmsBlocks';
import type { TestimonialPayload } from '@/types/site-content';
import SectionHeader from '@/components/SectionHeader';
import { Play, BadgeCheck } from 'lucide-react';
import { useTranslation } from '@/context/LocaleContext';

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { locale } = useTranslation();
  const { blocks } = useCmsBlocks('testimonial', locale);
  const cmsItems = blocks.map((b) => b.payload as TestimonialPayload);
  const items = cmsItems.length ? cmsItems : TESTIMONIALS;

  useGSAP(
    () => {
      if (!gridRef.current) return;
      const cards = gridRef.current.querySelectorAll('.testimonial-card');
      gsap.from(cards, {
        opacity: 0,
        y: 60,
        scale: 0.96,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 85%',
        },
      });
    },
    { scope: gridRef }
  );

  return (
    <section id="reviews" className="bg-best-elevated/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="TESTIMONIALS" headline="Trusted by Gamers" />

        <div ref={gridRef} className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((t) => (
            <div
              key={t.name}
              className="testimonial-card rounded-xl border border-best-border bg-best-elevated p-8 transition-all duration-300 hover:border-best-cyan/40"
            >
              {/* Video placeholder for video reviews */}
              {t.hasVideo && (
                <div className="group relative mb-6 flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-best-border bg-gradient-to-br from-best-purple/15 via-best-surface to-best-cyan/10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-best-cyan/15 text-best-cyan transition-all duration-300 group-hover:scale-110 group-hover:bg-best-cyan group-hover:text-best-bg group-hover:shadow-cyan-glow">
                    <Play className="ml-1 h-6 w-6" />
                  </div>
                  <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 font-heading text-[11px] font-semibold uppercase tracking-wider text-white">
                    Gameplay clip
                  </span>
                </div>
              )}

              <div className="relative">
                <span className="absolute -left-1 -top-2 text-4xl leading-none text-best-purple">"</span>
                <p className="pl-6 text-base italic leading-relaxed text-white">{t.quote}</p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-best-border bg-gradient-to-br from-best-cyan/30 to-best-purple/30 text-xs font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-best-caption">{t.handle}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-heading text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  <BadgeCheck className="h-3 w-3" />
                  {t.tag}
                </span>
              </div>

              <div className="mt-3 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="h-2.5 w-2.5 fill-best-gold" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
