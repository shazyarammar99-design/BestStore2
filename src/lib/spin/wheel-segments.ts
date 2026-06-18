/** Best Store brand tokens — matches tailwind.config.js `best` palette */
export const BRAND = {
  bg: '#0B0C10',
  elevated: '#11131A',
  surface: '#161925',
  border: '#1E2230',
  cyan: '#00F0FF',
  purple: '#B026FF',
  text: '#FFFFFF',
  muted: '#8B93A7',
} as const;

export type SegmentGradient = {
  id: string;
  inner: string;
  mid: string;
  outer: string;
  accent: string;
};

/** Display labels matching the reference wheel (truncated where shown). */
export const DISPLAY_LABELS: Record<string, string> = {
  'Grand Prize — 5000 IQD': 'Grand Prize...',
  '10% Store Credit': '10% Store Cr...',
  '500 IQD Bonus': '500 IQD Bonus',
  'Free Delivery Token': 'Free Deliver...',
  '1000 IQD Bonus': '1000 IQD Bonus',
  'Rare Skin Voucher': 'Rare Skin Vo...',
};

export function getDisplayLabel(fullName: string): string {
  return DISPLAY_LABELS[fullName] ?? fullName;
}

/** Alternating cyan / purple — visible tints, readable on dark base */
export const SEGMENT_GRADIENTS: SegmentGradient[] = [
  {
    id: 'seg-cyan',
    inner: BRAND.elevated,
    mid: '#0c2a35',
    outer: '#104a5c',
    accent: BRAND.cyan,
  },
  {
    id: 'seg-purple',
    inner: BRAND.surface,
    mid: '#1e1040',
    outer: '#3a1870',
    accent: BRAND.purple,
  },
  {
    id: 'seg-cyan-2',
    inner: BRAND.elevated,
    mid: '#0c2a35',
    outer: '#104a5c',
    accent: BRAND.cyan,
  },
  {
    id: 'seg-purple-2',
    inner: BRAND.surface,
    mid: '#1e1040',
    outer: '#3a1870',
    accent: BRAND.purple,
  },
  {
    id: 'seg-cyan-3',
    inner: BRAND.elevated,
    mid: '#0c2a35',
    outer: '#104a5c',
    accent: BRAND.cyan,
  },
  {
    id: 'seg-purple-3',
    inner: BRAND.surface,
    mid: '#1e1040',
    outer: '#3a1870',
    accent: BRAND.purple,
  },
];
