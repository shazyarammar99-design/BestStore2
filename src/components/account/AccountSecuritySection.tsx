'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LocaleContext';

export default function AccountSecuritySection() {
  const { t } = useTranslation();
  const {
    changePassword,
    listMfaFactors,
    enrollMfa,
    verifyMfaEnrollment,
    unenrollMfa,
  } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [enrollFactorId, setEnrollFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(true);

  const loadMfa = async () => {
    setMfaLoading(true);
    const { totp, error } = await listMfaFactors();
    if (error) {
      setMfaLoading(false);
      return;
    }
    const verified = totp.find((f) => f.status === 'verified');
    setMfaEnabled(Boolean(verified));
    setMfaFactorId(verified?.id ?? null);
    setMfaLoading(false);
  };

  useEffect(() => {
    void loadMfa();
  }, []);

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }
    if (newPassword === currentPassword) {
      toast.error(t('account.passwordSameAsCurrent'));
      return;
    }

    setSavingPassword(true);
    const { error, code } = await changePassword(currentPassword, newPassword);
    setSavingPassword(false);

    if (error) {
      if (code === 'CURRENT_PASSWORD_WRONG') {
        toast.error(t('account.currentPasswordWrong'));
      } else if (code === 'MFA_REAUTH_REQUIRED') {
        toast.error(t('account.mfaReauthRequired'));
      } else {
        toast.error(error);
      }
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success(t('account.passwordUpdated'));
  };

  const handleStartEnroll = async () => {
    setEnrolling(true);
    const result = await enrollMfa();
    setEnrolling(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setQrCode(result.qrCode ?? null);
    setEnrollFactorId(result.factorId ?? null);
    setVerifyCode('');
  };

  const handleVerifyEnroll = async () => {
    if (!enrollFactorId || verifyCode.length < 6) {
      toast.error(t('auth.mfaCodeRequired'));
      return;
    }

    setEnrolling(true);
    const { error } = await verifyMfaEnrollment(enrollFactorId, verifyCode);
    setEnrolling(false);

    if (error) {
      toast.error(error);
      return;
    }

    setQrCode(null);
    setEnrollFactorId(null);
    setVerifyCode('');
    toast.success(t('account.mfaEnabled'));
    await loadMfa();
  };

  const handleDisableMfa = async () => {
    if (!mfaFactorId) return;

    setEnrolling(true);
    const { error } = await unenrollMfa(mfaFactorId);
    setEnrolling(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success(t('account.mfaDisabled'));
    await loadMfa();
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-best-muted">
          {t('account.changePassword')}
        </h3>
        <form onSubmit={handlePassword} className="mt-4 space-y-4">
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('account.currentPassword')}
            className="h-11 border-best-border bg-best-bg text-white focus-visible:border-best-cyan focus-visible:ring-0"
          />
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('account.newPassword')}
            className="h-11 border-best-border bg-best-bg text-white focus-visible:border-best-cyan focus-visible:ring-0"
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('account.confirmNewPassword')}
            className="h-11 border-best-border bg-best-bg text-white focus-visible:border-best-cyan focus-visible:ring-0"
          />
          <Button
            type="submit"
            disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="bg-best-gold font-heading text-sm font-bold uppercase tracking-widest text-best-bg hover:bg-best-gold/90"
          >
            {savingPassword ? t('common.loading') : t('account.updatePassword')}
          </Button>
        </form>
      </div>

      <div className="border-t border-best-border pt-8">
        <div className="flex items-center gap-2">
          {mfaEnabled ? (
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          ) : (
            <Shield className="h-5 w-5 text-best-muted" />
          )}
          <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-best-muted">
            {t('account.twoFactor')}
          </h3>
        </div>

        {mfaLoading ? (
          <p className="mt-3 text-sm text-best-muted">{t('common.loading')}</p>
        ) : mfaEnabled ? (
          <div className="mt-4">
            <p className="text-sm text-emerald-400">{t('account.mfaActive')}</p>
            <Button
              type="button"
              variant="outline"
              disabled={enrolling}
              onClick={handleDisableMfa}
              className="mt-3 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              {t('account.disableMfa')}
            </Button>
          </div>
        ) : qrCode && enrollFactorId ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-best-muted">{t('account.scanQr')}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCode}
              alt="TOTP QR code"
              className="mx-auto h-40 w-40 rounded-lg border border-best-border bg-white p-2"
            />
            <div className="flex flex-col items-center gap-3">
              <InputOTP maxLength={6} value={verifyCode} onChange={setVerifyCode}>
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="h-11 w-10 rounded-lg border-best-border bg-best-bg text-white data-[active=true]:border-best-cyan"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <Button
                type="button"
                disabled={enrolling || verifyCode.length < 6}
                onClick={handleVerifyEnroll}
                className="bg-best-cyan font-heading text-sm font-bold uppercase tracking-widest text-best-bg"
              >
                {enrolling ? t('auth.verifying') : t('account.enableMfa')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-best-muted">{t('account.mfaHint')}</p>
            <Button
              type="button"
              disabled={enrolling}
              onClick={handleStartEnroll}
              className="mt-3 border-best-cyan/40 bg-best-cyan/10 font-heading text-sm font-bold uppercase tracking-widest text-best-cyan hover:bg-best-cyan/20"
            >
              {enrolling ? t('common.loading') : t('account.setupMfa')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
