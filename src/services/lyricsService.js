/**
 * Service for fetching real-time synced lyrics from LRCLIB (free, open-source)
 */
export const lyricsService = {
  /**
   * Parse LRC format string: [01:23.45] lyric text
   */
  parseLrc(lrcText) {
    if (!lrcText) return [];
    const lines = lrcText.split('\n');
    const parsed = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
      const match = timeRegex.exec(line);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = parseInt(match[3].padEnd(3, '0').slice(0, 3), 10);
        const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
        const text = line.replace(timeRegex, '').trim();
        if (text) {
          parsed.push({ time: timeInSeconds, text });
        }
      }
    }
    return parsed.sort((a, b) => a.time - b.time);
  },

  /**
   * Fetch lyrics by track title and artist name
   */
  async getLyrics(trackTitle, artistName = '', duration = 0) {
    if (!trackTitle) return null;

    // Clean up title for better search matching
    const cleanTitle = trackTitle
      .replace(/\s*\(.*?\)/g, '')
      .replace(/\s*\[.*?\]/g, '')
      .replace(/feat\..*$/i, '')
      .replace(/ft\..*$/i, '')
      .trim();

    try {
      // 1. Try direct exact match with duration
      const params = new URLSearchParams({
        track_name: cleanTitle,
        ...(artistName && { artist_name: artistName }),
        ...(duration > 0 && { duration: Math.round(duration).toString() })
      });

      let res = await fetch(`https://lrclib.net/api/get?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          synced: data.syncedLyrics ? this.parseLrc(data.syncedLyrics) : null,
          plain: data.plainLyrics || null,
          isSynced: !!data.syncedLyrics
        };
      }

      // 2. Try loose search if direct get failed
      const searchParams = new URLSearchParams({ q: `${cleanTitle} ${artistName}`.trim() });
      res = await fetch(`https://lrclib.net/api/search?${searchParams.toString()}`);
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          const match = results[0];
          return {
            synced: match.syncedLyrics ? this.parseLrc(match.syncedLyrics) : null,
            plain: match.plainLyrics || null,
            isSynced: !!match.syncedLyrics
          };
        }
      }
    } catch (e) {
      console.warn('LRCLIB lyrics fetch error:', e.message);
    }

    return null;
  }
};
