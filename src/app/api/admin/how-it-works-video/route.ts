import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';
import { DEFAULT_HOW_IT_WORKS_VIDEO, type HowItWorksVideoType } from '@/types/site-settings';

const VALID_TYPES = new Set<HowItWorksVideoType>(['none', 'upload', 'youtube', 'vimeo']);

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.ctx.admin
    .from('site_settings')
    .select('value')
    .eq('key', 'how_it_works_video')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings = { ...DEFAULT_HOW_IT_WORKS_VIDEO, ...(data?.value as object) };
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const videoType = String(body.videoType ?? 'none') as HowItWorksVideoType;
  if (!VALID_TYPES.has(videoType)) {
    return NextResponse.json({ error: 'Invalid video type' }, { status: 400 });
  }

  const videoUrl = body.videoUrl ? String(body.videoUrl).trim() : null;
  const label = String(body.label ?? DEFAULT_HOW_IT_WORKS_VIDEO.label).trim();
  const posterUrl = body.posterUrl ? String(body.posterUrl).trim() : null;

  const value = { videoType, videoUrl, label, posterUrl };

  const { data, error } = await auth.ctx.admin
    .from('site_settings')
    .upsert(
      { key: 'how_it_works_video', value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    .select('value')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/');
  return NextResponse.json({ settings: data.value });
}
