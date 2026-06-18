import { NextResponse } from 'next/server';
import { createMathChallenge } from '@/lib/captcha';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const limit = await rateLimit(`captcha:${getClientIp(request)}`, 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
    );
  }

  const challenge = createMathChallenge();
  return NextResponse.json(challenge);
}
