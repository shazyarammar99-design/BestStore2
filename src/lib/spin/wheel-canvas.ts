import type { WheelSegment } from '@/types/spin';
import { BRAND, type SegmentGradient } from '@/lib/spin/wheel-segments';
import { getPrizeIconKey } from '@/lib/spin/prize-icons';

export const IDLE_MS_PER_REV = 25000;
/** Total wheel spin time — 3 seconds. */
export const SPIN_DURATION_MS = 3000;
export const SPIN_DURATION_REDUCED_MS = 2000;

/** ~70% of distance in first 35% of time, then long ease-out finish */
export function easeCasinoSpin(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  if (clamped < 0.35) return (clamped / 0.35) * 0.7;
  const tail = (clamped - 0.35) / 0.65;
  return 0.7 + 0.3 * (1 - Math.pow(1 - tail, 4));
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
}

export function getSpinDuration(reducedMotion: boolean): number {
  return reducedMotion ? SPIN_DURATION_REDUCED_MS : SPIN_DURATION_MS;
}

/** Segment index currently under the top pointer. */
export function getPointerSegmentIndex(rotationDeg: number, segmentCount: number): number {
  if (segmentCount <= 0) return 0;
  const slice = 360 / segmentCount;
  const adjusted = ((360 - (rotationDeg % 360)) + 360) % 360;
  return Math.floor(adjusted / slice) % segmentCount;
}

function degToRad(deg: number): number {
  return ((deg - 90) * Math.PI) / 180;
}

