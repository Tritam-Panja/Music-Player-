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
  Mic2,
  Sparkles
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
  const isDark = theme === 'dark';
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
      <div className="fixed bottom-16 sm:bottom-3 inset-x-2 sm:inset-x-3 md:bottom-5 md:inset-x-6 z-40 max-w-5xl mx-auto">
        <div 
          onClick={(e) => {
            if (window.innerWidth < 768) {
              setIsMobileModalOpen(true);
            }
          }}
          className={`rounded-[30px] px-3.5 py-2 sm:px-5 sm:py-3 flex flex-col gap-1.5 transition-all cursor-pointer md:cursor-default ${
            isDark 
              ? 'bg-[#1b1d23] neu-pill-shadow neu-dark text-[#f3efe8]' 
              : 'bg-[#faf9f6] neu-pill-shadow text-[#2e221b]'
          }`}
        >
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Left: Track Information */}
            <div 
              onClick={() => setIsMobileModalOpen(true)}
              className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial sm:w-1/4 cursor-pointer"
            >
              <div className="relative group/cover flex-shrink-0">
                <img 
                  src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
                  alt={track.title} 
                  className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl object-cover shadow-sm border border-white/10"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h4 className={`text-xs sm:text-sm font-bold truncate hover:underline ${
                    isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
                  }`}>
                    {track.title}
                  </h4>
                </div>
                <p className={`text-[10px] sm:text-[11px] truncate mt-0.5 font-medium ${
                  isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                }`}>
                  {track.artist}
                </p>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite && onToggleFavorite();
                }}
                className={`p-1 sm:p-1.5 rounded-full transition-colors flex-shrink-0 ${
                  isFavorite 
                    ? 'text-rose-500' 
                    : isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Center: Controls & Timeline */}
            <div className="flex flex-col items-center flex-initial sm:flex-1 max-w-xl">
              <div className="flex items-center gap-1.5 sm:gap-4 mb-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleShuffle && onToggleShuffle();
                  }}
                  className={`hidden xs:block sm:block p-1.5 rounded-lg transition-colors ${
                    isShuffle 
                      ? isDark ? 'text-[#c4956a]' : 'text-[#3c2b20]' 
                      : isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
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
                  className={`p-1 sm:p-1.5 transition-colors ${
                    isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
                  }`}
                  title="Previous"
                >
                  <SkipBack size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePlay && onTogglePlay();
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3c2b20] hover:bg-[#4d3729] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? (
                    <Pause size={15} className="fill-white sm:w-[17px] sm:h-[17px]" />
                  ) : (
                    <Play size={15} className="fill-white ml-0.5 sm:w-[17px] sm:h-[17px]" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext && onNext();
                  }}
                  className={`p-1 sm:p-1.5 transition-colors ${
                    isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
                  }`}
                  title="Next"
                >
                  <SkipForward size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRepeat && onToggleRepeat();
                  }}
                  className={`hidden xs:block sm:block p-1.5 rounded-lg transition-colors ${
                    repeatMode !== 'off' 
                      ? isDark ? 'text-[#c4956a]' : 'text-[#3c2b20]' 
                      : isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
                  }`}
                  title={`Repeat: ${repeatMode}`}
                >
                  {repeatMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
                </button>
              </div>

              {/* Hairline Timeline Scrubber */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className={`w-full hidden sm:flex items-center gap-2 text-[10px] font-mono select-none ${
                  isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                }`}
              >
              <span className="w-8 text-right font-medium">{formatDuration(displayTime)}</span>
              <div className="relative flex-1 group flex items-center h-3.5">
                <div className={`absolute inset-x-0 h-[4px] rounded-full overflow-hidden transition-all ${
                  isDark ? 'bg-[#111215] neu-groove-inset neu-dark' : 'bg-[#e8e2d8] neu-groove-inset'
                }`}>
                  <div 
                    className={`h-full rounded-full transition-all ${
                      isDark ? 'bg-[#c4956a]' : 'bg-[#3d2b20]'
                    }`}
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
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="w-8 font-medium">{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Right: Actions, Lyrics, Volume */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 w-auto sm:w-1/4">
            {/* Synced Lyrics */}
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
                  ? isDark 
                    ? 'bg-[#111215] neu-groove-inset neu-dark text-[#c4956a]' 
                    : 'bg-[#e8e2d8] neu-groove-inset text-[#3c2b20]'
                  : isDark 
                    ? 'text-[#828694] hover:text-[#f3efe8]' 
                    : 'text-[#8f8075] hover:text-[#2e221b]'
              }`}
              title="Lyrics"
            >
              <Mic2 size={15} className="sm:w-4 sm:h-4" />
            </button>

            {/* Queue Trigger */}
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
                  ? isDark 
                    ? 'bg-[#111215] neu-groove-inset neu-dark text-[#c4956a]' 
                    : 'bg-[#e8e2d8] neu-groove-inset text-[#3c2b20]'
                  : isDark 
                    ? 'text-[#828694] hover:text-[#f3efe8]' 
                    : 'text-[#8f8075] hover:text-[#2e221b]'
              }`}
              title="Queue"
            >
              <ListMusic size={15} className="sm:w-4 sm:h-4" />
            </button>

            {/* Compact Volume */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="hidden sm:flex items-center gap-1.5 group/vol"
            >
              <button
                onClick={onToggleMute}
                className={`p-1 transition-colors cursor-pointer ${
                  isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div className="w-16 relative flex items-center h-3">
                <div className={`absolute inset-x-0 h-[4px] rounded-full overflow-hidden ${
                  isDark ? 'bg-[#111215] neu-groove-inset neu-dark' : 'bg-[#e8e2d8] neu-groove-inset'
                }`}>
                  <div 
                    className={`h-full rounded-full ${
                      isDark ? 'bg-[#c4956a]' : 'bg-[#3d2b20]'
                    }`}
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
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
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
