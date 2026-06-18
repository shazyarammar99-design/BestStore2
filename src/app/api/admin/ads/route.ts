import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const placement = searchParams.get('placement');

  let query = auth.ctx.admin.from('site_ads').select('*').order('sort_order', { ascending: true });
  if (placement) query = query.eq('placement', placement);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ads: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { data, error } = await auth.ctx.admin
    .from('site_ads')
    .insert({
      placement: body.placement ?? 'navbar',
      image_url: body.image_url,
      link_url: body.link_url ?? '/',
      alt_text: body.alt_text ?? '',
      sort_order: body.sort_order ?? 0,
      active: body.active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/');
  return NextResponse.json({ ad: data });
}
