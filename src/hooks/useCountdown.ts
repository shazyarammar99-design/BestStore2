'use client';

import { useEffect, useState } from 'react';

export type CountdownParts = {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  expired: boolean;
};

function getParts(targetIso: string | null | undefined): CountdownParts {
  if (!targetIso) {
    return { hours: 0, minutes: 0, seconds: 0, totalMs: 0, expired: true };
  }
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalMs: 0, expired: true };
  }
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { hours, minutes, seconds, totalMs: diff, expired: false };
}

export function formatCountdown(parts: CountdownParts): string {
  if (parts.expired) return '0h 0m';
  if (parts.hours > 0) {
    return `${parts.hours}h ${parts.minutes}m`;
  }
  if (parts.minutes > 0) {
    return `${parts.minutes}m ${parts.seconds}s`;
  }
  return `${parts.seconds}s`;
}

export function useCountdown(targetIso: string | null | undefined): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(() => getParts(targetIso));

  useEffect(() => {
    setParts(getParts(targetIso));
    if (!targetIso) return;

    const id = setInterval(() => {
      setParts(getParts(targetIso));
    }, 1000);

    return () => clearInterval(id);
  }, [targetIso]);

  return parts;
}
