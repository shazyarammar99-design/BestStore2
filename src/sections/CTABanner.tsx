import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CTABanner() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const els = ref.current.querySelectorAll('.cta-anim');
      gsap.from(els, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
        },
      });
    },
    { scope: ref }
  );

  const scrollToProducts = () => {
    document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="bg-krylo-bg py-20"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0,132,255,0.03) 0%, transparent 70%)',
      }}
    >
      <div ref={ref} className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="cta-anim text-4xl font-bold tracking-tight text-white md:text-5xl">
          Ready to Shop?
        </h2>
        <p className="cta-anim mx-auto mt-4 max-w-lg text-lg leading-relaxed text-krylo-muted">
          Join 500+ gamers already using BEST STORE. Instant delivery, local IQD payments, 24/7 support.
        </p>
        <button
          onClick={scrollToProducts}
          className="cta-anim mt-8 rounded-lg bg-krylo-copper px-12 py-4 text-lg font-bold uppercase tracking-wider text-krylo-bg transition-all duration-250 hover:scale-[1.03] hover:bg-[#D9915A] hover:shadow-cta-glow"
        >
          Browse Products
        </button>
        <p className="cta-anim mt-3 text-sm text-krylo-caption">Pay securely in IQD</p>
      </div>
    </section>
  );
}
