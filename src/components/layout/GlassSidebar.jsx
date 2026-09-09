import React from 'react';
import { 
  Home, 
  Search, 
  Heart, 
  Plus, 
  Library, 
  Radio, 
  Trash2,
  ExternalLink 
} from 'lucide-react';
import YoutubeIcon from '../ui/YoutubeIcon';

export default function GlassSidebar({
  currentView,
  selectedPlaylistId,
  playlists,
  favoritesCount,
  user,
  onNavigate,
  onOpenImportModal,
  onOpenLoginModal,
  onDeletePlaylist
}) {
  return (
    <aside className="w-60 h-full flex flex-col glass-panel border-r border-white/[0.06] select-none flex-shrink-0 z-20">
      {/* Brand & Logo */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm shadow-sm">
            L
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight">
              Liquid Music
            </h1>
            <span className="text-[10px] text-slate-500 font-medium block">
              Free • Lossless
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-3 space-y-0.5">
        <button
          onClick={() => onNavigate('home')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'home'
              ? 'bg-white/10 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Home size={16} />
          <span>Home</span>
        </button>

        <button
          onClick={() => onNavigate('search')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'search'
              ? 'bg-white/10 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Search size={16} />
          <span>Search & Explore</span>
        </button>

        <button
          onClick={() => onNavigate('favorites')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'favorites'
              ? 'bg-white/10 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Heart size={16} className={currentView === 'favorites' ? 'text-rose-500 fill-rose-500' : ''} />
          <span className="flex-1 text-left">Liked Songs</span>
          {favoritesCount > 0 && (
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
              {favoritesCount}
            </span>
          )}
        </button>
      </div>

      <div className="my-3 mx-4 border-t border-white/[0.06]" />

      {/* Library Section */}
      <div className="px-4 flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Playlists
        </span>
        <button
          onClick={onOpenImportModal}
          className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors"
          title="Import Playlist URL"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* YouTube Connect Chip */}
      <div className="px-3 mb-2">
        {user ? (
          <button
            onClick={onOpenLoginModal}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-medium text-slate-300 transition-all"
          >
            <img src={user.picture} alt={user.name} className="w-4 h-4 rounded-full object-cover" />
            <span className="truncate flex-1 text-left text-[11px] font-semibold text-white">{user.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[11px] font-medium text-slate-400 hover:text-white transition-all"
          >
            <YoutubeIcon size={14} className="text-red-500" />
            <span className="truncate">Sign In to YouTube</span>
          </button>
        )}
      </div>

      {/* Playlists List */}
      <div className="flex-1 overflow-y-auto px-2.5 space-y-0.5">
        {playlists.map((pl) => {
          const isSelected = currentView === 'playlist' && selectedPlaylistId === pl.id;
          return (
            <div
              key={pl.id}
              onClick={() => onNavigate('playlist', pl.id)}
              className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <img
                src={pl.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                alt={pl.title}
                className="w-7 h-7 rounded-lg object-cover flex-shrink-0 border border-white/5"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs">{pl.title}</p>
              </div>

              {pl.id !== 'chill-lofi-beats' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Remove playlist "${pl.title}"?`)) {
                      onDeletePlaylist(pl.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                  title="Remove"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3.5 border-t border-white/[0.06] text-[10px] text-slate-500 flex items-center justify-between">
        <span>v1.2 • Open Source</span>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noreferrer" 
          className="hover:text-slate-300 transition-colors"
        >
          GitHub
        </a>
      </div>
    </aside>
  );
}
