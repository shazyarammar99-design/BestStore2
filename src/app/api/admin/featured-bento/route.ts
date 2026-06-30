import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.ctx.admin
    .from('site_settings')
    .select('value')
    .eq('key', 'featured_bento')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ bentoItems: data?.value || [] });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const bentoItems = Array.isArray(body.bentoItems) ? body.bentoItems : [];

  const { error } = await auth.ctx.admin
    .from('site_settings')
    .upsert(
      { key: 'featured_bento', value: bentoItems, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/');
  return NextResponse.json({ success: true, bentoItems });
}
