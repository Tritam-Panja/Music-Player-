import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart, 
  Volume2, 
  VolumeX, 
  ListMusic, 
  Mic2, 
  Radio, 
  Clock, 
  Check 
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import MobileNowPlayingModal from './MobileNowPlayingModal';
import { playerService } from '../../core/player/PlayerService';

export default function PlayerBar({
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  autoplay = true,
  isFavorite,
  isQueueOpen,
  isLyricsOpen,
  queue = [],
  currentIndex = 0,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleAutoplay,
  onToggleFavorite,
  onToggleQueue,
  onToggleLyrics,
  onPlayTrack,
  onRemoveFromQueue,
  theme = 'dark'
}) {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [isSleepMenuOpen, setIsSleepMenuOpen] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(() => playerService.getState().sleepTimer || { isActive: false, mode: null, endTime: null });
  const sleepMenuRef = useRef(null);

  useEffect(() => {
    const unsub = playerService.subscribe((state) => {
      if (state.sleepTimer) {
        setSleepTimer(state.sleepTimer);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isSleepMenuOpen) return;
    const handleClickOutside = (e) => {
      if (sleepMenuRef.current && !sleepMenuRef.current.contains(e.target)) {
        setIsSleepMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSleepMenuOpen]);

  const renderSleepMenu = () => (
    <div
      ref={sleepMenuRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-full right-0 mb-3 w-48 rounded-2xl p-1.5 bg-im-card/95 backdrop-blur-xl border border-im-line shadow-im-float z-50 text-xs text-white animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <div className="px-3 py-2 font-semibold text-[11px] tracking-wider uppercase text-im-inkFaint border-b border-im-line flex items-center justify-between">
        <span>Sleep Timer</span>
        {sleepTimer?.isActive && (
          <span className="text-[10px] lowercase font-normal px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">
            {sleepTimer.mode === 'endOfTrack' ? 'end track' : `${sleepTimer.mode}m`}
          </span>
        )}
      </div>

      <div className="py-1 space-y-0.5">
        {[15, 30, 45, 60].map((mins) => {
          const isSelected = sleepTimer?.mode === mins;
          return (
            <button
              key={mins}
              onClick={() => {
                playerService.setSleepTimer(mins);
                setIsSleepMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
                isSelected
                  ? 'bg-white/15 font-semibold text-white'
                  : 'hover:bg-white/10 text-im-inkSoft hover:text-white'
              }`}
            >
              <span>{mins} minutes</span>
              {isSelected && <Check size={14} className="text-emerald-400" />}
            </button>
          );
        })}

        <button
          onClick={() => {
            playerService.setSleepTimer('endOfTrack');
            setIsSleepMenuOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
            sleepTimer?.mode === 'endOfTrack'
              ? 'bg-white/15 font-semibold text-white'
              : 'hover:bg-white/10 text-im-inkSoft hover:text-white'
          }`}
        >
          <span>End of track</span>
          {sleepTimer?.mode === 'endOfTrack' && <Check size={14} className="text-emerald-400" />}
        </button>
      </div>

      {sleepTimer?.isActive && (
        <div className="pt-1 mt-1 border-t border-im-line">
          <button
            onClick={() => {
              playerService.cancelSleepTimer();
              setIsSleepMenuOpen(false);
            }}
            className="w-full text-left px-3 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 font-medium transition-colors cursor-pointer"
          >
            Turn off timer
          </button>
        </div>
      )}
    </div>
  );

  if (!track) return null;

  const displayTime = isSeeking ? seekValue : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  const handleSeekChange = (e) => {
    setIsSeeking(true);
    setSeekValue(parseFloat(e.target.value));
  };

  const handleSeekCommit = (e) => {
    setIsSeeking(false);
    onSeek(parseFloat(e.target.value));
  };

  return (
    <>
      {/* 
        Bottom-docked Frosted Floating Pill on mobile / Full-width docked on desktop:
        - Mobile: floating pill docked near bottom (bottom-3 inset-x-3 rounded-full)
        - Desktop: full-width bottom docked (sm:bottom-0 sm:inset-x-0 sm:rounded-none)
        - Styling: bg-im-navBg with backdrop-blur-2xl, border border-im-line
      */}
      <div className="hidden md:block fixed bottom-0 inset-x-0 z-50 bg-im-navBg backdrop-blur-2xl border-t border-im-line shadow-im-float px-6 py-2.5 pb-safe select-none text-white transition-all">
        
        {/* Full-width Top Edge Progress Indicator (desktop) */}
        <div className="hidden sm:block absolute top-0 inset-x-0 h-[2.5px] bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-white transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Small track thumbnail + title/artist */}
          <div 
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsMobileModalOpen(true);
              }
            }}
            className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial sm:w-1/4 cursor-pointer"
          >
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileModalOpen(true);
              }}
              className="relative flex-shrink-0 cursor-pointer group"
              title="Expand player"
            >
              <img 
                src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
                alt={track.title} 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full sm:rounded-xl object-cover border border-im-line group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileModalOpen(true);
                }}
                className="text-xs sm:text-sm font-bold text-white truncate hover:underline cursor-pointer leading-tight"
              >
                {track.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-im-inkFaint truncate mt-0.5 font-medium leading-tight">
                {track.artist}
              </p>
            </div>
          </div>

          {/* Center: Desktop Centered playback controls with a thin progress bar beneath them */}
          <div className="hidden sm:flex flex-col items-center flex-1 max-w-xl mx-2 sm:mx-4">
            {/* Playback Controls Row */}
            <div className="flex items-center gap-2 sm:gap-4 mb-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleShuffle && onToggleShuffle();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isShuffle ? 'text-white font-bold bg-white/20 shadow-xs' : 'text-im-inkFaint hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle size={14} className="sm:w-[15px] sm:h-[15px]" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev && onPrev();
                }}
                className="p-1 sm:p-1.5 text-white hover:text-white/80 transition-colors cursor-pointer active:scale-95"
                title="Previous"
              >
                <SkipBack size={16} className="sm:w-[18px] sm:h-[18px] fill-current" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay && onTogglePlay();
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? (
                  <Pause size={16} className="fill-current text-black sm:w-[17px] sm:h-[17px]" />
                ) : (
                  <Play size={16} className="fill-current text-black ml-0.5 sm:w-[17px] sm:h-[17px]" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext && onNext();
                }}
                className="p-1 sm:p-1.5 text-white hover:text-white/80 transition-colors cursor-pointer active:scale-95"
                title="Next"
              >
                <SkipForward size={16} className="sm:w-[18px] sm:h-[18px] fill-current" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRepeat && onToggleRepeat();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  repeatMode !== 'off' ? 'text-white font-bold bg-white/20 shadow-xs' : 'text-im-inkFaint hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAutoplay && onToggleAutoplay();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  autoplay ? 'text-white font-bold bg-white/20 shadow-xs' : 'text-im-inkFaint hover:text-white'
                }`}
                title={`Autoplay / Radio: ${autoplay ? 'On' : 'Off'}`}
              >
                <Radio size={14} className={autoplay ? 'text-white' : ''} />
              </button>
            </div>

            {/* Thin progress bar beneath them with time labels */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="w-full flex items-center gap-2.5 text-[10px] font-mono text-im-inkFaint select-none"
            >
              <span className="w-8 text-right font-medium">{formatDuration(displayTime)}</span>
              <div className="relative flex-1 group flex items-center h-3">
                <div className="absolute inset-x-0 h-[4px] rounded-full overflow-hidden bg-white/15">
                  <div 
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.5}
                  value={displayTime}
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekCommit}
                  onTouchEnd={handleSeekCommit}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-3"
                />
              </div>
              <span className="w-8 font-medium">{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Right: Desktop Like, Lyrics, Queue, Volume icons */}
          <div className="hidden sm:flex items-center justify-end gap-1.5 sm:gap-2.5 w-auto sm:w-1/4">
            {/* Like Icon */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite && onToggleFavorite();
              }}
              className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                isFavorite 
                  ? 'text-rose-500 scale-105' 
                  : 'text-im-inkFaint hover:text-white'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            {/* Sleep Timer */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSleepMenuOpen(!isSleepMenuOpen);
                }}
                className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                  sleepTimer?.isActive 
                    ? 'bg-white/20 text-teal-300 shadow-xs border border-im-line' 
                    : 'text-im-inkFaint hover:text-white'
                }`}
                title={
                  sleepTimer?.isActive 
                    ? `Sleep timer active (${sleepTimer.mode === 'endOfTrack' ? 'End of track' : `${sleepTimer.mode}m`})` 
                    : 'Sleep timer'
                }
              >
                <Clock size={15} className="sm:w-4 sm:h-4" />
              </button>

              {isSleepMenuOpen && renderSleepMenu()}
            </div>

            {/* Lyrics Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.innerWidth < 768) {
                  setIsMobileModalOpen(true);
                } else {
                  onToggleLyrics && onToggleLyrics();
                }
              }}
              className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                isLyricsOpen 
                  ? 'bg-white/20 text-white shadow-xs border border-im-line' 
                  : 'text-im-inkFaint hover:text-white'
              }`}
              title="Lyrics"
            >
              <Mic2 size={15} className="sm:w-4 sm:h-4" />
            </button>

            {/* Queue Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.innerWidth < 768) {
                  setIsMobileModalOpen(true);
                } else {
                  onToggleQueue && onToggleQueue();
                }
              }}
              className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                isQueueOpen 
                  ? 'bg-white/20 text-white shadow-xs border border-im-line' 
                  : 'text-im-inkFaint hover:text-white'
              }`}
              title="Queue"
            >
              <ListMusic size={15} className="sm:w-4 sm:h-4" />
            </button>

            {/* Compact Volume */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5"
            >
              <button
                onClick={onToggleMute}
                className="p-1 text-im-inkFaint hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div className="w-16 sm:w-20 relative flex items-center h-3">
                <div className="absolute inset-x-0 h-[4px] rounded-full overflow-hidden bg-white/15">
                  <div 
                    className="h-full rounded-full bg-white"
                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-3"
                />
              </div>
            </div>
          </div>

          {/* Right: Dedicated Mobile Action Buttons (< sm screens) */}
          <div className="flex sm:hidden items-center gap-1.5 flex-shrink-0 pr-1">
            {/* Play / Pause Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay && onTogglePlay();
              }}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={17} className="fill-current text-black" />
              ) : (
                <Play size={17} className="fill-current text-black ml-0.5" />
              )}
            </button>

            {/* Next Track Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext && onNext();
              }}
              className="p-2 text-white hover:text-white/80 active:scale-90 transition-all cursor-pointer"
              title="Next"
            >
              <SkipForward size={18} className="fill-current text-white" />
            </button>
          </div>

        </div>
      </div>

      {/* Full-Screen Mobile Expandable Player Modal */}
      <MobileNowPlayingModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        track={track}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        autoplay={autoplay}
        isFavorite={isFavorite}
        queue={queue}
        currentIndex={currentIndex}
        onTogglePlay={onTogglePlay}
        onPrev={onPrev}
        onNext={onNext}
        onSeek={onSeek}
        onVolumeChange={onVolumeChange}
        onToggleMute={onToggleMute}
        onToggleShuffle={onToggleShuffle}
        onToggleRepeat={onToggleRepeat}
        onToggleAutoplay={onToggleAutoplay}
        onToggleFavorite={onToggleFavorite}
        onPlayTrack={onPlayTrack}
        onRemoveFromQueue={onRemoveFromQueue}
        theme={theme}
      />
    </>
  );
}
