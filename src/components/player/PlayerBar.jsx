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
  Maximize2 
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import VisualizerCanvas from './VisualizerCanvas';

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
    <div className="fixed bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 z-40 glass-panel rounded-2xl px-4 py-3 md:px-6 md:py-3.5 border border-white/10 shadow-2xl flex flex-col gap-2 backdrop-blur-3xl">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3.5 min-w-0 w-1/4">
          <div className="relative group/cover flex-shrink-0">
            <img 
              src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
              alt={track.title} 
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover shadow-md border border-white/10 group-hover/cover:scale-105 transition-transform"
            />
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white truncate hover:text-cyan-300 transition-colors">
              {track.title}
            </h4>
            <p className="text-xs text-slate-400 truncate hover:text-slate-200 transition-colors">
              {track.artist}
            </p>
          </div>

          <button 
            onClick={onToggleFavorite}
            className={`p-2 rounded-full transition-all flex-shrink-0 ${
              isFavorite 
                ? 'text-pink-500 hover:text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.7)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Center: Controls & Timeline */}
        <div className="flex flex-col items-center flex-1 max-w-xl">
          <div className="flex items-center gap-3 md:gap-5 mb-1.5">
            <button
              onClick={onToggleShuffle}
              className={`p-1.5 rounded-lg transition-colors ${
                isShuffle ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle size={16} />
            </button>

            <button
              onClick={onPrev}
              className="p-1.5 text-slate-300 hover:text-white transition-colors"
              title="Previous"
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white hover:bg-slate-100 text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all shadow-cyan-500/20"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause size={20} className="fill-black" />
              ) : (
                <Play size={20} className="fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-1.5 text-slate-300 hover:text-white transition-colors"
              title="Next"
            >
              <SkipForward size={20} />
            </button>

            <button
              onClick={onToggleRepeat}
              className={`p-1.5 rounded-lg transition-colors ${
                repeatMode !== 'off' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 size={17} /> : <Repeat size={16} />}
            </button>
          </div>

          {/* Progress Bar & Timers */}
          <div className="w-full flex items-center gap-2.5 text-[11px] text-slate-400 font-mono">
            <span className="w-9 text-right">{formatDuration(displayTime)}</span>
            <div className="relative flex-1 group flex items-center h-4">
              {/* Background Bar */}
              <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 rounded-full"
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
            <span className="w-9">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right: Actions, Mini Visualizer, Volume */}
        <div className="flex items-center justify-end gap-2.5 md:gap-3.5 w-1/4">
          {/* Mini Visualizer */}
          <div className="hidden xl:block w-24">
            <VisualizerCanvas isPlaying={isPlaying} className="h-6" />
          </div>

          {/* Synced Lyrics Trigger */}
          <button
            onClick={onToggleLyrics}
            className={`p-2 rounded-xl transition-all ${
              isLyricsOpen 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Real-time Synced Lyrics"
          >
            <Mic2 size={18} />
          </button>

          {/* Queue Trigger */}
          <button
            onClick={onToggleQueue}
            className={`p-2 rounded-xl transition-all ${
              isQueueOpen 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Play Queue"
          >
            <ListMusic size={18} />
          </button>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2 group/vol">
            <button
              onClick={onToggleMute}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div className="w-16 md:w-20 relative flex items-center h-4">
              <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full overflow-hidden">
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
  );
}
