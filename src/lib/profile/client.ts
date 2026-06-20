import { authFetch } from '@/lib/auth-fetch';
import type { ProfileSummary } from '@/app/api/profile/summary/route';

export async function fetchProfileSummary(): Promise<ProfileSummary | null> {
  try {
    const res = await authFetch('/api/profile/summary');
    if (!res.ok) return null;
    return (await res.json()) as ProfileSummary;
  } catch {
    return null;
  }
}
