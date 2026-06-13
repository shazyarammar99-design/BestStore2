import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const NAV_LINKS = [
  { label: 'Software', href: '#software' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Proof', href: '#proof' },
  { label: 'Support', href: '#faq' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen && overlayRef.current && linksRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      const links = linksRef.current.querySelectorAll('.mobile-link');
      gsap.fromTo(
        links,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, delay: 0.15, ease: 'power3.out' }
      );
    }
  }, [mobileOpen]);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-panel border-b border-best-border shadow-cyan-glow' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Brand */}
          <a href="#" className="flex items-center gap-1.5">
            <span className="font-display text-lg font-bold uppercase tracking-[0.15em] text-white">
              BEST
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-best-cyan shadow-cyan-glow" />
            <span className="font-display text-lg font-medium uppercase tracking-[0.15em] text-gradient-neon">
              STORE
            </span>
          </a>

          {/* Center links - desktop */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="font-heading text-sm font-semibold uppercase tracking-widest text-best-muted transition-all duration-200 hover:text-best-cyan hover:text-glow-cyan"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => scrollTo('#pricing')}
              className="hidden font-heading text-sm font-semibold uppercase tracking-widest text-best-muted transition-colors hover:text-white md:inline-block"
            >
              Login
            </button>
            <button
              onClick={() => scrollTo('#pricing')}
              className="hidden rounded-lg bg-best-gold px-5 py-2.5 font-heading text-sm font-bold uppercase tracking-widest text-best-bg transition-all duration-200 hover:scale-[1.03] hover:shadow-gold-glow md:inline-block"
            >
              Start Free Trial
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1.5 md:hidden"
              aria-label="Toggle menu"
            >
              <span
                className={`h-0.5 w-6 bg-best-cyan transition-transform duration-300 ${
                  mobileOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              />
              <span
                className={`h-0.5 w-6 bg-best-cyan transition-opacity duration-300 ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`h-0.5 w-6 bg-best-cyan transition-transform duration-300 ${
                  mobileOpen ? '-translate-y-2 -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div ref={overlayRef} className="fixed inset-0 z-40 glass-panel md:hidden">
          <div ref={linksRef} className="flex h-full flex-col items-center justify-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="mobile-link font-display text-2xl font-bold uppercase tracking-widest text-white transition-colors hover:text-best-cyan"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo('#pricing')}
              className="mobile-link mt-4 rounded-lg bg-best-gold px-8 py-3.5 font-heading text-base font-bold uppercase tracking-widest text-best-bg"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      )}
    </>
  );
}
