import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function findAuthUserByEmail(
  admin: SupabaseClient,
  email: string
): Promise<User | null> {
  const normalized = email.trim().toLowerCase();

  let page = 1;
  const perPage = 200;

  while (page <= 50) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (found) return found;

    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}
