'use client';

import Link from 'next/link';
import { useBrandingSettings } from '@/hooks/useSiteSettings';

export default function LogoBrand() {
  const { settings } = useBrandingSettings();

  return (
    <Link
      href="/"
      aria-label={`${settings.siteName} — Home`}
      className="group flex items-center transition-transform duration-200 hover:scale-[1.04]"
    >
      <img
        src={settings.logoUrl}
        alt={settings.siteName}
        className="h-10 w-auto object-contain md:h-11"
      />
    </Link>
  );
}
