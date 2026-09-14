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
      className="sticky top-0 z-40 w-full px-4 sm:px-6 pt-safe pb-2 sm:pb-2.5 app-drag-region select-none transition-colors duration-300 bg-white/50 dark:bg-[#0c0d14]/75 backdrop-blur-lg border-b border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none text-ui2-ink dark:text-white"
    >
      <div className="w-full flex flex-col gap-2 max-w-7xl mx-auto">
        
        {/* Top Row: Brand mark top left, search capsule center, theme & controls right */}
        <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Mark Top */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 app-no-drag">
            <div 
              onClick={() => onViewChange('home')}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none"
              title="Go to Home"
              aria-label="Liquid Music Home"
            >
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 bg-white/80 dark:bg-white/10 border border-black/5 dark:border-white/10 text-ui2-ink dark:text-white shadow-ui2-soft dark:shadow-none">
                <Disc3 size={17} className="group-hover:rotate-180 transition-transform duration-700 text-ui2-ink dark:text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gradient-to-tr from-[#bdeee0] to-[#cfe0f5] border border-white dark:border-black" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs sm:text-sm tracking-tight whitespace-nowrap text-ui2-ink dark:text-white">
                    Liquid Music
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-ui2-ink text-white dark:bg-white/20 dark:text-white">
                    NEU
                  </span>
                </div>
                <p className="text-[10px] font-medium -mt-0.5 hidden sm:block text-ui2-inkSoft dark:text-white/50">
                  Studio Edition
                </p>
              </div>
            </div>
          </div>

          {/* Center: Search Capsule Trigger (Desktop/Tablet) */}
          <div className="flex-1 max-w-md hidden sm:block app-no-drag mx-2">
            <button
              onClick={onOpenSearch}
              aria-label="Search songs, albums and artists"
              className="w-full flex items-center justify-between px-4 py-1.5 sm:py-2 rounded-full transition-all shadow-ui2-soft dark:shadow-none cursor-pointer group bg-white/70 hover:bg-white/90 dark:bg-white/[0.07] dark:hover:bg-white/[0.12] border border-black/5 dark:border-white/10 text-ui2-inkSoft hover:text-ui2-ink dark:text-white/60 dark:hover:text-white backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <Search size={14} className="text-ui2-inkFaint group-hover:text-ui2-ink dark:text-white/40 dark:group-hover:text-white transition-colors" />
                <span className="font-medium text-ui2-inkSoft group-hover:text-ui2-ink dark:text-white/60 dark:group-hover:text-white">What do you want to play?</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-px h-3 bg-black/10 dark:bg-white/15" />
                <Library size={13} className="text-ui2-inkFaint dark:text-white/40" />
                <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/80 dark:bg-white/10 text-ui2-ink dark:text-white/80 border border-black/5 dark:border-white/10 shadow-xs">
                  Ctrl + K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right: Theme Toggle, Profile & Window Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 app-no-drag">
            {/* Dark Mode / Light Mode Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                className="p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] bg-white/70 hover:bg-white/90 dark:bg-white/10 dark:hover:bg-white/15 border border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none text-ui2-ink dark:text-white hover:scale-105 active:scale-95"
                title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              >
                {isDark ? (
                  <Sun size={15} className="text-amber-400" />
                ) : (
                  <Moon size={15} className="text-ui2-ink" />
                )}
                <span className="text-[11px] font-bold hidden xl:inline ml-1 text-ui2-ink dark:text-white">
                  {isDark ? 'Light' : 'Dark'}
                </span>
              </button>
            )}

            {/* YouTube / Google Account Chip */}
            <button
              onClick={onOpenLogin}
              title={ytUser ? ytUser.name : "Connect Google"}
              aria-label={ytUser ? `Signed in as ${ytUser.name}` : "Connect Google Account"}
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl transition-all cursor-pointer min-w-[34px] min-h-[34px] justify-center bg-white/70 hover:bg-white/90 dark:bg-white/10 dark:hover:bg-white/15 border border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none text-ui2-ink dark:text-white hover:scale-105"
            >
              {ytUser ? (
                <>
                  <img
                    src={ytUser.picture}
                    alt={ytUser.name}
                    className="w-5 h-5 rounded-full object-cover border border-emerald-500"
                  />
                  <span className="text-xs font-semibold max-w-[90px] truncate hidden md:inline text-ui2-ink dark:text-white">
                    {ytUser.name}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden sm:inline-block" />
                </>
              ) : (
                <>
                  <YoutubeIcon size={15} className="text-red-500" />
                  <span className="text-xs font-semibold hidden md:inline text-ui2-ink dark:text-white">
                    Connect Google
                  </span>
                </>
              )}
            </button>

            {/* Desktop Window Controls */}
            <div 
              className={`${
                isElectron ? 'flex' : 'hidden md:flex'
              } items-center gap-1 ml-1 pl-2 border-l border-black/10 dark:border-white/15 app-no-drag`}
            >
              <button
                type="button"
                onClick={handleMinimize}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-white/70 hover:bg-white/90 dark:bg-white/10 dark:hover:bg-white/15 border border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none text-ui2-ink dark:text-white hover:scale-105 active:scale-95"
                title="Minimize Window"
                aria-label="Minimize"
              >
                <Minus size={13} className="stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={handleMaximize}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-white/70 hover:bg-white/90 dark:bg-white/10 dark:hover:bg-white/15 border border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none text-ui2-ink dark:text-white hover:scale-105 active:scale-95"
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
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer group bg-white/70 hover:bg-red-500 hover:text-white dark:bg-white/10 dark:hover:bg-red-500 dark:hover:text-white border border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none text-ui2-ink dark:text-white active:scale-95"
                title="Close Window"
                aria-label="Close"
              >
                <X size={13} className="stroke-[2.5] group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Row: Nav items below, active item highlighted with bg-white/80 */}
        <nav className="flex items-center justify-between sm:justify-start gap-2 pt-1 border-t border-black/5 dark:border-white/10 app-no-drag">
          <div className="flex items-center p-1 rounded-xl bg-white/50 dark:bg-white/[0.06] border border-black/5 dark:border-white/10 shadow-xs dark:shadow-none">
            <button
              onClick={() => onViewChange('home')}
              className={`px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'home'
                  ? 'bg-white/80 text-ui2-ink border border-black/5 shadow-ui2-soft dark:bg-white/20 dark:text-white dark:border-white/15 dark:shadow-none'
                  : 'text-ui2-inkSoft hover:text-ui2-ink hover:bg-white/40 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10'
              }`}
            >
              <Disc3 size={13} className={currentView === 'home' ? 'text-ui2-ink dark:text-white' : ''} />
              <span>Home</span>
            </button>

            <button
              onClick={() => onViewChange('player')}
              className={`px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'player'
                  ? 'bg-white/80 text-ui2-ink border border-black/5 shadow-ui2-soft dark:bg-white/20 dark:text-white dark:border-white/15 dark:shadow-none'
                  : 'text-ui2-inkSoft hover:text-ui2-ink hover:bg-white/40 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10'
              }`}
            >
              <span>Player</span>
            </button>

            <button
              onClick={() => onViewChange('library')}
              className={`px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'library'
                  ? 'bg-white/80 text-ui2-ink border border-black/5 shadow-ui2-soft dark:bg-white/20 dark:text-white dark:border-white/15 dark:shadow-none'
                  : 'text-ui2-inkSoft hover:text-ui2-ink hover:bg-white/40 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10'
              }`}
            >
              <Library size={13} />
              <span>Library</span>
            </button>
          </div>

          {/* Search Trigger for Mobile/Small Screen */}
          <button
            onClick={onOpenSearch}
            className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/50 dark:bg-white/10 border border-black/5 dark:border-white/10 shadow-xs dark:shadow-none text-xs font-bold text-ui2-inkSoft hover:text-ui2-ink dark:text-white/60 dark:hover:text-white cursor-pointer"
          >
            <Search size={13} />
            <span>Search</span>
          </button>
        </nav>

      </div>
    </header>
  );
}

export default React.memo(BitChordNavbar);
