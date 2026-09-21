import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown,
  Heart, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ListMusic, 
  Trash2, 
  Volume1,
  Volume2,
  VolumeX,
  X,
  Shuffle,
  Repeat,
  Repeat1,
  Music,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronRight,
  Headphones,
  Download,
  Mic2,
  Share2
} from 'lucide-react';
import { playerService } from '../../core/player/PlayerService';
import { queueService } from '../../core/queue/QueueService';
import { lyricsService } from '../../services/lyricsService';
import DownloadButton from '../ui/DownloadButton';

export default function NeuphorismPlayerScreen({
  track,
  isPlaying,
  currentTime,
  duration,
  queue = [],
  currentIndex = 0,
  isFavorite,
  onToggleFavorite,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onAddToQueue,
  onPlayTrackIndex,
  onRemoveFromQueue,
  onOpenSearch,
  onOpenLibrary,
  volume: propVolume,
  isMuted: propIsMuted,
  isShuffle: propIsShuffle,
  repeatMode: propRepeatMode,
  autoplay: propAutoplay,
  onVolumeChange: propOnVolumeChange,
  onToggleMute: propOnToggleMute,
  onToggleShuffle: propOnToggleShuffle,
  onToggleRepeat: propOnToggleRepeat,
  onToggleAutoplay: propOnToggleAutoplay,
  theme = 'dark'
}) {
  // Drawers: null | 'queue' | 'lyrics' | 'options' | 'equalizer'
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  // Synced Lyrics state
  const [lyricsData, setLyricsData] = useState(null);
  const [currentLyricText, setCurrentLyricText] = useState('');
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef(null);

  // Audio & queue state subscriptions
  const [internalVolume, setInternalVolume] = useState(() => playerService?.getState()?.volume ?? 0.8);
  const [internalMuted, setInternalMuted] = useState(() => playerService?.getState()?.isMuted ?? false);
  const [internalShuffle, setInternalShuffle] = useState(() => queueService?.isShuffleEnabled ? queueService.isShuffleEnabled() : false);
  const [internalRepeat, setInternalRepeat] = useState(() => queueService?.getRepeatMode ? queueService.getRepeatMode() : 'off');
  const [internalAutoplay, setInternalAutoplay] = useState(() => queueService?.isAutoplayEnabled ? queueService.isAutoplayEnabled() : true);

  useEffect(() => {
    if (!playerService?.subscribe) return;
    const unsub = playerService.subscribe((state) => {
      if (typeof state.volume === 'number') setInternalVolume(state.volume);
      if (typeof state.isMuted === 'boolean') setInternalMuted(state.isMuted);
      if (queueService?.isShuffleEnabled) setInternalShuffle(queueService.isShuffleEnabled());
      if (queueService?.getRepeatMode) setInternalRepeat(queueService.getRepeatMode());
      if (queueService?.isAutoplayEnabled) setInternalAutoplay(queueService.isAutoplayEnabled());
    });
    return () => unsub();
  }, []);

  // Fetch lyrics when track changes
  useEffect(() => {
    let isMounted = true;
    if (!track?.title) {
      setLyricsData(null);
      setCurrentLyricText('');
      setActiveLyricIndex(-1);
      return;
    }

    lyricsService.getLyrics(track.title, track.artist, duration || track.duration || 0)
      .then((res) => {
        if (!isMounted) return;
        setLyricsData(res);
      })
      .catch(() => {
        if (isMounted) setLyricsData(null);
      });

    return () => {
      isMounted = false;
    };
  }, [track?.title, track?.artist, duration, track?.duration]);

  // Update current lyric snippet based on playback time
  useEffect(() => {
    if (lyricsData?.synced && Array.isArray(lyricsData.synced) && lyricsData.synced.length > 0) {
      const idx = [...lyricsData.synced].reverse().findIndex(l => l.time <= currentTime);
      if (idx !== -1) {
        const realIdx = lyricsData.synced.length - 1 - idx;
        setActiveLyricIndex(realIdx);
        setCurrentLyricText(lyricsData.synced[realIdx]?.text || '');
      } else {
        setActiveLyricIndex(0);
        setCurrentLyricText(lyricsData.synced[0]?.text || '');
      }
    } else if (lyricsData?.plain) {
      const firstLine = lyricsData.plain.split('\n').find(l => l.trim().length > 0) || '';
      setCurrentLyricText(firstLine);
    } else {
      setCurrentLyricText('');
    }
  }, [currentTime, lyricsData]);

  // Auto-scroll lyrics in drawer
  useEffect(() => {
    if (activeDrawer === 'lyrics' && lyricsContainerRef.current && activeLyricIndex >= 0) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex, activeDrawer]);

  const currentVolume = propVolume !== undefined ? propVolume : internalVolume;
  const currentMuted = propIsMuted !== undefined ? propIsMuted : internalMuted;
  const isShuffle = propIsShuffle !== undefined ? propIsShuffle : internalShuffle;
  const repeatMode = propRepeatMode !== undefined ? propRepeatMode : internalRepeat;
  const isAutoplay = propAutoplay !== undefined ? propAutoplay : internalAutoplay;

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      if (propOnVolumeChange) propOnVolumeChange(val);
      else if (playerService?.setVolume) playerService.setVolume(val);
      setInternalVolume(val);
    }
  };

  const handleToggleMute = () => {
    if (propOnToggleMute) propOnToggleMute();
    else if (playerService?.toggleMute) playerService.toggleMute();
    setInternalMuted(!currentMuted);
  };

  const handleToggleShuffle = () => {
    if (propOnToggleShuffle) propOnToggleShuffle();
    else if (queueService?.toggleShuffle) {
      const next = queueService.toggleShuffle();
      setInternalShuffle(next);
    }
  };

  const handleToggleRepeat = () => {
    if (propOnToggleRepeat) propOnToggleRepeat();
    else if (queueService?.cycleRepeatMode) {
      const next = queueService.cycleRepeatMode();
      setInternalRepeat(next);
    }
  };

  const handleToggleAutoplay = () => {
    if (propOnToggleAutoplay) propOnToggleAutoplay();
    else if (queueService?.toggleAutoplay) {
      const next = queueService.toggleAutoplay();
      setInternalAutoplay(next);
    }
  };

  // Format MM:SS
  const formatTimeMinutes = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Format -MM:SS (Negative remaining time matching reference)
  const formatRemainingTime = (current, total) => {
    if (!total || total <= 0) return '-0:00';
    const remaining = Math.max(0, total - current);
    const m = Math.floor(remaining / 60);
    const s = Math.floor(remaining % 60);
    return `-${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const displayTime = isScrubbing ? scrubValue : (currentTime || 0);
  const totalDuration = (duration && duration > 0) ? duration : (track?.duration || 180);
  const progressPercent = Math.min(100, Math.max(0, (displayTime / totalDuration) * 100));

  const handleScrubStart = (e) => {
    setIsScrubbing(true);
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setScrubValue(val);
  };

  const handleScrubChange = (e) => {
    setIsScrubbing(true);
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setScrubValue(val);
  };

  const handleScrubCommit = (e) => {
    setIsScrubbing(false);
    const val = parseFloat(e.target.value);
    const finalVal = !isNaN(val) ? val : scrubValue;
    setScrubValue(finalVal);
    if (onSeek) onSeek(finalVal);
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full flex flex-col justify-between select-none overflow-hidden text-white bg-[#0a0a0c] animate-player-enter">
      
      {/* =========================================================================
          1. IMMERSIVE FULL-BLEED ARTWORK BACKDROP
          Artwork fills top region from the absolute top edge and fades downward
         ========================================================================= */}
      <div className="absolute top-0 inset-x-0 h-[56vh] sm:h-[60vh] overflow-hidden pointer-events-none z-0">
        {track?.thumbnail ? (
          <img
            src={track.thumbnail}
            alt={track?.title || "Artwork"}
            className="w-full h-full object-cover object-top filter brightness-[0.92] transition-all duration-700 scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-rose-950/40 via-purple-950/30 to-[#0a0a0c]" />
        )}
        {/* Soft vignette & gradient scrim fading downward into controls area */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/20 via-45% to-[#0a0a0c]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 via-35% to-transparent" />
      </div>

      {/* Top minimize button (sleek and unobtrusive) */}
      <button
        type="button"
        onClick={onOpenLibrary}
        className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white tap-press transition-all cursor-pointer shadow-md"
        title="Minimize Player"
        aria-label="Minimize Player"
      >
        <ChevronDown size={22} />
      </button>

      {/* Spacer to position controls in lower half matching reference */}
      <div className="flex-1 min-h-[140px] pointer-events-none z-0" />

      {/* =========================================================================
          2. MAIN CONTROLS STACK (Ditto Match to Reference Image)
         ========================================================================= */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col px-6 pb-2">
        
        {/* Row 1: Track Title & Artist (Left) + Favorite & More Options (Right) */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1 pr-1">
            <h1 className="text-[26px] sm:text-[28px] font-bold text-white tracking-tight truncate leading-tight">
              {track?.title || "No Track Playing"}
            </h1>
            <p className="text-[17px] sm:text-[18px] font-semibold text-[#a1a1aa] truncate mt-1 leading-tight">
              {track?.artist || "Unknown Artist"}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Heart / Favorite Button */}
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`w-11 h-11 rounded-full bg-white/[0.12] backdrop-blur-md border border-white/10 active:scale-90 transition-all cursor-pointer flex items-center justify-center shadow-sm ${
                isFavorite ? 'text-rose-500 !bg-rose-500/20 !border-rose-500/30' : 'text-white'
              }`}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart size={20} className={isFavorite ? "fill-rose-500 text-rose-500" : "text-white"} />
            </button>

            {/* More Options Button (...) */}
            <button
              type="button"
              onClick={() => setActiveDrawer('options')}
              className="w-11 h-11 rounded-full bg-white/[0.12] backdrop-blur-md border border-white/10 active:scale-90 text-white transition-all cursor-pointer flex items-center justify-center shadow-sm"
              title="More Options"
              aria-label="More Options"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Row 2: Synced Lyrics Snippet Row (Clean Single-Line Text with Chevron) */}
        <div 
          onClick={() => setActiveDrawer('lyrics')}
          className="flex items-center justify-between gap-2 py-2 mt-1 mb-1 cursor-pointer group active:opacity-75 transition-opacity"
          title="Open Full Synced Lyrics"
        >
          <span className="text-[13.5px] sm:text-sm font-medium text-white/95 truncate">
            {currentLyricText || (track?.artist ? `${track.artist} - ${track.title}` : 'Tap to view lyrics')}
          </span>
          <ChevronRight size={15} className="text-white/40 group-hover:text-white flex-shrink-0 transition-colors" />
        </div>

        {/* Row 3: Progress Bar & Timestamps with Quality Badge */}
        <div className="w-full my-1.5">
          {/* Seekbar Track */}
          <div className="relative w-full h-5 flex items-center group cursor-pointer">
            <div className="w-full h-[3.5px] rounded-full bg-white/20 relative overflow-hidden">
              <div 
                className="h-full rounded-full bg-white transition-[width] duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={totalDuration > 0 ? totalDuration : 100}
              step={0.5}
              value={displayTime}
              onPointerDown={handleScrubStart}
              onMouseDown={handleScrubStart}
              onTouchStart={handleScrubStart}
              onInput={handleScrubChange}
              onChange={handleScrubChange}
              onPointerUp={handleScrubCommit}
              onMouseUp={handleScrubCommit}
              onTouchEnd={handleScrubCommit}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-5 z-20"
              aria-label="Seek track position"
            />
          </div>

          {/* Timestamps & "High Quality" badge row */}
          <div className="flex justify-between items-center text-xs font-mono text-white/60 -mt-0.5 px-0.5">
            <span className="w-12 text-left font-medium">{formatTimeMinutes(displayTime)}</span>
            
            <div className="flex items-center gap-1.5 text-[11px] font-sans font-semibold text-white/50">
              <Headphones size={13} className="text-white/60" />
              <span>High quality</span>
            </div>

            <span className="w-12 text-right font-medium">{formatRemainingTime(displayTime, totalDuration)}</span>
          </div>
        </div>

        {/* Row 4: Centered Playback Controls (SkipBack, Play/Pause, SkipForward) */}
        <div className="flex items-center justify-between px-6 sm:px-8 my-3 sm:my-4">
          {/* Previous Track */}
          <button
            type="button"
            onClick={onPrev}
            className="p-3 text-white transition-all hover:scale-110 tap-press cursor-pointer"
            title="Previous Track"
            aria-label="Previous Track"
          >
            <SkipBack size={32} className="fill-current text-white" />
          </button>

          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="p-3 flex items-center justify-center text-white tap-bounce cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-9 bg-white rounded-xs shadow-xs" />
                <span className="w-2.5 h-9 bg-white rounded-xs shadow-xs" />
              </div>
            ) : (
              <Play size={40} className="fill-current text-white ml-1" />
            )}
          </button>

          {/* Next Track */}
          <button
            type="button"
            onClick={onNext}
            className="p-3 text-white transition-all hover:scale-110 tap-press cursor-pointer"
            title="Next Track"
            aria-label="Next Track"
          >
            <SkipForward size={32} className="fill-current text-white" />
          </button>
        </div>

        {/* Row 5: Volume Slider */}
        <div className="flex items-center gap-3 w-full px-1 my-2 text-white/60">
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-1 hover:text-white tap-press cursor-pointer"
            title={currentMuted ? "Unmute" : "Mute"}
          >
            {currentMuted || currentVolume === 0 ? (
              <VolumeX size={16} className="text-white/50" />
            ) : (
              <Volume1 size={16} />
            )}
          </button>

          <div className="relative flex-1 h-[3.5px] rounded-full bg-white/20 overflow-hidden">
            <div 
              className="h-full rounded-full bg-white transition-[width] duration-75"
              style={{ width: `${(currentMuted ? 0 : currentVolume) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={currentMuted ? 0 : currentVolume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              aria-label="Volume"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (propOnVolumeChange) propOnVolumeChange(1);
              else if (playerService?.setVolume) playerService.setVolume(1);
              setInternalVolume(1);
            }}
            className="p-1 hover:text-white tap-press cursor-pointer"
            title="Max Volume"
          >
            <Volume2 size={16} />
          </button>
        </div>

        {/* Row 6: Bottom Secondary Actions (Shuffle, Repeat, Autoplay Infinity, Queue) */}
        <div className="flex items-center justify-between px-2 mt-2 pt-1 text-white/60">
          {/* Shuffle Toggle */}
          <button
            type="button"
            onClick={handleToggleShuffle}
            className={`p-2 rounded-xl tap-press cursor-pointer ${
              isShuffle ? 'text-white scale-110' : 'hover:text-white'
            }`}
            title={isShuffle ? "Shuffle On" : "Shuffle Off"}
            aria-label="Toggle Shuffle"
          >
            <Shuffle size={20} className={isShuffle ? "stroke-[2.5]" : ""} />
          </button>

          {/* Repeat Toggle */}
          <button
            type="button"
            onClick={handleToggleRepeat}
            className={`p-2 rounded-xl tap-press cursor-pointer ${
              repeatMode !== 'off' ? 'text-white scale-110' : 'hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
            aria-label="Cycle Repeat Mode"
          >
            {repeatMode === 'one' ? (
              <Repeat1 size={20} className="stroke-[2.5]" />
            ) : (
              <Repeat size={20} className={repeatMode === 'all' ? "stroke-[2.5]" : ""} />
            )}
          </button>

          {/* Infinity / Autoplay Toggle */}
          <button
            type="button"
            onClick={handleToggleAutoplay}
            className={`p-2 rounded-xl tap-press cursor-pointer ${
              isAutoplay ? 'text-white scale-110' : 'hover:text-white'
            }`}
            title={isAutoplay ? "Infinite Autoplay: On" : "Infinite Autoplay: Off"}
            aria-label="Toggle Autoplay"
          >
            <svg 
              width="22" 
              height="22" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={isAutoplay ? "2.5" : "2"} 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.178-8-12.356-8-5.096 0-5.096 8 0 8 5.178 0 7.261-8 12.356-8z" />
            </svg>
          </button>

          {/* Queue Drawer Toggle */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === 'queue' ? null : 'queue')}
            className={`p-2 rounded-xl tap-press cursor-pointer ${
              activeDrawer === 'queue' ? 'text-white scale-110' : 'hover:text-white'
            }`}
            title="Up Next Queue"
            aria-label="View Queue"
          >
            <ListMusic size={21} />
          </button>
        </div>

        {/* Bottom Phone Home Indicator Bar */}
        <div className="w-32 h-1 bg-white/30 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

      </div>

      {/* =========================================================================
          4. OVERLAY DRAWERS (Queue, Lyrics, More Options, Equalizer)
         ========================================================================= */}
      {activeDrawer && (
        <div 
          onClick={() => setActiveDrawer(null)}
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-3 animate-scale-fade"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl p-5 relative max-h-[82vh] flex flex-col bg-[#131417]/95 border border-white/10 shadow-2xl text-white animate-drawer-enter"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-im-line">
              <h3 className="text-base font-bold flex items-center gap-2 text-white">
                {activeDrawer === 'queue' && <><ListMusic size={18} /> Up Next Queue ({queue.length})</>}
                {activeDrawer === 'lyrics' && <><Mic2 size={18} /> Synced Lyrics</>}
                {activeDrawer === 'equalizer' && <><SlidersHorizontal size={18} /> Sound Studio Equalizer</>}
                {activeDrawer === 'options' && <><MoreHorizontal size={18} /> Song Options</>}
              </h3>
              <button 
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer bg-white/10 hover:bg-white/15 border border-im-line text-white"
              >
                <X size={15} />
              </button>
            </div>

            {/* A. Queue Content */}
            {activeDrawer === 'queue' && (
              <div className="overflow-y-auto flex-1 space-y-2 pr-1 scrollbar-thin">
                {queue.length === 0 ? (
                  <p className="text-xs text-center py-8 text-im-inkFaint">
                    Queue is empty. Search for songs to add!
                  </p>
                ) : (
                  queue.map((item, idx) => {
                    const isCurrent = idx === currentIndex;
                    return (
                      <div
                        key={item.id + idx}
                        onClick={() => {
                          if (onPlayTrackIndex) onPlayTrackIndex(idx);
                          setActiveDrawer(null);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border ${
                          isCurrent 
                            ? 'bg-white/15 border-white/30 text-white shadow-md' 
                            : 'bg-im-card hover:bg-im-card2 border-im-line text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate text-white">{item.title}</p>
                            <p className="text-[10px] truncate text-im-inkFaint">
                              {item.artist}
                            </p>
                          </div>
                        </div>

                        {onRemoveFromQueue && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromQueue(idx);
                            }}
                            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 text-im-inkFaint hover:text-rose-500 cursor-pointer ml-2"
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* B. Full Synced Lyrics Content */}
            {activeDrawer === 'lyrics' && (
              <div 
                ref={lyricsContainerRef}
                className="overflow-y-auto flex-1 space-y-4 py-4 px-2 scrollbar-thin text-center"
              >
                {lyricsData?.synced && lyricsData.synced.length > 0 ? (
                  lyricsData.synced.map((line, idx) => {
                    const isCurrent = idx === activeLyricIndex;
                    return (
                      <p
                        key={idx}
                        onClick={() => {
                          if (onSeek) onSeek(line.time);
                        }}
                        className={`text-lg sm:text-xl font-bold transition-all cursor-pointer py-1 ${
                          isCurrent 
                            ? 'text-white scale-105 font-black drop-shadow-md' 
                            : 'text-white/30 hover:text-white/70'
                        }`}
                      >
                        {line.text}
                      </p>
                    );
                  })
                ) : lyricsData?.plain ? (
                  <div className="whitespace-pre-line text-sm sm:text-base font-medium text-white/80 leading-relaxed">
                    {lyricsData.plain}
                  </div>
                ) : (
                  <div className="py-12 text-center text-white/50 text-sm">
                    <Mic2 size={32} className="mx-auto mb-2 opacity-40" />
                    <p>No lyrics found for this song.</p>
                  </div>
                )}
              </div>
            )}

            {/* C. More Options Content */}
            {activeDrawer === 'options' && (
              <div className="space-y-2.5 py-1">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download size={18} className="text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Save Offline</h4>
                      <p className="text-[10px] text-white/50">Download audio for offline playback</p>
                    </div>
                  </div>
                  <DownloadButton track={track} size={18} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold" />
                </div>

                <button 
                  onClick={() => setActiveDrawer('equalizer')}
                  className="w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                >
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal size={18} className="text-purple-400" />
                    <span>Sound Studio Equalizer</span>
                  </div>
                  <ChevronRight size={16} className="text-white/40" />
                </button>

                <button 
                  onClick={() => {
                    setActiveDrawer(null);
                    onOpenSearch && onOpenSearch();
                  }}
                  className="w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                >
                  <div className="flex items-center gap-3">
                    <Music size={18} className="text-blue-400" />
                    <span>Search Similar Songs</span>
                  </div>
                  <ChevronRight size={16} className="text-white/40" />
                </button>
              </div>
            )}

            {/* D. Equalizer Content */}
            {activeDrawer === 'equalizer' && (
              <div className="space-y-4 py-2">
                {['Bass Boost', 'Vocal Clarity', 'Treble', 'Spatial Depth'].map((fx, i) => (
                  <div key={fx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-white">
                      <span>{fx}</span>
                      <span className="text-im-inkFaint">{60 + i * 10}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden bg-white/10">
                      <div 
                        className="h-full rounded-full bg-white"
                        style={{ width: `${60 + i * 10}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
