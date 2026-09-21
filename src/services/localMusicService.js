import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.flac', '.aac', '.ogg'];

function isAudioFile(filename) {
  if (!filename || typeof filename !== 'string') return false;
  const lower = filename.toLowerCase();
  return AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function cleanTitle(filename) {
  if (!filename) return 'Unknown Title';
  return filename.replace(/\.(mp3|m4a|wav|flac|aac|ogg)$/i, '');
}

export const localMusicService = {
  /**
   * Request runtime storage permissions before scanning
   */
  async requestPermissions() {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    try {
      const check = await Filesystem.checkPermissions();
      if (check.publicStorage !== 'granted') {
        const req = await Filesystem.requestPermissions();
        return req.publicStorage === 'granted';
      }
      return true;
    } catch (err) {
      console.warn('Failed to check/request filesystem permissions:', err);
      return false;
    }
  },

  /**
   * Scan the standard Music directory (Directory.ExternalStorage, path 'Music')
   * and optionally standard Download directory for local audio files (.mp3, .m4a, .wav).
   * Returns a list of tracks with their file URI and filename as the track title.
   * @returns {Promise<Array<Object>>}
   */
  async scanLocalMusic() {
    // 1. Request runtime storage permission on native platforms (Android / iOS)
    await this.requestPermissions();

    const pathsToScan = ['Music', 'Download'];
    const tracks = [];
    const seenUris = new Set();

    for (const folder of pathsToScan) {
      try {
        const dirContent = await Filesystem.readdir({
          path: folder,
          directory: Directory.ExternalStorage
        });

        const files = dirContent?.files || [];

        for (const file of files) {
          const fileName = typeof file === 'string' ? file : file?.name;
          const fileType = typeof file === 'object' ? file?.type : 'file';

          if (!fileName || fileType === 'directory') continue;

          if (isAudioFile(fileName)) {
            let fileUri = typeof file === 'object' ? file?.uri : null;

            // If uri is not directly on the file object, query getUri
            if (!fileUri) {
              try {
                const uriRes = await Filesystem.getUri({
                  path: `${folder}/${fileName}`,
                  directory: Directory.ExternalStorage
                });
                fileUri = uriRes.uri;
              } catch (uriErr) {
                fileUri = `file://${folder}/${fileName}`;
              }
            }

            if (!seenUris.has(fileUri)) {
              seenUris.add(fileUri);

              // Convert native file:// URI into a webview-accessible URL for HTML5 Audio playback
              const playableUrl = Capacitor.isNativePlatform()
                ? Capacitor.convertFileSrc(fileUri)
                : fileUri;

              tracks.push({
                id: `local-${encodeURIComponent(fileUri)}`,
                title: cleanTitle(fileName),
                filename: fileName,
                artist: 'Local Device',
                thumbnail: '',
                duration: 0,
                uri: fileUri,
                localUri: fileUri,
                streamUrl: playableUrl,
                isLocal: true,
                folder
              });
            }
          }
        }
      } catch (folderErr) {
        console.warn(`Could not read directory ${folder} in ExternalStorage:`, folderErr.message);
      }
    }

    try {
      localStorage.setItem('liquid_local_tracks_count', String(tracks.length));
      localStorage.setItem('liquid_local_tracks', JSON.stringify(tracks));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('liquid_local_music_changed', {
          detail: { count: tracks.length, tracks }
        }));
      }
    } catch {}

    return tracks;
  },

  /**
   * Get cached local tracks from previous scan if available
   */
  getCachedTracks() {
    try {
      const data = localStorage.getItem('liquid_local_tracks');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Get count of cached local tracks
   */
  getCachedCount() {
    try {
      const count = localStorage.getItem('liquid_local_tracks_count');
      return count !== null ? parseInt(count, 10) : 0;
    } catch {
      return 0;
    }
  }
};

export const scanLocalMusic = () => localMusicService.scanLocalMusic();
export const requestPermissions = () => localMusicService.requestPermissions();

export default localMusicService;
