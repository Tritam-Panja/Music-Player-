import React from 'react';
import { 
  Home, 
  Search, 
  Heart, 
  PlusCircle, 
  Library, 
  Radio, 
  Music2, 
  Trash2, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';

export default function GlassSidebar({
  currentView,
  selectedPlaylistId,
  playlists,
  favoritesCount,
  onNavigate,
  onOpenImportModal,
  onDeletePlaylist
}) {
  return (
    <aside className="w-64 h-full flex flex-col glass-panel border-r border-white/10 select-none flex-shrink-0 z-20">
      {/* Brand & Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-0.5 shadow-neon-cyan/40 shadow-lg flex items-center justify-center">
          <div className="w-full h-full bg-[#0d0e15] rounded-[14px] flex items-center justify-center">
            <Music2 size={20} className="text-cyan-400" />
          </div>
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-300 tracking-tight">
            Liquid Music
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400/80 block">
            Open Source • 0 Ads
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-4 space-y-1">
        <button
          onClick={() => onNavigate('home')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
            currentView === 'home'
              ? 'bg-white/10 text-white shadow-glass-sm border border-white/15'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Home size={18} className={currentView === 'home' ? 'text-cyan-400' : ''} />
          <span>Home</span>
        </button>

        <button
          onClick={() => onNavigate('search')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
            currentView === 'search'
              ? 'bg-white/10 text-white shadow-glass-sm border border-white/15'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Search size={18} className={currentView === 'search' ? 'text-cyan-400' : ''} />
          <span>Search & YouTube</span>
        </button>

        <button
          onClick={() => onNavigate('favorites')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
            currentView === 'favorites'
              ? 'bg-white/10 text-white shadow-glass-sm border border-white/15'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart size={18} className={currentView === 'favorites' ? 'text-pink-500 fill-pink-500' : ''} />
          <span className="flex-1 text-left">Liked Songs</span>
          {favoritesCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
              {favoritesCount}
            </span>
          )}
        </button>
      </div>

      <div className="my-4 mx-5 border-t border-white/10" />

      {/* Library & YouTube Playlists */}
      <div className="px-5 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Library size={15} />
          <span>Your Playlists</span>
        </div>
        <button
          onClick={onOpenImportModal}
          className="text-cyan-400 hover:text-cyan-300 p-1 hover:bg-cyan-500/10 rounded-lg transition-colors"
          title="Import YouTube Playlist"
        >
          <PlusCircle size={18} />
        </button>
      </div>

      {/* Import YT Playlist CTA Glass Card */}
      <div className="px-4 mb-3">
        <button
          onClick={onOpenImportModal}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-red-600/20 via-purple-600/20 to-cyan-600/20 hover:from-red-600/30 hover:to-cyan-600/30 border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-white transition-all group"
        >
          <div className="w-6 h-6 rounded-lg bg-red-600/80 flex items-center justify-center text-white">
            <Radio size={14} />
          </div>
          <span className="truncate">Connect YT Playlist</span>
          <Sparkles size={13} className="ml-auto text-cyan-400 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Playlists List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {playlists.map((pl) => {
          const isSelected = currentView === 'playlist' && selectedPlaylistId === pl.id;
          return (
            <div
              key={pl.id}
              onClick={() => onNavigate('playlist', pl.id)}
              className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-white/10 text-white border-white/20 font-medium'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <img
                src={pl.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                alt={pl.title}
                className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold">{pl.title}</p>
                <p className="text-[11px] text-slate-500 truncate">{pl.tracks?.length || 0} tracks</p>
              </div>

              {/* Delete Custom Playlist button */}
              {pl.id !== 'chill-lofi-beats' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Remove playlist "${pl.title}"?`)) {
                      onDeletePlaylist(pl.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                  title="Remove Playlist"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Liquid v1.0
        </span>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noreferrer" 
          className="hover:text-slate-300 flex items-center gap-1 transition-colors"
        >
          GitHub <ExternalLink size={11} />
        </a>
      </div>
    </aside>
  );
}
