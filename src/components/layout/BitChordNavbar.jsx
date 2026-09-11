import React, { useState, useEffect } from 'react';
import { Search, Disc3, Library, Minus, Square, Copy, X, Sun, Moon, Palette } from 'lucide-react';
import YoutubeIcon from '../ui/YoutubeIcon';

function BitChordNavbar({
  currentView,
  onViewChange,
  onOpenSearch,
  onOpenLogin,
  ytUser,
  theme = 'neuphorism',
  onToggleTheme
}) {
  const isElectron = typeof window !== 'undefined' && (
    Boolean(window.electronAPI?.isElectron) ||
    Boolean(window.electronAPI?.minimize) ||
    (typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron'))
  );

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI?.isMaximized) {
      window.electronAPI.isMaximized().then(setIsMaximized).catch(() => {});
    }

    if (window.electronAPI?.onMaximizeChange) {
      const cleanup = window.electronAPI.onMaximizeChange((maximized) => {
        setIsMaximized(maximized);
      });
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }

    const handleFullscreenChange = () => {
      setIsMaximized(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMinimize = (e) => {
    e.stopPropagation();
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = (e) => {
    e.stopPropagation();
    if (window.electronAPI?.maximize) {
      window.electronAPI.maximize();
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    } else {
      window.close();
    }
  };

  const handleHeaderDoubleClick = (e) => {
    if (e.target.closest('.app-no-drag')) return;
    handleMaximize(e);
  };

  const isDark = theme === 'dark';

  return (
    <header 
      onDoubleClick={handleHeaderDoubleClick}
      className={`sticky top-0 z-40 w-full px-3 sm:px-6 py-2.5 sm:py-3.5 app-drag-region select-none transition-colors duration-300 ${
        isDark 
          ? 'bg-[#131417]/90 backdrop-blur-xl border-b border-[#23262f]' 
          : 'bg-[#f3f2ee]/85 backdrop-blur-xl border-b border-[#e6dfd3]'
      }`}
    >
      <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Logo + Spotify-style Home Icon Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 app-no-drag">
          <div 
            onClick={() => onViewChange('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none"
            title="Go to Home"
          >
            <div className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
              isDark
                ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]'
                : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
            }`}>
              <Disc3 size={16} className={`group-hover:rotate-180 transition-transform duration-700 sm:w-[18px] sm:h-[18px] ${
                isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
              }`} />
              <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                isDark ? 'bg-[#c4956a]' : 'bg-[#3c2b20]'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className={`font-extrabold text-xs sm:text-sm tracking-tight whitespace-nowrap ${
                  isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
                }`}>
                  Liquid Music
                </span>
                <span className={`text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.2 rounded ${
                  isDark
                    ? 'bg-[#382417] text-[#c4956a]'
                    : 'bg-[#3d2b20] text-[#faf9f6]'
                }`}>
                  NEU
                </span>
              </div>
              <p className={`text-[10px] font-medium -mt-0.5 hidden sm:block ${
                isDark ? 'text-[#828694]' : 'text-[#8f8075]'
              }`}>
                Neuphorism Edition
              </p>
            </div>
          </div>

          {/* Spotify-style Standalone Round Home Button */}
          <button
            onClick={() => onViewChange('home')}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              currentView === 'home'
                ? isDark
                  ? 'bg-[#f3efe8] text-[#131417] shadow-md scale-105'
                  : 'bg-[#2e221b] text-[#faf9f6] shadow-md scale-105'
                : isDark
                  ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#828694] hover:text-[#f3efe8]'
                  : 'bg-[#faf9f6] neu-btn-shadow text-[#8f8075] hover:text-[#2e221b]'
            }`}
            title="Home"
            aria-label="Home"
          >
            <Disc3 size={16} className={currentView === 'home' ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Center: Spotify-style "What do you want to play?" Search Capsule Trigger (Ctrl + K) */}
        <div className="flex-1 max-w-lg hidden sm:block app-no-drag mx-2">
          <button
            onClick={onOpenSearch}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-full transition-all shadow-md cursor-pointer group ${
              isDark
                ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#828694] hover:text-[#f3efe8]'
                : 'bg-[#faf9f6] neu-btn-shadow text-[#8f8075] hover:text-[#2e221b]'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <Search size={15} className={isDark ? 'text-[#828694] group-hover:text-[#f3efe8]' : 'text-[#8f8075] group-hover:text-[#2e221b]'} />
              <span className="font-semibold">What do you want to play?</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-px h-3 ${isDark ? 'bg-[#2e323e]' : 'bg-[#e0d7cb]'}`} />
              <Library size={13} className={isDark ? 'text-[#828694]' : 'text-[#8f8075]'} />
              <kbd className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                isDark
                  ? 'bg-[#111215] text-[#828694]'
                  : 'bg-[#e8e2d8] text-[#2e221b]'
              }`}>
                Ctrl + K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right Navigation, Theme Toggle, Profile & Desktop Window Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 app-no-drag">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className={`sm:hidden p-2 rounded-xl cursor-pointer ${
              isDark
                ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]'
                : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
            }`}
            title="Search"
          >
            <Search size={15} />
          </button>

          {/* Alternate Dark Mode / Light Mode Neuphorism Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 ${
                isDark
                  ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-amber-400 hover:scale-105 active:scale-95'
                  : 'bg-[#faf9f6] neu-btn-shadow text-[#3c2b20] hover:scale-105 active:scale-95'
              }`}
              title={isDark ? "Switch to Light Neuphorism" : "Switch to Dark Neuphorism"}
            >
              {isDark ? (
                <Sun size={15} className="text-amber-400" />
              ) : (
                <Moon size={15} className="text-[#3c2b20]" />
              )}
              <span className={`text-[11px] font-bold hidden xl:inline ${isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'}`}>
                {isDark ? 'Light' : 'Dark'}
              </span>
            </button>
          )}

          {/* View Switcher: Home vs Player vs Library */}
          <div className={`flex items-center p-0.5 sm:p-1 rounded-xl sm:rounded-2xl ${
            isDark
              ? 'bg-[#111215] neu-groove-inset neu-dark'
              : 'bg-[#e8e2d8] neu-groove-inset'
          }`}>
            <button
              onClick={() => onViewChange('home')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                currentView === 'home'
                  ? isDark
                    ? 'bg-[#1b1d23] text-[#f3efe8] neu-btn-shadow neu-dark'
                    : 'bg-[#faf9f6] text-[#2e221b] neu-btn-shadow'
                  : isDark
                    ? 'text-[#828694] hover:text-[#f3efe8]'
                    : 'text-[#8f8075] hover:text-[#2e221b]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onViewChange('player')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                currentView === 'player'
                  ? isDark
                    ? 'bg-[#1b1d23] text-[#f3efe8] neu-btn-shadow neu-dark'
                    : 'bg-[#faf9f6] text-[#2e221b] neu-btn-shadow'
                  : isDark
                    ? 'text-[#828694] hover:text-[#f3efe8]'
                    : 'text-[#8f8075] hover:text-[#2e221b]'
              }`}
            >
              Player
            </button>

            <button
              onClick={() => onViewChange('library')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentView === 'library'
                  ? isDark
                    ? 'bg-[#1b1d23] text-[#f3efe8] neu-btn-shadow neu-dark'
                    : 'bg-[#faf9f6] text-[#2e221b] neu-btn-shadow'
                  : isDark
                    ? 'text-[#828694] hover:text-[#f3efe8]'
                    : 'text-[#8f8075] hover:text-[#2e221b]'
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
            className={`flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer ${
              isDark
                ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8] hover:scale-105'
                : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b] hover:scale-105'
            }`}
          >
            {ytUser ? (
              <>
                <img
                  src={ytUser.picture}
                  alt={ytUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-500/60"
                />
                <span className={`text-xs font-semibold max-w-[100px] truncate hidden md:inline ${
                  isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
                }`}>
                  {ytUser.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden sm:inline-block" />
              </>
            ) : (
              <>
                <YoutubeIcon size={15} className="text-red-500" />
                <span className={`text-xs font-semibold hidden md:inline ${
                  isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
                }`}>
                  Connect Google
                </span>
              </>
            )}
          </button>

          {/* Desktop Window Controls (Minimize, Maximize/Restore, Close) */}
          <div 
            className={`${
              isElectron ? 'flex' : 'hidden md:flex'
            } items-center gap-1 ml-1.5 pl-2 border-l ${
              isDark ? 'border-[#262933]' : 'border-[#d8d0c2]'
            } app-no-drag`}
          >
            <button
              type="button"
              onClick={handleMinimize}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8] hover:scale-105 active:scale-95'
                  : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b] hover:scale-105 active:scale-95'
              }`}
              title="Minimize Window"
              aria-label="Minimize"
            >
              <Minus size={14} className="stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={handleMaximize}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8] hover:scale-105 active:scale-95'
                  : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b] hover:scale-105 active:scale-95'
              }`}
              title={isMaximized ? "Restore Window" : "Maximize Window"}
              aria-label="Maximize"
            >
              {isMaximized ? (
                <Copy size={12} className="rotate-90 stroke-[2.5]" />
              ) : (
                <Square size={12} className="stroke-[2.5]" />
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer group ${
                isDark
                  ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8] hover:bg-red-500 hover:text-white active:scale-95'
                  : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b] hover:bg-red-500 hover:text-white active:scale-95'
              }`}
              title="Close Window"
              aria-label="Close"
            >
              <X size={14} className="stroke-[2.5] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}

export default React.memo(BitChordNavbar);
