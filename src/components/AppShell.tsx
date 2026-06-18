'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { StoreProvider } from '@/context/StoreContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { Toaster } from '@/components/ui/sonner';

const PresenceHeartbeat = dynamic(() => import('@/components/PresenceHeartbeat'), { ssr: false });
const SupportBubble = dynamic(() => import('@/components/SupportBubble'), { ssr: false });
const CursorTrail = dynamic(() => import('@/components/CursorTrail'), { ssr: false });

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  return (
    <LocaleProvider>
      <AuthProvider>
        <ProfileProvider>
        <StoreProvider>
          <div className="flex min-h-screen flex-col">
            {!isAdmin && <Navigation />}
            <div className={isAdmin ? 'flex flex-1 flex-col' : 'flex flex-1 flex-col pt-20'}>
              <div className="flex-1">{children}</div>
            </div>
            {!isAdmin && <Footer />}

            <PresenceHeartbeat />
            <SupportBubble />
            {isHome && <CursorTrail />}
            <Toaster theme="dark" position="bottom-right" richColors />
          </div>
        </StoreProvider>
        </ProfileProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
