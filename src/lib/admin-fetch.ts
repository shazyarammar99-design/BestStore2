import { authFetch } from '@/lib/auth-fetch';

export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  return authFetch(input, init);
}
