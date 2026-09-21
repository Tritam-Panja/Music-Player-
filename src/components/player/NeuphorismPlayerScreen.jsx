import React, { useState, useEffect } from 'react';
import { 
  ChevronDown,
  Heart, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ListMusic, 
  Trash2, 
  Volume2,
  VolumeX,
  X,
  Shuffle,
  Repeat,
  Repeat1,
  Music,
  SlidersHorizontal,
  MoreHorizontal
} from 'lucide-react';
import { playerService } from '../../core/player/PlayerService';
import { queueService } from '../../core/queue/QueueService';
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
  // Bottom drawer state: null | 'queue' | 'equalizer' | 'options'
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  // Internal audio & queue state subscriptions with fallback
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

  // Format Neuphorism time (e.g. 2:47)
  const formatNeuTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const displayTime = isScrubbing ? scrubValue : (currentTime || 0);
  const totalDuration = (duration && duration > 0) ? duration : 100;
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
    <div 
      className="relative w-full flex-1 flex flex-col items-center justify-center select-none overflow-y-auto px-4 py-4 sm:py-6 text-white min-h-[calc(100vh-140px)] pb-36"
      style={{
        background: 'linear-gradient(180deg, #2b253b 0%, #17151e 40%, #0a0a0c 100%)'
      }}
    >
      {/* =========================================================================
          FULL-BLEED BACKGROUND
          Simulating blurred album art fading to #0a0a0c at bottom
         ========================================================================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {track?.thumbnail ? (
          <img
            src={track.thumbnail}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-150 blur-3xl opacity-25"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0c]/85 to-[#0a0a0c]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        
        {/* Top Header Row */}
        <div className="w-full flex items-center justify-between pb-2 mb-2">
          <button
            type="button"
            onClick={onOpenLibrary}
            className="p-2 -ml-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Back to Library"
          >
            <ChevronDown size={24} />
          </button>

          <span className="text-[11px] font-black uppercase tracking-widest text-im-inkFaint">
            NOW PLAYING
          </span>

          <div className="flex items-center gap-1 -mr-2">
            <DownloadButton track={track} size={20} className="p-2 rounded-full" />
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isFavorite ? 'text-rose-500 scale-110' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart size={20} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
            </button>
          </div>
        </div>

        {/* Album Art Card */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 aspect-square rounded-2xl overflow-hidden mx-auto my-2 border border-white/10 bg-im-card shadow-im-float flex items-center justify-center group">
          {track?.thumbnail ? (
            <img
              src={track.thumbnail}
              alt={track?.title || "Album Art"}
              className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
            />
          ) : (
            <Music size={56} className="text-im-inkFaint/50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
        </div>

        {/* Track title bold white, artist in rgba(255,255,255,0.6) below it */}
        <div className="text-center mt-3 mb-2 px-3 w-full">
          <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
            {track?.title || "No Track Selected"}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[rgba(255,255,255,0.6)] truncate mt-1">
            {track?.artist || "Unknown Artist"}
          </p>
        </div>

        {/* Thin progress bar (4px, rounded, white fill on rgba(255,255,255,0.25) track) with time labels below */}
        <div className="w-full px-2 my-2">
          <div className="relative w-full h-4 flex items-center group cursor-pointer">
            {/* 4px rounded track */}
            <div className="w-full h-[4px] rounded-full bg-[rgba(255,255,255,0.25)] relative overflow-hidden">
              {/* White fill */}
              <div 
                className="h-full rounded-full bg-white transition-[width] duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Hidden range input covering track */}
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 100}
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
            />
          </div>

          {/* Time labels below */}
          <div className="flex justify-between items-center text-xs font-mono text-[rgba(255,255,255,0.6)] mt-1">
            <span>{formatNeuTime(displayTime)}</span>
            <span>{formatNeuTime(duration)}</span>
          </div>
        </div>

        {/* Centered controls: prev/next as plain white icons, large centered play/pause icon (no button background, just a bigger icon) */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 my-3 sm:my-4">
          <button
            type="button"
            onClick={onPrev}
            className="p-2 text-white hover:text-white/80 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Previous Track"
          >
            <SkipBack size={28} className="fill-current text-white" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            className="p-2 text-white hover:text-white/80 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={56} className="fill-current text-white" />
            ) : (
              <Play size={56} className="fill-current text-white ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={onNext}
            className="p-2 text-white hover:text-white/80 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Next Track"
          >
            <SkipForward size={28} className="fill-current text-white" />
          </button>
        </div>

        {/* A volume slider row below controls */}
        <div className="flex items-center gap-3 w-full max-w-[280px] mx-auto my-2 text-[rgba(255,255,255,0.7)]">
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-1 text-[rgba(255,255,255,0.7)] hover:text-white transition-colors cursor-pointer"
            title={currentMuted ? "Unmute" : "Mute"}
          >
            {currentMuted || currentVolume === 0 ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <div className="relative flex-1 h-[4px] rounded-full bg-[rgba(255,255,255,0.25)] overflow-hidden">
            <div 
              className="h-full rounded-full bg-white transition-[width] duration-100"
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
            />
          </div>
        </div>

        {/* Bottom row of secondary icons (shuffle, repeat, an "infinite"/autoplay toggle, queue) evenly spaced in rgba(255,255,255,0.7) */}
        <div className="w-full max-w-[360px] flex items-center justify-between mx-auto mt-4 pt-2 text-[rgba(255,255,255,0.7)]">
          {/* Shuffle */}
          <button
            type="button"
            onClick={handleToggleShuffle}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isShuffle ? 'text-white scale-110' : 'hover:text-white hover:bg-white/5'
            }`}
            title={isShuffle ? "Shuffle On" : "Shuffle Off"}
          >
            <Shuffle size={20} className={isShuffle ? "stroke-[2.5]" : ""} />
          </button>

          {/* Repeat */}
          <button
            type="button"
            onClick={handleToggleRepeat}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              repeatMode !== 'off' ? 'text-white scale-110' : 'hover:text-white hover:bg-white/5'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 size={20} className="stroke-[2.5]" />
            ) : (
              <Repeat size={20} className={repeatMode === 'all' ? "stroke-[2.5]" : ""} />
            )}
          </button>

          {/* "Infinite" / Autoplay Toggle */}
          <button
            type="button"
            onClick={handleToggleAutoplay}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isAutoplay ? 'text-white scale-110' : 'hover:text-white hover:bg-white/5'
            }`}
            title={isAutoplay ? "Infinite Autoplay: On" : "Infinite Autoplay: Off"}
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

          {/* Queue */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === 'queue' ? null : 'queue')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawer === 'queue' ? 'text-white scale-110' : 'hover:text-white hover:bg-white/5'
            }`}
            title="Up Next Queue"
          >
            <ListMusic size={20} />
          </button>
        </div>

      </div>

      {/* Interactive Overlay Drawer (Queue / Equalizer / Options) */}
      {activeDrawer && (
        <div 
          onClick={() => setActiveDrawer(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl p-6 relative max-h-[80vh] flex flex-col bg-im-card border border-im-line shadow-im-float text-white animate-slideUp"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-im-line">
              <h3 className="text-base font-bold flex items-center gap-2 text-white">
                {activeDrawer === 'queue' && <><ListMusic size={18} /> Up Next Queue ({queue.length})</>}
                {activeDrawer === 'equalizer' && <><SlidersHorizontal size={18} /> Sound Studio Equalizer</>}
                {activeDrawer === 'options' && <><MoreHorizontal size={18} /> Player Options & Modes</>}
              </h3>
              <button 
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer bg-white/10 hover:bg-white/15 border border-im-line text-white"
              >
                <X size={15} />
              </button>
            </div>

            {/* Queue Content */}
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
                            ? 'bg-im-card2 border-white/20 text-white shadow-md' 
                            : 'bg-im-card hover:bg-im-card2 border-im-line text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
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
                            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 text-im-inkFaint hover:text-rose-500 cursor-pointer"
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

            {/* Equalizer Content */}
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

            {/* Options Content */}
            {activeDrawer === 'options' && (
              <div className="space-y-2.5 py-1">
                <button 
                  onClick={onOpenSearch}
                  className="w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all bg-im-card hover:bg-im-card2 border border-im-line text-white"
                >
                  <span>Search Online YouTube Catalog</span>
                  <span className="font-mono text-[10px] text-im-inkFaint">Ctrl + K</span>
                </button>
                <button 
                  onClick={onOpenLibrary}
                  className="w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all bg-im-card hover:bg-im-card2 border border-im-line text-white"
                >
                  <span>Open Full Music Library</span>
                  <span className="text-im-inkFaint">→</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
