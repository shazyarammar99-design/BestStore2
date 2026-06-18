import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

const SESSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const limit = await rateLimit(`presence:${getClientIp(request)}`, 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }  let body: { sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim();
  if (!sessionId || !SESSION_ID_RE.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid sessionId.' }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();

  const { error } = await admin.from('site_presence').upsert(
    { session_id: sessionId, last_seen: now },
    { onConflict: 'session_id' }
  );

  if (error) {
    return NextResponse.json({ error: 'Heartbeat failed.' }, { status: 500 });
  }

  // Opportunistic cleanup of stale sessions
  const staleBefore = new Date(Date.now() - 3 * 60 * 1000).toISOString();
  await admin.from('site_presence').delete().lt('last_seen', staleBefore);

  return NextResponse.json({ ok: true });
}
