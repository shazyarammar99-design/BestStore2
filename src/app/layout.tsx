import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';
import { getBrandingSettings } from '@/lib/site-settings';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingSettings();
  const icons = branding.faviconUrl
    ? { icon: [{ url: branding.faviconUrl }] }
    : undefined;

  return {
    title: `${branding.siteName} — Premium Gaming Marketplace`,
    description:
      'The premium marketplace for in-game currency, elite accounts, and digital assets — delivered instantly with local IQD payments.',
    icons,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
