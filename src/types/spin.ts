export type Prize = {
  id: string;
  name: string;
  probability_weight: number;
  image_url: string | null;
  value: number;
  active: boolean;
};

export type SpinResult = {
  prize: {
    id: string;
    name: string;
    image_url: string | null;
    value: number;
  };
  segmentIndex: number;
};

export type SpinPrizeRow = {
  id: string;
  name: string;
  image_url: string | null;
  value: number;
  probability_weight: number;
  winPercent: number;
};

export type SpinOddsMeta = {
  lastUpdated: string;
  nextReview: string;
};

export type SpinStatus = {
  canSpinToday: boolean;
  nextSpinAt: string | null;
  spinCredits: number;
  requiresPurchase: boolean;
  minPurchaseIqd: number;
  nextFreeSpinAt: string | null;
  monthlySpinGranted?: number;
  oddsMeta: SpinOddsMeta;
  prizes: SpinPrizeRow[];
};

export type MathChallengeResponse = {
  challengeId: string;
  question: string;
  captchaToken: string;
};

export type WheelPhase = 'idle' | 'spinning' | 'celebrating';

export interface WheelSegment {
  id: string;
  label: string;
  fullName: string;
  imageUrl: string | null;
  gradientId: string;
  startAngle: number;
  endAngle: number;
}

export interface PrizeOutcome {
  segmentIndex: number;
  prize: SpinResult['prize'];
}

export interface SpinWheelCanvasProps {
  segments: WheelSegment[];
  phase: WheelPhase;
  baseRotation: number;
  targetRotation: number;
  winningIndex: number | null;
  onHubClick?: () => void;
  spinDisabled?: boolean;
  onSpinTransitionEnd?: () => void;
}
