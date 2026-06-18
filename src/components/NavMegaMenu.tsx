'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { NavItem } from '@/data/navigation';

type SelectHandler = (item: NavItem) => void;

/* ---------------- Desktop ---------------- */

function FlyoutItem({ item, onSelect }: { item: NavItem; onSelect: SelectHandler }) {
  const hasChildren = !!item.children?.length;

  if (!hasChildren) {
    return (
      <button
        onClick={() => onSelect(item)}
        className="block w-full rounded-md px-3 py-2 text-left font-heading text-sm text-best-muted transition-colors hover:bg-best-cyan/10 hover:text-best-cyan"
      >
        {item.label}
      </button>
    );
  }

  return (
    <div className="group/sub relative">
      <button
        onClick={() => item.categoryId && onSelect(item)}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left font-heading text-sm text-best-muted transition-colors hover:bg-best-cyan/10 hover:text-best-cyan"
      >
        {item.label}
        <ChevronRight className="h-4 w-4 opacity-60" />
      </button>
      <div className="invisible absolute left-full top-0 z-50 ml-1 min-w-[200px] -translate-x-1 rounded-xl border border-best-border bg-best-bg p-2 opacity-0 shadow-cyan-glow transition-all duration-150 group-hover/sub:visible group-hover/sub:translate-x-0 group-hover/sub:opacity-100">
        {item.children!.map((child) => (
          <FlyoutItem key={child.id} item={child} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

export function NavMegaMenuDesktop({
  label,
  items,
  onSelect,
}: {
  label: string;
  items: NavItem[];
  onSelect: SelectHandler;
}) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 font-heading text-sm font-semibold uppercase tracking-widest text-best-muted transition-all duration-200 hover:text-best-cyan hover:text-glow-cyan">
        {label}
        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
      </button>
      <div className="invisible absolute left-0 top-full z-50 min-w-[220px] translate-y-1 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="rounded-xl border border-best-border bg-best-bg p-2 shadow-cyan-glow">
          {items.map((item) => (
            <FlyoutItem key={item.id} item={item} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Mobile ---------------- */

export function NavMegaMenuMobile({
  label,
  items,
  onSelect,
}: {
  label: string;
  items: NavItem[];
  onSelect: SelectHandler;
}) {
  // Stack of menus the user has drilled into; each frame has a title + items.
  const [stack, setStack] = useState<{ title: string; items: NavItem[] }[]>([]);

  const open = (title: string, list: NavItem[]) =>
    setStack((s) => [...s, { title, items: list }]);
  const back = () => setStack((s) => s.slice(0, -1));
  const reset = () => setStack([]);

  const current = stack[stack.length - 1];

  if (!current) {
    return (
      <button
        onClick={() => open(label, items)}
        className="mobile-link font-display text-2xl font-bold uppercase tracking-widest text-white transition-colors hover:text-best-cyan"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-1">
      <button
        onClick={back}
        className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-widest text-best-cyan"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        Back
      </button>
      <p className="mb-2 text-center font-display text-lg font-bold uppercase tracking-widest text-white">
        {current.title}
      </p>
      {current.items.map((item) => {
        const hasChildren = !!item.children?.length;
        return (
          <div key={item.id} className="flex items-center">
            <button
              onClick={() => {
                if (hasChildren && !item.categoryId && !item.productId) {
                  open(item.label, item.children!);
                } else {
                  onSelect(item);
                  reset();
                }
              }}
              className="flex-1 rounded-md px-4 py-3 text-left font-heading text-base text-best-muted transition-colors hover:bg-best-cyan/10 hover:text-best-cyan"
            >
              {item.label}
            </button>
            {hasChildren && (
              <button
                onClick={() => open(item.label, item.children!)}
                aria-label={`Open ${item.label}`}
                className="px-3 py-3 text-best-caption hover:text-best-cyan"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
