'use client';

import { useState, useRef, useCallback } from 'react';
import { Play, ChevronUp, ChevronDown, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type MediaItem = {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
};

type Props = {
  mainImage: string | null;
  galleryImages: string[];
  videoUrl: string | null;
  productName: string;
};

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)/.test(url);
}

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function getYouTubeThumbnail(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match
    ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
    : '';
}

export default function ProductMediaGallery({
  mainImage,
  galleryImages,
  videoUrl,
  productName,
}: Props) {
  const items: MediaItem[] = [];

  // Main image first
  if (mainImage) {
    items.push({ type: 'image', url: mainImage });
  }

  // Gallery images
  for (const img of galleryImages) {
    if (img && img !== mainImage) {
      items.push({ type: 'image', url: img });
    }
  }

  // Video last (or wherever)
  if (videoUrl) {
    items.push({
      type: 'video',
      url: videoUrl,
      thumbnail: isYouTubeUrl(videoUrl)
        ? getYouTubeThumbnail(videoUrl)
        : undefined,
    });
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const thumbContainerRef = useRef<HTMLDivElement>(null);

  const scrollThumbs = useCallback((direction: 'up' | 'down') => {
    if (!thumbContainerRef.current) return;
    const scrollAmount = 80;
    thumbContainerRef.current.scrollBy({
      top: direction === 'up' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  // If no items, show placeholder
  if (items.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-best-border bg-gradient-to-br from-best-purple/25 via-best-surface to-best-cyan/10">
        <span className="font-display px-8 text-center text-4xl font-black uppercase tracking-tight text-white">
          {productName}
        </span>
      </div>
    );
  }

  const activeItem = items[activeIndex] ?? items[0];

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {/* Thumbnail strip */}
      <div className="flex w-full md:w-[72px] shrink-0 flex-row md:flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => scrollThumbs('up')}
          className="hidden md:flex h-6 w-full items-center justify-center rounded-md border border-best-border bg-best-elevated text-best-muted transition-colors hover:text-best-cyan"
          aria-label="Scroll thumbnails up"
        >
          <ChevronUp className="h-4 w-4" />
        </button>

        <div
          ref={thumbContainerRef}
          className="flex md:max-h-[340px] flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-best-border w-full md:w-auto"
          style={{ scrollbarWidth: 'thin' }}
        >
          {items.map((item, i) => (
            <button
              key={`thumb-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200',
                i === activeIndex
                  ? 'border-best-cyan shadow-cyan-glow'
                  : 'border-best-border opacity-60 hover:opacity-100'
              )}
            >
              {item.type === 'video' ? (
                <>
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt="Video thumbnail"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-best-elevated">
                      <Play className="h-5 w-5 text-best-cyan" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-4 w-4 fill-white text-white" />
                  </div>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={`${productName} ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollThumbs('down')}
          className="hidden md:flex h-6 w-full items-center justify-center rounded-md border border-best-border bg-best-elevated text-best-muted transition-colors hover:text-best-cyan"
          aria-label="Scroll thumbnails down"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Main viewer */}
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-best-border bg-gradient-to-br from-best-purple/25 via-best-surface to-best-cyan/10">
        <MediaViewer item={activeItem} productName={productName} />
      </div>
    </div>
  );
}

function MediaViewer({
  item,
  productName,
}: {
  item: MediaItem;
  productName: string;
}) {
  if (item.type === 'image') {
    return (
      <img
        src={item.url}
        alt={productName}
        className="aspect-square w-full object-cover"
      />
    );
  }

  // Video
  if (isYouTubeUrl(item.url)) {
    return (
      <div className="relative aspect-video w-full">
        <iframe
          src={getYouTubeEmbedUrl(item.url)}
          title={`${productName} video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full rounded-2xl"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full">
      <video
        src={item.url}
        controls
        playsInline
        className="absolute inset-0 h-full w-full rounded-2xl object-contain bg-black"
        preload="metadata"
      >
        <track kind="captions" />
      </video>
    </div>
  );
}
