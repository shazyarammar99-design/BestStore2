'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LocaleContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

function safeRedirectPath(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/';
}

export default function LoginPageContent() {
  const searchParams = useSearchParams();
  const { signIn, verifyMfaLogin, configured, user, loading } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = safeRedirectPath(
    searchParams?.get('redirect') ?? searchParams?.get('next') ?? null
  );

  // Already signed in on the client — send to intended page (middleware needs cookies).
  useEffect(() => {
    if (loading || !user) return;
    window.location.replace(redirectTo);
  }, [loading, user, redirectTo]);

  const goAfterAuth = () => {
    toast.success(t('auth.welcomeBack'));
    // Full navigation so middleware reads the fresh auth cookies.
    window.location.assign(redirectTo);
  };

  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await signIn(email, password, remember);
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.mfaRequired) {
      setMfaFactorId(result.factorId);
      setMfaCode('');
      setStep('mfa');
      return;
    }

    goAfterAuth();
  };

  const handleMfaVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (mfaCode.length < 6) {
      toast.error(t('auth.mfaCodeRequired'));
      return;
    }
    setSubmitting(true);
    const { error } = await verifyMfaLogin(mfaFactorId, mfaCode);
    setSubmitting(false);

    if (error) {
      toast.error(error);
      return;
    }

    goAfterAuth();
  };

  if (loading || user) {
    return (
      <AuthLayout
        title={t('auth.logInTitle')}
        subtitle={t('auth.accessAccount')}
        footer={null}
      >
        <p className="text-center text-sm text-best-muted">{t('common.loading')}</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={step === 'credentials' ? t('auth.logInTitle') : t('auth.mfaTitle')}
      subtitle={
        step === 'credentials' ? t('auth.accessAccount') : t('auth.mfaSubtitle')
      }
      footer={
        step === 'credentials' ? (
          <>
            {t('auth.noAccount')}{' '}
            <Link href="/signup" className="font-semibold text-best-cyan hover:text-glow-cyan">
              {t('auth.signUpLink')}
            </Link>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setStep('credentials')}
            className="font-semibold text-best-cyan hover:text-glow-cyan"
          >
            {t('auth.backToLogin')}
          </button>
        )
      }
    >
      {!configured && (
        <p className="mb-4 rounded-lg border border-best-gold/40 bg-best-gold/10 p-3 text-xs text-best-gold">
          {t('auth.authNotConfiguredLogin')}
        </p>
      )}

      {step === 'credentials' ? (
        <form onSubmit={handleCredentials} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block font-heading text-xs font-semibold uppercase tracking-widest text-best-muted">
              {t('auth.email')}
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 border-best-border bg-best-elevated text-white placeholder:text-best-caption focus-visible:border-best-cyan focus-visible:ring-0"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-heading text-xs font-semibold uppercase tracking-widest text-best-muted">
              {t('auth.password')}
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 border-best-border bg-best-elevated text-white placeholder:text-best-caption focus-visible:border-best-cyan focus-visible:ring-0"
            />
          </div>

          <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-best-muted">
            <Checkbox
              checked={remember}
              onCheckedChange={(value) => setRemember(value === true)}
              className="border-best-border data-[state=checked]:border-best-cyan data-[state=checked]:bg-best-cyan data-[state=checked]:text-best-bg"
            />
            {t('auth.rememberMe')}
          </label>

          <Button
            type="submit"
            disabled={submitting}
            className="mt-2 h-11 w-full bg-best-gold font-heading text-sm font-bold uppercase tracking-widest text-best-bg hover:bg-best-gold/90 hover:shadow-gold-glow"
          >
            {submitting ? t('common.loading') : t('auth.logInTitle')}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleMfaVerify} className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3">
            <InputOTP maxLength={6} value={mfaCode} onChange={setMfaCode}>
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-12 w-11 rounded-lg border-best-border bg-best-elevated text-lg text-white data-[active=true]:border-best-cyan data-[active=true]:ring-best-cyan/40"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="h-11 w-full bg-best-gold font-heading text-sm font-bold uppercase tracking-widest text-best-bg hover:bg-best-gold/90 hover:shadow-gold-glow"
          >
            {submitting ? t('auth.verifying') : t('auth.verifyMfa')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
