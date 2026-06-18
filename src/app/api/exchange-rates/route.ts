import { NextResponse } from 'next/server';
import { getCachedExchangeRatesResponse } from '@/lib/exchange-rates';

export async function GET() {
  const { rates, currencies, source } = await getCachedExchangeRatesResponse();

  return NextResponse.json(
    { rates, currencies, source, updatedAt: new Date().toISOString() },
    {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      },
    }
  );
}
