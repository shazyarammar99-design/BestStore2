import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/route-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { InventoryItem } from '@/types/spin';
import type { PrizeType } from '@/lib/spin/prize-effects';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Inventory service not configured.' }, { status: 503 });
  }

  const { data, error } = await admin
    .from('inventory')
    .select(
      'id, quantity, won_at, prize_id, prizes ( id, name, prize_type, value, image_url )'
    )
    .eq('user_id', user.id)
    .gt('quantity', 0)
    .order('won_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to load inventory.' }, { status: 500 });
  }

  const items: InventoryItem[] = (data ?? [])
    .map((row) => {
      const rawPrize = row.prizes as unknown;
      const prize = (Array.isArray(rawPrize) ? rawPrize[0] : rawPrize) as {
        id: string;
        name: string;
        prize_type: string;
        value: number;
        image_url: string | null;
      } | null;
      if (!prize) return null;
      return {
        inventoryId: row.id,
        quantity: row.quantity,
        wonAt: row.won_at,
        prize: {
          id: prize.id,
          name: prize.name,
          prize_type: (prize.prize_type ?? 'fixed_off') as PrizeType,
          value: Number(prize.value),
          image_url: prize.image_url,
        },
      };
    })
    .filter((item): item is InventoryItem => item !== null);

  return NextResponse.json({ items });
}
