import { NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin/auth';
import { getAuthenticatedUser } from '@/lib/supabase/route-auth';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ isAdmin: false });
  }

  const isAdmin = await isAdminUser(user);
  return NextResponse.json({ isAdmin });
}
