import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/route-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { leaderboardQuerySchema } from '@/lib/validation/leaderboard';
import type { LeaderboardEntry, LeaderboardResponse } from '@/types/leaderboard';

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthStartUtc(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = leaderboardQuerySchema.safeParse({
    limit: searchParams.get('limit') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters.' }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Leaderboard not configured.' }, { status: 503 });
  }

  const monthStart = monthStartUtc();

  const { data: rows, error } = await admin
    .from('purchases')
    .select('user_id, points_earned')
    .gte('created_at', monthStart);

  if (error) {
    return NextResponse.json({ error: 'Failed to load leaderboard.' }, { status: 500 });
  }

  const totals = new Map<string, number>();
  for (const row of rows ?? []) {
    const prev = totals.get(row.user_id) ?? 0;
    totals.set(row.user_id, prev + Number(row.points_earned));
  }

  const sorted = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, parsed.data.limit);

  const userIds = sorted.map(([id]) => id);
  const { data: profiles } = userIds.length
    ? await admin.from('profiles').select('id, username, avatar_url, is_admin').in('id', userIds)
    : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      {
        username: p.username,
        avatar_url: p.avatar_url,
        is_admin: p.is_admin === true,
      },
    ])
  );

  const entries: LeaderboardEntry[] = sorted.map(([userId, totalPoints], i) => {
    const profile = profileMap.get(userId);
    return {
      rank: i + 1,
      userId,
      username: profile?.username ?? 'Player',
      avatarUrl: profile?.avatar_url ?? null,
      totalPoints,
      isAdmin: profile?.is_admin === true,
    };
  });

  const user = await getAuthenticatedUser(request);

  let currentUser: LeaderboardResponse['currentUser'] = null;
  if (user) {
    const userTotal = totals.get(user.id) ?? 0;
    if (userTotal > 0) {
      const allSorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
      const rank = allSorted.findIndex(([id]) => id === user.id) + 1;
      currentUser = { rank, totalPoints: userTotal };
    } else {
      currentUser = { rank: 0, totalPoints: 0 };
    }
  }

  const response: LeaderboardResponse = {
    month: currentMonthKey(),
    entries,
    currentUser,
  };

  return NextResponse.json(response);
}
