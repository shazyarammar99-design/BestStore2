'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, LogIn, Search, ArrowLeft } from 'lucide-react';
import LogoBrand from '@/components/LogoBrand';
import CurrencySelect from '@/components/CurrencySelect';
import LanguageSelect from '@/components/LanguageSelect';
import ProfileDropdown from '@/components/account/ProfileDropdown';
import AccountMobileMenu from '@/components/account/AccountMobileMenu';
import { NavMegaMenuDesktop, NavMegaMenuMobile } from '@/components/NavMegaMenu';
import GlobalSearch from '@/components/GlobalSearch';
import { CATEGORY_MENU, PRODUCT_MENU } from '@/data/navigation';
import type { NavItem } from '@/data/navigation';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation, useFormatCurrency } from '@/context/LocaleContext';
import { localizeNavItem } from '@/i18n/catalog';
import { useProfile } from '@/context/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items, itemCount, cartOpen, setCartOpen, updateQuantity, removeItem, totalPrice } = useStore();
  const { t, locale } = useTranslation();
  const formatPrice = useFormatCurrency();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile } = useProfile();

  const categoryMenu = CATEGORY_MENU.map((item) => localizeNavItem(item, locale));
  const productMenu = PRODUCT_MENU.map((item) => localizeNavItem(item, locale));

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

  const handleNavSelect = (item: NavItem) => {
    setMobileOpen(false);
    if (item.productId) {
      router.push(`/product/${item.productId}`);
    } else if (item.categoryId) {
      router.push(`/category/${item.categoryId}`);
    }
  };

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
          <div className="flex items-center gap-4">
            {pathname !== '/' && (
              <button
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-best-border bg-best-elevated/50 text-best-muted transition-colors hover:border-best-cyan hover:text-best-cyan"
                aria-label={t('nav.back') || 'Go Back'}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <LogoBrand />
          </div>

          <nav className="hidden flex-1 items-center justify-center px-8 lg:flex">
            <div className="w-full max-w-2xl">
              <GlobalSearch />
            </div>
          </nav>

          <nav className="hidden items-center gap-2 lg:flex">
            <Link
              href="/leaderboard"
              className="rounded-full px-4 py-2 font-heading text-sm font-semibold uppercase tracking-widest text-best-muted transition-all duration-200 hover:bg-white/5 hover:text-best-cyan"
            >
              {t('nav.leaderboard') !== 'nav.leaderboard' ? t('nav.leaderboard') : 'Leaderboard'}
            </Link>
            <Link
              href="/spin"
              className="rounded-full px-4 py-2 font-heading text-sm font-semibold uppercase tracking-widest text-best-muted transition-all duration-200 hover:bg-white/5 hover:text-best-gold"
            >
              {t('nav.spinWin') !== 'nav.spinWin' ? t('nav.spinWin') : 'Spin & Win'}
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
                {t('nav.login') !== 'nav.login' ? t('nav.login') : 'Login'}
              </Link>
            ) : null}

            <div className="block lg:hidden">
              <GlobalSearch isMobile={true} />
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={t('nav.openCart')}
              className="relative flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-best-border text-best-muted transition-all duration-200 hover:border-best-cyan hover:text-best-cyan"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-best-cyan px-1 font-heading text-[10px] font-bold text-best-bg shadow-cyan-glow">
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
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-start gap-6 bg-best-bg/98 px-6 pt-24 backdrop-blur-md lg:hidden overflow-y-auto pb-10">
          <div className="flex items-center gap-3">
            <CurrencySelect className="flex h-10 min-w-[5.5rem] rounded-lg border-best-border bg-transparent font-heading text-xs font-semibold text-best-muted shadow-none hover:border-best-cyan hover:text-best-cyan" />
            <LanguageSelect className="flex h-10 min-w-[6.5rem] rounded-lg border-best-border bg-transparent font-heading text-xs font-semibold text-best-muted shadow-none hover:border-best-cyan hover:text-best-cyan" />
          </div>
          <NavMegaMenuMobile
            label={t('nav.categories')}
            items={categoryMenu}
            onSelect={handleNavSelect}
          />
          <NavMegaMenuMobile label={t('nav.products')} items={productMenu} onSelect={handleNavSelect} />
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

      {/* Slide-in Cart Drawer */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-best-bg/80 backdrop-blur-sm transition-opacity"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed bottom-0 right-0 top-0 z-[70] flex w-full max-w-md flex-col border-l border-white/10 bg-best-elevated/95 backdrop-blur-xl shadow-2xl animate-drawer-in">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">Shopping Cart ({itemCount})</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-lg p-2 text-best-muted hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <ShoppingBag className="h-16 w-16 text-white/10" />
                  <p className="font-heading text-lg text-best-muted uppercase tracking-wider">Your cart is empty</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-4 rounded-lg bg-best-cyan/10 px-6 py-3 font-heading text-sm font-bold uppercase tracking-widest text-best-cyan transition-colors hover:bg-best-cyan hover:text-best-bg"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.cartKey} className="flex gap-4 border-b border-white/5 pb-6">
                      <div className="flex flex-1 flex-col">
                        <h4 className="font-heading text-sm font-bold text-white">{item.name}</h4>
                        {item.variantLabel && (
                          <p className="text-xs text-best-muted mt-1">{item.variantLabel}</p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                              className="text-best-muted hover:text-white"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-semibold text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                              className="text-best-muted hover:text-white"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-display font-bold text-best-gold">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.cartKey)}
                        className="self-start p-1 text-best-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {items.length > 0 && (
              <div className="border-t border-white/10 bg-best-bg/50 px-6 py-6 backdrop-blur-md">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-heading text-sm font-semibold uppercase tracking-wider text-best-muted">Total</span>
                  <span className="font-display text-xl font-bold text-best-gold">{formatPrice(totalPrice)}</span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    router.push('/checkout');
                  }}
                  className="w-full rounded-lg bg-best-cyan px-6 py-4 font-heading text-sm font-bold uppercase tracking-widest text-best-bg transition-all hover:scale-[1.02] hover:shadow-cyan-glow-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
