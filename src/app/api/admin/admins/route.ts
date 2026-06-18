import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getOwnerEmail, isOwnerEmail } from '@/lib/admin/auth';
import { findAuthUserByEmail } from '@/lib/admin/find-user-by-email';
import { requireAdmin } from '@/lib/admin/require-admin';

type ProfileRow = {
  id: string;
  username: string;
  is_admin: boolean;
  updated_at: string;
};

async function enrichProfiles(
  admin: SupabaseClient,
  rows: ProfileRow[],
  ownerId: string | null
) {
  return Promise.all(
    rows.map(async (profile) => {
      const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
      const email = authUser.user?.email ?? null;
      const isOwner = isOwnerEmail(email) || profile.id === ownerId;

      return {
        ...profile,
        email,
        is_admin: profile.is_admin || isOwner,
        is_owner: isOwner,
      };
    })
  );
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const ownerEmail = getOwnerEmail();
  let ownerId: string | null = null;

  if (ownerEmail) {
    try {
      const ownerUser = await findAuthUserByEmail(auth.ctx.admin, ownerEmail);
      ownerId = ownerUser?.id ?? null;
    } catch {
      ownerId = null;
    }
  }

  const { data: allProfiles, error } = await auth.ctx.admin
    .from('profiles')
    .select('id, username, is_admin, updated_at')
    .order('username', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = await enrichProfiles(auth.ctx.admin, allProfiles ?? [], ownerId);

  if (ownerId && !enriched.some((p) => p.id === ownerId)) {
    const { data: ownerAuth } = await auth.ctx.admin.auth.admin.getUserById(ownerId);
    const { data: ownerProfile } = await auth.ctx.admin
      .from('profiles')
      .select('id, username, is_admin, updated_at')
      .eq('id', ownerId)
      .maybeSingle();

    enriched.unshift({
      id: ownerId,
      username: ownerProfile?.username ?? ownerEmail?.split('@')[0] ?? 'owner',
      is_admin: true,
      updated_at: ownerProfile?.updated_at ?? new Date().toISOString(),
      email: ownerAuth.user?.email ?? ownerEmail,
      is_owner: true,
    });
  }

  enriched.sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: 'base' }));

  const admins = enriched.filter((p) => p.is_admin);

  return NextResponse.json({ admins, users: enriched, ownerEmail });
}
