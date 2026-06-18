'use client';

import Link from 'next/link';
import { useBrandingSettings } from '@/hooks/useSiteSettings';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, string> = {
  sm: 'h-10',
  md: 'h-12',
  lg: 'h-14',
  xl: 'h-16',
};

export default function BrandMark({
  size = 'md',
  href = '/',
  className = '',
}: {
  size?: Size;
  href?: string;
  className?: string;
}) {
  const { settings } = useBrandingSettings();

  return (
    <Link
      href={href}
      aria-label={`${settings.siteName} — Home`}
      className={`inline-block transition-transform duration-300 hover:scale-[1.04] ${className}`}
    >
      <img
        src={settings.logoUrl}
        alt={settings.siteName}
        className={`${SIZES[size]} w-auto object-contain`}
      />
    </Link>
  );
}
