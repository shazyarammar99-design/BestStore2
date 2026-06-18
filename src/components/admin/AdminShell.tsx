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

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, badgeKey: 'orders' as const },
  { href: '/admin/ads', label: 'Ads', icon: Megaphone },
  { href: '/admin/new-releases', label: 'New Releases', icon: Sparkles },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/homepage', label: 'Homepage', icon: Home },
  { href: '/admin/admins', label: 'Admins', icon: Shield },
];

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
    <nav className="space-y-1">
      {NAV.map(({ href, label, icon: Icon, badgeKey }) => {
        const active = pathname === href || (href !== '/admin' && pathname?.startsWith(href));
        const badge = badgeKey === 'orders' && pendingOrders > 0 ? pendingOrders : null;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-best-cyan/15 text-best-cyan'
                : 'text-best-muted hover:bg-best-border/40 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge !== null && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
      <Link
        href="/"
        onClick={onNavigate}
        className="mt-6 flex min-h-11 items-center gap-2 text-xs text-best-caption hover:text-best-cyan"
      >
        <ExternalLink className="h-3 w-3" />
        View site
      </Link>
    </nav>
  );
}

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

  const current = NAV.find(
    (n) => pathname === n.href || (n.href !== '/admin' && pathname?.startsWith(n.href))
  );

  return (
    <div className="flex min-h-screen bg-best-bg text-white">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(0,240,255,0.04)_0%,_transparent_50%)]"
        aria-hidden
      />

      <aside className="relative hidden w-60 shrink-0 border-r border-best-border bg-best-elevated/80 p-4 backdrop-blur-sm lg:block">
        <Link
          href="/admin"
          className="font-display block text-lg font-black uppercase tracking-tight text-best-cyan"
        >
          Admin
        </Link>
        <p className="mt-1 text-xs text-best-caption">BEST STORE CMS</p>
        {user?.email && (
          <p className="mt-3 truncate text-xs text-best-muted">{user.email}</p>
        )}
        <div className="mt-8">
          <NavLinks pathname={pathname ?? ''} pendingOrders={pendingOrders} />
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-best-border bg-best-bg/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="min-h-11 min-w-11 shrink-0 border-best-border">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-best-border bg-best-elevated text-white">
              <SheetHeader>
                <SheetTitle className="font-display text-left text-best-cyan">Admin</SheetTitle>
              </SheetHeader>
              {user?.email && (
                <p className="mt-2 truncate text-xs text-best-muted">{user.email}</p>
              )}
              <div className="mt-6">
                <NavLinks
                  pathname={pathname ?? ''}
                  pendingOrders={pendingOrders}
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-bold text-white">
              {current?.label ?? 'Admin'}
            </p>
            <p className="text-xs text-best-caption">BEST STORE CMS</p>
          </div>
          {pendingOrders > 0 && (
            <Link
              href="/admin/orders"
              className="shrink-0 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-400"
            >
              {pendingOrders} pending
            </Link>
          )}
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
