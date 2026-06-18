'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, setRememberMe } from '@/lib/supabase';

type AuthResult = { error: string | null; code?: string };
type SignUpResult = AuthResult & { session: Session | null };

export type SignInResult =
  | { error: string | null; mfaRequired: false }
  | { error: null; mfaRequired: true; factorId: string };

export type MfaEnrollResult = {
  error: string | null;
  factorId?: string;
  qrCode?: string;
  secret?: string;
};

export type MfaFactor = {
  id: string;
  friendlyName: string;
  status: string;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<SignInResult>;
  verifyMfaLogin: (factorId: string, code: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  listMfaFactors: () => Promise<{ totp: MfaFactor[]; error: string | null }>;
  enrollMfa: () => Promise<MfaEnrollResult>;
  verifyMfaEnrollment: (factorId: string, code: string) => Promise<AuthResult>;
  unenrollMfa: (factorId: string) => Promise<AuthResult>;
};

const NOT_CONFIGURED =
  'Authentication is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function needsMfaStep(): Promise<string | null> {
  if (!supabase) return null;

  const { data: aal, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !aal) return null;

  if (aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) return null;
    const verified = factors.totp.find((f) => f.status === 'verified');
    return verified?.id ?? null;
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (
    email: string,
    password: string,
    remember: boolean
  ): Promise<SignInResult> => {
    if (!supabase) return { error: NOT_CONFIGURED, mfaRequired: false };
    setRememberMe(remember);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, mfaRequired: false };

    const factorId = await needsMfaStep();
    if (factorId) {
      return { error: null, mfaRequired: true, factorId };
    }

    return { error: null, mfaRequired: false };
  };

  const verifyMfaLogin = async (factorId: string, code: string): Promise<AuthResult> => {
    if (!supabase) return { error: NOT_CONFIGURED };

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError) return { error: challengeError.message };

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string): Promise<SignUpResult> => {
    if (!supabase) return { error: NOT_CONFIGURED, session: null };
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null, session: data.session };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<AuthResult> => {
    if (!supabase) return { error: NOT_CONFIGURED };
    const email = session?.user?.email;
    if (!email) return { error: 'No email on account' };

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (signInError) {
      return { error: signInError.message, code: 'CURRENT_PASSWORD_WRONG' };
    }

    const factorId = await needsMfaStep();
    if (factorId) {
      return { error: 'MFA re-auth required', code: 'MFA_REAUTH_REQUIRED' };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  };

  const listMfaFactors = async (): Promise<{ totp: MfaFactor[]; error: string | null }> => {
    if (!supabase) return { totp: [], error: NOT_CONFIGURED };
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return { totp: [], error: error.message };
    return {
      totp: (data.totp ?? []).map((f) => ({
        id: f.id,
        friendlyName: f.friendly_name ?? 'Authenticator',
        status: f.status,
      })),
      error: null,
    };
  };

  const enrollMfa = async (): Promise<MfaEnrollResult> => {
    if (!supabase) return { error: NOT_CONFIGURED };
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Authenticator app',
    });
    if (error) return { error: error.message };
    return {
      error: null,
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    };
  };

  const verifyMfaEnrollment = async (factorId: string, code: string): Promise<AuthResult> => {
    if (!supabase) return { error: NOT_CONFIGURED };
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError) return { error: challengeError.message };

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });
    return { error: error?.message ?? null };
  };

  const unenrollMfa = async (factorId: string): Promise<AuthResult> => {
    if (!supabase) return { error: NOT_CONFIGURED };
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    return { error: error?.message ?? null };
  };

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    configured: isSupabaseConfigured,
    signIn,
    verifyMfaLogin,
    signUp,
    signOut,
    changePassword,
    listMfaFactors,
    enrollMfa,
    verifyMfaEnrollment,
    unenrollMfa,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
