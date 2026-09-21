import React, { useState, useEffect } from 'react';
import { Search, Disc3, Compass, Library, Minus, Square, Copy, X } from 'lucide-react';
import YoutubeIcon from '../ui/YoutubeIcon';

function BitChordNavbar({
  currentView,
  onViewChange,
  onOpenSearch,
  onOpenLogin,
  ytUser,
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

  return (
    <header 
      onDoubleClick={handleHeaderDoubleClick}
      className="sticky top-0 z-40 w-full px-4 sm:px-6 pt-safe pb-2.5 app-drag-region select-none transition-all duration-300 bg-[#0a0a0c]/65 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.35)] text-white"
    >
      <div className="w-full flex items-center justify-between gap-2.5 sm:gap-4 max-w-7xl mx-auto">
        
        {/* Brand Mark Left */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 app-no-drag order-1">
          <div 
            onClick={() => onViewChange('home')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none"
            title="Go to Home"
            aria-label="Liquid Music Home"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 liquid-glass-card border border-white/15 text-white shadow-sm">
              <Disc3 size={17} className="group-hover:rotate-180 transition-transform duration-700 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight whitespace-nowrap text-white">
                  Liquid Music
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white border border-white/15 backdrop-blur-md">
                  NEU
                </span>
              </div>
              <p className="text-[10px] font-medium -mt-0.5 hidden sm:block text-im-inkFaint">
                Studio Edition
              </p>
            </div>
          </div>
        </div>

        {/* Home/Explore/Player/Library nav items as a pill-style segmented control (desktop only, mobile uses floating bottom dock) */}
        <nav className="hidden md:flex items-center gap-2 app-no-drag order-2">
          <div className="flex items-center p-1 rounded-full bg-im-card border border-im-line shadow-inner">
            <button
              onClick={() => onViewChange('home')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'home'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-im-inkSoft hover:text-im-ink hover:bg-white/5'
              }`}
            >
              <Disc3 size={13} className={currentView === 'home' ? 'text-black' : 'text-im-inkSoft'} />
              <span>Home</span>
            </button>

            <button
              onClick={() => onViewChange('search')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'search'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-im-inkSoft hover:text-im-ink hover:bg-white/5'
              }`}
            >
              <Search size={13} className={currentView === 'search' ? 'text-black' : 'text-im-inkSoft'} />
              <span>Search</span>
            </button>

            <button
              onClick={() => onViewChange('explore')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'explore'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-im-inkSoft hover:text-im-ink hover:bg-white/5'
              }`}
            >
              <Compass size={13} className={currentView === 'explore' ? 'text-black' : 'text-im-inkSoft'} />
              <span>Explore</span>
            </button>

            <button
              onClick={() => onViewChange('player')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'player'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-im-inkSoft hover:text-im-ink hover:bg-white/5'
              }`}
            >
              <span>Player</span>
            </button>

            <button
              onClick={() => onViewChange('library')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'library' || currentView === 'favorites' || currentView === 'liked' || currentView === 'downloads' || currentView === 'local-music'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-im-inkSoft hover:text-im-ink hover:bg-white/5'
              }`}
            >
              <Library size={13} className={currentView === 'library' || currentView === 'favorites' || currentView === 'liked' || currentView === 'downloads' || currentView === 'local-music' ? 'text-black' : 'text-im-inkSoft'} />
              <span>Library</span>
            </button>
          </div>

          {/* Search Trigger for Mobile/Small Screen */}
          <button
            onClick={() => (onViewChange ? onViewChange('search') : onOpenSearch?.())}
            aria-label="Search"
            className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-im-card border border-im-line text-xs font-semibold text-im-inkSoft hover:text-im-ink cursor-pointer"
          >
            <Search size={13} />
            <span>Search</span>
          </button>
        </nav>

        {/* Search bar styled as a rounded bg-im-card input */}
        <div className="flex-1 max-w-xs lg:max-w-sm hidden sm:block app-no-drag order-3">
          <button
            onClick={() => (onViewChange ? onViewChange('search') : onOpenSearch?.())}
            aria-label="Search songs, albums and artists"
            className="w-full flex items-center justify-between px-3.5 py-1.5 sm:py-2 rounded-full transition-all cursor-pointer group bg-im-card hover:bg-im-card2 border border-im-line text-im-inkSoft hover:text-im-ink shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              <Search size={14} className="text-im-inkFaint group-hover:text-im-ink transition-colors" />
              <span className="font-medium text-im-inkSoft group-hover:text-im-ink truncate">What do you want to play?</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-px h-3 bg-im-line" />
              <Library size={13} className="text-im-inkFaint" />
              <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-im-card2 text-im-inkSoft border border-im-line">
                Ctrl + K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right: Connect Google & Window Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 app-no-drag order-2 md:order-4">
          {/* YouTube / Google Account Chip */}
          <button
            onClick={onOpenLogin}
            title={ytUser ? ytUser.name : "Connect Google"}
            aria-label={ytUser ? `Signed in as ${ytUser.name}` : "Connect Google Account"}
            className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full transition-all cursor-pointer min-w-[34px] min-h-[34px] justify-center bg-im-card hover:bg-im-card2 border border-im-line text-im-ink hover:scale-105 active:scale-95 shadow-sm"
          >
            {ytUser ? (
              <>
                <img
                  src={ytUser.picture}
                  alt={ytUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-500"
                />
                <span className="text-xs font-semibold max-w-[90px] truncate hidden md:inline text-im-ink">
                  {ytUser.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden sm:inline-block" />
              </>
            ) : (
              <>
                <YoutubeIcon size={15} className="text-red-500" />
                <span className="text-xs font-semibold hidden md:inline text-im-ink">
                  Connect Google
                </span>
              </>
            )}
          </button>

          {/* Desktop Window Controls */}
          <div 
            className={`${
              isElectron ? 'flex' : 'hidden'
            } items-center gap-1 ml-1 pl-2 border-l border-im-line app-no-drag`}
          >
            <button
              type="button"
              onClick={handleMinimize}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-im-card hover:bg-im-card2 border border-im-line text-im-inkSoft hover:text-im-ink hover:scale-105 active:scale-95"
              title="Minimize Window"
              aria-label="Minimize"
            >
              <Minus size={13} className="stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={handleMaximize}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-im-card hover:bg-im-card2 border border-im-line text-im-inkSoft hover:text-im-ink hover:scale-105 active:scale-95"
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
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer group bg-im-card hover:bg-red-500/90 hover:text-white border border-im-line text-im-inkSoft active:scale-95"
              title="Close Window"
              aria-label="Close"
            >
              <X size={13} className="stroke-[2.5] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}

export default React.memo(BitChordNavbar);
