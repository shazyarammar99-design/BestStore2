'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import { MousePointerClick, CreditCard, Zap, Play, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/context/LocaleContext';
import { getSteps } from '@/i18n/content';
import { useCmsBlocks } from '@/hooks/useCmsBlocks';
import type { StepPayload } from '@/types/site-content';

gsap.registerPlugin(ScrollTrigger);

const STEP_ICONS: LucideIcon[] = [MousePointerClick, CreditCard, Zap];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useTranslation();
  const { blocks } = useCmsBlocks('step', locale);
  const cmsSteps = blocks.map((b) => b.payload as StepPayload);
  const steps = cmsSteps.length ? cmsSteps : getSteps(locale);

  useGSAP(
    () => {
      if (!containerRef.current || !lineRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
      });

      tl.from(lineRef.current, {
        scaleX: 0,
        duration: 1,
        ease: 'power3.inOut',
      });

      const steps = containerRef.current.querySelectorAll('.step-item');
      tl.from(
        steps,
        {
          opacity: 0,
          y: 40,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
        },
        '-=0.5'
      );
    },
    { scope: containerRef }
  );

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow={t('sections.howItWorks').toUpperCase()} headline={t('sections.howItWorks')} />

        <div ref={containerRef} className="relative mt-16">
          <div
            ref={lineRef}
            className="absolute left-0 right-0 top-7 hidden h-px origin-left border-t border-dashed border-best-cyan/30 md:block"
          />

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i] ?? MousePointerClick;
              return (
                <div key={step.number} className="step-item relative text-center md:text-left">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-best-cyan/40 bg-best-cyan/5 shadow-cyan-glow md:mx-0">
                    <Icon className="h-6 w-6 text-best-cyan" />
                  </div>
                  <p className="font-display mt-5 text-sm font-bold text-best-purple">{step.number}</p>
                  <h4 className="font-heading mt-2 text-2xl font-bold text-white">{step.title}</h4>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-best-muted md:mx-0">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Explainer video placeholder */}
          <div className="group relative mx-auto mt-16 flex aspect-video max-w-3xl cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-best-border bg-gradient-to-br from-best-purple/15 via-best-elevated to-best-cyan/10 transition-all duration-300 hover:border-best-cyan/50 hover:shadow-cyan-glow">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-best-cyan/15 text-best-cyan transition-all duration-300 group-hover:scale-110 group-hover:bg-best-cyan group-hover:text-best-bg group-hover:shadow-cyan-glow-lg">
              <Play className="ml-1.5 h-9 w-9" />
            </div>
            <span className="absolute bottom-4 left-4 rounded bg-black/60 px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-white">
              Watch: setup in under 2 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
