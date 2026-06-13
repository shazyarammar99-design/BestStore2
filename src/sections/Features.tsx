import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FEATURES } from '@/data';
import SectionHeader from '@/components/SectionHeader';
import { Zap, Shield, SlidersHorizontal, RefreshCw, Headphones, Layers, type LucideIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Shield, Sliders: SlidersHorizontal, RefreshCw, Headphones, Layers,
};

export default function Features() {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.feature-card');
    gsap.from(cards, {
      opacity: 0,
      y: 60,
      scale: 0.96,
      duration: 0.9,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: gridRef.current,
        start: 'top 85%',
      },
    });
  }, { scope: gridRef });

  return (
    <section id="features" className="bg-krylo-bg py-28 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="WHY BEST STORE" headline="Everything You Need to Dominate" />

        <div ref={gridRef} className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = ICON_MAP[feature.icon] || Zap;
            return (
              <div
                key={feature.title}
                className="feature-card group rounded-xl border border-krylo-border bg-krylo-elevated p-8 transition-all duration-300 hover:-translate-y-1 hover:border-krylo-blue"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[radial-gradient(circle,rgba(0,132,255,0.1)_0%,transparent_70%)]">
                  <Icon className="h-5 w-5 text-krylo-blue" />
                </div>
                <h4 className="mt-5 text-xl font-medium text-white">{feature.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-krylo-muted">{feature.description}</p>
                <span className="mt-4 inline-block cursor-default text-sm text-krylo-blue transition-opacity hover:opacity-80">
                  Learn more
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
