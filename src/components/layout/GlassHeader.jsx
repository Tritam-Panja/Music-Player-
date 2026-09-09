import React from 'react';
import { Search, Minus, Square, X } from 'lucide-react';
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

  const handleMinimize = () => window.electronAPI?.minimize();
  const handleMaximize = () => window.electronAPI?.maximize();
  const handleClose = () => window.electronAPI?.close();

  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-white/[0.06] bg-[#07080c]/60 backdrop-blur-2xl z-20 app-drag-region">
      {/* Search Capsule */}
      <div className="flex items-center gap-3 flex-1 max-w-md app-no-drag">
        <div className="relative w-full">
          <Search 
            size={15} 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" 
          />
          <input
            type="text"
            placeholder="Search songs, artists, playlists..."
            value={searchQuery}
            onFocus={() => {
              if (currentView !== 'search') onNavigate('search');
            }}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (currentView !== 'search') onNavigate('search');
            }}
            className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] text-white placeholder-slate-500 text-xs pl-9 pr-14 py-2 rounded-xl border border-white/[0.06] focus:border-white/20 outline-none transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5 pointer-events-none">
            Ctrl K
          </span>
        </div>
      </div>

      {/* Right User & Window Controls */}
      <div className="flex items-center gap-2.5 app-no-drag">
        {user ? (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
            title="Connected YouTube Account"
          >
            <img
              src={user.picture}
              alt={user.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-slate-200 max-w-[110px] truncate">
              {user.name}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 text-xs font-medium transition-all"
            title="Sign In with YouTube"
          >
            <YoutubeIcon size={14} className="text-red-500" />
            <span>Sign In</span>
          </button>
        )}

        {/* Electron Window Controls */}
        {isElectron && (
          <div className="flex items-center gap-0.5 ml-2 border-l border-white/[0.06] pl-2">
            <button
              onClick={handleMinimize}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Minimize"
            >
              <Minus size={13} />
            </button>
            <button
              onClick={handleMaximize}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Maximize"
            >
              <Square size={11} />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/80 transition-colors"
              title="Close"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
