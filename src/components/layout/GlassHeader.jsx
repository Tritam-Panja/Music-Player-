import React from 'react';
import { Search, Minus, Square, X, Sparkles, User, UserCheck } from 'lucide-react';
import YoutubeIcon from '../ui/YoutubeIcon';

export default function GlassHeader({
  searchQuery,
  onSearchChange,
  onOpenLoginModal,
  currentView,
  onNavigate,
  user
}) {
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

  const handleMinimize = () => {
    if (window.electronAPI) window.electronAPI.minimize();
  };

  const handleMaximize = () => {
    if (window.electronAPI) window.electronAPI.maximize();
  };

  const handleClose = () => {
    if (window.electronAPI) window.electronAPI.close();
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-white/[0.015] backdrop-blur-xl z-20 app-drag-region">
      {/* Search Input Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-lg app-no-drag">
        <div className="relative w-full">
          <Search 
            size={17} 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" 
          />
          <input
            type="text"
            placeholder="Search YouTube songs, artists, playlists..."
            value={searchQuery}
            onFocus={() => {
              if (currentView !== 'search') onNavigate('search');
            }}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (currentView !== 'search') onNavigate('search');
            }}
            className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 text-white placeholder-slate-400 text-sm pl-10 pr-4 py-2 rounded-2xl border border-white/10 focus:border-cyan-400/50 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls & YouTube Account Status */}
      <div className="flex items-center gap-3 app-no-drag">
        {user ? (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            title="Connected YouTube Account"
          >
            <img
              src={user.picture}
              alt={user.name}
              className="w-6 h-6 rounded-full object-cover border border-white/20"
            />
            <span className="text-xs font-semibold text-white max-w-[120px] truncate">
              {user.name}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-xs font-semibold transition-all hover:scale-[1.02]"
            title="Connect your YouTube Account"
          >
            <YoutubeIcon size={16} className="text-red-400" />
            <span>Sign In with YouTube</span>
          </button>
        )}

        {/* Electron Window Controls */}
        {isElectron && (
          <div className="flex items-center gap-1 ml-3 border-l border-white/10 pl-3">
            <button
              onClick={handleMinimize}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Minimize"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={handleMaximize}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Maximize"
            >
              <Square size={12} />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/80 transition-colors"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
