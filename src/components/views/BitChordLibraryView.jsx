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
  ExternalLink
} from 'lucide-react';
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
  ytUser,
}) {
  const effectiveLiked = Array.isArray(likedSongs) ? likedSongs : favorites;
  const [subTab, setSubTab] = useState(initialSubTab); // 'playlists' | 'favorites' | 'history'

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
      </div>

      {/* 1. Playlists Tab Content */}
      {subTab === 'playlists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((pl, idx) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className="group relative p-3.5 rounded-xl transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.01] bg-im-card hover:bg-im-card2 border border-im-line shadow-sm hover:shadow-im-float"
            >
              <div className={`relative aspect-square rounded-lg overflow-hidden mb-3 border border-im-line shadow-xs bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]}`}>
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
                  className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-md border border-white/20 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all cursor-pointer"
                >
                  <Play size={15} className="fill-current ml-0.5 text-black" />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold truncate transition-colors text-white group-hover:underline">
                  {pl.title}
                </h4>
                <p className="text-[11px] font-medium truncate mt-0.5 text-im-inkFaint">
                  {pl.tracks?.length || 0} tracks • {pl.author || 'YouTube'}
                </p>
              </div>
            </div>
          ))}
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
