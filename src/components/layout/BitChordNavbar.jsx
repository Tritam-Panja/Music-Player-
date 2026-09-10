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
    <header className="sticky top-0 z-40 w-full px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onViewChange('player')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-400/20 via-white/10 to-purple-500/20 border border-white/15 backdrop-blur-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Disc3 size={18} className="text-white group-hover:rotate-180 transition-transform duration-700" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-[#07090e]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">Liquid Music</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/[0.08] text-sky-400 border border-white/[0.06]">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5">Player-First Edition</p>
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
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
            title="Search"
          >
            <Search size={16} />
          </button>

          {/* Player vs Library View Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
            <button
              onClick={() => onViewChange('player')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'player'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Player
            </button>

            <button
              onClick={() => onViewChange('library')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'library'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Library size={13} />
              <span>Library</span>
            </button>
          </div>

          {/* YouTube / Google Account Chip */}
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/15 backdrop-blur-xl transition-all cursor-pointer"
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </>
            ) : (
              <>
                <YoutubeIcon size={14} className="text-red-500" />
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
