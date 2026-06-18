import { NextResponse } from 'next/server';
import { isOwnerEmail } from '@/lib/admin/auth';
import { requireAdmin } from '@/lib/admin/require-admin';

type Params = { params: Promise<{ userId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { userId } = await params;
  const body = await request.json();

  if (typeof body.is_admin !== 'boolean') {
    return NextResponse.json({ error: 'is_admin required' }, { status: 400 });
  }

  if (!body.is_admin) {
    const { data: authUser, error: authError } = await auth.ctx.admin.auth.admin.getUserById(userId);
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }
    if (isOwnerEmail(authUser.user?.email)) {
      return NextResponse.json({ error: 'Cannot revoke owner admin access' }, { status: 403 });
    }
  }

  const { data, error } = await auth.ctx.admin
    .from('profiles')
    .update({ is_admin: body.is_admin })
    .eq('id', userId)
    .select('id, username, is_admin')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
