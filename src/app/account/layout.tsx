import AccountAuthGuard from '@/components/account/AccountAuthGuard';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountAuthGuard>{children}</AccountAuthGuard>;
}
