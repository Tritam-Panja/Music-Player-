import React, { useState } from 'react';
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
  Mic2
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import MobileNowPlayingModal from './MobileNowPlayingModal';

export default function PlayerBar({
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
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
  onToggleFavorite,
  onToggleQueue,
  onToggleLyrics,
  onPlayTrack,
  onRemoveFromQueue,
  theme = 'light'
}) {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

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
      {/* Bottom-docked bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 w-full bg-white/95 sm:bg-white/60 dark:bg-[#0c0e15]/95 sm:dark:bg-[#10121b]/80 backdrop-blur-xl border-t border-black/10 dark:border-white/10 shadow-ui2-float dark:shadow-none px-3 sm:px-6 py-2 sm:py-2.5 pb-safe select-none text-ui2-ink dark:text-white transition-colors">
        
        {/* Full-width Top Edge Progress Indicator */}
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-black/5 dark:bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Small track thumbnail + title/artist (Clickable on mobile to open full screen) */}
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
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-ui2-soft dark:shadow-none border border-black/10 dark:border-white/10 group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileModalOpen(true);
                }}
                className="text-xs sm:text-sm font-bold text-ui2-ink dark:text-white truncate hover:underline cursor-pointer leading-tight"
              >
                {track.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-ui2-inkSoft dark:text-white/50 truncate mt-0.5 font-medium leading-tight">
                {track.artist}
              </p>
            </div>
          </div>

          {/* Center: Desktop Centered playback controls with a thin gradient progress bar beneath them */}
          <div className="hidden sm:flex flex-col items-center flex-1 max-w-xl mx-2 sm:mx-4">
            {/* Playback Controls Row */}
            <div className="flex items-center gap-2 sm:gap-4 mb-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleShuffle && onToggleShuffle();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isShuffle ? 'text-ui2-ink dark:text-white font-bold bg-white/80 dark:bg-white/20 shadow-xs' : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white'
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
                className="p-1 sm:p-1.5 text-ui2-ink dark:text-white hover:text-ui2-accentInk dark:hover:text-white transition-colors cursor-pointer active:scale-95"
                title="Previous"
              >
                <SkipBack size={16} className="sm:w-[18px] sm:h-[18px] fill-current" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay && onTogglePlay();
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-white text-ui2-accentInk dark:text-black flex items-center justify-center shadow-ui2-soft border border-black/5 dark:border-transparent hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? (
                  <Pause size={16} className="fill-current sm:w-[17px] sm:h-[17px]" />
                ) : (
                  <Play size={16} className="fill-current ml-0.5 sm:w-[17px] sm:h-[17px]" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext && onNext();
                }}
                className="p-1 sm:p-1.5 text-ui2-ink dark:text-white hover:text-ui2-accentInk dark:hover:text-white transition-colors cursor-pointer active:scale-95"
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
                  repeatMode !== 'off' ? 'text-ui2-ink dark:text-white font-bold bg-white/80 dark:bg-white/20 shadow-xs' : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
              </button>
            </div>

            {/* Thin gradient progress bar beneath them with time labels */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="w-full flex items-center gap-2.5 text-[10px] font-mono text-ui2-inkSoft dark:text-white/50 select-none"
            >
              <span className="w-8 text-right font-medium">{formatDuration(displayTime)}</span>
              <div className="relative flex-1 group flex items-center h-3">
                <div className="absolute inset-x-0 h-[4px] rounded-full overflow-hidden bg-black/10 dark:bg-white/15">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2] transition-all"
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
                  : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

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
                  ? 'bg-white/80 text-ui2-ink dark:bg-white/20 dark:text-white shadow-xs border border-black/5 dark:border-white/10' 
                  : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white'
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
                  ? 'bg-white/80 text-ui2-ink dark:bg-white/20 dark:text-white shadow-xs border border-black/5 dark:border-white/10' 
                  : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white'
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
                className="p-1 text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div className="w-16 sm:w-20 relative flex items-center h-3">
                <div className="absolute inset-x-0 h-[4px] rounded-full overflow-hidden bg-black/10 dark:bg-white/15">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#bdeee0] to-[#cfe0f5]"
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
          <div className="flex sm:hidden items-center gap-1 flex-shrink-0">
            {/* Like Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite && onToggleFavorite();
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isFavorite 
                  ? 'text-rose-500 scale-105' 
                  : 'text-ui2-inkFaint dark:text-white/40 active:text-ui2-ink dark:active:text-white'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            {/* Play / Pause Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay && onTogglePlay();
              }}
              className="w-10 h-10 rounded-full bg-white dark:bg-white text-ui2-accentInk dark:text-black flex items-center justify-center shadow-ui2-soft border border-black/10 dark:border-transparent active:scale-95 transition-all cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={17} className="fill-current" />
              ) : (
                <Play size={17} className="fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext && onNext();
              }}
              className="p-2 text-ui2-ink dark:text-white active:scale-90 transition-all cursor-pointer"
              title="Next"
            >
              <SkipForward size={18} className="fill-current" />
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
        onToggleFavorite={onToggleFavorite}
        onPlayTrack={onPlayTrack}
        onRemoveFromQueue={onRemoveFromQueue}
        theme={theme}
      />
    </>
  );
}
