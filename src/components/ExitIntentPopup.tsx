import { useEffect, useState } from 'react';
import { X, Gift } from 'lucide-react';

const SESSION_KEY = 'best-store-exit-intent-shown';

export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 10 || e.relatedTarget) return;
      sessionStorage.setItem(SESSION_KEY, '1');
      setVisible(true);
    };

    // Small delay so it doesn't fire during initial page load mouse movement
    const timer = setTimeout(() => {
      document.addEventListener('mouseout', onLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseout', onLeave);
    };
  }, []);

  if (!visible) return null;

  const claim = () => {
    setVisible(false);
    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="border-gradient-neon relative w-full max-w-md rounded-2xl p-8 text-center shadow-purple-glow-lg">
        <button
          onClick={() => setVisible(false)}
          aria-label="Close offer"
          className="absolute right-4 top-4 text-best-caption transition-colors hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-best-gold/15 text-best-gold">
          <Gift className="h-8 w-8" />
        </div>

        <h3 className="font-display mt-6 text-2xl font-bold uppercase text-white">
          Wait! Don't leave empty-handed
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-best-muted">
          Take <span className="font-bold text-best-gold">10% off</span> your first subscription.
          Use this code at checkout:
        </p>

        <div className="mt-5 rounded-lg border border-dashed border-best-gold/50 bg-best-gold/5 py-3 font-mono text-xl font-bold tracking-[0.3em] text-best-gold">
          BEST10
        </div>

        <button
          onClick={claim}
          className="mt-6 w-full rounded-lg bg-best-gold py-3.5 font-heading text-sm font-bold uppercase tracking-widest text-best-bg transition-all duration-200 hover:scale-[1.02] hover:shadow-gold-glow-lg"
        >
          Claim My Discount
        </button>
        <button
          onClick={() => setVisible(false)}
          className="mt-3 text-xs text-best-caption transition-colors hover:text-white"
        >
          No thanks, I play at full price
        </button>
      </div>
    </div>
  );
}
