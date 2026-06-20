'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useNewReleases } from '@/hooks/useNewReleases';
import { cn } from '@/lib/utils';

const AUTOPLAY_DELAY_MS = 5000;

export default function NewReleaseCarousel() {
  const { releases, loading } = useNewReleases();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const restartProgress = useCallback(() => {
    setProgressKey((k) => k + 1);
  }, []);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    restartProgress();
  }, [api, restartProgress]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  const goToSlide = (index: number) => {
    api?.scrollTo(index);
  };

  const handleTimerComplete = useCallback(
    (event: React.AnimationEvent<HTMLDivElement>) => {
      if (event.animationName !== 'carousel-progress') return;
      if (isPaused || !api) return;
      api.scrollNext();
    },
    [api, isPaused]
  );

  if (loading) {
    return (
      <section aria-label="New releases loading" className="border-b border-best-border bg-best-elevated/30 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="h-48 animate-pulse rounded-2xl bg-best-border/40 md:h-56" />
        </div>
      </section>
    );
  }

  if (releases.length === 0) return null;

  return (
    <section
      aria-label="New releases"
      className="border-b border-best-border bg-gradient-to-b from-best-elevated/50 to-transparent py-10 md:py-12"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-best-cyan">
              Now Showing
            </p>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
              New Releases
            </h2>
          </div>
          <p className="sr-only" aria-live="polite">
            Slide {current + 1} of {releases.length}
          </p>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: 'start', loop: true, direction: 'ltr' }}
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            restartProgress();
          }}
        >
          <CarouselContent>
            {releases.map((release, index) => (
              <CarouselItem key={release.id}>
                <article className="relative overflow-hidden rounded-2xl border border-best-border bg-best-elevated">
                  <div className="grid md:grid-cols-[1.2fr_1fr]">
                    <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[280px]">
                      <Image
                        src={release.image_url}
                        alt={release.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 60vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-best-bg/20 to-transparent md:hidden" />
                    </div>
                    <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
                      <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white md:text-2xl">
                        {release.title}
                      </h3>
                      <p className="line-clamp-3 text-sm leading-relaxed text-best-muted md:text-base">
                        {release.description}
                      </p>
                      <Link
                        href={release.link}
                        className="inline-flex w-fit items-center rounded-lg border border-best-cyan/50 bg-best-cyan/10 px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-widest text-best-cyan transition-colors hover:bg-best-cyan/20"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>

          {releases.length > 1 && (
            <>
              <CarouselPrevious className="start-3 border-best-border bg-best-bg/90 text-white hover:bg-best-elevated md:-start-4" />
              <CarouselNext className="end-3 border-best-border bg-best-bg/90 text-white hover:bg-best-elevated md:-end-4" />
              <div
                className="mt-4 h-1 w-full overflow-hidden rounded-full bg-best-border/60"
                aria-hidden="true"
              >
                <div
                  key={progressKey}
                  className="h-full w-0 bg-best-cyan animate-carousel-progress"
                  style={{
                    animationDuration: `${AUTOPLAY_DELAY_MS}ms`,
                    animationPlayState: isPaused ? 'paused' : 'running',
                  }}
                  onAnimationEnd={handleTimerComplete}
                />
              </div>
              <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Carousel slides">
                {releases.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === current}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => goToSlide(i)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      i === current ? 'w-6 bg-best-cyan' : 'w-2 bg-best-border hover:bg-best-muted'
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
}
