'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UsernameWithBadge } from '@/components/AdminVerifiedBadge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LocaleContext';
import { useProfile } from '@/context/ProfileContext';

type Props = {
  email: string;
};

export default function AccountAvatarUpload({ email }: Props) {
  const { t } = useTranslation();
  const { profile, uploadAvatar } = useProfile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl ?? profile?.avatar_url ?? undefined;
  const initials = (profile?.username ?? email).slice(0, 2).toUpperCase();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('account.invalidImage'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('account.imageTooLarge'));
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);

    setUploading(true);
    const error = await uploadAvatar(file);
    setUploading(false);

    if (error) {
      URL.revokeObjectURL(blobUrl);
      setPreviewUrl(null);
      toast.error(error);
      return;
    }

    URL.revokeObjectURL(blobUrl);
    setPreviewUrl(null);
    toast.success(t('account.photoUpdated'));
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-best-cyan/40 shadow-cyan-glow">
          <AvatarImage
            key={displayUrl ?? 'fallback'}
            src={displayUrl}
            alt={profile?.username ?? email}
          />
          <AvatarFallback className="bg-best-elevated font-display text-xl text-best-cyan">
            {initials}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-best-bg/70">
            <Loader2 className="h-6 w-6 animate-spin text-best-cyan" />
          </div>
        )}
      </div>

      <div className="text-center sm:text-left">
        <UsernameWithBadge
          username={profile?.username ?? email}
          isAdmin={profile?.is_admin}
          badgeSize="md"
          className="font-heading text-lg font-bold text-white"
        />
        <p className="text-sm text-best-muted">{email}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-3 border-best-border bg-best-elevated text-best-muted hover:border-best-cyan hover:text-best-cyan"
        >
          <Camera className="mr-2 h-4 w-4" />
          {t('account.changePhoto')}
        </Button>
      </div>
    </div>
  );
}
