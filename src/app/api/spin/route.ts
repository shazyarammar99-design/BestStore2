import { NextResponse } from 'next/server';
import { SPIN_TEST_MODE } from '@/config/spin';
import { SPIN_ODDS_META } from '@/config/spin-prizes';
import { verifyMathChallenge } from '@/lib/captcha';
import { rateLimit } from '@/lib/rate-limit';
import { consumeSpinCredit, resetMonthlySpinTimerOnSpin, syncMonthlyFreeSpins } from '@/lib/spin/credits';
import { getAuthenticatedUser } from '@/lib/supabase/route-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { pickWeightedPrize, prizeSegmentIndex } from '@/lib/spin/weighted-random';
import { spinRequestSchema } from '@/lib/validation/spin';
import { DEFAULT_SPIN_SETTINGS } from '@/types/site-settings';

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function utcMidnightTomorrow(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  ).toISOString();
}

async function pickSpinResult(admin: NonNullable<ReturnType<typeof createAdminClient>>) {
  const { data: prizes, error: prizesError } = await admin
    .from('prizes')
    .select('id, name, image_url, value, probability_weight')
    .eq('active', true)
    .order('probability_weight', { ascending: false });

  if (prizesError || !prizes?.length) {
    return null;
  }

  const won = pickWeightedPrize(prizes);
  const orderedIds = prizes.map((p) => p.id);
  const segmentIndex = prizeSegmentIndex(won.id, orderedIds);

  return {
    prize: {
      id: won.id,
      name: won.name,
      image_url: won.image_url,
      value: Number(won.value),
    },
    segmentIndex,
    won,
  };
}

function buildSpinStatusPayload(
  spinCredits: number,
  spunToday: boolean,
  nextFreeSpinAt: string | null,
  monthlySpinGranted: number,
  prizes: Array<{
    id: string;
    name: string;
    image_url: string | null;
    value: number;
    probability_weight: number;
    winPercent: number;
  }>,
  loggedIn: boolean,
  spinSettings: { extraTurns: number; spinDurationMs: number; minPurchaseIqd: number }
) {
  const canUseSpinToday = SPIN_TEST_MODE
    ? loggedIn
    : loggedIn && spinCredits > 0 && !spunToday;

  return {
    canSpinToday: canUseSpinToday,
    nextSpinAt: SPIN_TEST_MODE ? null : spunToday && loggedIn ? utcMidnightTomorrow() : null,
    spinCredits: SPIN_TEST_MODE ? 1 : spinCredits,
    requiresPurchase: SPIN_TEST_MODE ? false : loggedIn && spinCredits === 0,
    minPurchaseIqd: spinSettings.minPurchaseIqd,
    nextFreeSpinAt: SPIN_TEST_MODE ? null : loggedIn ? nextFreeSpinAt : null,
    monthlySpinGranted,
    oddsMeta: {
      lastUpdated: SPIN_ODDS_META.lastUpdated,
      nextReview: SPIN_ODDS_META.nextReview,
    },
    prizes,
    extraTurns: spinSettings.extraTurns,
    spinDurationMs: spinSettings.spinDurationMs,
  };
}

