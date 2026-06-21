'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NavItem } from '@/data/navigation';

type SelectHandler = (item: NavItem) => void;

/* ---------------- Desktop ---------------- */

function FlyoutItem({ item, onSelect }: { item: NavItem; onSelect: SelectHandler }) {
  const hasChildren = !!item.children?.length;
  const [isOpen, setIsOpen] = useState(false);

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
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => item.categoryId && onSelect(item)}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left font-heading text-sm text-best-muted transition-colors hover:bg-best-cyan/10 hover:text-best-cyan"
      >
        {item.label}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4 opacity-60" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="absolute left-full top-0 z-50 ml-1 min-w-[200px] rounded-xl border border-best-border bg-best-bg/95 p-2 shadow-cyan-glow backdrop-blur-md"
          >
            {item.children!.map((child) => (
              <FlyoutItem key={child.id} item={child} onSelect={onSelect} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 font-heading text-sm font-semibold uppercase tracking-widest text-best-muted transition-all duration-200 hover:text-best-cyan hover:text-glow-cyan">
        {label}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="absolute left-0 top-full z-50 min-w-[220px] pt-3"
          >
            <div className="rounded-xl border border-best-border bg-best-bg/95 p-2 shadow-cyan-glow backdrop-blur-md">
              {items.map((item) => (
                <FlyoutItem key={item.id} item={item} onSelect={onSelect} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="flex w-full max-w-xs flex-col gap-1 overflow-hidden">
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
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current.title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
