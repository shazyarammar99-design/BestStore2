import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminVerifiedBadgeProps = {
  className?: string;
  size?: 'sm' | 'md';
};

export function AdminVerifiedBadge({ className, size = 'sm' }: AdminVerifiedBadgeProps) {
  const iconSize = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <span title="Admin" className="inline-flex">
      <BadgeCheck
        className={cn('shrink-0 fill-best-cyan text-best-bg', iconSize, className)}
        aria-label="Verified admin"
      />
    </span>
  );
}

type UsernameWithBadgeProps = {
  username: string;
  isAdmin?: boolean;
  className?: string;
  badgeSize?: 'sm' | 'md';
};

export function UsernameWithBadge({
  username,
  isAdmin = false,
  className,
  badgeSize = 'sm',
}: UsernameWithBadgeProps) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5', className)}>
      <span className="truncate">{username}</span>
      {isAdmin ? <AdminVerifiedBadge size={badgeSize} /> : null}
    </span>
  );
}
