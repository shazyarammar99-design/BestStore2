import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';
import { DEFAULT_BRANDING_SETTINGS } from '@/types/site-settings';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.ctx.admin
    .from('site_settings')
    .select('value')
    .eq('key', 'branding')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings = { ...DEFAULT_BRANDING_SETTINGS, ...(data?.value as object) };
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const logoUrl = String(body.logoUrl ?? DEFAULT_BRANDING_SETTINGS.logoUrl).trim();
  const faviconUrl = body.faviconUrl ? String(body.faviconUrl).trim() : null;
  const siteName = String(body.siteName ?? DEFAULT_BRANDING_SETTINGS.siteName).trim();

  if (!logoUrl) return NextResponse.json({ error: 'Logo URL is required' }, { status: 400 });
  if (!siteName) return NextResponse.json({ error: 'Site name is required' }, { status: 400 });

  const value = { logoUrl, faviconUrl, siteName };

  const { data, error } = await auth.ctx.admin
    .from('site_settings')
    .upsert({ key: 'branding', value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select('value')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/');
  return NextResponse.json({ settings: data.value });
}
