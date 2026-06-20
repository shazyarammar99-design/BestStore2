export type SpinSettings = {
  extraTurns: number;
  spinDurationMs: number;
  minPurchaseIqd: number;
  /** When true: unlimited test spins, no credits consumed, prizes not persisted. */
  testMode: boolean;
};

export type BrandingSettings = {
  logoUrl: string;
  faviconUrl: string | null;
  siteName: string;
};

export type HowItWorksVideoType = 'none' | 'upload' | 'youtube' | 'vimeo';

export type HowItWorksVideoSettings = {
  videoUrl: string | null;
  videoType: HowItWorksVideoType;
  label: string;
  posterUrl: string | null;
};

export const DEFAULT_SPIN_SETTINGS: SpinSettings = {
  extraTurns: 7,
  spinDurationMs: 3000,
  minPurchaseIqd: 10_000,
  testMode: false,
};

export const DEFAULT_BRANDING_SETTINGS: BrandingSettings = {
  logoUrl: '/brand/logo.png',
  faviconUrl: null,
  siteName: 'BEST STORE',
};

export const DEFAULT_HOW_IT_WORKS_VIDEO: HowItWorksVideoSettings = {
  videoUrl: null,
  videoType: 'none',
  label: 'Watch: setup in under 2 minutes',
  posterUrl: null,
};
