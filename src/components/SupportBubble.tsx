import { useState } from 'react';
import { Gamepad2, X, Send } from 'lucide-react';

export default function SupportBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-best-border glass-panel shadow-purple-glow">
          <div className="flex items-center justify-between bg-best-purple/90 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Gamepad2 className="h-5 w-5 text-white" />
              <div>
                <p className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                  Best Store Support
                </p>
                <p className="flex items-center gap-1.5 text-[11px] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online — replies in minutes
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close support chat"
              className="text-white/80 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 p-4">
            <div className="max-w-[85%] rounded-lg rounded-tl-none border border-best-border bg-best-surface px-3.5 py-2.5">
              <p className="text-sm text-best-muted">
                Hey gamer! Need help picking software, installing, or with an order? Ask away.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Installation help', 'Payment in IQD', 'Is it undetected?'].map((q) => (
                <button
                  key={q}
                  className="rounded-full border border-best-cyan/40 px-3 py-1.5 text-xs text-best-cyan transition-all hover:bg-best-cyan/10"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-best-border p-3">
            <input
              type="text"
              placeholder="Type a message..."
              className="min-w-0 flex-1 rounded-lg border border-best-border bg-best-surface px-3 py-2 text-sm text-white placeholder:text-best-caption focus:border-best-cyan focus:outline-none"
            />
            <button
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-best-cyan text-best-bg transition-all hover:shadow-cyan-glow"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bubble */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open support chat"
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-best-purple text-white shadow-purple-glow transition-all duration-300 hover:scale-110 hover:shadow-purple-glow-lg"
      >
        {open ? <X className="h-6 w-6" /> : <Gamepad2 className="h-6 w-6" />}
      </button>
    </>
  );
}