function drawSegmentWedge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  gradient: SegmentGradient,
  highlight: boolean
): void {
  const startRad = degToRad(startAngle);
  const endRad = degToRad(endAngle);

  const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  grad.addColorStop(0, gradient.inner);
  grad.addColorStop(0.45, gradient.mid);
  grad.addColorStop(1, gradient.outer);

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, startRad, endRad);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  if (highlight) {
    ctx.strokeStyle = BRAND.cyan;
    ctx.lineWidth = 3.5;
    ctx.stroke();
  } else {
    ctx.strokeStyle = gradient.accent;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawDivider(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  angle: number
): void {
  const rad = degToRad(angle);
  ctx.beginPath();
  ctx.moveTo(cx + (r - 6) * Math.cos(rad), cy + (r - 6) * Math.sin(rad));
  ctx.lineTo(cx + (r + 4) * Math.cos(rad), cy + (r + 4) * Math.sin(rad));
  ctx.strokeStyle = BRAND.cyan;
  ctx.globalAlpha = 0.65;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export type WheelDrawOptions = {
  rotationDeg: number;
  segments: WheelSegment[];
  gradients: SegmentGradient[];
  iconImages: Map<string, HTMLImageElement | null>;
  winningIndex: number | null;
  celebratePhase: boolean;
  celebratePulse: number;
};

export function drawWheel(
  ctx: CanvasRenderingContext2D,
  size: number,
  options: WheelDrawOptions
): void {
  const {
    rotationDeg,
    segments,
    gradients,
    iconImages,
    winningIndex,
    celebratePhase,
    celebratePulse,
  } = options;

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const r = size * 0.4375;
  const hubR = size * 0.108;

  ctx.clearRect(0, 0, size, size);

  // Background disc
  ctx.beginPath();
  ctx.arc(cx, cy, outerR + size * 0.03, 0, Math.PI * 2);
  ctx.fillStyle = BRAND.bg;
  ctx.fill();

  // Celebration shockwaves (behind ring, in front of bg)
  if (celebratePhase && celebratePulse > 0) {
    for (let wave = 0; wave < 2; wave++) {
      const phase = (celebratePulse + wave * 0.5) % 1;
      const waveR = outerR + size * 0.04 + phase * size * 0.08;
      const alpha = (1 - phase) * 0.45;
      ctx.beginPath();
      ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
      ctx.strokeStyle = wave % 2 === 0 ? BRAND.cyan : BRAND.purple;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 2 + phase * 3;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Neon ring — pulses during celebration
  const ringGrad = ctx.createLinearGradient(0, 0, size, size);
  ringGrad.addColorStop(0, BRAND.cyan);
  ringGrad.addColorStop(1, BRAND.purple);
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = size * (0.012 + (celebratePhase ? celebratePulse * 0.008 : 0));
  ctx.shadowColor = celebratePhase ? BRAND.purple : BRAND.cyan;
  ctx.shadowBlur = size * (0.02 + (celebratePhase ? celebratePulse * 0.05 : 0));
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Inner bezel
  ctx.beginPath();
  ctx.arc(cx, cy, r + size * 0.008, 0, Math.PI * 2);
  ctx.fillStyle = BRAND.bg;
  ctx.fill();
  ctx.strokeStyle = BRAND.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.translate(-cx, -cy);

  segments.forEach((seg, i) => {
    const gradient = gradients[i % gradients.length];
    const isWinner = celebratePhase && winningIndex === i;
    const pulse = isWinner ? 1 + celebratePulse * 0.35 : 1;

    if (isWinner) {
      ctx.save();
      ctx.globalAlpha = 0.25 + celebratePulse * 0.45;
      ctx.beginPath();
      const mid = seg.startAngle + (seg.endAngle - seg.startAngle) / 2;
      const midRad = degToRad(mid);
      ctx.arc(cx, cy, r, midRad - 0.45, midRad + 0.45);
      ctx.lineTo(cx, cy);
      ctx.fillStyle = BRAND.cyan;
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    if (pulse !== 1) ctx.filter = `brightness(${pulse})`;
    drawSegmentWedge(ctx, cx, cy, r, seg.startAngle, seg.endAngle, gradient, isWinner);
    ctx.restore();

    drawDivider(ctx, cx, cy, r, seg.startAngle);

    const mid = seg.startAngle + (seg.endAngle - seg.startAngle) / 2;
    const midRad = degToRad(mid);
    const iconX = cx + r * 0.5 * Math.cos(midRad);
    const iconY = cy + r * 0.5 * Math.sin(midRad);
    const labelX = cx + r * 0.72 * Math.cos(midRad);
    const labelY = cy + r * 0.72 * Math.sin(midRad);

    const iconKey = seg.imageUrl
      ? `url:${seg.imageUrl}`
      : `icon:${getPrizeIconKey(seg.fullName)}`;
    const iconImg = iconImages.get(iconKey);
    const iconSize = size * 0.055;

    ctx.save();
    ctx.translate(iconX, iconY);
    ctx.rotate((mid * Math.PI) / 180);
    if (iconImg) {
      ctx.drawImage(iconImg, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(labelX, labelY);
    ctx.rotate((mid * Math.PI) / 180);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 ${Math.max(11, size * 0.033)}px Rajdhani, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(seg.label, 0, 0);
    ctx.restore();
  });

  // Hub (rotates with wheel)
  const hubGrad = ctx.createRadialGradient(cx - hubR * 0.3, cy - hubR * 0.3, 0, cx, cy, hubR);
  hubGrad.addColorStop(0, '#1a2035');
  hubGrad.addColorStop(1, BRAND.bg);
  ctx.beginPath();
  ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
  ctx.fillStyle = hubGrad;
  ctx.fill();
  ctx.strokeStyle = BRAND.cyan;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, hubR * 0.65, 0, Math.PI * 2);
  ctx.strokeStyle = BRAND.purple;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = BRAND.cyan;
  ctx.font = `700 ${Math.max(12, size * 0.031)}px Orbitron, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = BRAND.cyan;
  ctx.shadowBlur = 8;
  ctx.fillText('SPIN', cx, cy);
  ctx.shadowBlur = 0;

  ctx.restore();
}

export function computeIdleRotation(
  startRotation: number,
  elapsedMs: number,
  reducedMotion: boolean
): number {
  if (reducedMotion) return startRotation;
  return startRotation + (elapsedMs / IDLE_MS_PER_REV) * 360;
}

export function computeSpinRotation(
  startRotation: number,
  targetRotation: number,
  elapsedMs: number,
  durationMs: number,
  reducedMotion = false
): number {
  const t = Math.min(1, Math.max(0, elapsedMs / durationMs));
  const progress = reducedMotion ? t : easeCasinoSpin(t);
  return startRotation + (targetRotation - startRotation) * progress;
}
