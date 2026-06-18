import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { isAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser } from '@/lib/supabase/route-auth';
import { rateLimit } from '@/lib/rate-limit';
type AdminContext = {
  user: User;
  admin: SupabaseClient;
};

type AdminResult =
  | { ok: true; ctx: AdminContext }
  | { ok: false; response: NextResponse };

export async function requireAdmin(request: Request): Promise<AdminResult> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const allowed = await isAdminUser(user);
  if (!allowed) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  const adminLimit = await rateLimit(`admin:${user.id}`, 30, 60_000);
  if (!adminLimit.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Too many admin requests. Please wait.' },
        { status: 429, headers: { 'Retry-After': String(adminLimit.retryAfterSec) } }
      ),
    };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Admin client not configured' }, { status: 503 }),
    };
  }

  return { ok: true, ctx: { user, admin } };
}
