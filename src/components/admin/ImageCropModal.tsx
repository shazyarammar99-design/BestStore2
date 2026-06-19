'use client';

import { useState, useCallback, useMemo } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

type Point = { x: number; y: number };
type Area = { width: number; height: number; x: number; y: number };

export default function ImageCropModal({
  imageFile,
  aspectRatio = 1,
  onCropComplete,
  onCancel,
}: {
  imageFile: File | null;
  aspectRatio?: number;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const imageUrl = useMemo(() => {
    return imageFile ? URL.createObjectURL(imageFile) : '';
  }, [imageFile]);

  const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageFile || !croppedAreaPixels || !imageUrl) return;
    
    try {
      const canvas = document.createElement('canvas');
      const img = new window.Image();
      img.src = imageUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No 2d context');

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Canvas to Blob failed');
        onCropComplete(blob);
      }, imageFile.type);
    } catch (e) {
      console.error(e);
      onCancel();
    }
  };

  return (
    <Dialog open={!!imageFile} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="relative h-64 w-full sm:h-80 bg-black rounded-lg overflow-hidden">
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropCompleteInternal}
              onZoomChange={setZoom}
            />
          )}
        </div>
        <div className="py-4">
          <p className="text-sm text-best-caption mb-2">Zoom</p>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={(v) => setZoom(v[0])}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm & Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
