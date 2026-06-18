import type { WheelSegment } from '@/types/spin';
import { getDisplayLabel, SEGMENT_GRADIENTS } from '@/lib/spin/wheel-segments';
const CX = 240;
const CY = 240;
const R = 210;

export const WHEEL_VIEWBOX = '0 0 480 480';
export const WHEEL_CX = CX;
export const WHEEL_CY = CY;
export const WHEEL_R = R;

export function segmentSlicePath(
  startAngle: number,
  endAngle: number,
  cx = CX,
  cy = CY,
  r = R
): string {
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

export function segmentLabelPosition(
  startAngle: number,
  endAngle: number,
  cx = CX,
  cy = CY,
  r = R
): { x: number; y: number; rotation: number } {
  const mid = startAngle + (endAngle - startAngle) / 2;
  const midRad = ((mid - 90) * Math.PI) / 180;
  return {
    x: cx + r * 0.62 * Math.cos(midRad),
    y: cy + r * 0.62 * Math.sin(midRad),
    rotation: mid,
  };
}

export function buildWheelSegments(
  prizes: { id: string; name: string; image_url?: string | null }[]
): WheelSegment[] {
  const count = Math.max(prizes.length, 1);
  const slice = 360 / count;

  return prizes.map((prize, i) => ({
    id: prize.id,
    label: getDisplayLabel(prize.name),
    fullName: prize.name,
    imageUrl: prize.image_url ?? null,
    gradientId: SEGMENT_GRADIENTS[i % SEGMENT_GRADIENTS.length].id,
    startAngle: slice * i,
    endAngle: slice * (i + 1),
  }));
}

const EDGE_PADDING_RATIO = 0.12;

/** Full extra revolutions during a spin (lower = smoother, less RPM). */
export const SPIN_EXTRA_TURNS = 7;

/** Random offset within a slice, padded away from boundary lines. */
export function randomLandingOffsetInSegment(segmentDeg: number): number {
  const min = -segmentDeg / 2 + segmentDeg * EDGE_PADDING_RATIO;
  const max = segmentDeg / 2 - segmentDeg * EDGE_PADDING_RATIO;
  return min + Math.random() * (max - min);
}

/** Land a random spot inside the winning segment under the top pointer. */
export function computeSpinTargetRotation(
  currentRotation: number,
  segmentIndex: number,
  segmentCount: number,
  extraTurns = SPIN_EXTRA_TURNS
): number {
  const segmentDeg = 360 / segmentCount;
  const landingOffset = randomLandingOffsetInSegment(segmentDeg);
  const targetAngle = 360 - (segmentIndex * segmentDeg + segmentDeg / 2 + landingOffset);
  const extra = extraTurns * 360;
  return currentRotation + extra + targetAngle - (currentRotation % 360);
}

export const CELEBRATION_RESUME_MS = 4500;
