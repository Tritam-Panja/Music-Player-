import React, { useState, useEffect, useCallback } from 'react';
import BitChordMeshBackdrop from './components/player/BitChordMeshBackdrop';
import BitChordNavbar from './components/layout/BitChordNavbar';
import BitChordNowPlayingScreen from './components/player/BitChordNowPlayingScreen';
import BitChordLibraryView from './components/views/BitChordLibraryView';
import PlaylistView from './components/views/PlaylistView';
import PlayerBar from './components/player/PlayerBar';
import SpotlightSearchModal from './components/modals/SpotlightSearchModal';
import YTImportModal from './components/modals/YTImportModal';
import YTLoginModal from './components/modals/YTLoginModal';

import { audioEngine } from './services/audioEngine';
import { storageService } from './services/storageService';
import { ytAuthService } from './services/ytAuthService';

export default function App() {
  // Navigation: 'player' (default!) | 'library' | 'playlist'
  const [currentView, setCurrentView] = useState('player');
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

  // Queue State
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Player Engine State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(210);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');

  // Initialize data
  useEffect(() => {
    const loadedPlaylists = storageService.getPlaylists();
    const loadedFavorites = storageService.getFavorites();
    const loadedHistory = storageService.getHistory();
    const savedSettings = storageService.getSettings();
    const loadedUser = ytAuthService.getUser();

    setPlaylists(loadedPlaylists);
    setFavorites(loadedFavorites);
    setHistory(loadedHistory);
    setYtUser(loadedUser);

    if (savedSettings) {
      setVolume(savedSettings.volume ?? 0.8);
      setIsMuted(savedSettings.isMuted ?? false);
      setIsShuffle(savedSettings.isShuffle ?? false);
      setRepeatMode(savedSettings.repeatMode ?? 'off');
    }

    // Default queue from initial playlist or top track
    if (loadedPlaylists.length > 0 && loadedPlaylists[0].tracks?.length > 0) {
      setQueue(loadedPlaylists[0].tracks);
      setCurrentTrack(loadedPlaylists[0].tracks[0]);
    }
  }, []);

  // Listen to Audio Engine updates
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      if (state.currentTrack) setCurrentTrack(state.currentTrack);
      setIsPlaying(state.isPlaying);
      setCurrentTime(state.currentTime);
      setDuration(state.duration);
      setVolume(state.volume);
      setIsMuted(state.isMuted);
    });

    return () => unsubscribe();
  }, []);

  // Play next track handler
  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    if (repeatMode === 'one' && currentTrack) {
      audioEngine.seek(0);
      audioEngine.resume();
      return;
    }

    let nextIdx = currentIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        return;
      }
    }

    setCurrentIndex(nextIdx);
    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      audioEngine.playTrack(nextTrack);
      setHistory(storageService.addToHistory(nextTrack));
    }
  }, [queue, currentIndex, isShuffle, repeatMode, currentTrack]);

  // Play previous track handler
  const playPrev = useCallback(() => {
    if (currentTime > 4) {
      audioEngine.seek(0);
      return;
    }

    const prevIdx = currentIndex > 0 ? currentIndex - 1 : (repeatMode === 'all' ? queue.length - 1 : 0);
    setCurrentIndex(prevIdx);
    const prevTrack = queue[prevIdx];
    if (prevTrack) {
      audioEngine.playTrack(prevTrack);
      setHistory(storageService.addToHistory(prevTrack));
    }
  }, [queue, currentIndex, repeatMode, currentTime]);

  // Global Keyboard Shortcuts (Ctrl+K for search, Space for play/pause, Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.code === 'Space') {
        e.preventDefault();
        audioEngine.togglePlay();
      } else if (e.code === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        playNext();
      } else if (e.code === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        playPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playNext, playPrev]);

  // Track playback ended
  useEffect(() => {
    const handleEnded = () => playNext();
    audioEngine.on('ended', handleEnded);
    return () => audioEngine.off('ended', handleEnded);
  }, [playNext]);

  // Play specific track
  const handlePlayTrack = (track) => {
    // Purge any lingering demo tracks from active queue
    const DEMO_IDS = ['jfKfPfyJRdk', '5yx6BWlEVcY', '7NOSDKb0HlU'];
    const filteredQueue = queue.filter((t) => !DEMO_IDS.includes(t.id));

    // Add to queue if not present
    let index = filteredQueue.findIndex((t) => t.id === track.id);
    if (index === -1) {
      filteredQueue.push(track);
      index = filteredQueue.length - 1;
    }
    setQueue(filteredQueue);
    setCurrentIndex(index);
    audioEngine.playTrack(track);
    setHistory(storageService.addToHistory(track));
  };

  // Play full playlist
  const handlePlayPlaylist = (playlist, startIndex = 0) => {
    if (!playlist.tracks || playlist.tracks.length === 0) return;
    setQueue(playlist.tracks);
    setCurrentIndex(startIndex);
    audioEngine.playTrack(playlist.tracks[startIndex]);
    setHistory(storageService.addToHistory(playlist.tracks[startIndex]));
  };

  // Add track to queue
  const handleAddToQueue = (track) => {
    setQueue((prev) => [...prev, track]);
  };

  // Remove track from queue
  const handleRemoveFromQueue = (index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index < currentIndex) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (track) => {
    const updated = storageService.toggleFavorite(track);
    setFavorites(updated);
  };

  const isFavorite = (trackId) => {
    return favorites.some((t) => t.id === trackId);
  };

  // Shuffle & Repeat
  const handleToggleShuffle = () => {
    const next = !isShuffle;
    setIsShuffle(next);
    storageService.saveSettings({ volume, isMuted, repeatMode, isShuffle: next });
  };

  const handleToggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(next);
    storageService.saveSettings({ volume, isMuted, repeatMode: next, isShuffle });
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
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#07090e] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. BitChord Living Mesh Gradient Backdrop */}
      <BitChordMeshBackdrop track={currentTrack} isPlaying={isPlaying} />

      {/* 2. Top Floating Glass Navbar */}
      <BitChordNavbar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        ytUser={ytUser}
      />

      {/* 3. Main Stage: Player Studio vs Library */}
      <main className="flex-1 overflow-y-auto pb-24 relative z-10 scrollbar-none">
        {currentView === 'player' && (
          <BitChordNowPlayingScreen
            track={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            queue={queue}
            currentIndex={currentIndex}
            isFavorite={currentTrack ? isFavorite(currentTrack.id) : false}
            onToggleFavorite={() => currentTrack && handleToggleFavorite(currentTrack)}
            onPlayTrack={(idx) => {
              setCurrentIndex(idx);
              audioEngine.playTrack(queue[idx]);
            }}
            onRemoveFromQueue={handleRemoveFromQueue}
            onSeek={(sec) => audioEngine.seek(sec)}
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
          />
        )}

        {currentView === 'playlist' && activePlaylist && (
          <div className="max-w-7xl mx-auto px-6 py-6">
            <button
              onClick={() => setCurrentView('library')}
              className="mb-4 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
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
              onTogglePlay={() => audioEngine.togglePlay()}
              onToggleFavorite={handleToggleFavorite}
              onAddToQueue={handleAddToQueue}
              onDeletePlaylist={handleDeletePlaylist}
            />
          </div>
        )}
      </main>

      {/* 4. Floating Bottom Glass Capsule Player */}
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
        onTogglePlay={() => audioEngine.togglePlay()}
        onPrev={playPrev}
        onNext={playNext}
        onSeek={(sec) => audioEngine.seek(sec)}
        onVolumeChange={(vol) => {
          audioEngine.setVolume(vol);
          storageService.saveSettings({ volume: vol, isMuted, repeatMode, isShuffle });
        }}
        onToggleMute={() => audioEngine.toggleMute()}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onToggleFavorite={() => currentTrack && handleToggleFavorite(currentTrack)}
        onToggleQueue={() => setCurrentView('player')}
        onToggleLyrics={() => setCurrentView('player')}
      />

      {/* 5. Spotlight Search Command Palette (Ctrl + K) */}
      <SpotlightSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onPlayTrack={(track) => {
          handlePlayTrack(track);
          setCurrentView('player');
        }}
        onAddToQueue={handleAddToQueue}
      />

      {/* 6. YouTube Playlist Importer Modal */}
      <YTImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* 7. YouTube Account Login & Sync Modal */}
      <YTLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        user={ytUser}
        onUserChange={setYtUser}
        onSyncComplete={handleSyncComplete}
      />
    </div>
  );
}
