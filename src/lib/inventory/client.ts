import { authFetch } from '@/lib/auth-fetch';
import type { InventoryItem } from '@/types/spin';

export async function fetchMyInventory(): Promise<InventoryItem[]> {
  try {
    const res = await authFetch('/api/inventory');
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}
