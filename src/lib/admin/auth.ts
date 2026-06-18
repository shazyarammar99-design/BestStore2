import type { User } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Primary owner — cannot be demoted from the admin panel. */
export function getOwnerEmail(): string | null {
  const explicit = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (explicit) return explicit;
  return getAdminEmails()[0] ?? null;
}

export function isOwnerEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const owner = getOwnerEmail();
  return owner !== null && email.toLowerCase() === owner;
}

export function isEmailAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export async function isAdminUser(user: User): Promise<boolean> {
  if (isEmailAdmin(user.email)) return true;

  const admin = createAdminClient();
  if (!admin) return false;

  const { data } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  return data?.is_admin === true;
}
