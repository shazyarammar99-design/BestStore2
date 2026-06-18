'use client';

import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import type { SpinWheelCanvasProps } from '@/types/spin';
import {
  computeIdleRotation,
  computeSpinRotation,
  drawWheel,
  getPointerSegmentIndex,
  getSpinDuration,
} from '@/lib/spin/wheel-canvas';
import { BRAND, SEGMENT_GRADIENTS } from '@/lib/spin/wheel-segments';
import {
  getPrizeIconKey,
  loadPrizeIconImage,
  loadPrizeImageFromUrl,
} from '@/lib/spin/prize-icons';
import { playTick, prefersReducedMotion } from '@/lib/spin/tick-sound';
import { cn } from '@/lib/utils';

const WHEEL_SIZE =
  'h-[min(92vw,520px)] w-[min(92vw,520px)] sm:h-[min(85vw,560px)] sm:w-[min(85vw,560px)] lg:h-[560px] lg:w-[560px]';

const SpinWheelCanvas = forwardRef<HTMLDivElement, SpinWheelCanvasProps>(function SpinWheelCanvas(
  {
    segments,
    phase,
    baseRotation,
    targetRotation,
    winningIndex,
    onHubClick,
    spinDisabled = false,
    onSpinTransitionEnd,
    spinDurationMs,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerGradId = useId().replace(/:/g, '');
  const rotationRef = useRef(baseRotation);
  const rafRef = useRef<number | null>(null);
  const spinStartRef = useRef(0);
  const spinFromRef = useRef(0);
  const idleStartRef = useRef(0);
  const idleFromRef = useRef(0);
  const lastTickSegmentRef = useRef(-1);
  const lastTickSoundMsRef = useRef(0);
  const celebrateStartRef = useRef(0);
  const spinEndedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const canvasDprRef = useRef(1);

  const [iconImages, setIconImages] = useState<Map<string, HTMLImageElement | null>>(new Map());
  const [canvasSize, setCanvasSize] = useState(480);

  const drawStateRef = useRef({
    segments,
    iconImages,
    winningIndex,
    phase,
    canvasSize,
  });

  const phaseRef = useRef(phase);
  const prevPhaseRef = useRef<typeof phase>(phase);
  const targetRotationRef = useRef(targetRotation);
  const segmentsLengthRef = useRef(segments.length);
  const onSpinEndRef = useRef(onSpinTransitionEnd);
  const spinDurationMsRef = useRef(spinDurationMs);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    targetRotationRef.current = targetRotation;
  }, [targetRotation]);

  useEffect(() => {
    spinDurationMsRef.current = spinDurationMs;
  }, [spinDurationMs]);

  useEffect(() => {
    segmentsLengthRef.current = segments.length;
  }, [segments.length]);

  useEffect(() => {
    onSpinEndRef.current = onSpinTransitionEnd;
  }, [onSpinTransitionEnd]);

  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  useEffect(() => {
    reducedMotionRef.current = prefersReducedMotion();
  }, []);

  useEffect(() => {
    if (phase === 'idle') {
      rotationRef.current = baseRotation;
    }
  }, [baseRotation, phase]);

  useEffect(() => {
    let cancelled = false;
    const map = new Map<string, HTMLImageElement | null>();

    async function loadAll() {
      await Promise.all(
        segments.map(async (seg) => {
          if (seg.imageUrl) {
            const key = `url:${seg.imageUrl}`;
            const img = await loadPrizeImageFromUrl(seg.imageUrl);
            if (!cancelled) map.set(key, img);
          } else {
            const iconKey = getPrizeIconKey(seg.fullName);
            const key = `icon:${iconKey}`;
            const img = await loadPrizeIconImage(iconKey, 28, '#FFFFFF');
            if (!cancelled) map.set(key, img);
          }
        })
      );
      if (!cancelled) setIconImages(new Map(map));
    }

    void loadAll();
    return () => {
      cancelled = true;
    };
  }, [segments]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width;
      setCanvasSize(Math.max(280, Math.floor(width)));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    drawStateRef.current = { segments, iconImages, winningIndex, phase, canvasSize };
  }, [segments, iconImages, winningIndex, phase, canvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvasDprRef.current = dpr;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
  }, [canvasSize]);

  const renderFrame = useCallback((rotation: number, celebratePulse: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { segments: segs, iconImages: icons, winningIndex: winIdx, phase: drawPhase, canvasSize: size } =
      drawStateRef.current;
    const dpr = canvasDprRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    drawWheel(ctx, size, {
      rotationDeg: rotation,
      segments: segs,
      gradients: SEGMENT_GRADIENTS,
      iconImages: icons,
      winningIndex: winIdx,
      celebratePhase: drawPhase === 'celebrating',
      celebratePulse,
    });
  }, []);

  useEffect(() => {
    const tick = (now: number) => {
      const reduced = reducedMotionRef.current;
      const currentPhase = phaseRef.current;
      const targetRotation = targetRotationRef.current;
      const segmentCount = segmentsLengthRef.current;
      let rotation = rotationRef.current;
      let celebratePulse = 0;

      if (currentPhase === 'idle') {
        if (idleStartRef.current === 0) {
          idleStartRef.current = now;
          idleFromRef.current = rotationRef.current;
        }
        rotation = computeIdleRotation(idleFromRef.current, now - idleStartRef.current, reduced);
        rotationRef.current = rotation;
      } else if (currentPhase === 'spinning') {
        idleStartRef.current = 0;
        if (spinStartRef.current === 0) {
          spinStartRef.current = now;
          spinFromRef.current = rotationRef.current;
          spinEndedRef.current = false;
          lastTickSegmentRef.current = getPointerSegmentIndex(spinFromRef.current, segmentCount);
          lastTickSoundMsRef.current = 0;
        }
        const duration = getSpinDuration(reduced, spinDurationMsRef.current);
        const elapsed = now - spinStartRef.current;
        rotation = computeSpinRotation(
          spinFromRef.current,
          targetRotation,
          elapsed,
          duration,
          reduced
        );
        rotationRef.current = rotation;

        if (!reduced) {
          const segIdx = getPointerSegmentIndex(rotation, segmentCount);
          if (segIdx !== lastTickSegmentRef.current) {
            lastTickSegmentRef.current = segIdx;
            const minTickGapMs = elapsed > duration * 0.65 ? 120 : 70;
            if (now - lastTickSoundMsRef.current >= minTickGapMs) {
              lastTickSoundMsRef.current = now;
              playTick();
            }
          }
        }

        if (elapsed >= duration && !spinEndedRef.current) {
          spinEndedRef.current = true;
          spinStartRef.current = 0;
          rotationRef.current = computeSpinRotation(
            spinFromRef.current,
            targetRotation,
            duration,
            duration,
            reduced
          );
          onSpinEndRef.current?.();
        }
      } else if (currentPhase === 'celebrating') {
        idleStartRef.current = 0;
        spinStartRef.current = 0;
        if (celebrateStartRef.current === 0) celebrateStartRef.current = now;
        celebratePulse = (Math.sin((now - celebrateStartRef.current) / 300) + 1) / 2;
        rotation = rotationRef.current;
      }

      renderFrame(rotation, celebratePulse);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [renderFrame]);

  useEffect(() => {
    phaseRef.current = phase;
    const prev = prevPhaseRef.current;
    if (phase === 'spinning' && (prev === 'idle' || prev === 'celebrating')) {
      spinStartRef.current = 0;
      spinEndedRef.current = false;
    }
    if (phase === 'celebrating') {
      celebrateStartRef.current = 0;
    }
    if (phase === 'idle') {
      celebrateStartRef.current = 0;
      if (prev !== 'idle') {
        spinStartRef.current = 0;
      }
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  const handleHubClick = () => {
    if (!spinDisabled && onHubClick) onHubClick();
  };

  const handleHubKeyDown = (e: React.KeyboardEvent) => {
    if (!spinDisabled && onHubClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onHubClick();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative flex items-center justify-center', WHEEL_SIZE)}
    >
      <div
        className="pointer-events-none absolute inset-[6%] rounded-full bg-best-cyan/10 blur-[60px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[14%] rounded-full bg-best-purple/8 blur-[40px]"
        aria-hidden
      />

      <div className="relative" style={{ width: canvasSize, height: canvasSize }}>
        <div
          className="pointer-pulse-glow pointer-events-none absolute left-1/2 z-30 -translate-x-1/2"
          style={{ top: -6 }}
          aria-hidden
        >
          <svg width="32" height="40" viewBox="0 0 32 40" className="block">
            <defs>
              <linearGradient id={pointerGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={BRAND.purple} />
                <stop offset="100%" stopColor={BRAND.cyan} />
              </linearGradient>
            </defs>
            <path
              d="M16 38 L28 4 L16 10 L4 4 Z"
              fill={`url(#${pointerGradId})`}
              stroke={BRAND.cyan}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Prize wheel with ${segments.length} segments`}
          className="relative z-10 block"
          style={{ width: canvasSize, height: canvasSize }}
        />

        <button
          type="button"
          onClick={handleHubClick}
          onKeyDown={handleHubKeyDown}
          disabled={spinDisabled || !onHubClick}
          title={onHubClick && !spinDisabled ? 'Spin the wheel' : undefined}
          aria-label={
            phase === 'spinning'
              ? 'Spinning the wheel'
              : spinDisabled
                ? 'Spin unavailable'
                : 'Spin the wheel'
          }
          className={cn(
            'absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full',
            'h-[22%] w-[22%] min-h-[52px] min-w-[52px] border-0 bg-transparent',
            'transition-all duration-200',
            onHubClick && !spinDisabled
              ? 'cursor-pointer hover:bg-best-cyan/15 hover:shadow-[0_0_28px_rgba(0,240,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-best-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-best-bg'
              : 'cursor-default'
          )}
        />
      </div>
    </div>
  );
});

export default SpinWheelCanvas;
