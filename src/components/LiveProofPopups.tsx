import { useEffect, useState } from 'react';
import { LIVE_PROOF_EVENTS } from '@/data';
import { ShoppingBag, X } from 'lucide-react';

type ProofEvent = (typeof LIVE_PROOF_EVENTS)[number];

export default function LiveProofPopups() {
  const [current, setCurrent] = useState<ProofEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    let index = 0;
    let hideTimer: ReturnType<typeof setTimeout>;

    const show = () => {
      setCurrent(LIVE_PROOF_EVENTS[index % LIVE_PROOF_EVENTS.length]);
      index += 1;
      hideTimer = setTimeout(() => setCurrent(null), 5000);
    };

    const firstTimer = setTimeout(show, 8000);
    const interval = setInterval(show, 18000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, [dismissed]);

  if (!current || dismissed) return null;

  return (
    <div className="fixed bottom-24 left-4 z-50 max-w-[320px] animate-slide-in-right">
      <div className="flex items-start gap-3 rounded-xl border border-best-border glass-panel p-4 shadow-cyan-glow">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-best-cyan/15 text-best-cyan">
          <ShoppingBag className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-white">
            <span className="font-semibold">{current.name}</span> {current.action}{' '}
            <span className="text-best-cyan">{current.product}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-best-caption">a few seconds ago</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss notifications"
          className="shrink-0 text-best-caption transition-colors hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
