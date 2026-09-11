import React, { useState, useEffect, useCallback } from 'react';
import { Disc3, Search, Music, Library, AlertCircle, X } from 'lucide-react';
import BitChordNavbar from './components/layout/BitChordNavbar';
import HomeView from './components/views/HomeView';
import NeuphorismPlayerScreen from './components/player/NeuphorismPlayerScreen';
import BitChordLibraryView from './components/views/BitChordLibraryView';
import PlaylistView from './components/views/PlaylistView';
import PlayerBar from './components/player/PlayerBar';
import SpotlightSearchModal from './components/modals/SpotlightSearchModal';
import YTImportModal from './components/modals/YTImportModal';
import YTLoginModal from './components/modals/YTLoginModal';

import { playerService } from './core/player/PlayerService';
import { queueService } from './core/queue/QueueService';
import { storageService } from './services/storageService';
import { ytAuthService } from './services/ytAuthService';

export default function App() {
  // Theme: 'light' (Warm Soft Clay) | 'dark' (Alternate Dark Soft Clay / Obsidian)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('liquid_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('liquid_theme', nextTheme);
    } catch {}
  };

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  }, [theme]);

  // Navigation: 'home' (default Spotify-like feed) | 'player' | 'library' | 'playlist'
  const [currentView, setCurrentView] = useState('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Library & Data State
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [ytUser, setYtUser] = useState(null);
  const [playerError, setPlayerError] = useState(null);

  // Queue State (synced from headless QueueService)
  const [queue, setQueue] = useState(() => queueService.getState().tracks);
  const [currentIndex, setCurrentIndex] = useState(() => queueService.getState().currentIndex);
  const [isShuffle, setIsShuffle] = useState(() => queueService.getState().isShuffle);
  const [repeatMode, setRepeatMode] = useState(() => queueService.getState().repeatMode);

  // Player State (synced from headless PlayerService)
  const [currentTrack, setCurrentTrack] = useState(() => playerService.getState().currentTrack);
  const [isPlaying, setIsPlaying] = useState(() => playerService.getState().isPlaying);
  const [currentTime, setCurrentTime] = useState(() => playerService.getState().currentTime);
  const [duration, setDuration] = useState(() => playerService.getState().duration || 210);
  const [volume, setVolume] = useState(() => playerService.getState().volume);
  const [isMuted, setIsMuted] = useState(() => playerService.getState().isMuted);

  // Initialize data & subscribe to headless services
  useEffect(() => {
    setPlaylists(storageService.getPlaylists());
    setFavorites(storageService.getFavorites());
    setHistory(storageService.getHistory());
    setYtUser(ytAuthService.getUser());

    // Subscribe to YouTube session/auth changes
    const unsubAuth = ytAuthService.subscribe((authState) => {
      setYtUser(authState.user);
    });

    // Restore persistent session if valid
    ytAuthService.restoreSession();

    // Subscribe to PlayerService
    const unsubPlayer = playerService.subscribe((state) => {
      setCurrentTrack(state.currentTrack);
      setIsPlaying(state.isPlaying);
      setCurrentTime(state.currentTime);
      setDuration(state.duration);
      setVolume(state.volume);
      setIsMuted(state.isMuted);
      if (state.currentTrack) {
        setHistory(storageService.getHistory());
      }
      if (state.error) {
        setPlayerError(state.error.userMessage || state.error.message);
      } else {
        setPlayerError(null);
      }
    });

    // Subscribe to QueueService
    const unsubQueue = queueService.subscribe((qState) => {
      setQueue(qState.tracks);
      setCurrentIndex(qState.currentIndex);
      setIsShuffle(qState.isShuffle);
      setRepeatMode(qState.repeatMode);
    });

    return () => {
      unsubPlayer();
      unsubQueue();
      unsubAuth();
    };
  }, []);

  const playNext = useCallback(() => {
    playerService.next();
  }, []);

  const playPrev = useCallback(() => {
    playerService.previous();
  }, []);

  // Global Keyboard Shortcuts (Ctrl+K for search, Space for play/pause, Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.code === 'Space') {
        e.preventDefault();
        playerService.togglePlay();
      } else if (e.code === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        playerService.next();
      } else if (e.code === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        playerService.previous();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Play specific track
  const handlePlayTrack = useCallback((track, contextQueue = null) => {
    if (contextQueue && Array.isArray(contextQueue) && contextQueue.length > 0) {
      const idx = contextQueue.findIndex((t) => t.id === track.id);
      playerService.setQueue(contextQueue, idx >= 0 ? idx : 0);
    }
    playerService.play(track);
    setHistory(storageService.getHistory());
  }, []);

  // Play full playlist
  const handlePlayPlaylist = useCallback((playlist, startIndex = 0) => {
    if (!playlist.tracks || playlist.tracks.length === 0) return;
    playerService.setQueue(playlist.tracks, startIndex);
    playerService.play(playlist.tracks[startIndex]);
    setHistory(storageService.getHistory());
  }, []);

  // Add track to queue
  const handleAddToQueue = useCallback((track) => {
    queueService.addTrack(track);
  }, []);

  // Remove track from queue
  const handleRemoveFromQueue = useCallback((index) => {
    queueService.removeTrack(index);
  }, []);

  // Toggle favorite
  const handleToggleFavorite = useCallback((track) => {
    const updated = storageService.toggleFavorite(track);
    setFavorites(updated);
  }, []);

  const isFavorite = (trackId) => {
    return favorites.some((t) => t.id === trackId);
  };

  // Shuffle & Repeat
  const handleToggleShuffle = () => {
    queueService.toggleShuffle();
  };

  const handleToggleRepeat = () => {
    queueService.cycleRepeatMode();
  };

  // Handle imported playlist
  const handleImportSuccess = (newPlaylist) => {
    const updated = storageService.savePlaylist(newPlaylist);
    setPlaylists(updated);
    setSelectedPlaylistId(newPlaylist.id);
    setCurrentView('playlist');
  };

  // Handle library sync from YouTube Account
  const handleSyncComplete = (syncedPlaylists) => {
    const current = storageService.getPlaylists();
    setPlaylists(current);
  };

  // Handle delete playlist
  const handleDeletePlaylist = (playlistId) => {
    const updated = storageService.deletePlaylist(playlistId);
    setPlaylists(updated);
    if (selectedPlaylistId === playlistId) {
      setCurrentView('player');
      setSelectedPlaylistId(null);
    }
  };

  // Resolve current active playlist
  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  return (
    <div className={`relative w-screen h-screen overflow-hidden flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-500 neu-canvas-bg ${
      theme === 'dark' ? 'neu-dark text-[#f3efe8]' : 'text-[#2e221b]'
    }`}>
      {/* 1. Top Floating Navbar with Theme Toggle & Window Controls */}
      <BitChordNavbar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        ytUser={ytUser}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Playback Alert Toast */}
      {playerError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 text-black text-xs font-bold shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3 duration-300">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>{playerError}</span>
          <button onClick={() => setPlayerError(null)} className="ml-2 cursor-pointer p-0.5 hover:opacity-75">
            <X size={13} />
          </button>
        </div>
      )}

      {/* 2. Main Stage: Neuphorism Home vs Player Studio vs Library vs Playlist */}
      <main className="flex-1 overflow-y-auto pb-20 relative z-10 scrollbar-none flex flex-col">
        {currentView === 'home' && (
          <HomeView
            playlists={playlists}
            history={history}
            onPlayTrack={handlePlayTrack}
            onPlayPlaylist={handlePlayPlaylist}
            onSelectPlaylist={(id) => {
              setSelectedPlaylistId(id);
              setCurrentView('playlist');
            }}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onViewChange={(view) => setCurrentView(view)}
            theme={theme}
          />
        )}

        {currentView === 'player' && (
          <NeuphorismPlayerScreen
            track={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            queue={queue}
            currentIndex={currentIndex}
            isFavorite={currentTrack ? isFavorite(currentTrack.id) : false}
            onToggleFavorite={() => currentTrack && handleToggleFavorite(currentTrack)}
            onTogglePlay={() => playerService.togglePlay()}
            onPrev={playPrev}
            onNext={playNext}
            onSeek={(sec) => playerService.seek(sec)}
            onAddToQueue={handleAddToQueue}
            onPlayTrackIndex={(idx) => {
              setCurrentIndex(idx);
              playerService.play(queue[idx]);
            }}
            onRemoveFromQueue={handleRemoveFromQueue}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenLibrary={() => setCurrentView('library')}
            theme={theme}
          />
        )}

        {currentView === 'library' && (
          <BitChordLibraryView
            playlists={playlists}
            favorites={favorites}
            history={history}
            onPlayPlaylist={handlePlayPlaylist}
            onPlayTrack={handlePlayTrack}
            onSelectPlaylist={(id) => {
              setSelectedPlaylistId(id);
              setCurrentView('playlist');
            }}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            ytUser={ytUser}
            theme={theme}
          />
        )}

        {currentView === 'playlist' && activePlaylist && (
          <div className="max-w-7xl mx-auto px-6 py-6">
            <button
              onClick={() => setCurrentView('library')}
              className={`mb-4 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                theme === 'dark' ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
              }`}
            >
              ← Back to Library
            </button>
            <PlaylistView
              playlist={activePlaylist}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              isFavorite={isFavorite}
              onPlayTrack={handlePlayTrack}
              onPlayPlaylist={handlePlayPlaylist}
              onTogglePlay={() => playerService.togglePlay()}
              onToggleFavorite={handleToggleFavorite}
              onAddToQueue={handleAddToQueue}
              onDeletePlaylist={handleDeletePlaylist}
              theme={theme}
            />
          </div>
        )}
      </main>

      {/* 3. Floating Bottom Player: Shown when on Library or Playlist view */}
      {currentView !== 'player' && (
        <PlayerBar
          track={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          isFavorite={currentTrack ? isFavorite(currentTrack.id) : false}
          isQueueOpen={currentView === 'player'}
          isLyricsOpen={currentView === 'player'}
          queue={queue}
          currentIndex={currentIndex}
          onPlayTrack={handlePlayTrack}
          onRemoveFromQueue={handleRemoveFromQueue}
          onTogglePlay={() => playerService.togglePlay()}
          onPrev={playPrev}
          onNext={playNext}
          onSeek={(sec) => playerService.seek(sec)}
          onVolumeChange={(vol) => playerService.setVolume(vol)}
          onToggleMute={() => playerService.toggleMute()}
          onToggleShuffle={handleToggleShuffle}
          onToggleRepeat={handleToggleRepeat}
          onToggleFavorite={() => currentTrack && handleToggleFavorite(currentTrack)}
          onToggleQueue={() => setCurrentView('player')}
          onToggleLyrics={() => setCurrentView('player')}
          theme={theme}
        />
      )}

      {/* 4. Spotlight Search Command Palette (Ctrl + K) */}
      <SpotlightSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onPlayTrack={(track) => {
          handlePlayTrack(track);
          setCurrentView('player');
        }}
        onAddToQueue={handleAddToQueue}
        theme={theme}
      />

      {/* 5. YouTube Playlist Importer Modal */}
      <YTImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        theme={theme}
      />

      {/* 6. YouTube Account Login & Sync Modal */}
      <YTLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        user={ytUser}
        onUserChange={setYtUser}
        onSyncComplete={handleSyncComplete}
        theme={theme}
      />

      {/* 7. Spotify-Style Mobile Bottom Navigation Bar */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t px-4 py-2 flex items-center justify-around select-none backdrop-blur-xl transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#131417]/95 border-[#23262f] text-[#828694]'
          : 'bg-[#f3f2ee]/95 border-[#e6dfd3] text-[#8f8075]'
      }`}>
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            currentView === 'home'
              ? theme === 'dark' ? 'text-[#f3efe8] scale-105' : 'text-[#2e221b] scale-105'
              : 'hover:text-[#2e221b] dark:hover:text-[#f3efe8]'
          }`}
        >
          <Disc3 size={19} className={currentView === 'home' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center gap-1 transition-all cursor-pointer hover:text-[#2e221b] dark:hover:text-[#f3efe8]"
        >
          <Search size={19} />
          <span className="text-[10px] font-bold">Search</span>
        </button>

        <button
          onClick={() => setCurrentView('player')}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            currentView === 'player'
              ? theme === 'dark' ? 'text-[#f3efe8] scale-105' : 'text-[#2e221b] scale-105'
              : 'hover:text-[#2e221b] dark:hover:text-[#f3efe8]'
          }`}
        >
          <Music size={19} className={currentView === 'player' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] font-bold">Player</span>
        </button>

        <button
          onClick={() => setCurrentView('library')}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            currentView === 'library' || currentView === 'playlist'
              ? theme === 'dark' ? 'text-[#f3efe8] scale-105' : 'text-[#2e221b] scale-105'
              : 'hover:text-[#2e221b] dark:hover:text-[#f3efe8]'
          }`}
        >
          <Library size={19} className={currentView === 'library' || currentView === 'playlist' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] font-bold">Library</span>
        </button>
      </nav>
    </div>
  );
}