async function loadSpinSettings(admin: NonNullable<ReturnType<typeof createAdminClient>>) {
  const { data } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', 'spin')
    .maybeSingle();

  return { ...DEFAULT_SPIN_SETTINGS, ...(data?.value as object) };
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Spin service not configured.' }, { status: 503 });
  }

  const { data: prizes } = await admin
    .from('prizes')
    .select('id, name, image_url, value, probability_weight, created_at')
    .eq('active', true)
    .order('probability_weight', { ascending: false });

  const rows = prizes ?? [];
  const totalWeight = rows.reduce((sum, p) => sum + p.probability_weight, 0);
  const prizeRows = rows.map((p) => ({
    id: p.id,
    name: p.name,
    image_url: p.image_url,
    value: Number(p.value),
    probability_weight: p.probability_weight,
    winPercent:
      totalWeight > 0
        ? Math.round((p.probability_weight / totalWeight) * 1000) / 10
        : 0,
  }));

  const spinSettings = await loadSpinSettings(admin);

  if (!user) {
    return NextResponse.json(
      buildSpinStatusPayload(0, false, null, 0, prizeRows, false, spinSettings)
    );
  }

  const monthly = await syncMonthlyFreeSpins(admin, user.id);
  if ('error' in monthly) {
    return NextResponse.json({ error: monthly.error }, { status: 500 });
  }

  const spinCredits = monthly.spinCredits;

  const { data: existing } = await admin
    .from('spins')
    .select('id')
    .eq('user_id', user.id)
    .eq('spin_date', utcToday())
    .maybeSingle();

  return NextResponse.json(
    buildSpinStatusPayload(
      spinCredits,
      Boolean(existing),
      monthly.nextFreeSpinAt,
      monthly.grantedCount,
      prizeRows,
      true,
      spinSettings
    )
  );
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: 'Sign in to spin the wheel.' }, { status: 401 });
  }

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = spinRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }

  const { challengeId, answer, captchaToken } = parsed.data;
  const captcha = verifyMathChallenge(captchaToken, challengeId, answer);
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.reason }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Spin service not configured.' }, { status: 503 });
  }

  const limit = await rateLimit(`spin:${user.id}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
    );
  }

  const monthly = await syncMonthlyFreeSpins(admin, user.id);
  if ('error' in monthly) {
    return NextResponse.json({ error: monthly.error }, { status: 500 });
  }

  const spinCredits = monthly.spinCredits;
  const spinSettings = await loadSpinSettings(admin);

  if (!SPIN_TEST_MODE && spinCredits <= 0) {
    return NextResponse.json(
      {
        error: `Purchase at least ${spinSettings.minPurchaseIqd.toLocaleString()} IQD to unlock spins.`,
      },
      { status: 403 }
    );
  }

  const today = utcToday();

  if (!SPIN_TEST_MODE) {
    const { data: existingSpin } = await admin
      .from('spins')
      .select('id')
      .eq('user_id', user.id)
      .eq('spin_date', today)
      .maybeSingle();

    if (existingSpin) {
      return NextResponse.json({ error: 'You have already spun today. Come back tomorrow!' }, { status: 409 });
    }
  }

  const result = await pickSpinResult(admin);
  if (!result) {
    return NextResponse.json({ error: 'No prizes available.' }, { status: 503 });
  }

  if (!SPIN_TEST_MODE) {
    const { error: spinError } = await admin.from('spins').insert({
      user_id: user.id,
      spin_date: today,
      prize_id: result.won.id,
    });

    if (spinError) {
      if (spinError.code === '23505') {
        return NextResponse.json({ error: 'You have already spun today.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to record spin.' }, { status: 500 });
    }

    const consumed = await consumeSpinCredit(admin, user.id);
    if ('error' in consumed) {
      return NextResponse.json({ error: consumed.error }, { status: 500 });
    }

    const timerReset = await resetMonthlySpinTimerOnSpin(
      admin,
      user.id,
      consumed.monthlySpinPending
    );
    if ('error' in timerReset) {
      return NextResponse.json({ error: timerReset.error }, { status: 500 });
    }

    const { data: invRow } = await admin
      .from('inventory')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('prize_id', result.won.id)
      .maybeSingle();

    if (invRow) {
      await admin
        .from('inventory')
        .update({ quantity: invRow.quantity + 1, won_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('prize_id', result.won.id);
    } else {
      await admin.from('inventory').insert({
        user_id: user.id,
        prize_id: result.won.id,
        quantity: 1,
      });
    }

    return NextResponse.json({
      prize: result.prize,
      segmentIndex: result.segmentIndex,
      spinCreditsRemaining: consumed.remaining,
    });
  }

  return NextResponse.json({
    prize: result.prize,
    segmentIndex: result.segmentIndex,
    spinCreditsRemaining: 1,
  });
}
