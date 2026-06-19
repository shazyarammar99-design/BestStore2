'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderOpen,
  LayoutGrid,
  Megaphone,
  Package,
  PackagePlus,
  ShoppingBag,
  Sparkles,
  Users,
  ArrowUpRight,
  CircleDot,
  Image,
  TrendingUp,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import { shortOrderId } from '@/lib/orders/utils';
import type { OrderItemSnapshot } from '@/types/orders';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

type DashboardStats = {
  activeUsers: number;
  gamesSupported: number;
  reviewCount: number | null;
  categoryCount: number;
  productCount: number;
  pendingOrders: number;
  recentOrders: {
    id: string;
    status: string;
    amount: number;
    created_at: string;
    username: string;
    items_json: OrderItemSnapshot[];
  }[];
};

/* ─── Greeting helper ─── */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(email?: string | null): string {
  if (!email) return 'Admin';
  const name = email.split('@')[0];
  const parts = name.split(/[._-]/);
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
}

/* ─── Quick-link cards ─── */

const SECTIONS = [
  {
    href: '/admin/orders',
    title: 'Orders',
    desc: 'Confirm payments and mark delivered',
    icon: ShoppingBag,
    gradient: 'from-amber-500/20 to-amber-600/5',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]',
  },
  {
    href: '/admin/products',
    title: 'Products',
    desc: 'Drag-and-drop catalog board',
    icon: Package,
    gradient: 'from-best-cyan/20 to-best-cyan/5',
    iconBg: 'bg-best-cyan/15',
    iconColor: 'text-best-cyan',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(0,240,255,0.12)]',
  },
  {
    href: '/admin/categories',
    title: 'Categories',
    desc: 'Names, tags, banner images',
    icon: FolderOpen,
    gradient: 'from-best-gold/20 to-best-gold/5',
    iconBg: 'bg-best-gold/15',
    iconColor: 'text-best-gold',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(255,215,0,0.12)]',
  },
  {
    href: '/admin/ads',
    title: 'Ads',
    desc: 'Promo banners and carousel images',
    icon: Megaphone,
    gradient: 'from-best-purple/20 to-best-purple/5',
    iconBg: 'bg-best-purple/15',
    iconColor: 'text-best-purple',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(176,38,255,0.12)]',
  },
  {
    href: '/admin/new-releases',
    title: 'New Releases',
    desc: 'Homepage carousel slides',
    icon: Sparkles,
    gradient: 'from-pink-500/20 to-pink-600/5',
    iconBg: 'bg-pink-500/15',
    iconColor: 'text-pink-400',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(236,72,153,0.12)]',
  },
  {
    href: '/admin/homepage',
    title: 'Homepage',
    desc: 'Hero, FAQ, steps, features',
    icon: LayoutGrid,
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(52,211,153,0.12)]',
  },
  {
    href: '/admin/branding',
    title: 'Branding',
    desc: 'Logo, colors, and site identity',
    icon: Image,
    gradient: 'from-sky-500/20 to-sky-600/5',
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(56,189,248,0.12)]',
  },
  {
    href: '/admin/spin',
    title: 'Spin Wheel',
    desc: 'Prizes and spin configuration',
    icon: CircleDot,
    gradient: 'from-orange-500/20 to-orange-600/5',
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(251,146,60,0.12)]',
  },
  {
    href: '/admin/admins',
    title: 'Admins',
    desc: 'Grant admin access to users',
    icon: Users,
    gradient: 'from-rose-500/20 to-rose-600/5',
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-400',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(251,113,133,0.12)]',
  },
];

/* ─── Stat card ─── */

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  glowColor,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  glowColor: string;
}) {
  return (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl border border-best-border/50 bg-best-elevated/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5',
      glowColor
    )}>
      {/* Subtle shimmer on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-best-caption">
            {label}
          </p>
          <p className="mt-3 font-display text-3xl font-black tracking-tight text-white">
            {value}
          </p>
        </div>
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </span>
      </div>

      {/* Bottom accent line */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100',
        `bg-gradient-to-r from-transparent via-current to-transparent`,
        iconColor
      )} />
    </div>
  );
}

/* ─── Status badge for orders ─── */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { dot: string; bg: string; text: string }> = {
    pending: { dot: 'bg-amber-400', bg: 'bg-amber-500/10', text: 'text-amber-400' },
    paid: { dot: 'bg-blue-400', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    delivered: { dot: 'bg-emerald-400', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    cancelled: { dot: 'bg-red-400', bg: 'bg-red-500/10', text: 'text-red-400' },
  };
  const c = config[status] ?? config.pending;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1', c.bg)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot, status === 'pending' && 'animate-pulse')} />
      <span className={cn('text-[11px] font-semibold capitalize', c.text)}>{status}</span>
    </span>
  );
}

