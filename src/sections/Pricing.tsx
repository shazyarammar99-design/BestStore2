import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PRICING_TIERS, formatPrice } from '@/data';
import SectionHeader from '@/components/SectionHeader';
import { Switch } from '@/components/ui/switch';
import { Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Pricing() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [annual, setAnnual] = useState(false);

  useGSAP(
    () => {
      if (!gridRef.current) return;
      const cards = gridRef.current.querySelectorAll('.pricing-card');
      gsap.from(cards, {
        opacity: 0,
        y: 60,
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
    <section id="pricing" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="PRICING & PLANS"
          headline="Choose Your Power Level"
          subtitle="Every plan includes auto-updates, an HWID spoofer, and 24/7 support."
        />

        {/* Annual toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <span
            className={`font-heading text-sm font-semibold uppercase tracking-widest ${
              !annual ? 'text-white' : 'text-best-caption'
            }`}
          >
            Standard
          </span>
          <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Toggle annual pricing" />
          <span
            className={`font-heading text-sm font-semibold uppercase tracking-widest ${
              annual ? 'text-white' : 'text-best-caption'
            }`}
          >
            Annual
          </span>
          <span className="rounded-full border border-best-gold/40 bg-best-gold/10 px-2.5 py-1 font-heading text-[11px] font-bold uppercase tracking-wider text-best-gold">
            Save up to 26%
          </span>
        </div>

        <div ref={gridRef} className="mt-14 grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.tier}
              className={`pricing-card relative rounded-xl border p-8 transition-all duration-300 ${
                tier.highlighted
                  ? 'border-gradient-neon scale-[1.02] shadow-purple-glow md:scale-105'
                  : 'border-best-border bg-best-elevated hover:border-best-cyan/40'
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-best-purple px-3 py-1 font-heading text-[11px] font-bold uppercase tracking-wider text-white shadow-purple-glow">
                  {tier.badge}
                </span>
              )}

              <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-best-caption">
                {tier.tier}
              </p>
              <h3 className="font-heading mt-2 text-2xl font-bold text-white">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold tracking-tight text-white">
                  {formatPrice(annual ? tier.annualPrice : tier.price)}
                </span>
                <span className="text-sm text-best-caption">
                  {annual ? tier.annualPeriod : tier.period}
                </span>
              </div>
              {annual && (
                <p className="mt-1 font-heading text-xs font-semibold uppercase tracking-wider text-best-gold">
                  {tier.savings}
                </p>
              )}

              <div className="my-6 h-px bg-best-border" />

              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-best-cyan" />
                    <span className="text-sm text-best-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 w-full rounded-lg py-3.5 font-heading text-sm font-bold uppercase tracking-widest transition-all duration-200 ${
                  tier.highlighted
                    ? 'bg-best-gold text-best-bg hover:scale-[1.02] hover:shadow-gold-glow-lg'
                    : 'bg-best-cyan/10 text-best-cyan hover:bg-best-cyan hover:text-best-bg hover:shadow-cyan-glow'
                }`}
              >
                Get {tier.name}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-best-caption">
          New here?{' '}
          <span className="cursor-pointer text-best-cyan underline-offset-4 hover:underline">
            Start with a free trial
          </span>{' '}
          — no card required.
        </p>
      </div>
    </section>
  );
}
