import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/** Resolve user from cookie session or Authorization Bearer (localStorage auth). */
export async function getAuthenticatedUser(request: Request): Promise<User | null> {
  const authHeader = request.headers.get('Authorization');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (authHeader?.startsWith('Bearer ') && url && anonKey) {
    const token = authHeader.slice(7);
    const client = createSupabaseClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const {
      data: { user },
    } = await client.auth.getUser(token);
    if (user) return user;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
