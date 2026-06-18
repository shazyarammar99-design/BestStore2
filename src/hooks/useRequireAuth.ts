'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const requireAuth = (message = 'Please log in to continue.') => {
    if (loading) return false;
    if (user) return true;
    toast.error(message);
    router.push('/login');
    return false;
  };

  return { user, loading, requireAuth };
}
