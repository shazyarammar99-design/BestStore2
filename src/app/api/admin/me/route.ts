import { NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin/auth';
import { getAuthenticatedUser } from '@/lib/supabase/route-auth';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ admin: false, user: null });
  }
  const admin = await isAdminUser(user);
  return NextResponse.json({
    admin,
    user: { id: user.id, email: user.email },
  });
}
