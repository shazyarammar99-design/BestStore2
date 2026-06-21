'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Loader2 } from 'lucide-react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { adminFetch } from '@/lib/admin-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type ImageUploadFieldProps = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
};

async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop, fileName: string): Promise<File> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('No 2d context');

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(new File([blob], fileName, { type: 'image/jpeg' }));
    }, 'image/jpeg', 1);
  });
}

export default function ImageUploadField({
  label = 'Image',
  value,
  onChange,
  folder = 'uploads',
}: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crop states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  const onSelectFile = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setCrop(undefined);
    setCompletedCrop(null);
    const reader = new FileReader();
    reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
    reader.readAsDataURL(file);
  };

  const executeUpload = async (fileToUpload: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', fileToUpload);
      form.append('folder', folder);
      const res = await adminFetch('/api/admin/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      onChange(json.url);
      setImgSrc('');
      setSelectedFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmCrop = async () => {
    if (!selectedFile) return;
    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && imgRef.current) {
      try {
        const croppedFile = await getCroppedImg(imgRef.current, completedCrop, selectedFile.name);
        await executeUpload(croppedFile);
      } catch (e) {
        setError('Failed to crop image');
      }
    } else {
      // If no crop was selected, upload the original file
      await executeUpload(selectedFile);
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
          onChange={(e) => onSelectFile(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => {
            if (fileRef.current) fileRef.current.value = '';
            fileRef.current?.click();
          }}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}

      <Dialog open={!!imgSrc} onOpenChange={(open) => !open && setImgSrc('')}>
        <DialogContent className="max-w-3xl border-best-border bg-best-background">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-[60vh] justify-center overflow-auto rounded-lg bg-black/50 p-4">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  className="max-h-[55vh] w-auto max-w-full object-contain"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImgSrc('')} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCrop} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                'Crop & Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
