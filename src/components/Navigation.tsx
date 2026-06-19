'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, LogIn, Search } from 'lucide-react';
import LogoBrand from '@/components/LogoBrand';
import CurrencySelect from '@/components/CurrencySelect';
import LanguageSelect from '@/components/LanguageSelect';
import ProfileDropdown from '@/components/account/ProfileDropdown';
import AccountMobileMenu from '@/components/account/AccountMobileMenu';
import GlobalSearchMenu from '@/components/layout/GlobalSearchMenu';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LocaleContext';
import { useProfile } from '@/context/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Navigation() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useStore();
  const { t, locale } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile } = useProfile();
  const [searchOpen, setSearchOpen] = useState(false);

  const initials = (profile?.username ?? user?.email ?? '?').slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);


  return (
    <>
      <header
        dir="ltr"
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'border-best-border bg-best-bg/95 backdrop-blur-md'
            : 'border-transparent bg-best-bg/80 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6">
          <LogoBrand />

          <nav className="hidden items-center gap-8 lg:flex">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-widest text-best-cyan transition-all duration-200 hover:text-white hover:text-glow-cyan"
            >
              <Search className="h-5 w-5" />
              {t('nav.search') || 'Search'}
            </button>
            <Link
              href="/leaderboard"
              className="font-heading text-sm font-semibold uppercase tracking-widest text-best-muted transition-colors hover:text-best-cyan"
            >
              {t('nav.leaderboard')}
            </Link>
            <Link
              href="/spin"
              className="font-heading text-sm font-semibold uppercase tracking-widest text-best-muted transition-colors hover:text-best-gold"
            >
              {t('nav.spinWin')}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <CurrencySelect />
            <LanguageSelect />

            {!authLoading && user ? (
              <ProfileDropdown />
            ) : !authLoading ? (
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-lg border border-best-border px-3 py-2 font-heading text-sm font-semibold text-best-muted transition-colors hover:border-best-cyan hover:text-best-cyan sm:flex"
              >
                <LogIn className="h-4 w-4" />
                {t('nav.login')}
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => router.push('/checkout')}
              aria-label={t('nav.openCart')}
              className="relative flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-best-border text-best-muted transition-all duration-200 hover:border-best-cyan hover:text-best-cyan"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-best-gold px-1 font-heading text-[10px] font-bold text-best-bg">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={t('nav.toggleMenu')}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-best-border text-best-muted transition-colors hover:text-best-cyan lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-best-bg/98 px-6 pt-20 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            <CurrencySelect className="flex h-10 min-w-[5.5rem] rounded-lg border-best-border bg-transparent font-heading text-xs font-semibold text-best-muted shadow-none hover:border-best-cyan hover:text-best-cyan" />
            <LanguageSelect className="flex h-10 min-w-[6.5rem] rounded-lg border-best-border bg-transparent font-heading text-xs font-semibold text-best-muted shadow-none hover:border-best-cyan hover:text-best-cyan" />
          </div>
          <button
            onClick={() => {
              setMobileOpen(false);
              setSearchOpen(true);
            }}
            className="flex items-center gap-2 font-display text-2xl font-bold uppercase tracking-widest text-best-cyan hover:text-white"
          >
            <Search className="h-6 w-6" />
            {t('nav.search') || 'Search'}
          </button>
          <Link
            href="/leaderboard"
            onClick={() => setMobileOpen(false)}
            className="font-display text-2xl font-bold uppercase tracking-widest text-white hover:text-best-cyan"
          >
            {t('nav.leaderboard')}
          </Link>
          <Link
            href="/spin"
            onClick={() => setMobileOpen(false)}
            className="font-display text-2xl font-bold uppercase tracking-widest text-white hover:text-best-gold"
          >
            {t('nav.spinWin')}
          </Link>
          {!authLoading && user ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-best-cyan/40">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.username ?? t('nav.account')} />
                  <AvatarFallback className="bg-best-elevated text-sm text-best-cyan">{initials}</AvatarFallback>
                </Avatar>
              </div>
              <AccountMobileMenu
                onNavigate={() => setMobileOpen(false)}
                onSignOut={() => void handleSignOut()}
              />
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="font-display text-2xl font-bold uppercase tracking-widest text-white hover:text-best-cyan"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      )}

      <GlobalSearchMenu open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
