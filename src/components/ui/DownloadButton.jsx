import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, CheckCircle2, Loader2 } from 'lucide-react';
import { downloadService } from '../../services/downloadService';

export default function DownloadButton({ track, size = 16, className = '' }) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!track?.id) return;
    let isMounted = true;

    downloadService.isDownloaded(track.id).then((downloaded) => {
      if (isMounted) setIsDownloaded(downloaded);
    }).catch(() => {});

    const handleDownloadChange = (e) => {
      if (String(e.detail?.trackId) === String(track.id)) {
        setIsDownloaded(e.detail?.status === 'downloaded');
        if (e.detail?.status === 'downloaded') {
          setIsDownloading(false);
        }
      }
    };

    window.addEventListener('liquid_download_changed', handleDownloadChange);
    return () => {
      isMounted = false;
      window.removeEventListener('liquid_download_changed', handleDownloadChange);
    };
  }, [track?.id]);

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!track || !track.id || isDownloading) return;

    if (isDownloaded) {
      return;
    }

    try {
      setIsDownloading(true);
      await downloadService.downloadTrack(track);
      setIsDownloaded(true);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!track?.id) return null;

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
        isDownloaded 
          ? 'text-emerald-400 hover:text-emerald-300' 
          : isDownloading
          ? 'text-emerald-400 cursor-wait'
          : 'text-im-inkFaint hover:text-white hover:bg-white/10'
      } ${className}`}
      title={
        isDownloaded 
          ? 'Downloaded (Offline Ready)' 
          : isDownloading 
          ? 'Downloading audio...' 
          : 'Download for offline playback'
      }
      aria-label={
        isDownloaded 
          ? 'Downloaded' 
          : isDownloading 
          ? 'Downloading audio' 
          : 'Download track'
      }
    >
      {isDownloading ? (
        <Loader2 size={size} className="animate-spin text-emerald-400 flex-shrink-0" />
      ) : isDownloaded ? (
        <CheckCircle2 size={size} className="text-emerald-400 fill-emerald-400/20 flex-shrink-0" />
      ) : (
        <ArrowDownToLine size={size} className="flex-shrink-0" />
      )}
    </button>
  );
}
