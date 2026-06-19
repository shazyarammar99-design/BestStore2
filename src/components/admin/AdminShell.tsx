'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Megaphone,
  Sparkles,
  Package,
  FolderOpen,
  Home,
  Shield,
  ExternalLink,
  Menu,
  ShoppingBag,
  CircleDot,
  Image,
  LogOut,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { adminFetch } from '@/lib/admin-fetch';
import { useAuth } from '@/context/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

/* ─── Navigation config with grouped sections ─── */

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'orders';
  accent?: string;
};

type NavGroup = { title: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, accent: 'text-best-cyan' },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, badgeKey: 'orders', accent: 'text-amber-400' },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package, accent: 'text-best-cyan' },
      { href: '/admin/categories', label: 'Categories', icon: FolderOpen, accent: 'text-best-gold' },
      { href: '/admin/ads', label: 'Ads', icon: Megaphone, accent: 'text-best-purple' },
      { href: '/admin/new-releases', label: 'New Releases', icon: Sparkles, accent: 'text-pink-400' },
      { href: '/admin/homepage', label: 'Homepage', icon: Home, accent: 'text-emerald-400' },
      { href: '/admin/branding', label: 'Branding', icon: Image, accent: 'text-sky-400' },
      { href: '/admin/spin', label: 'Spin Wheel', icon: CircleDot, accent: 'text-orange-400' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { href: '/admin/admins', label: 'Admins', icon: Shield, accent: 'text-rose-400' },
    ],
  },
];

const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);

/* ─── Helper: extract initials from email ─── */

function getInitials(email?: string | null): string {
  if (!email) return 'A';
  const name = email.split('@')[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/* ─── NavLinks component ─── */

function NavLinks({
  pathname,
  pendingOrders,
  onNavigate,
}: {
  pathname: string;
  pendingOrders: number;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          {/* Section divider */}
          <p className="mb-2 mt-5 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-best-caption/60 first:mt-0">
            <span className="h-px flex-1 bg-gradient-to-r from-best-border to-transparent" />
            {group.title}
            <span className="h-px flex-1 bg-gradient-to-l from-best-border to-transparent" />
          </p>

          {group.items.map(({ href, label, icon: Icon, badgeKey, accent }) => {
            const active = pathname === href || (href !== '/admin' && pathname?.startsWith(href));
            const badge = badgeKey === 'orders' && pendingOrders > 0 ? pendingOrders : null;
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  'group relative flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-best-cyan/10 text-white shadow-[inset_0_0_20px_rgba(0,240,255,0.06)]'
                    : 'text-best-muted hover:bg-white/[0.04] hover:text-white hover:translate-x-0.5'
                )}
              >
                {/* Active indicator bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-best-cyan shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                )}

                {/* Icon with tinted background */}
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
                    active
                      ? 'bg-best-cyan/15 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                      : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5 transition-colors',
                      active ? 'text-best-cyan' : accent ?? 'text-best-muted'
                    )}
                  />
                </span>

                <span className="flex-1">{label}</span>

                {badge !== null && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-[10px] font-bold tabular-nums text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                    {badge}
                  </span>
                )}

                {active && (
                  <ChevronRight className="h-3 w-3 text-best-cyan/50" />
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/* ─── User badge ─── */

function UserBadge({ email }: { email?: string | null }) {
  if (!email) return null;
  return (
    <div className="mt-auto border-t border-best-border/50 pt-4">
      <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-best-cyan/20 to-best-purple/20 text-xs font-bold text-best-cyan shadow-[0_0_12px_rgba(0,240,255,0.1)]">
          {getInitials(email)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-white/80">{email}</p>
          <p className="text-[10px] text-best-caption">Administrator</p>
        </div>
      </div>
      <Link
        href="/"
        className="mt-2 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-best-caption transition-colors hover:bg-white/[0.04] hover:text-best-cyan"
      >
        <ExternalLink className="h-3 w-3" />
        View store
      </Link>
    </div>
  );
}

/* ─── Sidebar brand header ─── */

function SidebarHeader() {
  return (
    <div className="mb-2">
      <Link href="/admin" className="group flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-best-cyan/20 to-best-cyan/5 shadow-[0_0_15px_rgba(0,240,255,0.12)] transition-shadow group-hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <Zap className="h-4 w-4 text-best-cyan" />
        </span>
        <div>
          <h2 className="font-display text-base font-black uppercase tracking-tight text-white">
            Admin
          </h2>
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-best-cyan/60">
            BEST STORE CMS
          </p>
        </div>
      </Link>
    </div>
  );
}

/* ─── Main AdminShell ─── */

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    adminFetch('/api/admin/orders?status=pending')
      .then((r) => r.json())
      .then((j) => setPendingOrders(j.pendingCount ?? 0))
      .catch(() => {});
  }, [pathname]);

  const current = ALL_NAV.find(
    (n) => pathname === n.href || (n.href !== '/admin' && pathname?.startsWith(n.href))
  );

  return (
    <div className="flex min-h-screen bg-best-bg text-white">
      {/* Background ambient gradient */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(0,240,255,0.03)_0%,_transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(176,38,255,0.02)_0%,_transparent_50%)]"
        aria-hidden
      />

      {/* ─── Desktop sidebar ─── */}
      <aside className="relative hidden w-64 shrink-0 flex-col border-r border-best-border/50 lg:flex">
        {/* Glassmorphic background layers */}
        <div className="absolute inset-0 bg-best-elevated/90 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-best-cyan/[0.02] via-transparent to-best-purple/[0.02]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-best-cyan/20 to-transparent" />

        <div className="relative flex flex-1 flex-col gap-2 p-4">
          <SidebarHeader />
          <NavLinks pathname={pathname ?? ''} pendingOrders={pendingOrders} />
          <UserBadge email={user?.email} />
        </div>
      </aside>

      {/* ─── Main area ─── */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-best-border/50 bg-best-bg/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="min-h-10 min-w-10 shrink-0 border-best-border/50 bg-white/[0.03] hover:bg-white/[0.06]"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-72 flex-col border-best-border/50 bg-best-elevated/95 text-white backdrop-blur-xl"
            >
              <SheetHeader>
                <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
              </SheetHeader>
              <div className="px-2 pt-2">
                <SidebarHeader />
              </div>
              <div className="flex flex-1 flex-col px-2">
                <NavLinks
                  pathname={pathname ?? ''}
                  pendingOrders={pendingOrders}
                  onNavigate={() => setOpen(false)}
                />
                <UserBadge email={user?.email} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-bold text-white">
              {current?.label ?? 'Admin'}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-best-cyan/60">
              BEST STORE CMS
            </p>
          </div>

          {pendingOrders > 0 && (
            <Link
              href="/admin/orders"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)] transition-all hover:bg-amber-500/25"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              {pendingOrders}
            </Link>
          )}
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
