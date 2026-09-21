import React, { useState, useEffect, useCallback } from 'react';
import { Disc3, Search, Music, Library, AlertCircle, X, Compass, Play, Pause, SkipForward } from 'lucide-react';
import BitChordNavbar from './components/layout/BitChordNavbar';
import HomeView from './components/views/HomeView';
import ExploreView from './components/views/ExploreView';
import NeuphorismPlayerScreen from './components/player/NeuphorismPlayerScreen';
import BitChordLibraryView from './components/views/BitChordLibraryView';
import PlaylistView from './components/views/PlaylistView';
import PlayerBar from './components/player/PlayerBar';
import SearchView from './components/views/SearchView';
import DownloadsView from './components/views/DownloadsView';
import LocalMusicView from './components/views/LocalMusicView';
import YTImportModal from './components/modals/YTImportModal';
import YTLoginModal from './components/modals/YTLoginModal';

import { playerService } from './core/player/PlayerService';
import { queueService } from './core/queue/QueueService';
import { storageService } from './services/storageService';
import { ytAuthService } from './services/ytAuthService';

export default function App() {
  // Always render in dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }, []);

  // Navigation: 'home' (default Spotify-like feed) | 'search' | 'explore' | 'player' | 'library' | 'playlist'
  const [currentView, setCurrentView] = useState('home');
  const [previousView, setPreviousView] = useState('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  const navigateToView = (view) => {
    if (currentView !== 'player') {
      setPreviousView(currentView);
    }
    setCurrentView(view);
  };

  // Modals
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
  const [autoplay, setAutoplay] = useState(() => queueService.getState().autoplay);

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
    setFavorites(storageService.getLikedSongs());
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
      if (typeof qState.autoplay === 'boolean') {
        setAutoplay(qState.autoplay);
      }
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
        setCurrentView('search');
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

  // Storage event listener for cross-tab sync of liked songs
  useEffect(() => {
    const handleStorage = (e) => {
      if (!e || e.key === 'liked_songs' || e.key === 'liquid_music_favorites') {
        setFavorites(storageService.getLikedSongs());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Toggle favorite / like
  const handleToggleFavorite = useCallback((track) => {
    const updated = storageService.toggleLike(track);
    setFavorites(updated);
  }, []);

  const isFavorite = (trackId) => {
    return storageService.isLiked(trackId);
  };

  // Shuffle & Repeat
  const handleToggleShuffle = () => {
    queueService.toggleShuffle();
  };

  const handleToggleRepeat = () => {
    queueService.cycleRepeatMode();
  };

  const handleToggleAutoplay = () => {
    queueService.toggleAutoplay();
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
    <div className="relative w-full max-w-full h-screen overflow-hidden flex flex-col font-['Plus_Jakarta_Sans',sans-serif] bg-im-bg text-white">
      {/* =========================================================================
          AMBIENT LIQUID GLASS GLOWING MESH
          Refractive liquid aura that morphs, pulses, and reflects playing music
         ========================================================================= */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Primary liquid fluid orb */}
        <div 
          className="absolute -top-[15%] -left-[10%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full bg-gradient-to-tr from-purple-700/20 via-pink-600/15 to-blue-600/20 blur-[130px] animate-fluid-slow opacity-60"
        />
        {/* Secondary liquid reactive orb */}
        <div 
          className="absolute top-[35%] -right-[15%] w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full bg-gradient-to-br from-cyan-500/15 via-indigo-600/20 to-rose-600/15 blur-[140px] animate-fluid-slow opacity-50"
          style={{ animationDelay: '-6s' }}
        />
        {/* Bottom subtle ambient floor orb */}
        <div 
          className="absolute -bottom-[20%] left-[15%] w-[500px] sm:w-[750px] h-[400px] sm:h-[550px] rounded-full bg-gradient-to-t from-emerald-500/10 via-teal-600/15 to-transparent blur-[120px] opacity-40"
          style={{ animationDelay: '-12s' }}
        />
        {/* Dynamic Track-Themed Ambient Reflection if track is playing */}
        {currentTrack?.thumbnail && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10 blur-[110px] scale-125 transition-opacity duration-1000"
            style={{ backgroundImage: `url(${currentTrack.thumbnail})` }}
          />
        )}
      </div>

      {/* 1. Top Floating Navbar & Window Controls (Hidden when in full-screen player) */}
      {currentView !== 'player' && (
        <BitChordNavbar
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view)}
          onOpenSearch={() => setCurrentView('search')}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          ytUser={ytUser}
        />
      )}

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

      {/* 2. Main Stage: Neuphorism Home vs Search vs Explore vs Player Studio vs Library vs Playlist */}
      <main className={`flex-1 relative z-10 scrollbar-none flex flex-col w-full max-w-full ${
        currentView === 'player' 
          ? 'fixed inset-0 z-50 overflow-hidden p-0 m-0' 
          : 'overflow-y-auto overflow-x-hidden pb-36 sm:pb-24'
      }`}>
        {currentView === 'home' && (
          <div className="w-full flex-1 flex flex-col animate-view-enter">
            <HomeView
              playlists={playlists}
              history={history}
              onPlayTrack={handlePlayTrack}
              onPlayPlaylist={handlePlayPlaylist}
              onSelectPlaylist={(id) => {
                setSelectedPlaylistId(id);
                navigateToView('playlist');
              }}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onOpenSearch={() => navigateToView('search')}
              onViewChange={(view) => navigateToView(view)}
            />
          </div>
        )}

        {currentView === 'search' && (
          <div className="w-full flex-1 flex flex-col animate-view-enter">
            <SearchView
              playlists={playlists}
              history={history}
              onPlayTrack={handlePlayTrack}
              onPlayPlaylist={handlePlayPlaylist}
              onAddToQueue={handleAddToQueue}
              onSelectPlaylist={(id) => {
                setSelectedPlaylistId(id);
                navigateToView('playlist');
              }}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onOpenSearch={() => navigateToView('search')}
              onViewChange={(view) => navigateToView(view)}
              onNavigate={(view) => navigateToView(view)}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
            />
          </div>
        )}

        {currentView === 'explore' && (
          <div className="w-full flex-1 flex flex-col animate-view-enter">
            <ExploreView
              playlists={playlists}
              history={history}
              onPlayTrack={handlePlayTrack}
              onPlayPlaylist={handlePlayPlaylist}
              onAddToQueue={handleAddToQueue}
              onSelectPlaylist={(id) => {
                setSelectedPlaylistId(id);
                navigateToView('playlist');
              }}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onOpenSearch={() => navigateToView('search')}
              onViewChange={(view) => navigateToView(view)}
              onNavigate={(view) => navigateToView(view)}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
            />
          </div>
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
            onOpenSearch={() => navigateToView('search')}
            onOpenLibrary={() => setCurrentView(previousView || 'home')}
          />
        )}

        {(currentView === 'library' || currentView === 'favorites' || currentView === 'liked' || currentView === 'liked-songs') && (
          <div className="w-full flex-1 flex flex-col animate-view-enter">
            <BitChordLibraryView
              playlists={playlists}
              favorites={favorites}
              likedSongs={favorites}
              history={history}
              initialSubTab={(currentView === 'favorites' || currentView === 'liked' || currentView === 'liked-songs') ? 'favorites' : 'playlists'}
              onPlayPlaylist={handlePlayPlaylist}
              onPlayTrack={handlePlayTrack}
              onSelectPlaylist={(id) => {
                setSelectedPlaylistId(id);
                navigateToView('playlist');
              }}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onNavigate={(view) => navigateToView(view)}
              onViewChange={(view) => navigateToView(view)}
              ytUser={ytUser}
            />
          </div>
        )}

        {currentView === 'downloads' && (
          <div className="w-full flex-1 flex flex-col animate-view-enter">
            <DownloadsView
              onPlayTrack={handlePlayTrack}
              onPlayPlaylist={handlePlayPlaylist}
              onAddToQueue={handleAddToQueue}
              onNavigate={(view) => navigateToView(view)}
              onViewChange={(view) => navigateToView(view)}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
            />
          </div>
        )}

        {currentView === 'local-music' && (
          <div className="w-full flex-1 flex flex-col animate-view-enter">
            <LocalMusicView
              onPlayTrack={handlePlayTrack}
              onPlayPlaylist={handlePlayPlaylist}
              onAddToQueue={handleAddToQueue}
              onNavigate={(view) => navigateToView(view)}
              onViewChange={(view) => navigateToView(view)}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
            />
          </div>
        )}

        {currentView === 'playlist' && activePlaylist && (
          <div className="w-full flex-1 flex flex-col animate-view-enter">
            <div className="max-w-7xl mx-auto px-6 py-6 w-full">
              <button
                onClick={() => navigateToView('library')}
                className="mb-4 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-[#828694] hover:text-[#f3efe8] tap-press"
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
              />
            </div>
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
          autoplay={autoplay}
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
          onToggleAutoplay={handleToggleAutoplay}
          onToggleFavorite={() => currentTrack && handleToggleFavorite(currentTrack)}
          onToggleQueue={() => setCurrentView('player')}
          onToggleLyrics={() => setCurrentView('player')}
        />
      )}

      {/* 4. YouTube Playlist Importer Modal */}
      <YTImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* 5. YouTube Account Login & Sync Modal */}
      <YTLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        user={ytUser}
        onUserChange={setYtUser}
        onSyncComplete={handleSyncComplete}
      />

      {/* 6. Mobile Floating Multi-Pill Bottom Dock with Liquid Glass */}
      {currentView !== 'player' && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center gap-2 select-none pointer-events-none">
          {/* 1. Mini-player pill: only rendered when a track is loaded/playing */}
          {currentTrack && (
            <div
              onClick={() => setCurrentView('player')}
              className="flex-1 min-w-0 h-[48px] px-3 rounded-full liquid-glass-pill flex items-center justify-between gap-2.5 cursor-pointer pointer-events-auto transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <img
                    src={currentTrack.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                    alt={currentTrack.title}
                    className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-sm"
                  />
                  {isPlaying && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-pulse" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-white truncate block leading-tight">
                    {currentTrack.title}
                  </span>
                  <span className="text-[10px] font-medium text-white/60 truncate block leading-tight mt-0.5">
                    {currentTrack.artist || 'Unknown Artist'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 pr-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playerService.togglePlay();
                  }}
                  className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition-transform"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause size={13} className="fill-current text-black" />
                  ) : (
                    <Play size={13} className="fill-current text-black ml-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playNext();
                  }}
                  className="p-1.5 text-white/80 hover:text-white active:scale-90 transition-transform cursor-pointer"
                  title="Next"
                >
                  <SkipForward size={16} className="fill-current text-white" />
                </button>
              </div>
            </div>
          )}

          {/* 2. Nav pill: containing 3 icon-only buttons for Play(Home)/Explore/Library */}
          <div
            className={`h-[48px] rounded-full liquid-glass-pill flex items-center pointer-events-auto transition-all ${
              currentTrack ? 'flex-shrink-0 px-3.5 gap-2.5' : 'flex-1 justify-around px-5'
            }`}
          >
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              aria-label="Home"
              className={`p-2 rounded-full transition-all cursor-pointer ${
                currentView === 'home'
                  ? 'text-white bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.18)] scale-105'
                  : 'text-im-inkFaint hover:text-white hover:bg-white/5'
              }`}
            >
              <Play size={18} className={currentView === 'home' ? 'fill-current text-white' : 'fill-current text-im-inkFaint'} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('explore')}
              aria-label="Explore"
              className={`p-2 rounded-full transition-all cursor-pointer ${
                currentView === 'explore'
                  ? 'text-white bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.18)] scale-105'
                  : 'text-im-inkFaint hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass size={20} className={currentView === 'explore' ? 'stroke-[2.5]' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('library')}
              aria-label="Library"
              className={`p-2 rounded-full transition-all cursor-pointer ${
                currentView === 'library' || currentView === 'playlist' || currentView === 'downloads' || currentView === 'local-music'
                  ? 'text-white bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.18)] scale-105'
                  : 'text-im-inkFaint hover:text-white hover:bg-white/5'
              }`}
            >
              <Library size={20} className={currentView === 'library' || currentView === 'playlist' || currentView === 'downloads' || currentView === 'local-music' ? 'stroke-[2.5]' : ''} />
            </button>
          </div>

          {/* 3. Circular floating search button (~48px) */}
          <button
            type="button"
            onClick={() => setCurrentView('search')}
            aria-label="Search"
            className={`w-[48px] h-[48px] rounded-full liquid-glass-circle flex items-center justify-center flex-shrink-0 pointer-events-auto cursor-pointer transition-all ${
              currentView === 'search'
                ? 'text-white border-white/40 bg-white/15 shadow-[0_0_18px_rgba(255,255,255,0.25)] scale-105'
                : 'text-im-inkFaint hover:text-white'
            }`}
          >
            <Search size={20} className={currentView === 'search' ? 'stroke-[2.5]' : ''} />
          </button>
        </div>
      )}
    </div>
  );
}
