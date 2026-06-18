'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  updated_at: string;
  is_admin: boolean;
};

type ProfileContextValue = {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateUsername: (username: string) => Promise<string | null>;
  updateAvatarUrl: (avatarUrl: string) => Promise<string | null>;
  uploadAvatar: (file: File) => Promise<string | null>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function defaultUsername(email: string | undefined): string {
  const fromEmail = email?.split('@')[0]?.trim();
  return fromEmail && fromEmail.length >= 2 ? fromEmail : 'player';
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!supabase || !user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const [{ data, error }, badgeRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, avatar_url, updated_at, is_admin')
        .eq('id', user.id)
        .maybeSingle(),
      fetch('/api/profile/admin-badge', { credentials: 'include' }),
    ]);

    const badgeJson = badgeRes.ok ? await badgeRes.json() : { isAdmin: false };

    if (!error && data) {
      setProfile({
        ...(data as Omit<Profile, 'is_admin'>),
        is_admin: data.is_admin === true || badgeJson.isAdmin === true,
      });
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refreshProfile();
  }, [authLoading, refreshProfile]);

  const ensureProfile = async (): Promise<string | null> => {
    if (!supabase || !user) return 'Not signed in';

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (existing) return null;

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      username: defaultUsername(user.email),
      avatar_url: null,
    });

    if (error) return error.message;
    return null;
  };

  const updateUsername = async (username: string): Promise<string | null> => {
    if (!supabase || !user) return 'Not signed in';
    const trimmed = username.trim();
    if (!trimmed) return 'Username is required';

    const ensureError = await ensureProfile();
    if (ensureError) return ensureError;

    const { data, error } = await supabase
      .from('profiles')
      .update({ username: trimmed, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('id, username, avatar_url, updated_at, is_admin')
      .single();

    if (error) return error.message;
    if (!data) return 'Failed to save profile';
    setProfile({
      ...(data as Omit<Profile, 'is_admin'>),
      is_admin: profile?.is_admin ?? data.is_admin === true,
    });
    return null;
  };

  const updateAvatarUrl = async (avatarUrl: string): Promise<string | null> => {
    if (!supabase || !user) return 'Not signed in';

    const ensureError = await ensureProfile();
    if (ensureError) return ensureError;

    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('id, username, avatar_url, updated_at, is_admin')
      .single();

    if (error) return error.message;
    if (!data) return 'Failed to save profile';
    setProfile({
      ...(data as Omit<Profile, 'is_admin'>),
      is_admin: profile?.is_admin ?? data.is_admin === true,
    });
    return null;
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!supabase || !user) return 'Not signed in';

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) return uploadError.message;

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;

    return updateAvatarUrl(url);
  };

  const value: ProfileContextValue = {
    profile,
    loading: authLoading || loading,
    refreshProfile,
    updateUsername,
    updateAvatarUrl,
    uploadAvatar,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
