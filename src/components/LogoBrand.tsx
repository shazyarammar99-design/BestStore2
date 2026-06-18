import Link from 'next/link';

export default function LogoBrand() {
  return (
    <Link
      href="/"
      aria-label="BEST STORE — Home"
      className="group flex items-center transition-transform duration-200 hover:scale-[1.04]"
    >
      <img
        src="/brand/logo.png"
        alt="BEST"
        className="h-10 w-auto object-contain md:h-11"
      />
    </Link>
  );
}
