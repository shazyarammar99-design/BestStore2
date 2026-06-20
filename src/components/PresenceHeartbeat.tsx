'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'best-store-session-id';
const HEARTBEAT_MS = 90_000;

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}

async function sendHeartbeat(sessionId: string): Promise<void> {
  try {
    await fetch('/api/presence/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
      keepalive: true,
    });
  } catch {
    // Non-critical — next interval will retry
  }
}

export default function PresenceHeartbeat() {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    const tick = () => {
      if (document.visibilityState === 'visible') {
        void sendHeartbeat(sessionId);
      }
    };

    tick();
    const id = setInterval(tick, HEARTBEAT_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void sendHeartbeat(sessionId);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}
