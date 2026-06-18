import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';

const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  const folder = String(form.get('folder') ?? 'uploads').replace(/[^a-z0-9-_]/gi, '');
  const isVideo = VIDEO_TYPES.has(file.type) || folder === 'videos';

  if (isVideo) {
    if (!VIDEO_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Invalid video type (MP4 or WebM only)' }, { status: 400 });
    }
    if (file.size > VIDEO_MAX_BYTES) {
      return NextResponse.json({ error: 'Video too large (max 50MB)' }, { status: 400 });
    }
  } else {
    if (!IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    if (file.size > IMAGE_MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? (isVideo ? 'mp4' : 'png');
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await auth.ctx.admin.storage.from('site-assets').upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = auth.ctx.admin.storage.from('site-assets').getPublicUrl(path);
  revalidatePath('/');
  return NextResponse.json({ url: data.publicUrl, path });
}
