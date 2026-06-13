import { Bitcoin, CreditCard, Wallet } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Software', href: '#software' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Categories', href: '#categories' },
  { label: 'Proof', href: '#proof' },
  { label: 'FAQ', href: '#faq' },
];

const PAYMENT_METHODS = [
  { icon: Bitcoin, label: 'Crypto' },
  { icon: Wallet, label: 'PayPal' },
  { icon: CreditCard, label: 'Card' },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-best-border">
      {/* Ready to Play CTA */}
      <div
        className="py-20 text-center"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(176, 38, 255, 0.12), transparent)',
        }}
      >
        <h2 className="font-display text-4xl font-black uppercase tracking-tight text-white md:text-6xl">
          Ready to <span className="text-gradient-neon">Play?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-best-muted">
          Instant access, auto-updates, and 24/7 support. Your edge is one click away.
        </p>
        <button
          onClick={() => scrollTo('#pricing')}
          className="animate-pulse-glow mt-8 rounded-lg bg-best-gold px-12 py-4 font-heading text-base font-bold uppercase tracking-widest text-best-bg transition-transform duration-200 hover:scale-[1.04]"
        >
          Get Instant Access
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-10">
        <div className="grid grid-cols-1 gap-12 border-t border-best-border pt-14 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-lg font-bold uppercase tracking-[0.15em] text-white">
                BEST
              </span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-best-cyan" />
              <span className="font-display text-lg font-medium uppercase tracking-[0.15em] text-gradient-neon">
                STORE
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-best-caption">
              The premium marketplace for gaming software subscriptions — cheats, trainers,
              overlays, and boosters with local IQD payments.
            </p>

            {/* Newsletter */}
            <div className="mt-6 flex max-w-sm gap-2">
              <input
                type="email"
                placeholder="Your email for drops & deals"
                className="min-w-0 flex-1 rounded-lg border border-best-border bg-best-elevated px-4 py-2.5 text-sm text-white placeholder:text-best-caption focus:border-best-cyan focus:outline-none"
              />
              <button className="shrink-0 rounded-lg bg-best-cyan/10 px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-widest text-best-cyan transition-all hover:bg-best-cyan hover:text-best-bg hover:shadow-cyan-glow">
                Join
              </button>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading mb-4 text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm text-best-muted transition-colors hover:text-best-cyan"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Payments */}
          <div>
            <h4 className="font-heading mb-4 text-xs font-bold uppercase tracking-[0.2em] text-best-muted">
              We Accept
            </h4>
            <div className="flex flex-wrap gap-3">
              {PAYMENT_METHODS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg border border-best-border bg-best-elevated px-3.5 py-2.5"
                >
                  <Icon className="h-4 w-4 text-best-gold" />
                  <span className="text-xs text-best-muted">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-best-caption">+ local IQD payments via WhatsApp</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-best-border pt-8 md:flex-row">
          <p className="font-mono text-xs uppercase tracking-wider text-best-caption">
            © 2025 BEST STORE. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="cursor-default font-mono text-xs uppercase tracking-wider text-best-caption transition-colors hover:text-white">
              Privacy
            </span>
            <span className="cursor-default font-mono text-xs uppercase tracking-wider text-best-caption transition-colors hover:text-white">
              Terms
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
