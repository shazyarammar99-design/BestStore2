import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { guardAdminRoute } from '@/lib/supabase/admin-guard';
import { rateLimit } from '@/lib/rate-limit';
const adsenseEnabled = Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);

function buildCsp(): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://fonts.googleapis.com',
    ...(adsenseEnabled
      ? [
          'https://pagead2.googlesyndication.com',
          'https://www.googletagmanager.com',
          'https://www.google-analytics.com',
        ]
      : []),
  ].join(' ');

  const frameSrc = adsenseEnabled
    ? "'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.youtube.com https://www.youtube-nocookie.com"
    : "'self' https://www.youtube.com https://www.youtube-nocookie.com";

  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https:',
    ...(adsenseEnabled ? ['https://pagead2.googlesyndication.com'] : []),
  ].join(' ');

  const mediaSrc = [
    "'self'",
    'https://*.supabase.co',
    'blob:',
    'data:',
  ].join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src ${imgSrc}`,
    `media-src ${mediaSrc}`,
    `frame-src ${frameSrc}`,
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', buildCsp());
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';
    const limit = await rateLimit(`api:${ip}`, 60, 60_000);
    if (!limit.allowed) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
      );
    }
  }

  const adminRedirect = await guardAdminRoute(request);  if (adminRedirect) return withSecurityHeaders(adminRedirect);

  // Skip auth refresh for read-only public API routes
  if (
    pathname === '/api/exchange-rates' ||
    pathname === '/api/leaderboard' ||
    pathname === '/api/presence/heartbeat' ||
    pathname === '/api/site-stats'
  ) {
    return withSecurityHeaders(NextResponse.next({ request }));
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const response = NextResponse.next({ request });
    return withSecurityHeaders(response);
  }
  const response = await updateSession(request);
  return withSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
