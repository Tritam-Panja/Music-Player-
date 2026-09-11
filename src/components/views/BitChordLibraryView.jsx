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
  const isDark = theme === 'dark';
  const [subTab, setSubTab] = useState('playlists'); // 'playlists' | 'favorites' | 'history'

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
        isDark ? 'border-[#262933]' : 'border-[#e8e2d8]'
      }`}>
        <div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
          }`}>
            Your Music Library
          </h2>
          <p className={`text-xs mt-1 ${
            isDark ? 'text-[#828694]' : 'text-[#8f8075]'
          }`}>
            Synced YouTube Music playlists, favorites & listening history
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenImportModal}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              isDark 
                ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8] hover:scale-105 active:scale-95' 
                : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b] hover:scale-105 active:scale-95'
            }`}
          >
            <FolderPlus size={14} />
            <span>Import Playlist URL</span>
          </button>

          <button
            onClick={onOpenLoginModal}
            className="px-4 py-2.5 rounded-2xl bg-[#3c2b20] hover:bg-[#4d3729] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <RefreshCw size={13} />
            <span>{ytUser ? 'Sync Google Account' : 'Connect YouTube Account'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs: Playlists | Liked Songs | History */}
      <div className={`flex items-center gap-2 p-1 rounded-2xl w-fit ${
        isDark ? 'bg-[#111215] neu-groove-inset neu-dark' : 'bg-[#e8e2d8] neu-groove-inset'
      }`}>
        <button
          onClick={() => setSubTab('playlists')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'playlists'
              ? isDark 
                ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]' 
                : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
              : isDark 
                ? 'text-[#828694] hover:text-[#f3efe8]' 
                : 'text-[#8f8075] hover:text-[#2e221b]'
          }`}
        >
          <ListMusic size={14} />
          <span>Playlists ({playlists.length})</span>
        </button>

        <button
          onClick={() => setSubTab('favorites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'favorites'
              ? isDark 
                ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]' 
                : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
              : isDark 
                ? 'text-[#828694] hover:text-[#f3efe8]' 
                : 'text-[#8f8075] hover:text-[#2e221b]'
          }`}
        >
          <Heart size={14} fill={subTab === 'favorites' ? 'currentColor' : 'none'} className={subTab === 'favorites' ? 'text-rose-500' : ''} />
          <span>Favorites ({favorites.length})</span>
        </button>

        <button
          onClick={() => setSubTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'history'
              ? isDark 
                ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]' 
                : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
              : isDark 
                ? 'text-[#828694] hover:text-[#f3efe8]' 
                : 'text-[#8f8075] hover:text-[#2e221b]'
          }`}
        >
          <Clock size={14} />
          <span>History ({history.length})</span>
        </button>
      </div>

      {/* 1. Playlists Tab Content */}
      {subTab === 'playlists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className={`group relative p-3.5 rounded-3xl transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] ${
                isDark 
                  ? 'bg-[#1b1d23] neu-card-shadow neu-dark' 
                  : 'bg-[#faf9f6] neu-card-shadow'
              }`}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-md">
                <img
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
                  className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-[#3c2b20] text-white flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all cursor-pointer"
                >
                  <Play size={16} className="fill-current ml-0.5" />
                </button>
              </div>

              <div>
                <h4 className={`text-xs font-bold truncate transition-colors ${
                  isDark ? 'text-[#f3efe8] group-hover:text-[#c4956a]' : 'text-[#2e221b] group-hover:text-[#3c2b20]'
                }`}>
                  {pl.title}
                </h4>
                <p className={`text-[11px] truncate mt-0.5 ${
                  isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                }`}>
                  {pl.tracks?.length || 0} tracks • {pl.author || 'YouTube'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Favorites Tab Content */}
      {subTab === 'favorites' && (
        <div className={`p-4 rounded-3xl ${
          isDark ? 'bg-[#1b1d23] neu-card-shadow neu-dark' : 'bg-[#faf9f6] neu-card-shadow'
        }`}>
          {favorites.length === 0 ? (
            <div className={`py-16 text-center space-y-2 ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
              <Heart size={32} className="mx-auto opacity-40 text-rose-500" />
              <p className="text-sm font-semibold">No favorites yet</p>
              <p className="text-xs opacity-75">Click the heart icon on any playing song to add it here</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {favorites.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group ${
                    isDark 
                      ? 'hover:bg-[#232630] text-[#f3efe8]' 
                      : 'hover:bg-[#ece6dc] text-[#2e221b]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`w-5 text-center text-xs font-mono ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                      {i + 1}
                    </span>
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-11 h-11 rounded-xl object-cover shadow-sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">
                        {track.title}
                      </p>
                      <p className={`text-[11px] truncate ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-mono ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
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
        <div className={`p-4 rounded-3xl ${
          isDark ? 'bg-[#1b1d23] neu-card-shadow neu-dark' : 'bg-[#faf9f6] neu-card-shadow'
        }`}>
          {history.length === 0 ? (
            <div className={`py-16 text-center space-y-2 ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
              <Clock size={32} className="mx-auto opacity-40" />
              <p className="text-sm font-semibold">No playback history yet</p>
              <p className="text-xs opacity-75">Songs you listen to will be recorded here</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {history.map((track, i) => (
                <div
                  key={`${track.id}-${i}`}
                  onClick={() => onPlayTrack(track)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group ${
                    isDark 
                      ? 'hover:bg-[#232630] text-[#f3efe8]' 
                      : 'hover:bg-[#ece6dc] text-[#2e221b]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`w-5 text-center text-xs font-mono ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                      {i + 1}
                    </span>
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-11 h-11 rounded-xl object-cover shadow-sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">
                        {track.title}
                      </p>
                      <p className={`text-[11px] truncate ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-mono ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
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
