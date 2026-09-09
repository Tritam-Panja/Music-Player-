import React, { useState, useEffect, useCallback } from 'react';
import AmbientGlow from './components/ui/AmbientGlow';
import GlassSidebar from './components/layout/GlassSidebar';
import GlassHeader from './components/layout/GlassHeader';
import PlayerBar from './components/player/PlayerBar';
import GlassQueue from './components/player/GlassQueue';
import LyricsView from './components/player/LyricsView';
import HomeView from './components/views/HomeView';
import SearchView from './components/views/SearchView';
import PlaylistView from './components/views/PlaylistView';
import YTImportModal from './components/modals/YTImportModal';

import { audioEngine } from './services/audioEngine';
import { storageService } from './services/storageService';

export default function App() {
  // Navigation & Views
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'search' | 'playlist' | 'favorites'
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Panels
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Library & Data State
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);

  // Queue State
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Player Engine State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'

  // Initialize data from local storage
  useEffect(() => {
    const loadedPlaylists = storageService.getPlaylists();
    const loadedFavorites = storageService.getFavorites();
    const loadedHistory = storageService.getHistory();
    const savedSettings = storageService.getSettings();

    setPlaylists(loadedPlaylists);
    setFavorites(loadedFavorites);
    setHistory(loadedHistory);

    if (savedSettings) {
      setVolume(savedSettings.volume ?? 0.8);
      setIsMuted(savedSettings.isMuted ?? false);
      setIsShuffle(savedSettings.isShuffle ?? false);
      setRepeatMode(savedSettings.repeatMode ?? 'off');
    }

    // Default queue from the initial playlist
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
        return; // reached end of queue
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

  // Handle track end event from audioEngine
  useEffect(() => {
    const handleEnded = () => playNext();
    const handleNext = () => playNext();
    const handlePrev = () => playPrev();

    window.addEventListener('audio:ended', handleEnded);
    window.addEventListener('audio:next', handleNext);
    window.addEventListener('audio:prev', handlePrev);

    return () => {
      window.removeEventListener('audio:ended', handleEnded);
      window.removeEventListener('audio:next', handleNext);
      window.removeEventListener('audio:prev', handlePrev);
    };
  }, [playNext, playPrev]);

  // Electron Global Media Shortcuts integration
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onMediaPlayPause(() => audioEngine.togglePlay());
      window.electronAPI.onMediaNext(() => playNext());
      window.electronAPI.onMediaPrev(() => playPrev());
    }
  }, [playNext, playPrev]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        audioEngine.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        audioEngine.seek(currentTime + 5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        audioEngine.seek(Math.max(0, currentTime - 5));
      } else if (e.code === 'KeyM') {
        audioEngine.toggleMute();
      } else if (e.code === 'KeyL') {
        setIsLyricsOpen((prev) => !prev);
      } else if (e.code === 'KeyQ') {
        setIsQueueOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime]);

  // Play a specific track
  const handlePlayTrack = (track, contextPlaylist = null) => {
    if (contextPlaylist && contextPlaylist.tracks) {
      setQueue(contextPlaylist.tracks);
      const idx = contextPlaylist.tracks.findIndex((t) => t.id === track.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
    } else {
      // Add or bring to front of queue
      const existingIdx = queue.findIndex((t) => t.id === track.id);
      if (existingIdx >= 0) {
        setCurrentIndex(existingIdx);
      } else {
        const newQueue = [track, ...queue];
        setQueue(newQueue);
        setCurrentIndex(0);
      }
    }

    audioEngine.playTrack(track);
    setHistory(storageService.addToHistory(track));
  };

  // Play full playlist
  const handlePlayPlaylist = (playlist, shuffle = false) => {
    if (!playlist.tracks || playlist.tracks.length === 0) return;

    let tracks = [...playlist.tracks];
    if (shuffle) {
      tracks.sort(() => Math.random() - 0.5);
    }

    setQueue(tracks);
    setCurrentIndex(0);
    audioEngine.playTrack(tracks[0]);
    setHistory(storageService.addToHistory(tracks[0]));
  };

  // Add track to queue
  const handleAddToQueue = (track) => {
    setQueue((prev) => [...prev, track]);
  };

  // Remove track from queue
  const handleRemoveFromQueue = (index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear upcoming queue
  const handleClearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setCurrentIndex(0);
    } else {
      setQueue([]);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (track) => {
    const updated = storageService.toggleFavorite(track);
    setFavorites(updated);
  };

  // Check if track is favorite
  const isFavorite = (trackId) => {
    return favorites.some((t) => t.id === trackId);
  };

  // Toggle shuffle & repeat
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

  // Handle navigation
  const handleNavigate = (view, playlistId = null) => {
    setCurrentView(view);
    if (playlistId) setSelectedPlaylistId(playlistId);
  };

  // Handle imported playlist saved
  const handleImportSuccess = (newPlaylist) => {
    const updated = storageService.savePlaylist(newPlaylist);
    setPlaylists(updated);
    setSelectedPlaylistId(newPlaylist.id);
    setCurrentView('playlist');
  };

  // Handle delete playlist
  const handleDeletePlaylist = (playlistId) => {
    const updated = storageService.deletePlaylist(playlistId);
    setPlaylists(updated);
    if (selectedPlaylistId === playlistId) {
      setCurrentView('home');
      setSelectedPlaylistId(null);
    }
  };

  // Resolve current active playlist object
  const activePlaylist = currentView === 'favorites'
    ? {
        id: 'favorites',
        title: 'Liked Songs',
        description: 'Your favorite tracks from YouTube and playlists',
        author: 'You',
        thumbnail: favorites[0]?.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
        tracks: favorites
      }
    : playlists.find((p) => p.id === selectedPlaylistId);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#07080d] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dynamic Liquid Ambient Reactive Light Glow */}
      <AmbientGlow currentTrack={currentTrack} />

      {/* App Layout: Sidebar + Main Content Container */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Frosted Glass Sidebar */}
        <GlassSidebar
          currentView={currentView}
          selectedPlaylistId={selectedPlaylistId}
          playlists={playlists}
          favoritesCount={favorites.length}
          onNavigate={handleNavigate}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onDeletePlaylist={handleDeletePlaylist}
        />

        {/* Main View Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Glass Header */}
          <GlassHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            currentView={currentView}
            onNavigate={handleNavigate}
          />

          {/* Active View Router */}
          {currentView === 'home' && (
            <HomeView
              playlists={playlists}
              history={history}
              onPlayTrack={handlePlayTrack}
              onPlayPlaylist={handlePlayPlaylist}
              onSelectPlaylist={(id) => handleNavigate('playlist', id)}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
          )}

          {currentView === 'search' && (
            <SearchView
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onPlayTrack={handlePlayTrack}
              onAddToQueue={handleAddToQueue}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite}
              onImportPlaylist={handleImportSuccess}
            />
          )}

          {(currentView === 'playlist' || currentView === 'favorites') && activePlaylist && (
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
          )}
        </main>

        {/* Slide-over Play Queue Drawer */}
        <GlassQueue
          queue={queue}
          currentIndex={currentIndex}
          isOpen={isQueueOpen}
          onClose={() => setIsQueueOpen(false)}
          onPlayTrack={(index) => {
            setCurrentIndex(index);
            audioEngine.playTrack(queue[index]);
          }}
          onRemoveTrack={handleRemoveFromQueue}
          onClearQueue={handleClearQueue}
        />
      </div>

      {/* Floating Bottom Liquid Glass Player Bar */}
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
        isQueueOpen={isQueueOpen}
        isLyricsOpen={isLyricsOpen}
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
        onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
        onToggleLyrics={() => setIsLyricsOpen((prev) => !prev)}
      />

      {/* Fullscreen Real-Time Synced Lyrics Modal */}
      <LyricsView
        track={currentTrack}
        currentTime={currentTime}
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
      />

      {/* YouTube Playlist URL / Account Importer Modal */}
      <YTImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
