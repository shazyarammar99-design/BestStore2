import Link from 'next/link';

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
  return (
    <Link
      href={href}
      aria-label="BEST STORE — Home"
      className={`inline-block transition-transform duration-300 hover:scale-[1.04] ${className}`}
    >
      <img
        src="/brand/logo.png"
        alt="BEST"
        className={`${SIZES[size]} w-auto object-contain`}
      />
    </Link>
  );
}
