import { NextResponse } from 'next/server';
import { getOwnerEmail, isOwnerEmail } from '@/lib/admin/auth';
import { findAuthUserByEmail } from '@/lib/admin/find-user-by-email';
import { requireAdmin } from '@/lib/admin/require-admin';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const email = new URL(request.url).searchParams.get('email')?.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  try {
    const user = await findAuthUserByEmail(auth.ctx.admin, email);
    if (!user) {
      return NextResponse.json({ found: false });
    }

    const { data: profile } = await auth.ctx.admin
      .from('profiles')
      .select('id, username, is_admin')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json({
      found: true,
      ownerEmail: getOwnerEmail(),
      user: {
        id: user.id,
        email: user.email ?? email,
        username: profile?.username ?? user.email?.split('@')[0] ?? 'user',
        is_admin: profile?.is_admin === true || isOwnerEmail(user.email),
        is_owner: isOwnerEmail(user.email),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
