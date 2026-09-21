import React, { useState, useEffect } from 'react';
import { Play, ArrowDownToLine, Trash2, Music, Sparkles } from 'lucide-react';
import { downloadService } from '../../services/downloadService';
import { formatTime } from '../../utils/formatters';

const ROW_GRADIENTS = [
  'from-[#d98a3a] to-[#8a4a1e]',
  'from-[#8a6fd6] to-[#4a3a8f]',
  'from-[#4a3ad6] to-[#2a1a6f]',
  'from-[#c43a7a] to-[#6f1a4a]',
  'from-[#c4552e] to-[#7a2a12]',
  'from-[#3a7ac4] to-[#1a3a7a]',
  'from-[#c76b8a] to-[#5b3a63]',
];

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export default function DownloadsView({
  onPlayTrack,
  onPlayPlaylist,
  onAddToQueue,
  onNavigate,
  onViewChange,
  currentTrack,
  isPlaying
}) {
  const [downloadedTracks, setDownloadedTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTracks = async () => {
    try {
      const tracks = await downloadService.getDownloadedTracks();
      setDownloadedTracks(tracks);
    } catch (err) {
      console.error('Failed to load downloaded tracks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();

    const handleDownloadChange = () => {
      loadTracks();
    };

    window.addEventListener('liquid_download_changed', handleDownloadChange);
    return () => {
      window.removeEventListener('liquid_download_changed', handleDownloadChange);
    };
  }, []);

  const handleDelete = async (trackId, e) => {
    e.stopPropagation();
    try {
      await downloadService.deleteDownload(trackId);
      setDownloadedTracks((prev) => prev.filter((t) => String(t.id) !== String(trackId)));
    } catch (err) {
      console.error('Failed to delete download:', err);
    }
  };

  const handlePlayAll = () => {
    if (downloadedTracks.length > 0 && onPlayTrack) {
      onPlayTrack(downloadedTracks[0], downloadedTracks);
    }
  };

  const totalSize = downloadedTracks.reduce((acc, t) => acc + (t.size || 0), 0);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 select-none scrollbar-none text-white pb-36 animate-in fade-in duration-300">
      {/* Back Navigation */}
      <button
        onClick={() => (onNavigate ? onNavigate('library') : onViewChange?.('library'))}
        className="text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-im-inkFaint hover:text-white"
      >
        ← Back to Library
      </button>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-im-line">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Downloaded Songs
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Offline Ready
            </span>
          </div>
          <p className="text-xs mt-1 text-im-inkFaint font-medium">
            {downloadedTracks.length} {downloadedTracks.length === 1 ? 'song' : 'songs'} saved locally
            {totalSize > 0 && ` • ${formatBytes(totalSize)} storage`}
          </p>
        </div>

        {downloadedTracks.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-all shadow-md border border-white/20 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Play size={14} className="fill-current text-black ml-0.5" />
            <span>Play All</span>
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-im-inkFaint">Loading downloaded songs...</p>
        </div>
      ) : downloadedTracks.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center space-y-3 bg-im-card rounded-2xl border border-im-line p-8">
          <div className="w-14 h-14 rounded-2xl bg-im-card2 border border-im-line flex items-center justify-center mx-auto text-emerald-400">
            <ArrowDownToLine size={28} />
          </div>
          <h3 className="text-base font-bold text-white">No downloaded songs yet</h3>
          <p className="text-xs text-im-inkFaint max-w-sm mx-auto">
            Click the download button on any song across the app to store it locally and listen offline without an internet connection.
          </p>
          <button
            onClick={() => (onNavigate ? onNavigate('home') : onViewChange?.('home'))}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-white/90 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Explore Songs</span>
          </button>
        </div>
      ) : (
        /* Track rows list */
        <div className="flex flex-col gap-2">
          {downloadedTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id || idx}
                onClick={() => onPlayTrack?.(track, downloadedTracks)}
                className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-im-float border ${
                  isCurrent 
                    ? 'bg-im-card2 border-white/20' 
                    : 'bg-im-card hover:bg-im-card2 border-im-line'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-5 text-center text-xs font-mono text-im-inkFaint font-medium">
                    {idx + 1}
                  </span>

                  {/* 46px rounded thumbnail */}
                  <div className={`relative w-[46px] h-[46px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]} border border-im-line shadow-xs`}>
                    <img
                      loading="lazy"
                      decoding="async"
                      src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <Play size={14} className="fill-white text-white ml-0.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className={`font-bold text-xs sm:text-sm truncate group-hover:underline ${
                      isCurrent ? 'text-emerald-400' : 'text-white'
                    }`}>
                      {track.title}
                    </h4>
                    <p className="text-[11px] font-medium text-im-inkFaint truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                  {track.size ? (
                    <span className="text-[10px] font-mono text-im-inkFaint hidden sm:inline">
                      {formatBytes(track.size)}
                    </span>
                  ) : null}

                  {track.duration ? (
                    <span className="text-[11px] font-mono text-im-inkFaint">
                      {formatTime(track.duration)}
                    </span>
                  ) : null}

                  {/* Delete Download Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(track.id, e)}
                    className="p-1.5 text-im-inkFaint hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete download"
                    aria-label="Delete download"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
