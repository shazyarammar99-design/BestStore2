'use client';

import { useEffect, useRef, useState } from 'react';
import { STAT_LABELS } from '@/data';
import { useSiteStats } from '@/hooks/useSiteStats';

type Variant = 'hero' | 'trustbar';

function displaySuffix(key: string, value: number, baseSuffix: string): string {
  if (key === 'reviewCount' && value >= 100) return '+';
  return baseSuffix;
}

function StatBlock({
  value,
  suffix,
  label,
  variant,
}: {
  value: number | null;
  suffix: string;
  label: string;
  variant: Variant;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  const target = value ?? 0;

  useEffect(() => {
    if (value === null) return;
    if (variant === 'hero') {
      setDisplay(target);
      return;
    }
    if (started.current) {
      setDisplay(target);
      return;
    }
    setDisplay(0);
  }, [target, value, variant]);

  useEffect(() => {
    if (value === null || variant !== 'trustbar') return;
    const el = ref.current;
    if (!el) return;

    const runAnimation = () => {
      if (started.current) return;
      started.current = true;
      const duration = 1600;
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) runAnimation();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, value, variant]);

  const valueClass =
    variant === 'trustbar'
      ? 'font-display text-2xl font-bold text-best-cyan text-glow-cyan md:text-3xl'
      : 'font-display text-2xl font-bold text-white';

  if (value === null) {
    return (
      <div ref={ref} className="text-center">
        <p className={valueClass}>—</p>
        <p className="mt-1 font-heading text-xs uppercase tracking-widest text-best-caption">{label}</p>
      </div>
    );
  }

  const statKey = STAT_LABELS.find((s) => s.label === label)?.key ?? '';
  const shown = variant === 'trustbar' ? display : target;
  const sfx = displaySuffix(statKey, target, suffix);

  return (
    <div ref={ref} className="text-center">
      <p className={valueClass}>
        {shown.toLocaleString()}
        {sfx}
      </p>
      <p className="mt-1 font-heading text-xs uppercase tracking-widest text-best-caption">{label}</p>
    </div>
  );
}

export default function LiveSiteStats({ variant }: { variant: Variant }) {
  const { stats } = useSiteStats();

  const values: Record<string, number | null> = {
    activeUsers: stats.activeUsers,
    gamesSupported: stats.gamesSupported,
    reviewCount: stats.reviewCount,
  };

  return (
    <>
      {STAT_LABELS.map((stat) => (
        <StatBlock
          key={stat.key}
          value={values[stat.key]}
          suffix={stat.suffix}
          label={stat.label}
          variant={variant}
        />
      ))}
    </>
  );
}
