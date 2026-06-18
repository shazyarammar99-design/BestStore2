'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LocaleContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, configured } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error(t('auth.mustAgreeToTerms'));
      return;
    }
    if (password !== confirm) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }
    setSubmitting(true);
    const { error, session } = await signUp(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (session) {
      toast.success(t('auth.welcomeBack'));
      router.push('/account');
      return;
    }
    toast.success(t('auth.accountCreated'));
    router.push('/login');
  };

  return (
    <AuthLayout
      title={t('auth.signup')}
      subtitle={t('auth.createAccountSubtitle')}
      footer={
        <>
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="font-semibold text-best-cyan hover:text-glow-cyan">
            {t('auth.logInLink')}
          </Link>
        </>
      }
    >
      {!configured && (
        <p className="mb-4 rounded-lg border border-best-gold/40 bg-best-gold/10 p-3 text-xs text-best-gold">
          {t('auth.authNotConfiguredSignup')}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <div>
          <label className="mb-1.5 block font-heading text-xs font-semibold uppercase tracking-widest text-best-muted">
            {t('auth.confirmPassword')}
          </label>
          <Input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="h-11 border-best-border bg-best-elevated text-white placeholder:text-best-caption focus-visible:border-best-cyan focus-visible:ring-0"
          />
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-best-border bg-best-elevated/50 p-4">
          <Checkbox
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
            className="mt-0.5 border-best-border data-[state=checked]:border-best-cyan data-[state=checked]:bg-best-cyan data-[state=checked]:text-best-bg"
          />
          <span className="text-sm leading-relaxed text-best-muted">
            {t('auth.agreePrefix')}{' '}
            <Link href="/terms" className="text-best-cyan hover:underline">
              {t('footer.terms')}
            </Link>{' '}
            {t('auth.agreeAnd')}{' '}
            <Link href="/privacy" className="text-best-cyan hover:underline">
              {t('footer.privacy')}
            </Link>
          </span>
        </label>
        <Button
          type="submit"
          disabled={submitting}
          className="mt-2 h-11 w-full bg-best-gold font-heading text-sm font-bold uppercase tracking-widest text-best-bg hover:bg-best-gold/90 hover:shadow-gold-glow"
        >
          {submitting ? t('common.loading') : t('auth.signup')}
        </Button>
      </form>
    </AuthLayout>
  );
}
