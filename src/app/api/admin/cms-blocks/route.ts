import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');
  const locale = searchParams.get('locale');

  let query = auth.ctx.admin
    .from('cms_blocks')
    .select('*')
    .order('sort_order', { ascending: true });

  if (section) query = query.eq('section', section);
  if (locale) query = query.eq('locale', locale);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocks: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { data, error } = await auth.ctx.admin
    .from('cms_blocks')
    .insert({
      section: body.section,
      locale: body.locale ?? 'en',
      payload: body.payload ?? {},
      sort_order: body.sort_order ?? 0,
      active: body.active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/');
  return NextResponse.json({ block: data });
}
