import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when both env vars are present, so the UI can show a clear setup message otherwise. */
export const isSupabaseConfigured = Boolean(url && anonKey);

const REMEMBER_KEY = 'bs-remember-me';

/**
 * Persist the user's "Remember me" choice (UI preference).
 * Auth session is stored in cookies via @supabase/ssr so middleware can read it.
 */
export function setRememberMe(remember: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');
  } catch {
    /* storage may be unavailable */
  }
}

/** Cookie-based client — session is visible to Next.js middleware and server routes. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createBrowserClient(url!, anonKey!)
  : null;
