import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const adsenseEnabled = Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com${
        adsenseEnabled
          ? ' https://pagead2.googlesyndication.com https://www.googletagmanager.com'
          : ''
      }`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      `img-src 'self' data: blob: https:${
        adsenseEnabled ? ' https://pagead2.googlesyndication.com' : ''
      }`,
      `frame-src 'self' https://www.youtube.com https://player.vimeo.com${
        adsenseEnabled
          ? ' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com'
          : ''
      }`,
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/product/pubg-1day', destination: '/product/pubg-bypass', permanent: true },
      { source: '/product/pubg-1week', destination: '/product/pubg-bypass', permanent: true },
      { source: '/product/pubg-1month', destination: '/product/pubg-bypass', permanent: true },
      { source: '/product/pubg-lifetime', destination: '/product/pubg-bypass', permanent: true },
      { source: '/product/pubg-uc', destination: '/category/in-game-currency', permanent: true },
      { source: '/product/free-fire-diamonds', destination: '/category/in-game-currency', permanent: true },
      { source: '/product/cod-cp', destination: '/category/in-game-currency', permanent: true },
      { source: '/product/fortnite-vbucks', destination: '/category/in-game-currency', permanent: true },
      { source: '/product/steam-wallet-code', destination: '/category/in-game-currency', permanent: true },
    ];
  },
};

export default nextConfig;
