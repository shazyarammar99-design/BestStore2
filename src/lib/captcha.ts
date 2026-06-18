import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const TTL_MS = 5 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.CAPTCHA_SIGNING_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('CAPTCHA_SIGNING_SECRET is required in production.');
  }

  return 'dev-captcha-secret-local-only';
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export type MathChallenge = {
  challengeId: string;
  question: string;
  captchaToken: string;
};

export function createMathChallenge(): MathChallenge {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const challengeId = randomBytes(16).toString('hex');
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${challengeId}:${a}:${b}:${expiresAt}`;
  const captchaToken = `${payload}:${sign(payload)}`;

  return {
    challengeId,
    question: `What is ${a} + ${b}?`,
    captchaToken,
  };
}

export function verifyMathChallenge(
  captchaToken: string,
  challengeId: string,
  answer: number
): { ok: true } | { ok: false; reason: string } {
  const parts = captchaToken.split(':');
  if (parts.length !== 5) return { ok: false, reason: 'Invalid captcha token.' };

  const [id, aStr, bStr, expiresStr, signature] = parts;
  const payload = `${id}:${aStr}:${bStr}:${expiresStr}`;
  const expected = sign(payload);

  try {
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return { ok: false, reason: 'Captcha signature mismatch.' };
    }
  } catch {
    return { ok: false, reason: 'Captcha signature invalid.' };
  }

  if (id !== challengeId) return { ok: false, reason: 'Challenge ID mismatch.' };

  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return { ok: false, reason: 'Captcha expired. Request a new challenge.' };
  }

  const expectedAnswer = Number(aStr) + Number(bStr);
  if (answer !== expectedAnswer) return { ok: false, reason: 'Incorrect answer.' };

  return { ok: true };
}
