/** Split a buyer label into a visible prefix and a blurred suffix (~half the name). */
export function maskBuyerName(raw: string): { visible: string; hidden: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { visible: 'Someone', hidden: '' };

  const local = trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
  const visibleLen = Math.max(1, Math.ceil(local.length / 2));
  const visible = local.slice(0, visibleLen);
  let hidden = local.slice(visibleLen);

  if (hidden.length < 4) {
    hidden = hidden + '•'.repeat(4 - hidden.length);
  }

  return { visible, hidden };
}

export function buyerLabelFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const meta = user.user_metadata;
  const fullName =
    (typeof meta?.full_name === 'string' && meta.full_name) ||
    (typeof meta?.name === 'string' && meta.name) ||
    null;
  if (fullName) return fullName;
  if (user.email) return user.email.split('@')[0];
  return 'Customer';
}

export function formatPurchaseTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}
