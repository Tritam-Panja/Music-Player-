import { ytResolver } from './youtube/YouTubeResolver';

const DB_NAME = 'liquid_music_db';
const DB_VERSION = 1;
const STORE_NAME = 'downloaded_tracks';

const isIndexedDBSupported = typeof window !== 'undefined' && 'indexedDB' in window;

let dbPromise = null;

function openDB() {
  if (!isIndexedDBSupported) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment.'));
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };

    request.onerror = (event) => {
      dbPromise = null;
      reject(event.target.error || new Error('Failed to open IndexedDB.'));
    };
  });

  return dbPromise;
}

export const downloadService = {
  /**
   * Resolve a track's audio stream, download the blob, and store it in IndexedDB with metadata.
   * @param {Object|string} track - Track object or track ID
   * @param {Function} [onProgress] - Callback for progress reporting ({ status, progress, loaded, total })
   * @returns {Promise<Object>} Stored track metadata
   */
  async downloadTrack(track, onProgress) {
    if (!track) {
      throw new Error('Track is required for download.');
    }

    const trackId = typeof track === 'object' && track !== null ? track.id : track;
    if (!trackId) {
      throw new Error('Invalid track: missing ID.');
    }

    const idStr = String(trackId);

    // If already downloaded, return existing metadata
    const alreadyDownloaded = await this.isDownloaded(idStr);
    if (alreadyDownloaded) {
      onProgress?.({ status: 'success', progress: 100, loaded: 0, total: 0 });
      return await this.getDownloadedTrack(idStr);
    }

    try {
      onProgress?.({ status: 'resolving', progress: 0 });

      // 1. Resolve playable audio stream URL via YouTubeResolver
      let streamUrl = typeof track === 'object' ? track.streamUrl : null;
      let formatMime = typeof track === 'object' ? track.mimeType : 'audio/mp4';

      if (!streamUrl) {
        const streamInfo = await ytResolver.resolveAudioStream(idStr);
        if (!streamInfo || !streamInfo.streamUrl) {
          throw new Error(`Failed to resolve playable stream for track ${idStr}.`);
        }
        streamUrl = streamInfo.streamUrl;
        if (streamInfo.format) {
          formatMime = streamInfo.format;
        }
      }

      onProgress?.({ status: 'downloading', progress: 10 });

      // 2. Fetch audio as blob with progress tracking
      const response = await fetch(streamUrl);
      if (!response.ok) {
        throw new Error(`Failed to download audio stream: HTTP ${response.status}`);
      }

      const contentLengthHeader = response.headers.get('content-length');
      const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
      let audioBlob;

      if (response.body && totalBytes > 0 && typeof response.body.getReader === 'function') {
        const reader = response.body.getReader();
        const chunks = [];
        let receivedBytes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedBytes += value.length;

          if (totalBytes > 0) {
            const percent = Math.min(95, Math.round((receivedBytes / totalBytes) * 100));
            onProgress?.({
              status: 'downloading',
              progress: percent,
              loaded: receivedBytes,
              total: totalBytes
            });
          }
        }

        const resolvedType = response.headers.get('content-type') || formatMime || 'audio/mp4';
        audioBlob = new Blob(chunks, { type: resolvedType });
      } else {
        audioBlob = await response.blob();
      }

      onProgress?.({ status: 'saving', progress: 98 });

      // 3. Prepare metadata and record
      const trackObj = typeof track === 'object' && track !== null ? track : {};
      const metadata = {
        id: idStr,
        title: trackObj.title || 'Unknown Title',
        artist: trackObj.artist || 'Unknown Artist',
        thumbnail: trackObj.thumbnail || '',
        duration: typeof trackObj.duration === 'number' ? trackObj.duration : 0,
        size: audioBlob.size,
        mimeType: audioBlob.type || formatMime || 'audio/mp4',
        downloadedAt: Date.now()
      };

      const record = {
        ...metadata,
        blob: audioBlob
      };

      // 4. Save to IndexedDB
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(record);
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target.error);
        tx.onabort = (e) => reject(tx.error || e);
      });

      onProgress?.({
        status: 'success',
        progress: 100,
        loaded: audioBlob.size,
        total: audioBlob.size
      });

      // Notify window listeners of download changes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('liquid_download_changed', {
            detail: { trackId: idStr, status: 'downloaded', metadata }
          })
        );
      }

      return metadata;
    } catch (err) {
      onProgress?.({ status: 'error', progress: 0, error: err.message });
      throw err;
    }
  },

  /**
   * Return metadata for all downloaded tracks (omitting audio blobs).
   * @returns {Promise<Array<Object>>} List of track metadata
   */
  async getDownloadedTracks() {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const records = req.result || [];
          // Omit the blob field to keep listing memory-efficient
          const metadataList = records.map(({ blob, ...metadata }) => metadata);
          resolve(metadataList);
        };
        req.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      console.error('Failed to get downloaded tracks:', err);
      return [];
    }
  },

  /**
   * Return metadata for a single downloaded track.
   * @param {string} trackId - ID of track
   * @returns {Promise<Object|null>}
   */
  async getDownloadedTrack(trackId) {
    if (!trackId) return null;
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(String(trackId));
        req.onsuccess = () => {
          const record = req.result;
          if (!record) {
            resolve(null);
            return;
          }
          const { blob, ...metadata } = record;
          resolve(metadata);
        };
        req.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      console.error(`Failed to get downloaded track metadata for ${trackId}:`, err);
      return null;
    }
  },

  /**
   * Return the audio Blob for a downloaded track.
   * @param {string} trackId - ID of track
   * @returns {Promise<Blob|null>} Audio blob
   */
  async getDownloadedAudioBlob(trackId) {
    if (!trackId) return null;
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(String(trackId));
        req.onsuccess = () => {
          const record = req.result;
          resolve(record?.blob || null);
        };
        req.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      console.error(`Failed to get audio blob for track ${trackId}:`, err);
      return null;
    }
  },

  /**
   * Create and return an object URL for a downloaded audio blob.
   * Useful for directly assigning to audio element src.
   * @param {string} trackId - ID of track
   * @returns {Promise<string|null>} Object URL
   */
  async getDownloadedAudioUrl(trackId) {
    const blob = await this.getDownloadedAudioBlob(trackId);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  },

  /**
   * Delete a downloaded track from IndexedDB.
   * @param {string} trackId - ID of track
   * @returns {Promise<boolean>} True if successfully deleted
   */
  async deleteDownload(trackId) {
    if (!trackId) return false;
    const idStr = String(trackId);
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(idStr);
        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e.target.error);
        tx.onabort = (e) => reject(tx.error || e);
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('liquid_download_changed', {
            detail: { trackId: idStr, status: 'deleted' }
          })
        );
      }

      return true;
    } catch (err) {
      console.error(`Failed to delete download for track ${trackId}:`, err);
      return false;
    }
  },

  /**
   * Quick check if a track is already downloaded.
   * @param {string} trackId - ID of track
   * @returns {Promise<boolean>}
   */
  async isDownloaded(trackId) {
    if (!trackId) return false;
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.count(String(trackId));
        req.onsuccess = () => {
          resolve(req.result > 0);
        };
        req.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      return false;
    }
  }
};

export const downloadTrack = (track, onProgress) => downloadService.downloadTrack(track, onProgress);
export const getDownloadedTracks = () => downloadService.getDownloadedTracks();
export const getDownloadedTrack = (trackId) => downloadService.getDownloadedTrack(trackId);
export const getDownloadedAudioBlob = (trackId) => downloadService.getDownloadedAudioBlob(trackId);
export const getDownloadedAudioUrl = (trackId) => downloadService.getDownloadedAudioUrl(trackId);
export const deleteDownload = (trackId) => downloadService.deleteDownload(trackId);
export const isDownloaded = (trackId) => downloadService.isDownloaded(trackId);

export default downloadService;
