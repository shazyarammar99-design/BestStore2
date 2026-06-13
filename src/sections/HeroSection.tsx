import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ParticleCanvas from '@/components/ParticleCanvas';
import { useMouseParallax } from '@/hooks/useMouseParallax';

export default function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const parallaxRef = useMouseParallax(8);

  useEffect(() => {
    if (!contentRef.current) return;
    const els = contentRef.current.querySelectorAll('.hero-anim');
    const tl = gsap.timeline({ delay: 0.3 });
    tl.from(els, {
      opacity: 0,
      y: 30,
      duration: 1,
      stagger: 0.18,
      ease: 'power3.out',
    });
    return () => {
      tl.kill();
    };
  }, []);

  // Magnetic headline: pulls slightly toward the cursor
  useEffect(() => {
    const headline = headlineRef.current;
    if (!headline || window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e: MouseEvent) => {
      const rect = headline.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const dist = Math.hypot(dx, dy);
      const strength = Math.max(0, 1 - dist) * 14;
      gsap.to(headline, { x: dx * strength, y: dy * strength, duration: 0.6, ease: 'power2.out' });
    };
    const onLeave = () => gsap.to(headline, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
    };
  }, []);

  const scrollTo = (selector: string) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <ParticleCanvas />

      {/* Gradient vignette over particles */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0B0C10_95%)]" />

      <div ref={contentRef} className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div ref={parallaxRef}>
          <p className="hero-anim font-heading text-sm font-semibold uppercase tracking-[0.3em] text-best-cyan text-glow-cyan">
            Best Store — Premium Gaming Software
          </p>

          <h1
            ref={headlineRef}
            className="hero-anim font-display mt-6 text-4xl font-black uppercase leading-[1.1] tracking-tight text-white sm:text-5xl md:text-7xl"
          >
            Dominate Every Game.
            <span className="mt-2 block text-gradient-neon">Undetected.</span>
          </h1>

          <p className="hero-anim mx-auto mt-6 max-w-xl text-base leading-relaxed text-best-muted md:text-lg">
            Premium cheats, trainers, overlays, and performance boosters — auto-updated, HWID-protected,
            and delivered instantly with local IQD payments.
          </p>

          <div className="hero-anim mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => scrollTo('#software')}
              className="animate-pulse-glow rounded-lg bg-best-gold px-10 py-4 font-heading text-base font-bold uppercase tracking-widest text-best-bg transition-transform duration-200 hover:scale-[1.04] hover:shadow-gold-glow-lg"
            >
              Get Instant Access
            </button>
            <button
              onClick={() => scrollTo('#pricing')}
              className="rounded-lg border border-best-cyan/40 bg-transparent px-10 py-4 font-heading text-base font-semibold uppercase tracking-widest text-best-cyan transition-all duration-200 hover:border-best-cyan hover:shadow-cyan-glow"
            >
              Start Free Trial
            </button>
          </div>
        </div>

        <div className="hero-anim mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {[
            ['12,400+', 'Active Users'],
            ['38', 'Games Supported'],
            ['412', 'Days Undetected'],
          ].map(([value, label]) => (
            <div key={label} className="text-center">
              <p className="font-display text-2xl font-bold text-white">{value}</p>
              <p className="font-heading text-xs uppercase tracking-widest text-best-caption">{label}</p>
            </div>
          ))}
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
