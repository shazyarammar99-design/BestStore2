import confetti from 'canvas-confetti';
import { prefersReducedMotion } from '@/lib/spin/tick-sound';

export const WHEEL_FIREWORK_COLORS = ['#00F0FF', '#B026FF', '#FFFFFF', '#7B2FFF'];

function toConfettiOrigin(px: number, py: number): { x: number; y: number } {
  return {
    x: px / window.innerWidth,
    y: py / window.innerHeight,
  };
}

export function launchWheelFireworks(container: HTMLElement | null): void {
  if (!container || typeof window === 'undefined') return;

  const reduced = prefersReducedMotion();
  const rect = container.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const radius = Math.min(rect.width, rect.height) * 0.48;

  const burst = (px: number, py: number, opts: confetti.Options) => {
    void confetti({
      ...opts,
      origin: toConfettiOrigin(px, py),
      colors: WHEEL_FIREWORK_COLORS,
      disableForReducedMotion: true,
    });
  };

  if (reduced) {
    burst(cx, cy, {
      particleCount: 40,
      spread: 70,
      startVelocity: 28,
      scalar: 0.9,
    });
    return;
  }

  const points = 8;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;

    setTimeout(() => {
      burst(px, py, {
        particleCount: 28 + (i % 3) * 4,
        spread: 55 + (i % 2) * 25,
        startVelocity: 32 + (i % 3) * 6,
        ticks: 180,
        gravity: 0.9,
        shapes: i % 2 === 0 ? ['circle', 'star'] : ['star', 'circle'],
        scalar: 0.85 + (i % 3) * 0.1,
      });
    }, i * 120);
  }

  setTimeout(() => {
    burst(cx, cy, {
      particleCount: 90,
      spread: 360,
      startVelocity: 38,
      ticks: 220,
      gravity: 0.75,
      shapes: ['circle', 'star'],
      scalar: 1.15,
    });
  }, points * 120 + 80);

  setTimeout(() => {
    burst(cx, cy - radius * 0.15, {
      particleCount: 50,
      spread: 100,
      startVelocity: 42,
      ticks: 200,
      shapes: ['star'],
      scalar: 1.25,
    });
  }, points * 120 + 280);
}
