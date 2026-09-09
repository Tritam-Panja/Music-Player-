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
  onToggleLyrics
}) {
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
    <div className="fixed bottom-3 inset-x-3 md:bottom-4 md:inset-x-6 z-40">
      <div className="glass-dock rounded-2xl px-4 py-2.5 md:px-5 md:py-3 flex flex-col gap-1.5 transition-all">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Track Information */}
          <div className="flex items-center gap-3 min-w-0 w-1/4">
            <div className="relative group/cover flex-shrink-0">
              <img 
                src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
                alt={track.title} 
                className="w-11 h-11 md:w-12 md:h-12 rounded-xl object-cover shadow-sm border border-white/10"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs md:text-sm font-bold text-white truncate hover:underline cursor-pointer">
                  {track.title}
                </h4>
                <span className="hidden lg:inline text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 font-semibold border border-white/5">
                  Lossless
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                {track.artist}
              </p>
            </div>

            <button 
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                isFavorite 
                  ? 'text-rose-500' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Center: Controls & Timeline */}
          <div className="flex flex-col items-center flex-1 max-w-xl">
            <div className="flex items-center gap-3 md:gap-4 mb-1">
              <button
                onClick={onToggleShuffle}
                className={`p-1.5 rounded-lg transition-colors ${
                  isShuffle ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Shuffle"
              >
                <Shuffle size={15} />
              </button>

              <button
                onClick={onPrev}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Previous"
              >
                <SkipBack size={18} />
              </button>

              <button
                onClick={onTogglePlay}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white hover:bg-slate-100 text-black flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? (
                  <Pause size={17} className="fill-black" />
                ) : (
                  <Play size={17} className="fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={onNext}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Next"
              >
                <SkipForward size={18} />
              </button>

              <button
                onClick={onToggleRepeat}
                className={`p-1.5 rounded-lg transition-colors ${
                  repeatMode !== 'off' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
              </button>
            </div>

            {/* Hairline Timeline Scrubber */}
            <div className="w-full flex items-center gap-2 text-[10px] text-slate-500 font-mono select-none">
              <span className="w-8 text-right font-medium">{formatDuration(displayTime)}</span>
              <div className="relative flex-1 group flex items-center h-3.5">
                <div className="absolute inset-x-0 h-[3px] group-hover:h-[4px] bg-white/10 rounded-full overflow-hidden transition-all">
                  <div 
                    className="h-full bg-white rounded-full transition-all"
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
          <div className="flex items-center justify-end gap-2 md:gap-3 w-1/4">
            {/* Synced Lyrics */}
            <button
              onClick={onToggleLyrics}
              className={`p-2 rounded-xl transition-all ${
                isLyricsOpen 
                  ? 'bg-white/10 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Lyrics"
            >
              <Mic2 size={16} />
            </button>

            {/* Queue Trigger */}
            <button
              onClick={onToggleQueue}
              className={`p-2 rounded-xl transition-all ${
                isQueueOpen 
                  ? 'bg-white/10 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Queue"
            >
              <ListMusic size={16} />
            </button>

            {/* Compact Volume */}
            <div className="hidden sm:flex items-center gap-1.5 group/vol">
              <button
                onClick={onToggleMute}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div className="w-16 relative flex items-center h-3">
                <div className="absolute inset-x-0 h-[3px] bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/80 rounded-full"
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
  );
}
