'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LocaleContext';
import { authFetch } from '@/lib/auth-fetch';
import { SPIN_TEST_MODE } from '@/config/spin';
import {
  buildWheelSegments,
  CELEBRATION_RESUME_MS,
  computeSpinTargetRotation,
} from '@/lib/spin/wheel-geometry';
import { launchWheelFireworks } from '@/lib/spin/wheel-fireworks';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import SpinResultDialog from '@/components/spin/SpinResultDialog';
import SpinPrizeList from '@/components/spin/SpinPrizeList';
import SpinWheelCanvas from '@/components/spin/SpinWheelCanvas';
import type { SpinResult, SpinStatus, WheelPhase } from '@/types/spin';

type SpinWheelProps = {
  onSpinComplete?: (result: SpinResult) => void;
};

export default function SpinWheel({ onSpinComplete }: SpinWheelProps) {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [status, setStatus] = useState<SpinStatus | null>(null);
  const [phase, setPhase] = useState<WheelPhase>('idle');
  const [baseRotation, setBaseRotation] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelContainerRef = useRef<HTMLDivElement>(null);

  const spunToday = Boolean(status?.nextSpinAt);
  const dailyCountdown = useCountdown(spunToday ? status?.nextSpinAt : null);
  const monthlyCountdown = useCountdown(
    status?.requiresPurchase && status?.nextFreeSpinAt ? status.nextFreeSpinAt : null
  );

  const segments = useMemo(
    () => buildWheelSegments(status?.prizes ?? []),
    [status?.prizes]
  );

  const canSpin =
    Boolean(user) &&
    Boolean(status?.canSpinToday) &&
    phase === 'idle' &&
    !authLoading;
  const spinDisabled = !canSpin || phase !== 'idle';

  const loadStatus = useCallback(async () => {
    const res = await authFetch('/api/spin');
    if (res.ok) {
      const data = (await res.json()) as SpinStatus;
      setStatus(data);
      if (data.monthlySpinGranted && data.monthlySpinGranted > 0) {
        toast.success(t('spin.monthlySpinGranted'));
      }
    }
  }, [t]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus, user]);

  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
      if (dialogTimerRef.current) clearTimeout(dialogTimerRef.current);
    };
  }, []);

  const handleSpinTransitionEnd = useCallback(() => {
    setBaseRotation(targetRotation);
    setPhase('celebrating');

    if (result) {
      launchWheelFireworks(wheelContainerRef.current);
      onSpinComplete?.(result);

      dialogTimerRef.current = setTimeout(() => {
        setDialogOpen(true);
      }, 450);
    }

    celebrationTimerRef.current = setTimeout(() => {
      setWinningIndex(null);
      setPhase('idle');
    }, CELEBRATION_RESUME_MS);
  }, [targetRotation, result, onSpinComplete]);

  const handleSpin = async () => {
    if (!status?.canSpinToday) {
      if (status?.requiresPurchase) {
        toast.error(
          t('spin.purchaseRequired', { min: String(status.minPurchaseIqd) })
        );
      } else if (spunToday) {
        toast.error(t('spin.alreadySpunToday'));
      }
      return;
    }
    if (phase !== 'idle') return;

    try {
      const res = await authFetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? t('common.error'));
        return;
      }

      const spinResult = data as SpinResult & { spinCreditsRemaining?: number };
      const count = segments.length || 1;
      const extraTurns = status?.extraTurns ?? 7;
      const target = computeSpinTargetRotation(
        baseRotation,
        spinResult.segmentIndex,
        count,
        extraTurns
      );

      setResult(spinResult);
      setWinningIndex(spinResult.segmentIndex);
      setTargetRotation(target);
      setPhase('spinning');

      setStatus((prev) =>
        prev
          ? {
              ...prev,
              canSpinToday: SPIN_TEST_MODE ? true : false,
              nextSpinAt: SPIN_TEST_MODE
                ? null
                : new Date(
                    Date.UTC(
                      new Date().getUTCFullYear(),
                      new Date().getUTCMonth(),
                      new Date().getUTCDate() + 1
                    )
                  ).toISOString(),
              spinCredits:
                typeof spinResult.spinCreditsRemaining === 'number'
                  ? spinResult.spinCreditsRemaining
                  : Math.max(0, prev.spinCredits - 1),
            }
          : prev
      );

      void loadStatus();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const statusMessage =
    phase === 'spinning'
      ? t('spin.spinning')
      : !user
        ? t('spin.signInToSpin')
        : status?.requiresPurchase
          ? t('spin.purchaseRequired', { min: String(status.minPurchaseIqd) })
          : spunToday
            ? `${t('spin.comeBack')} ${formatCountdown(dailyCountdown)}`
            : status?.canSpinToday
              ? t('spin.spinsAvailable', { count: String(status.spinCredits) })
              : '';

  return (
    <div className="w-full">
      <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col items-center gap-4">
          {segments.length > 0 && (
            <SpinWheelCanvas
              ref={wheelContainerRef}
              segments={segments}
              phase={phase}
              baseRotation={baseRotation}
              targetRotation={targetRotation}
              winningIndex={winningIndex}
              onHubClick={canSpin ? handleSpin : undefined}
              spinDisabled={spinDisabled}
              onSpinTransitionEnd={handleSpinTransitionEnd}
              spinDurationMs={status?.spinDurationMs}
            />
          )}

          <p className="sr-only" aria-live="polite">
            {statusMessage}
          </p>

          {!user && !authLoading && (
            <p className="text-center text-xs font-bold uppercase tracking-widest text-best-cyan">
              {t('spin.signInToSpin')}{' '}
              <Link href="/login?next=/spin" className="underline hover:text-white">
                {t('nav.login')}
              </Link>
            </p>
          )}

          {user && !SPIN_TEST_MODE && status?.requiresPurchase && phase === 'idle' && (
            <>
              <p className="max-w-sm text-center font-heading text-sm font-bold uppercase tracking-widest text-best-gold">
                {t('spin.purchaseRequired', { min: String(status.minPurchaseIqd) })}
              </p>
              {status.nextFreeSpinAt && (
                <p className="text-center font-heading text-sm font-bold uppercase tracking-widest text-best-cyan">
                  {t('spin.nextFreeSpinIn', { time: formatCountdown(monthlyCountdown) })}
                </p>
              )}
            </>
          )}

          {user && !SPIN_TEST_MODE && spunToday && phase === 'idle' && !status?.requiresPurchase && (
            <p className="text-center font-heading text-sm font-bold uppercase tracking-widest text-best-cyan">
              {t('spin.comeBack')} {formatCountdown(dailyCountdown)}
            </p>
          )}

          {user && status && status.spinCredits > 0 && phase === 'idle' && (
            <p className="text-center text-sm text-best-muted">
              {t('spin.spinsAvailable', { count: String(status.spinCredits) })}
            </p>
          )}

          {canSpin && phase === 'idle' && (
            <p className="text-center text-sm text-best-muted">{t('spin.clickSpin')}</p>
          )}
        </div>

        <SpinPrizeList prizes={status?.prizes ?? []} loading={!status} />
      </div>

      <SpinResultDialog open={dialogOpen} onOpenChange={setDialogOpen} result={result} />
    </div>
  );
}
