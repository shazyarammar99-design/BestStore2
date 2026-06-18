import { NextResponse } from 'next/server';
import { getSiteStats } from '@/lib/site-stats';

export async function GET() {
  const stats = await getSiteStats();
  return NextResponse.json(stats, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
