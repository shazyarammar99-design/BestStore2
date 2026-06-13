import { LOGOS } from '@/data';

export default function LogoStrip() {
  const doubled = [...LOGOS, ...LOGOS];

  return (
    <section className="overflow-hidden border-y border-krylo-border bg-krylo-bg py-10">
      <div className="group flex animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
        {doubled.map((logo, i) => (
          <span
            key={`${logo}-${i}`}
            className="mx-12 inline-flex items-center text-base font-bold uppercase tracking-[0.1em] text-white/30 transition-opacity group-hover:text-white/60"
          >
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}
