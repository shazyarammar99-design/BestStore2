'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SectionHeaderProps {
  eyebrow: string;
  headline: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeader({ eyebrow, headline, subtitle, centered = true }: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll('.sh-anim');
    gsap.from(els, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
      },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={centered ? 'text-center' : ''}>
      <p className="sh-anim font-heading text-xs font-semibold uppercase tracking-[0.3em] text-best-cyan">
        {eyebrow}
      </p>
      <h2 className="sh-anim font-display mt-3 text-3xl font-bold uppercase leading-tight tracking-tight text-white md:text-5xl">
        {headline}
      </h2>
      {subtitle && (
        <p className="sh-anim mt-3 max-w-lg text-base leading-relaxed text-best-muted" style={centered ? { margin: '12px auto 0' } : {}}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
