'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, ShieldCheck } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type AdminProfile = {
  id: string;
  username: string;
  email: string | null;
  is_admin: boolean;
  is_owner?: boolean;
};

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch('/api/admin/admins');
    const json = await res.json();
    if (res.ok) {
      setAdmins(json.admins ?? []);
      setUsers(json.users ?? []);
      setOwnerEmail(json.ownerEmail ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.email?.toLowerCase().includes(q) ?? false)
    );
  }, [users, searchQuery]);

  const toggle = async (userId: string, is_admin: boolean, is_owner?: boolean) => {
    if (is_owner && !is_admin) {
      toast.error('Owner admin access cannot be revoked');
      return;
    }

    const res = await adminFetch(`/api/admin/admins/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_admin }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? 'Update failed');
      return;
    }

    toast.success(is_admin ? 'Admin granted' : 'Admin revoked');
    load();
  };

  const renderUserRow = (p: AdminProfile) => (
    <div
      key={p.id}
      className="flex items-center justify-between rounded-xl border border-best-border bg-best-elevated p-4"
    >
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium">{p.username}</p>
          {p.is_owner && (
            <span className="inline-flex items-center gap-1 rounded-full bg-best-cyan/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-best-cyan">
              <ShieldCheck className="h-3 w-3" />
              Owner
            </span>
          )}
        </div>
        <p className="text-sm text-best-muted">{p.email ?? 'No email'}</p>
      </div>
      <div className="flex items-center gap-2">
        <Label>{p.is_owner ? 'Always admin' : 'Admin'}</Label>
        <Switch
          checked={p.is_admin}
          disabled={p.is_owner}
          onCheckedChange={(v) => toggle(p.id, v, p.is_owner)}
        />
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-black uppercase tracking-tight">Admins</h1>
      <p className="mt-1 text-sm text-best-muted">
        Manage who can access the admin panel. The owner account cannot be revoked.
        {ownerEmail ? (
          <>
            {' '}
            Owner: <span className="text-best-cyan">{ownerEmail}</span>
          </>
        ) : null}
      </p>

      <h2 className="mt-8 font-heading text-lg font-semibold">Current admins</h2>
      {loading ? (
        <p className="mt-4 text-best-muted">Loading…</p>
      ) : admins.length === 0 ? (
        <p className="mt-4 text-best-muted">No admins yet.</p>
      ) : (
        <div className="mt-4 space-y-3">{admins.map((p) => renderUserRow(p))}</div>
      )}

      <h2 className="mt-10 font-heading text-lg font-semibold">All users</h2>
      <p className="mt-1 text-sm text-best-muted">
        Every registered user, sorted A–Z. Search by name or email to filter, or scroll the list to grant admin.
      </p>

      <div className="relative mt-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-best-caption" />
        <Input
          type="search"
          placeholder="Filter by name or email…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-best-bg pl-9"
        />
      </div>

      {loading ? (
        <p className="mt-4 text-best-muted">Loading…</p>
      ) : filteredUsers.length === 0 ? (
        <p className="mt-4 text-best-muted">No users match your search.</p>
      ) : (
        <div className="mt-4 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
          {filteredUsers.map((p) => renderUserRow(p))}
        </div>
      )}
    </div>
  );
}
