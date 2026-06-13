import { LIVE_PROOF_EVENTS, DISCORD_REACTIONS } from '@/data';
import SectionHeader from '@/components/SectionHeader';
import { ShoppingBag, MessageCircle } from 'lucide-react';

export default function LiveProofFeed() {
  // Duplicate the list so the marquee loops seamlessly
  const tickerItems = [...LIVE_PROOF_EVENTS, ...LIVE_PROOF_EVENTS];

  return (
    <section id="proof" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="LIVE PROOF"
          headline="Happening Right Now"
          subtitle="Real purchases, real reactions — straight from the community."
        />
      </div>

      {/* Purchase ticker */}
      <div className="mt-14 overflow-hidden border-y border-best-border bg-best-elevated/60 py-4">
        <div className="flex w-max animate-ticker gap-10">
          {tickerItems.map((event, i) => (
            <div key={i} className="flex shrink-0 items-center gap-2.5">
              <ShoppingBag className="h-3.5 w-3.5 text-best-cyan" />
              <span className="text-sm text-best-muted">
                <span className="font-semibold text-white">{event.name}</span> {event.action}{' '}
                <span className="text-best-cyan">{event.product}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Discord-style reactions */}
      <div className="mx-auto mt-14 max-w-3xl px-6">
        <div className="overflow-hidden rounded-xl border border-best-border bg-best-elevated">
          <div className="flex items-center gap-2 border-b border-best-border bg-best-surface px-5 py-3.5">
            <MessageCircle className="h-4 w-4 text-best-purple" />
            <span className="font-heading text-sm font-bold uppercase tracking-widest text-white">
              #community-wins
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-best-caption">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              2,841 online
            </span>
          </div>
          <div className="space-y-1 p-3">
            {DISCORD_REACTIONS.map((reaction) => (
              <div
                key={reaction.user}
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-best-cyan/30 to-best-purple/30 font-heading text-xs font-bold text-white">
                  {reaction.user.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-sm font-bold text-best-purple">
                      {reaction.user}
                    </span>
                    <span className="text-[11px] text-best-caption">{reaction.time}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-best-muted">{reaction.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
