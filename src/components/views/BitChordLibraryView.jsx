import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Heart, 
  Clock, 
  FolderPlus, 
  Plus, 
  RefreshCw, 
  Sparkles, 
  Music, 
  ListMusic, 
  Radio, 
  Trash2,
  ExternalLink,
  ArrowDownToLine,
  HardDrive,
  ChevronRight
} from 'lucide-react';
import { formatTime } from '../../utils/formatters';
import { downloadService } from '../../services/downloadService';
import { localMusicService } from '../../services/localMusicService';
import { historyService } from '../../services/historyService';

const ROW_GRADIENTS = [
  'from-[#d98a3a] to-[#8a4a1e]',
  'from-[#8a6fd6] to-[#4a3a8f]',
  'from-[#4a3ad6] to-[#2a1a6f]',
  'from-[#c43a7a] to-[#6f1a4a]',
  'from-[#c4552e] to-[#7a2a12]',
  'from-[#3a7ac4] to-[#1a3a7a]',
  'from-[#c76b8a] to-[#5b3a63]',
];

function BitChordLibraryView({
  playlists = [],
  favorites = [],
  likedSongs,
  history = [],
  initialSubTab = 'playlists',
  onPlayPlaylist,
  onPlayTrack,
  onSelectPlaylist,
  onOpenImportModal,
  onOpenLoginModal,
  onNavigate,
  onViewChange,
  ytUser,
}) {
  const effectiveLiked = Array.isArray(likedSongs) ? likedSongs : favorites;
  const [subTab, setSubTab] = useState(initialSubTab); // 'playlists' | 'favorites' | 'history'
  const [downloadCount, setDownloadCount] = useState(0);
  const [localCount, setLocalCount] = useState(() => localMusicService.getCachedCount());
  const [isScanningLocal, setIsScanningLocal] = useState(false);
  const [replayStats, setReplayStats] = useState(() => historyService.getReplayStats());
  const [showAllPlaylists, setShowAllPlaylists] = useState(false);
  const displayedPlaylists = showAllPlaylists ? playlists : playlists.slice(0, 4);

  useEffect(() => {
    let isMounted = true;
    const fetchDownloads = async () => {
      try {
        const tracks = await downloadService.getDownloadedTracks();
        if (isMounted) setDownloadCount(tracks.length);
      } catch {}
    };
    fetchDownloads();

    const handleDownloadChange = () => {
      fetchDownloads();
    };

    const handleLocalChange = (e) => {
      if (typeof e.detail?.count === 'number') {
        if (isMounted) setLocalCount(e.detail.count);
      } else {
        if (isMounted) setLocalCount(localMusicService.getCachedCount());
      }
    };

    window.addEventListener('liquid_download_changed', handleDownloadChange);
    window.addEventListener('liquid_local_music_changed', handleLocalChange);

    const handleStorage = (e) => {
      if (!e || e.key === 'playback_history') {
        setReplayStats(historyService.getReplayStats());
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener('liquid_download_changed', handleDownloadChange);
      window.removeEventListener('liquid_local_music_changed', handleLocalChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    setReplayStats(historyService.getReplayStats());
  }, [history]);

  const handleScanLocal = async (e) => {
    e?.stopPropagation();
    setIsScanningLocal(true);
    try {
      const tracks = await localMusicService.scanLocalMusic();
      setLocalCount(tracks.length);
      if (onNavigate) onNavigate('local-music');
      else if (onViewChange) onViewChange('local-music');
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanningLocal(false);
    }
  };

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 select-none scrollbar-none text-white pb-36 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-im-line">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Library
          </h1>
          <p className="text-xs mt-1 text-im-inkFaint font-medium">
            Synced YouTube Music playlists, favorites & listening history
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenImportModal}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-im-card hover:bg-im-card2 border border-im-line text-white shadow-sm hover:scale-105 active:scale-95"
          >
            <FolderPlus size={14} />
            <span>Import Playlist URL</span>
          </button>

          <button
            onClick={onOpenLoginModal}
            className="px-4 py-2 rounded-xl bg-white hover:bg-white/90 text-black text-xs font-bold transition-all shadow-sm border border-white/20 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <RefreshCw size={13} />
            <span>{ytUser ? 'Sync Google Account' : 'Connect YouTube Account'}</span>
          </button>
        </div>
      </div>

      {/* Your Replay Card */}
      <div
        onClick={() => setSubTab('history')}
        className="group relative w-full p-4 sm:p-5 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01] bg-gradient-to-r from-[#4a0d16] via-[#2c080e] to-[#1a0408] border border-rose-900/40 hover:border-rose-500/40 shadow-im-float flex items-center justify-between"
      >
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Your Replay</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {replayStats.year}
              </span>
            </h3>
            <p className="text-xs sm:text-sm font-medium text-rose-200/80 mt-0.5">
              {replayStats.minutesListened} minutes listened · {replayStats.playCount} plays · {replayStats.year}
            </p>
          </div>
        </div>

        <div className="relative z-10 w-8 h-8 rounded-full bg-white/10 group-hover:bg-white text-white group-hover:text-black flex items-center justify-center transition-colors flex-shrink-0">
          <ChevronRight size={16} />
        </div>
      </div>

      {/* Sub-tabs: Playlists | Liked Songs | History */}
      <div className="flex items-center gap-1.5 p-1 rounded-full w-fit bg-im-card border border-im-line shadow-inner">
        <button
          onClick={() => setSubTab('playlists')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'playlists'
              ? 'bg-white text-black font-bold shadow-sm'
              : 'text-im-inkSoft hover:text-white hover:bg-white/5'
          }`}
        >
          <ListMusic size={14} className={subTab === 'playlists' ? 'text-black' : 'text-im-inkSoft'} />
          <span>Playlists ({playlists.length})</span>
        </button>

        <button
          onClick={() => setSubTab('favorites')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'favorites' || subTab === 'liked'
              ? 'bg-white text-black font-bold shadow-sm'
              : 'text-im-inkSoft hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart size={14} fill={(subTab === 'favorites' || subTab === 'liked') ? 'currentColor' : 'none'} className={(subTab === 'favorites' || subTab === 'liked') ? 'text-rose-500' : 'text-im-inkSoft'} />
          <span>Liked Songs ({effectiveLiked.length})</span>
        </button>

        <button
          onClick={() => setSubTab('history')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'history'
              ? 'bg-white text-black font-bold shadow-sm'
              : 'text-im-inkSoft hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock size={14} className={subTab === 'history' ? 'text-black' : 'text-im-inkSoft'} />
          <span>History ({history.length})</span>
        </button>

        <button
          onClick={() => (onNavigate ? onNavigate('downloads') : onViewChange?.('downloads'))}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 text-im-inkSoft hover:text-white hover:bg-white/5"
        >
          <ArrowDownToLine size={14} className="text-emerald-400" />
          <span>Downloads ({downloadCount})</span>
        </button>

        <button
          onClick={() => (onNavigate ? onNavigate('local-music') : onViewChange?.('local-music'))}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 text-im-inkSoft hover:text-white hover:bg-white/5"
        >
          <HardDrive size={14} className="text-blue-400" />
          <span>Local Music {localCount > 0 ? `(${localCount})` : ''}</span>
        </button>
      </div>

      {/* 1. Playlists Tab Content */}
      {subTab === 'playlists' && (
        <div className="space-y-6">
          {/* Quick Access Tiles: Downloads and Local Music */}
          <div className="grid grid-cols-2 gap-4">
            {/* Downloads Quick-Access Card / Tile */}
            <div
              onClick={() => (onNavigate ? onNavigate('downloads') : onViewChange?.('downloads'))}
              className="group relative p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.01] bg-gradient-to-br from-emerald-950/40 via-im-card to-im-card2 border border-emerald-500/30 hover:border-emerald-400/50 shadow-sm hover:shadow-im-float"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 border border-emerald-500/20 shadow-xs bg-gradient-to-br from-emerald-600/30 to-teal-800/30 flex items-center justify-center">
                <ArrowDownToLine size={38} className="text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              </div>

              <div>
                <h4 className="text-xs font-bold truncate transition-colors text-white group-hover:underline flex items-center gap-1.5">
                  <span>Downloads</span>
                </h4>
                <p className="text-[11px] font-medium truncate mt-0.5 text-emerald-400">
                  {downloadCount} {downloadCount === 1 ? 'track' : 'tracks'} • Offline Ready
                </p>
              </div>
            </div>

            {/* Local Music Quick-Access Card / Tile */}
            <div
              onClick={() => (onNavigate ? onNavigate('local-music') : onViewChange?.('local-music'))}
              className="group relative p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.01] bg-gradient-to-br from-blue-950/40 via-im-card to-im-card2 border border-blue-500/30 hover:border-blue-400/50 shadow-sm hover:shadow-im-float"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 border border-blue-500/20 shadow-xs bg-gradient-to-br from-blue-600/30 to-indigo-800/30 flex items-center justify-center">
                <HardDrive size={38} className="text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>

              <div>
                <h4 className="text-xs font-bold truncate transition-colors text-white group-hover:underline flex items-center gap-1.5">
                  <span>Local Music</span>
                </h4>
                {localCount > 0 ? (
                  <p className="text-[11px] font-medium truncate mt-0.5 text-blue-400">
                    {localCount} {localCount === 1 ? 'file' : 'files'} • Device Storage
                  </p>
                ) : (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-im-inkFaint">No files scanned</span>
                    <button
                      type="button"
                      onClick={handleScanLocal}
                      disabled={isScanningLocal}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white border border-blue-500/30 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw size={9} className={isScanningLocal ? 'animate-spin' : ''} />
                      <span>{isScanningLocal ? '...' : 'Scan for music'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Playlists Section with Show All Link */}
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Playlists
              </h2>
              <button
                type="button"
                onClick={() => setShowAllPlaylists((prev) => !prev)}
                className="text-xs font-semibold text-im-inkSoft hover:text-white transition-colors cursor-pointer hover:underline"
              >
                {showAllPlaylists ? 'Show less' : 'Show all'}
              </button>
            </div>

            {playlists.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-im-card rounded-2xl border border-im-line p-6">
                <ListMusic size={32} className="mx-auto text-im-inkFaint opacity-60" />
                <h3 className="text-sm font-bold text-white">No playlists yet</h3>
                <p className="text-xs text-im-inkFaint max-w-sm mx-auto">
                  Import YouTube playlists using the button above or save your favorite albums.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {displayedPlaylists.map((pl, idx) => (
                  <div
                    key={pl.id}
                    onClick={() => onSelectPlaylist(pl.id)}
                    className="group flex flex-col cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                  >
                    <div className={`relative aspect-square w-full rounded-2xl overflow-hidden mb-2.5 border border-im-line shadow-sm hover:shadow-im-float bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]}`}>
                      <img
                        loading="lazy"
                        decoding="async"
                        src={pl.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500'}
                        alt={pl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Floating Play Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayPlaylist(pl);
                        }}
                        aria-label="Play playlist"
                        className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg border border-white/20 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all cursor-pointer"
                      >
                        <Play size={16} className="fill-current ml-0.5 text-black" />
                      </button>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:underline">
                      {pl.title}
                    </h4>
                    <p className="text-[11px] font-medium text-im-inkFaint truncate mt-0.5">
                      {pl.tracks?.length || 0} tracks • {pl.author || 'YouTube'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* 2. Liked Songs Tab Content */}
      {(subTab === 'favorites' || subTab === 'liked') && (
        <div>
          {effectiveLiked.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-im-inkFaint bg-im-card rounded-2xl border border-im-line">
              <Heart size={32} className="mx-auto opacity-40 text-rose-500" />
              <p className="text-sm font-semibold text-white">No liked songs yet</p>
              <p className="text-xs text-im-inkFaint">Click the heart icon on any playing song to add it here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {effectiveLiked.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-im-card hover:bg-im-card2 border border-im-line shadow-sm hover:shadow-im-float transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-5 text-center text-xs font-mono text-im-inkFaint font-medium">
                      {i + 1}
                    </span>

                    {/* 46px rounded-xl thumbnail */}
                    <div className={`relative w-[46px] h-[46px] rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[i % ROW_GRADIENTS.length]} border border-im-line shadow-xs`}>
                      <img
                        loading="lazy"
                        decoding="async"
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={14} className="fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:underline">
                        {track.title}
                      </h4>
                      <p className="text-[11px] font-medium text-im-inkFaint truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                    <span className="text-[11px] font-mono text-im-inkFaint">
                      {formatTime(track.duration)}
                    </span>
                    <Heart size={16} className="text-rose-500 fill-current" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. History Tab Content */}
      {subTab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-im-inkFaint bg-im-card rounded-2xl border border-im-line">
              <Clock size={32} className="mx-auto opacity-40 text-im-inkFaint" />
              <p className="text-sm font-semibold text-white">No playback history yet</p>
              <p className="text-xs text-im-inkFaint">Songs you listen to will be recorded here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((track, i) => (
                <div
                  key={`${track.id}-${i}`}
                  onClick={() => onPlayTrack(track)}
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-im-card hover:bg-im-card2 border border-im-line shadow-sm hover:shadow-im-float transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-5 text-center text-xs font-mono text-im-inkFaint font-medium">
                      {i + 1}
                    </span>

                    {/* 46px rounded-xl thumbnail */}
                    <div className={`relative w-[46px] h-[46px] rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[i % ROW_GRADIENTS.length]} border border-im-line shadow-xs`}>
                      <img
                        loading="lazy"
                        decoding="async"
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={14} className="fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:underline">
                        {track.title}
                      </h4>
                      <p className="text-[11px] font-medium text-im-inkFaint truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-im-inkFaint ml-2 flex-shrink-0">
                    {formatTime(track.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(BitChordLibraryView);