/* ─── Time ago helper ─── */

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ─── Main dashboard ─── */

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ─── Header with greeting ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-best-cyan/70">
            Control center
          </p>
          <h1 className="font-display mt-1 text-3xl font-black uppercase tracking-tight md:text-4xl">
            <span className="bg-gradient-to-r from-white via-white to-best-muted bg-clip-text text-transparent">
              {getGreeting()},
            </span>{' '}
            <span className="bg-gradient-to-r from-best-cyan to-best-purple bg-clip-text text-transparent">
              {getFirstName(user?.email)}
            </span>
          </h1>
          <p className="mt-2 text-sm text-best-muted">
            Manage your store, orders, and content from one place.
          </p>
        </div>

        {/* Quick action pills */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products"
            className="group inline-flex min-h-10 items-center gap-2 rounded-xl bg-best-cyan/10 px-4 py-2 text-sm font-semibold text-best-cyan transition-all duration-200 hover:bg-best-cyan/20 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]"
          >
            <PackagePlus className="h-4 w-4" />
            New product
            <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/admin/orders"
            className="group inline-flex min-h-10 items-center gap-2 rounded-xl border border-best-border/50 bg-white/[0.02] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:border-best-cyan/30 hover:bg-white/[0.04]"
          >
            <ShoppingBag className="h-4 w-4" />
            View orders
            <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {loading ? (
        /* Loading skeleton */
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-best-border/30 bg-best-elevated/40" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* ─── Stat cards ─── */}
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard
              label="Pending orders"
              value={stats.pendingOrders}
              icon={ShoppingBag}
              iconBg="bg-amber-500/15"
              iconColor="text-amber-400"
              glowColor="group-hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]"
            />
            <StatCard
              label="Products"
              value={stats.productCount}
              icon={Package}
              iconBg="bg-best-cyan/15"
              iconColor="text-best-cyan"
              glowColor="group-hover:shadow-[0_0_30px_rgba(0,240,255,0.1)]"
            />
            <StatCard
              label="Categories"
              value={stats.categoryCount}
              icon={FolderOpen}
              iconBg="bg-best-gold/15"
              iconColor="text-best-gold"
              glowColor="group-hover:shadow-[0_0_30px_rgba(255,215,0,0.1)]"
            />
            <StatCard
              label="Online now"
              value={stats.activeUsers}
              icon={Users}
              iconBg="bg-emerald-500/15"
              iconColor="text-emerald-400"
              glowColor="group-hover:shadow-[0_0_30px_rgba(52,211,153,0.1)]"
            />
          </div>

          {/* ─── Recent orders ─── */}
          {stats.recentOrders.length > 0 && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-best-border/50 bg-best-elevated/40 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-best-border/30 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                  </span>
                  <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                    Recent orders
                  </h2>
                </div>
                <Link
                  href="/admin/orders"
                  className="group flex items-center gap-1 text-xs font-medium text-best-cyan transition-colors hover:text-best-cyan/80"
                >
                  View all
                  <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <ul className="divide-y divide-best-border/20">
                {stats.recentOrders.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] font-mono text-xs font-bold text-best-muted">
                        #{shortOrderId(order.id).slice(0, 4)}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{order.username}</p>
                        <p className="flex items-center gap-2 text-xs text-best-caption">
                          <Clock className="h-3 w-3" />
                          {timeAgo(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <StatusBadge status={order.status} />
                      <p className="min-w-[80px] text-right text-sm font-bold tabular-nums text-best-gold">
                        {Number(order.amount).toLocaleString()} <span className="text-xs font-medium text-best-gold/60">IQD</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : null}

      {/* ─── Quick-link cards grid ─── */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group relative overflow-hidden rounded-2xl border border-best-border/40 bg-best-elevated/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-best-border/70',
              item.glowColor
            )}
          >
            {/* Top gradient accent bar */}
            <div className={cn(
              'absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100',
              item.gradient
            )} />

            {/* Background gradient on hover */}
            <div className={cn(
              'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
              item.gradient.replace('/20', '/[0.03]').replace('/5', '/[0.01]')
            )} />

            <div className="relative">
              <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300', item.iconBg)}>
                <item.icon className={cn('h-5 w-5', item.iconColor)} />
              </span>
              <h2 className="mt-3 font-heading text-base font-bold text-white transition-colors group-hover:text-best-cyan">
                {item.title}
              </h2>
              <p className="mt-1 text-sm text-best-muted">{item.desc}</p>

              {item.href === '/admin/orders' && stats && stats.pendingOrders > 0 && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                  {stats.pendingOrders} pending
                </span>
              )}
            </div>

            {/* Arrow on hover */}
            <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-best-caption opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-best-cyan group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
