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
   * Clean raw YouTube track titles and extract real artist & song name
   */
  cleanTrackInfo(rawTitle = '', rawArtist = '') {
    let title = (rawTitle || '').trim();
    let artist = (rawArtist || '').trim();

    // If title has "Artist - Song", extract them
    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      const possibleArtist = parts[0].trim();
      const possibleTitle = parts.slice(1).join(' - ').trim();
      if (possibleArtist && possibleTitle) {
        const lowerArtist = artist.toLowerCase();
        // If current artist is missing, or a channel/label name, prefer the parsed artist
        if (
          !artist ||
          lowerArtist.includes('cloud') ||
          lowerArtist.includes('vevo') ||
          lowerArtist.includes('topic') ||
          lowerArtist.includes('records') ||
          lowerArtist.includes('music') ||
          lowerArtist.includes('series')
        ) {
          artist = possibleArtist;
        }
        title = possibleTitle;
      }
    }

    // Clean common YouTube clutter and suffixes
    title = title
      .replace(/\s*\(.*?\)/g, '')
      .replace(/\s*\[.*?\]/g, '')
      .replace(/ft\..*$/i, '')
      .replace(/feat\..*$/i, '')
      .replace(/official\s*(music)?\s*(video|audio)?/gi, '')
      .replace(/lyric(s)?\s*(video)?/gi, '')
      .trim();

    artist = artist
      .replace(/\s*-\s*topic$/i, '')
      .replace(/vevo$/i, '')
      .trim();

    return { title, artist };
  },

  /**
   * Fetch lyrics with fallback to avoid 404 console errors
   */
  async getLyrics(trackTitle, artistName = '', duration = 0) {
    if (!trackTitle) return null;

    const { title: cleanTitle, artist: cleanArtist } = this.cleanTrackInfo(trackTitle, artistName);
    const searchQuery = `${cleanArtist} ${cleanTitle}`.trim() || cleanTitle;

    try {
      // Use /api/search with query:
      // Returns 200 OK with [] instead of HTTP 404 when no lyrics match,
      // avoiding console errors while supporting fuzzy search for YouTube metadata
      const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          // Prefer entries with synced lyrics
          const match = results.find(r => r.syncedLyrics) || results[0];
          return {
            synced: match.syncedLyrics ? this.parseLrc(match.syncedLyrics) : null,
            plain: match.plainLyrics || null,
            isSynced: !!match.syncedLyrics
          };
        }
      }
    } catch {
      // Silently handle offline or network aborts
    }

    return null;
  }
};
