import { useEffect, useRef, useState } from 'react';
import { STATS, TRUST_BADGES } from '@/data';
import { Lock, Fingerprint, Headphones, ShieldCheck, type LucideIcon } from 'lucide-react';

const BADGE_ICONS: Record<string, LucideIcon> = {
  Lock,
  Fingerprint,
  Headphones,
  ShieldCheck,
};

const DEADLINE_KEY = 'best-store-deal-deadline';

function getDeadline(): number {
  const stored = localStorage.getItem(DEADLINE_KEY);
  const now = Date.now();
  if (stored) {
    const ts = parseInt(stored, 10);
    if (ts > now) return ts;
  }
  const next = now + 24 * 60 * 60 * 1000;
  localStorage.setItem(DEADLINE_KEY, String(next));
  return next;
}

function Countdown() {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const deadline = getDeadline();
    const tick = () => setRemaining(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-3">
      <span className="font-heading text-xs font-semibold uppercase tracking-widest text-best-gold">
        Limited deal ends in
      </span>
      <div className="flex items-center gap-1 font-mono text-sm font-bold text-white">
        {[pad(hours), pad(minutes), pad(seconds)].map((unit, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="rounded border border-best-gold/30 bg-best-gold/10 px-2 py-1 text-best-gold">
              {unit}
            </span>
            {i < 2 && <span className="text-best-gold/60">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const duration = 1600;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-2xl font-bold text-best-cyan text-glow-cyan md:text-3xl">
        {display.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 font-heading text-xs uppercase tracking-widest text-best-caption">{label}</p>
    </div>
  );
}

export default function TrustBar() {
  return (
    <section className="border-y border-best-border bg-best-elevated/60">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <Counter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-best-border pt-8 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {TRUST_BADGES.map((badge) => {
              const Icon = BADGE_ICONS[badge.icon] || ShieldCheck;
              return (
                <div key={badge.label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-best-purple" />
                  <span className="font-heading text-xs font-semibold uppercase tracking-widest text-best-muted">
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
          <Countdown />
        </div>
      </div>
    </section>
  );
}
