import React, { useState, useEffect } from 'react';
import { Play, Folder, RefreshCw, Music, HardDrive } from 'lucide-react';
import { localMusicService } from '../../services/localMusicService';
import { formatTime } from '../../utils/formatters';

const ROW_GRADIENTS = [
  'from-[#3a7ac4] to-[#1a3a7a]',
  'from-[#8a6fd6] to-[#4a3a8f]',
  'from-[#4a3ad6] to-[#2a1a6f]',
  'from-[#d98a3a] to-[#8a4a1e]',
  'from-[#c43a7a] to-[#6f1a4a]',
  'from-[#c4552e] to-[#7a2a12]',
];

export default function LocalMusicView({
  onPlayTrack,
  onPlayPlaylist,
  onAddToQueue,
  onNavigate,
  onViewChange,
  currentTrack,
  isPlaying
}) {
  const [localTracks, setLocalTracks] = useState(() => localMusicService.getCachedTracks());
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(() => localMusicService.getCachedCount() > 0);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const found = await localMusicService.scanLocalMusic();
      setLocalTracks(found || []);
      setHasScanned(true);
    } catch (err) {
      console.error('Local music scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    // If no cached tracks yet, auto-scan on initial view mount
    if (localTracks.length === 0 && !hasScanned) {
      handleScan();
    }
  }, []);

  const handlePlayAll = () => {
    if (localTracks.length > 0 && onPlayTrack) {
      onPlayTrack(localTracks[0], localTracks);
    }
  };

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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Local Music</span>
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
              <HardDrive size={12} />
              <span>Device Storage</span>
            </span>
          </div>
          <p className="text-xs mt-1 text-im-inkFaint font-medium">
            {isScanning
              ? 'Scanning device storage (Music & Download)...'
              : `${localTracks.length} audio ${localTracks.length === 1 ? 'file' : 'files'} found on this device`}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-im-card hover:bg-im-card2 border border-im-line text-white shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Rescan device for new audio files"
          >
            <RefreshCw size={13} className={isScanning ? 'animate-spin text-blue-400' : ''} />
            <span>{isScanning ? 'Scanning...' : 'Scan for music'}</span>
          </button>

          {localTracks.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="px-5 py-2 rounded-xl bg-white hover:bg-white/90 text-black text-xs font-bold transition-all shadow-md border border-white/20 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Play size={14} className="fill-current text-black ml-0.5" />
              <span>Play All</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading indicator while scanning */}
      {isScanning ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-im-card rounded-2xl border border-im-line p-8">
          <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-white">Scanning device for audio files...</p>
          <p className="text-xs text-im-inkFaint">Searching standard Music and Download directories</p>
        </div>
      ) : localTracks.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center space-y-3 bg-im-card rounded-2xl border border-im-line p-8">
          <div className="w-14 h-14 rounded-2xl bg-im-card2 border border-im-line flex items-center justify-center mx-auto text-blue-400">
            <Folder size={28} />
          </div>
          <h3 className="text-base font-bold text-white">No local audio files found</h3>
          <p className="text-xs text-im-inkFaint max-w-md mx-auto">
            Place audio files (.mp3, .m4a, .wav) into your device's standard <strong>Music</strong> or <strong>Download</strong> folder, then click the button below to scan.
          </p>
          <button
            onClick={handleScan}
            className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-white/90 transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95"
          >
            <RefreshCw size={13} />
            <span>Scan for music</span>
          </button>
        </div>
      ) : (
        /* Track rows list */
        <div className="flex flex-col gap-2">
          {localTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id || currentTrack?.localUri === track.localUri;
            return (
              <div
                key={track.id || idx}
                onClick={() => onPlayTrack?.(track, localTracks)}
                className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-im-float border ${
                  isCurrent 
                    ? 'bg-im-card2 border-blue-400/40' 
                    : 'bg-im-card hover:bg-im-card2 border-im-line'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-5 text-center text-xs font-mono text-im-inkFaint font-medium">
                    {idx + 1}
                  </span>

                  {/* 46px rounded thumbnail */}
                  <div className={`relative w-[46px] h-[46px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]} border border-im-line shadow-xs flex items-center justify-center`}>
                    <Music size={20} className="text-white/60 group-hover:scale-110 transition-transform duration-300" />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <Play size={14} className="fill-white text-white ml-0.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className={`font-bold text-xs sm:text-sm truncate group-hover:underline ${
                      isCurrent ? 'text-blue-400' : 'text-white'
                    }`}>
                      {track.title}
                    </h4>
                    <p className="text-[11px] font-medium text-im-inkFaint truncate mt-0.5 flex items-center gap-1.5">
                      <span>{track.artist || 'Local Audio'}</span>
                      {track.folder && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-blue-400/80 font-mono">/{track.folder}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                  {track.duration > 0 ? (
                    <span className="text-[11px] font-mono text-im-inkFaint">
                      {formatTime(track.duration)}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-im-inkFaint border border-im-line">
                      AUDIO
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
