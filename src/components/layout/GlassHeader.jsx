import React from 'react';
import { Search, Minus, Square, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import YoutubeIcon from '../ui/YoutubeIcon';

export default function GlassHeader({
  searchQuery,
  onSearchChange,
  onOpenImportModal,
  currentView,
  onNavigate
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

      {/* Right Controls */}
      <div className="flex items-center gap-3 app-no-drag">
        {/* Connect YT Playlist quick button */}
        <button
          onClick={onOpenImportModal}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <YoutubeIcon size={15} className="text-red-400" />
          <span>Sync YouTube</span>
        </button>

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
