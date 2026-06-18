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
} from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import { shortOrderId } from '@/lib/orders/utils';
import type { OrderItemSnapshot } from '@/types/orders';
import { cn } from '@/lib/utils';

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

const SECTIONS = [
  {
    href: '/admin/orders',
    title: 'Orders',
    desc: 'Confirm payments and mark delivered',
    icon: ShoppingBag,
    accent: 'text-amber-400',
    border: 'hover:border-amber-500/40',
  },
  {
    href: '/admin/products',
    title: 'Products',
    desc: 'Drag-and-drop catalog board',
    icon: Package,
    accent: 'text-best-cyan',
    border: 'hover:border-best-cyan/50',
  },
  {
    href: '/admin/categories',
    title: 'Categories',
    desc: 'Names, tags, banner images',
    icon: FolderOpen,
    accent: 'text-best-gold',
    border: 'hover:border-best-gold/40',
  },
  {
    href: '/admin/ads',
    title: 'Ads',
    desc: 'Promo banners and carousel images',
    icon: Megaphone,
    accent: 'text-best-purple',
    border: 'hover:border-best-purple/40',
  },
  {
    href: '/admin/new-releases',
    title: 'New Releases',
    desc: 'Homepage carousel slides',
    icon: Sparkles,
    accent: 'text-pink-400',
    border: 'hover:border-pink-500/40',
  },
  {
    href: '/admin/homepage',
    title: 'Homepage',
    desc: 'Hero, FAQ, steps, features',
    icon: LayoutGrid,
    accent: 'text-emerald-400',
    border: 'hover:border-emerald-500/40',
  },
];

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-best-border bg-best-elevated/80 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-best-caption">{label}</p>
        <Icon className={cn('h-4 w-4', accent)} />
      </div>
      <p className="mt-2 font-display text-2xl font-black text-white">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-best-cyan">
            Control center
          </p>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-best-muted">
            Manage your store, orders, and content from one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-best-cyan/15 px-4 py-2 text-sm font-semibold text-best-cyan transition-colors hover:bg-best-cyan/25"
          >
            <PackagePlus className="h-4 w-4" />
            New product
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-best-border px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-best-cyan/50"
          >
            <ShoppingBag className="h-4 w-4" />
            View orders
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-best-muted">Loading stats…</p>
      ) : stats ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard
              label="Pending orders"
              value={stats.pendingOrders}
              icon={ShoppingBag}
              accent="text-amber-400"
            />
            <StatCard
              label="Products"
              value={stats.productCount}
              icon={Package}
              accent="text-best-cyan"
            />
            <StatCard
              label="Categories"
              value={stats.categoryCount}
              icon={FolderOpen}
              accent="text-best-gold"
            />
            <StatCard
              label="Online now"
              value={stats.activeUsers}
              icon={Users}
              accent="text-emerald-400"
            />
          </div>

          {stats.recentOrders.length > 0 && (
            <div className="mt-8 rounded-xl border border-best-border bg-best-elevated/60 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                  Recent orders
                </h2>
                <Link href="/admin/orders" className="text-xs text-best-cyan hover:underline">
                  View all
                </Link>
              </div>
              <ul className="mt-4 space-y-3">
                {stats.recentOrders.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-col gap-1 rounded-lg border border-best-border/50 bg-best-bg/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <span className="font-mono text-sm font-bold text-white">
                        #{shortOrderId(order.id)}
                      </span>
                      <span className="ml-2 text-xs capitalize text-best-caption">
                        {order.status}
                      </span>
                      <p className="text-xs text-best-muted">{order.username}</p>
                    </div>
                    <p className="text-sm font-semibold text-best-gold">
                      {Number(order.amount).toLocaleString()} IQD
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group rounded-xl border border-best-border bg-best-elevated/80 p-5 transition-all hover:-translate-y-0.5 hover:shadow-card-glow',
              item.border
            )}
          >
            <item.icon className={cn('h-6 w-6', item.accent)} />
            <h2 className="mt-3 font-heading font-bold text-white group-hover:text-best-cyan">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-best-muted">{item.desc}</p>
            {item.href === '/admin/orders' && stats && stats.pendingOrders > 0 && (
              <span className="mt-3 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-400">
                {stats.pendingOrders} pending
              </span>
            )}
          </Link>
        ))}
        <Link
          href="/admin/admins"
          className="group rounded-xl border border-best-border bg-best-elevated/80 p-5 transition-all hover:-translate-y-0.5 hover:border-best-cyan/50 hover:shadow-card-glow"
        >
          <Users className="h-6 w-6 text-best-muted" />
          <h2 className="mt-3 font-heading font-bold text-white">Admins</h2>
          <p className="mt-1 text-sm text-best-muted">Grant admin access to users</p>
        </Link>
      </div>
    </div>
  );
}
