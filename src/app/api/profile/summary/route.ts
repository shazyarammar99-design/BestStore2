import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser } from '@/lib/supabase/route-auth';
import {
  accountIdFromUserId,
  levelFromMonthlyPoints,
  monthStartUtc,
} from '@/lib/profile/utils';

export type ProfileSummary = {
  spin_credits: number;
  monthly_points: number;
  level: number;
  account_id: string;
};

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('spin_credits')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: 'Failed to load profile.' }, { status: 500 });
  }

  let monthlyPoints = 0;
  const admin = createAdminClient();
  if (admin) {
    const { data: purchases } = await admin
      .from('purchases')
      .select('points_earned')
      .eq('user_id', user.id)
      .gte('created_at', monthStartUtc());

    for (const row of purchases ?? []) {
      monthlyPoints += Number(row.points_earned);
    }
  }

  const summary: ProfileSummary = {
    spin_credits: profile?.spin_credits ?? 0,
    monthly_points: monthlyPoints,
    level: levelFromMonthlyPoints(monthlyPoints),
    account_id: accountIdFromUserId(user.id),
  };

  return NextResponse.json(summary);
}
