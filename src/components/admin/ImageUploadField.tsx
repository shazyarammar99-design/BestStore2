'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Loader2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageCropModal from './ImageCropModal';

type ImageUploadFieldProps = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
};

export default function ImageUploadField({
  label = 'Image',
  value,
  onChange,
  folder = 'uploads',
}: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const handleUpload = async (blob: Blob) => {
    setCropFile(null);
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      // Use the original file name or a generic one
      form.append('file', new File([blob], cropFile?.name ?? 'cropped.jpg', { type: blob.type }));
      form.append('folder', folder);
      const res = await adminFetch('/api/admin/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value && (
        <div className="relative h-24 w-full overflow-hidden rounded-lg border border-best-border">
          <Image src={value} alt="" fill className="object-cover" unoptimized />
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL or upload"
          className="bg-best-elevated"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setCropFile(file);
            e.target.value = ''; // reset so same file can be selected again
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <ImageCropModal
        imageFile={cropFile}
        onCancel={() => setCropFile(null)}
        onCropComplete={handleUpload}
      />
    </div>
  );
}
