'use client';

import { useState, type FormEvent } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useTranslation } from '@/context/LocaleContext';

const WHATSAPP_URL = 'https://wa.me/9647503220525';

function openWhatsApp(message: string) {
  const url = `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function SupportBubble() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { t, ui } = useTranslation();

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    openWhatsApp(`Hi BEST STORE Support,\n\n${trimmed}`);
    setMessage('');
    setOpen(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(message);
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-6 right-4 z-50 flex w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-best-border bg-best-bg shadow-purple-glow"
          role="dialog"
          aria-label="Best Store support chat"
        >
          <div className="flex items-center justify-between bg-best-purple px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                  Best Store Support
                </p>
                <p className="flex items-center gap-1.5 text-[11px] text-white/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  WhatsApp — replies in minutes
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close support chat"
              className="rounded-md p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 border-b border-best-border p-4">
            <div className="max-w-[90%] rounded-lg rounded-tl-none border border-best-border bg-best-elevated px-3.5 py-2.5">
              <p className="text-sm leading-relaxed text-best-muted">{t('support.greeting')} WhatsApp.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ui.support.suggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-best-cyan/40 px-3 py-1.5 text-xs text-best-cyan transition-all hover:bg-best-cyan/10"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="min-w-0 flex-1 rounded-lg border border-best-border bg-best-elevated px-3 py-2.5 text-sm text-white placeholder:text-best-caption focus:border-best-cyan focus:outline-none"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="shrink-0 rounded-lg bg-best-cyan px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-best-bg transition-all hover:shadow-cyan-glow disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open support chat"
          className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-best-purple text-white shadow-purple-glow transition-all duration-300 hover:scale-105 hover:shadow-purple-glow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </>
  );
}
