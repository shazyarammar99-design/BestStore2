export function parseVideoEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; embedUrl: string } | null {
  if (!url) return null;

  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  if (/\.(mp4|webm)(\?|$)/i.test(url) || url.includes('/storage/v1/object/public/')) {
    return { type: 'direct', embedUrl: url };
  }

  return null;
}
