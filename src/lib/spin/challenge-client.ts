import type { MathChallengeResponse } from '@/types/spin';

const MATH_QUESTION_RE = /What is (\d+) \+ (\d+)\?/;

export function parseMathAnswer(question: string): number | null {
  const match = question.match(MATH_QUESTION_RE);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return a + b;
}

export function buildSpinChallengePayload(
  challenge: MathChallengeResponse
): { challengeId: string; answer: number; captchaToken: string } | null {
  const answer = parseMathAnswer(challenge.question);
  if (answer === null) return null;
  return {
    challengeId: challenge.challengeId,
    answer,
    captchaToken: challenge.captchaToken,
  };
}

export async function fetchSpinChallenge(): Promise<MathChallengeResponse | null> {
  try {
    const res = await fetch('/api/spin/challenge');
    if (!res.ok) return null;
    const data = (await res.json()) as MathChallengeResponse;
    if (!data.challengeId || !data.captchaToken || !data.question) return null;
    return data;
  } catch {
    return null;
  }
}
