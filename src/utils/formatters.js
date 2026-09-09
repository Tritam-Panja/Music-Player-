export function formatDuration(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatViews(views) {
  if (!views) return '';
  if (views >= 1000000000) return `${(views / 1000000000).toFixed(1)}B`;
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

export function cleanTrackTitle(title) {
  if (!title) return 'Unknown Title';
  return title
    .replace(/\s*\(Official\s*(Music\s*)?(Video|Audio|Lyric\s*Video|HD|4K)\)/gi, '')
    .replace(/\s*\[Official\s*(Music\s*)?(Video|Audio|Lyric\s*Video|HD|4K)\]/gi, '')
    .replace(/\s*\(Lyric\s*Video\)/gi, '')
    .replace(/\s*\[Lyric\s*Video\]/gi, '')
    .replace(/\s*\(Audio\)/gi, '')
    .replace(/\s*\[Audio\]/gi, '')
    .replace(/\s*\(Visualizer\)/gi, '')
    .replace(/\s*\|.*$/, '')
    .trim();
}
