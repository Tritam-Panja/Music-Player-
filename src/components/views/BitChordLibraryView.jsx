import React, { useState } from 'react';
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
  'from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2]',
  'from-[#cfe0f5] via-[#e3d3f2] to-[#f2d9e6]',
  'from-[#f2d9e6] via-[#bdeee0] to-[#cfe0f5]',
  'from-[#dff3ea] via-[#e9e6f7] to-[#bdeee0]',
  'from-[#fed6e3] via-[#a8edea] to-[#cfe0f5]',
];

function BitChordLibraryView({
  playlists = [],
  favorites = [],
  history = [],
  onPlayPlaylist,
  onPlayTrack,
  onSelectPlaylist,
  onOpenImportModal,
  onOpenLoginModal,
  ytUser,
  theme = 'light'
}) {
  const [subTab, setSubTab] = useState('playlists'); // 'playlists' | 'favorites' | 'history'

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 select-none scrollbar-none text-ui2-ink dark:text-white pb-36 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ui2-ink dark:text-white">
            Your Music Library
          </h2>
          <p className="text-xs mt-1 text-ui2-inkSoft dark:text-white/50 font-medium">
            Synced YouTube Music playlists, favorites & listening history
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenImportModal}
            className="px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-white/70 hover:bg-white/90 dark:bg-white/10 dark:hover:bg-white/15 border border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none text-ui2-ink dark:text-white hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            <FolderPlus size={14} />
            <span>Import Playlist URL</span>
          </button>

          <button
            onClick={onOpenLoginModal}
            className="px-4 py-2 rounded-2xl bg-white/90 hover:bg-white dark:bg-white dark:hover:bg-white/90 text-ui2-accentInk dark:text-black text-xs font-bold transition-all shadow-ui2-soft border border-black/5 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            <RefreshCw size={13} />
            <span>{ytUser ? 'Sync Google Account' : 'Connect YouTube Account'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs: Playlists | Liked Songs | History */}
      <div className="flex items-center gap-2 p-1 rounded-2xl w-fit bg-white/50 dark:bg-white/[0.06] backdrop-blur-md border border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none">
        <button
          onClick={() => setSubTab('playlists')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'playlists'
              ? 'bg-white/80 dark:bg-white/20 text-ui2-ink dark:text-white border border-black/5 dark:border-white/15 shadow-ui2-soft dark:shadow-none'
              : 'text-ui2-inkSoft dark:text-white/60 hover:text-ui2-ink dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10'
          }`}
        >
          <ListMusic size={14} />
          <span>Playlists ({playlists.length})</span>
        </button>

        <button
          onClick={() => setSubTab('favorites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'favorites'
              ? 'bg-white/80 dark:bg-white/20 text-ui2-ink dark:text-white border border-black/5 dark:border-white/15 shadow-ui2-soft dark:shadow-none'
              : 'text-ui2-inkSoft dark:text-white/60 hover:text-ui2-ink dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10'
          }`}
        >
          <Heart size={14} fill={subTab === 'favorites' ? 'currentColor' : 'none'} className={subTab === 'favorites' ? 'text-rose-500' : ''} />
          <span>Favorites ({favorites.length})</span>
        </button>

        <button
          onClick={() => setSubTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'history'
              ? 'bg-white/80 dark:bg-white/20 text-ui2-ink dark:text-white border border-black/5 dark:border-white/15 shadow-ui2-soft dark:shadow-none'
              : 'text-ui2-inkSoft dark:text-white/60 hover:text-ui2-ink dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10'
          }`}
        >
          <Clock size={14} />
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
              className="group relative p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.01] bg-white/70 hover:bg-white/90 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none hover:shadow-ui2-soft"
            >
              <div className={`relative aspect-square rounded-xl overflow-hidden mb-3 shadow-xs border border-black/5 dark:border-white/10 bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]}`}>
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
                  className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-white dark:bg-white text-ui2-accentInk dark:text-black flex items-center justify-center shadow-ui2-soft border border-black/5 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all cursor-pointer"
                >
                  <Play size={15} className="fill-current ml-0.5" />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold truncate transition-colors text-ui2-ink dark:text-white group-hover:text-ui2-accentInk dark:group-hover:text-white group-hover:underline">
                  {pl.title}
                </h4>
                <p className="text-[11px] font-medium truncate mt-0.5 text-ui2-inkSoft dark:text-white/50">
                  {pl.tracks?.length || 0} tracks • {pl.author || 'YouTube'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Favorites Tab Content */}
      {subTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-ui2-inkSoft dark:text-white/50 bg-white/40 dark:bg-white/[0.04] rounded-3xl border border-black/5 dark:border-white/10">
              <Heart size={32} className="mx-auto opacity-40 text-rose-500" />
              <p className="text-sm font-semibold text-ui2-ink dark:text-white">No favorites yet</p>
              <p className="text-xs opacity-75">Click the heart icon on any playing song to add it here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {favorites.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/70 hover:bg-white/90 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none hover:shadow-ui2-soft transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-5 text-center text-xs font-mono text-ui2-inkFaint dark:text-white/40 font-medium">
                      {i + 1}
                    </span>

                    {/* 46px rounded-xl thumbnail (gradient placeholder, vary the gradient per row) */}
                    <div className={`relative w-[46px] h-[46px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[i % ROW_GRADIENTS.length]} shadow-xs border border-black/5 dark:border-white/10`}>
                      <img
                        loading="lazy"
                        decoding="async"
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={14} className="fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-ui2-ink dark:text-white truncate group-hover:text-ui2-accentInk dark:group-hover:text-white group-hover:underline">
                        {track.title}
                      </h4>
                      <p className="text-[11px] font-medium text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                    <span className="text-[11px] font-mono text-ui2-inkFaint dark:text-white/40">
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
            <div className="py-16 text-center space-y-2 text-ui2-inkSoft dark:text-white/50 bg-white/40 dark:bg-white/[0.04] rounded-3xl border border-black/5 dark:border-white/10">
              <Clock size={32} className="mx-auto opacity-40 text-ui2-inkFaint dark:text-white/40" />
              <p className="text-sm font-semibold text-ui2-ink dark:text-white">No playback history yet</p>
              <p className="text-xs opacity-75">Songs you listen to will be recorded here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((track, i) => (
                <div
                  key={`${track.id}-${i}`}
                  onClick={() => onPlayTrack(track)}
                  className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/70 hover:bg-white/90 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none hover:shadow-ui2-soft transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-5 text-center text-xs font-mono text-ui2-inkFaint dark:text-white/40 font-medium">
                      {i + 1}
                    </span>

                    {/* 46px rounded-xl thumbnail (gradient placeholder, vary the gradient per row) */}
                    <div className={`relative w-[46px] h-[46px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[i % ROW_GRADIENTS.length]} shadow-xs border border-black/5 dark:border-white/10`}>
                      <img
                        loading="lazy"
                        decoding="async"
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={14} className="fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-ui2-ink dark:text-white truncate group-hover:text-ui2-accentInk dark:group-hover:text-white group-hover:underline">
                        {track.title}
                      </h4>
                      <p className="text-[11px] font-medium text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-ui2-inkFaint dark:text-white/40 ml-2 flex-shrink-0">
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
