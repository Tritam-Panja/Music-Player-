import React from 'react';
import { Search, Disc3, Library, Sparkles, User, LogIn, ExternalLink } from 'lucide-react';
import YoutubeIcon from '../ui/YoutubeIcon';

export default function BitChordNavbar({
  currentView,
  onViewChange,
  onOpenSearch,
  onOpenLogin,
  ytUser
}) {
  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 py-2.5 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onViewChange('player')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-sky-400/20 via-white/10 to-purple-500/20 border border-white/15 backdrop-blur-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Disc3 size={16} className="text-white group-hover:rotate-180 transition-transform duration-700 sm:w-[18px] sm:h-[18px]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky-400 ring-2 ring-[#07090e]" />
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white whitespace-nowrap">Liquid Music</span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.2 rounded bg-white/[0.08] text-sky-400 border border-white/[0.06]">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5 hidden sm:block">Player-First Edition</p>
          </div>
        </div>

        {/* Center: Spotlight Search Capsule Trigger (Ctrl + K) */}
        <div className="flex-1 max-w-md hidden sm:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-4 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 backdrop-blur-2xl text-slate-400 hover:text-white transition-all shadow-lg cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <Search size={14} className="text-slate-400 group-hover:text-sky-400 transition-colors" />
              <span>Search songs, albums, artists...</span>
            </div>
            <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 group-hover:text-slate-200">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Navigation & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
            title="Search"
          >
            <Search size={15} />
          </button>

          {/* Player vs Library View Switcher */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
            <button
              onClick={() => onViewChange('player')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                currentView === 'player'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Player
            </button>

            <button
              onClick={() => onViewChange('library')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                currentView === 'library'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Library size={12} className="sm:w-[13px] sm:h-[13px]" />
              <span>Library</span>
            </button>
          </div>

          {/* YouTube / Google Account Chip */}
          <button
            onClick={onOpenLogin}
            title={ytUser ? ytUser.name : "Connect Google"}
            className="flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/15 backdrop-blur-xl transition-all cursor-pointer"
          >
            {ytUser ? (
              <>
                <img
                  src={ytUser.picture}
                  alt={ytUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-400/50"
                />
                <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden md:inline">
                  {ytUser.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 hidden sm:inline-block" />
              </>
            ) : (
              <>
                <YoutubeIcon size={15} className="text-red-500" />
                <span className="text-xs font-semibold text-slate-300 hidden md:inline">
                  Connect Google
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
