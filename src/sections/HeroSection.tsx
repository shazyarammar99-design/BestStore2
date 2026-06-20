'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { useCmsBlocks } from '@/hooks/useCmsBlocks';
import LiveSiteStats from '@/components/LiveSiteStats';
import { useTranslation } from '@/context/LocaleContext';
import { transliterateBest } from '@/i18n/transliterate';
import type { HeroPayload } from '@/types/site-content';

const ParticleCanvas = dynamic(() => import('@/components/ParticleCanvas'), { ssr: false });

const HERO_DELAYS = {
  eyebrow: '0.3s',
  headline: '0.48s',
  subtitle: '0.66s',
  buttons: '0.84s',
  stats: '1.02s',
} as const;

export default function HeroSection() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const { blocks } = useCmsBlocks('hero', locale);
  const cmsHero = blocks[0]?.payload as HeroPayload | undefined;
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const parallaxRef = useMouseParallax(8);
  const [contentKey, setContentKey] = useState(0);
  const prevPathname = useRef<string | null>(null);

  // Re-mount hero content when returning home so CSS animations replay (fixes back/forward nav).
  useEffect(() => {
    if (pathname === '/' && prevPathname.current !== null && prevPathname.current !== '/') {
      setContentKey((k) => k + 1);
    }
    prevPathname.current = pathname;
  }, [pathname]);

  // Browser back-forward cache can restore a stale GSAP/DOM state — force a fresh hero.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setContentKey((k) => k + 1);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  // Magnetic headline — only transforms, never touches opacity.
  useEffect(() => {
    const headline = headlineRef.current;
    if (!headline || window.matchMedia('(pointer: coarse)').matches) return;

    let pending = false;
    let mx = 0;
    let my = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const rect = headline.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (mx - cx) / rect.width;
        const dy = (my - cy) / rect.height;
        const dist = Math.hypot(dx, dy);
        const strength = Math.max(0, 1 - dist) * 14;
        gsap.to(headline, {
          x: dx * strength,
          y: dy * strength,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    };
    const onLeave = () =>
      gsap.to(headline, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      gsap.killTweensOf(headline);
      gsap.set(headline, { clearProps: 'transform' });
    };
  }, [contentKey]);

  const scrollTo = (selector: string) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <ParticleCanvas />

      {/* Gradient vignette over particles */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_30%,#0B0C10_95%)]" />

      <div
        key={contentKey}
        className="relative z-10 mx-auto max-w-5xl px-6 text-center"
      >
        <div ref={parallaxRef}>
          <p
            className="hero-anim font-heading text-sm font-semibold uppercase tracking-[0.3em] text-best-cyan text-glow-cyan"
            style={{ ['--hero-delay' as string]: HERO_DELAYS.eyebrow }}
          >
            {transliterateBest(cmsHero?.eyebrow ?? t('hero.eyebrow'), locale)}
          </p>

          <div className="hero-anim" style={{ ['--hero-delay' as string]: HERO_DELAYS.headline }}>
            <h1
              ref={headlineRef}
              className="font-display mt-6 text-3xl font-black uppercase leading-[1.1] tracking-tight text-white sm:text-5xl md:text-7xl"
            >
              {cmsHero?.headline ?? t('hero.headline')}
              <span className="mt-2 block text-gradient-neon">
                {cmsHero?.headlineAccent ?? t('hero.headlineAccent')}
              </span>
            </h1>
          </div>

          <p
            className="hero-anim mx-auto mt-6 max-w-xl text-base leading-relaxed text-best-muted md:text-lg"
            style={{ ['--hero-delay' as string]: HERO_DELAYS.subtitle }}
          >
            {cmsHero?.subtitle ?? t('hero.subtitle')}
          </p>

          <div
            className="hero-anim mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row"
            style={{ ['--hero-delay' as string]: HERO_DELAYS.buttons }}
          >
            <button
              onClick={() => scrollTo(cmsHero?.primaryCtaHref ?? '#categories')}
              className="animate-pulse-glow w-full rounded-lg bg-best-gold px-6 py-3 font-heading text-sm font-bold uppercase tracking-widest text-best-bg transition-transform duration-200 hover:scale-[1.04] hover:shadow-gold-glow-lg sm:w-auto sm:px-10 sm:py-4 sm:text-base"
            >
              {cmsHero?.primaryCtaLabel ?? t('hero.browseCategories')}
            </button>
            <button
              onClick={() => scrollTo(cmsHero?.secondaryCtaHref ?? '#products')}
              className="w-full rounded-lg border border-best-cyan/40 bg-transparent px-6 py-3 font-heading text-sm font-semibold uppercase tracking-widest text-best-cyan transition-all duration-200 hover:border-best-cyan hover:shadow-cyan-glow sm:w-auto sm:px-10 sm:py-4 sm:text-base"
            >
              {cmsHero?.secondaryCtaLabel ?? t('hero.viewProducts')}
            </button>
          </div>
        </div>

        <div
          className="hero-anim mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          style={{ ['--hero-delay' as string]: HERO_DELAYS.stats }}
        >
          <LiveSiteStats variant="hero" />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="relative h-10 w-px overflow-hidden bg-best-border">
          <div className="absolute left-0 top-0 h-2 w-full animate-scroll-dot rounded-full bg-best-cyan" />
        </div>
      </div>
    </section>
  );
}
