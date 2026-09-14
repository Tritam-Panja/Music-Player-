import React, { useState } from 'react';
import { 
  ChevronDown,
  Heart, 
  Plus, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  SlidersHorizontal, 
  ListMusic, 
  MoreHorizontal, 
  Trash2, 
  Library,
  Sparkles, 
  Volume2,
  X,
  Shuffle,
  Repeat,
  Music,
  Mic2
} from 'lucide-react';

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
  theme = 'light'
}) {
  // Bottom drawer state: null | 'queue' | 'equalizer' | 'options'
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  // Top Artist pills (derived from queue + popular artists)
  const defaultArtists = ['Justin Ti..', 'Zayn', 'Billie Ei..', 'The Weeknd', 'Dua Lipa'];
  const artistList = queue.length > 0 
    ? Array.from(new Set([track?.artist?.split(' ')[0] || 'Zayn', ...queue.map(t => t.artist?.split(' ')[0]).filter(Boolean)])).slice(0, 5)
    : defaultArtists;
  
  const [selectedArtist, setSelectedArtist] = useState(artistList[1] || 'Zayn');

  // Format time (e.g. 2.47 or 5.38 as in the reference)
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
    <div className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-6 relative select-none animate-fadeIn text-ui2-ink dark:text-white min-h-[calc(100vh-140px)]">
      
      {/* Mobile-First Device Wrapper */}
      <div className="w-full max-w-[420px] flex flex-col items-center">

        {/* Main Consistent Player Card */}
        <div className="w-full rounded-3xl p-5 sm:p-7 flex flex-col relative bg-white/80 dark:bg-[#12141f]/85 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-ui2-float dark:shadow-none transition-all duration-300">
          
          {/* Top Row: chevron-down/back icon left, "Now playing" label centered in uppercase small text, small circular avatar right */}
          <div className="w-full flex items-center justify-between pb-2 mb-1">
            <button
              type="button"
              onClick={onOpenLibrary}
              className="p-2 -ml-2 rounded-full text-ui2-ink dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
              title="Back"
            >
              <ChevronDown size={22} />
            </button>

            <span className="text-[11px] font-black uppercase tracking-widest text-ui2-inkFaint dark:text-white/40">
              NOW PLAYING
            </span>

            <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#bdeee0] via-[#cfe0f5] to-[#f2d9e6] p-0.5 shadow-xs flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white/60 dark:bg-[#1b1d28] flex items-center justify-center text-[10px] font-bold text-ui2-ink dark:text-white">
                LM
              </div>
            </div>
          </div>

          {/* Large square album art, rounded-2xl, shadow-ui2-float, gradient placeholder background */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 aspect-square rounded-2xl overflow-hidden mx-auto my-2 bg-gradient-to-br from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2] shadow-ui2-float dark:shadow-none border border-black/5 dark:border-white/10 flex items-center justify-center">
            {track?.thumbnail ? (
              <img
                src={track.thumbnail}
                alt={track?.title || "Album Art"}
                className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
              />
            ) : (
              <Music size={52} className="text-ui2-inkFaint/40 dark:text-white/30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/15 pointer-events-none" />
          </div>

          {/* Title bold, artist muted below it */}
          <div className="text-center mt-3 mb-2 px-2">
            <h2 className="text-xl sm:text-2xl font-black text-ui2-ink dark:text-white truncate tracking-tight">
              {track?.title || "No Track Selected"}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">
              {track?.artist || "Unknown Artist"}
            </p>
          </div>

          {/* Thin progress bar (5px, rounded, gradient fill) with time labels below */}
          <div className="w-full mt-2 mb-1 px-1">
            <div className="relative w-full h-4 flex items-center">
              {/* 5px rounded track */}
              <div className="w-full h-[5px] rounded-full bg-black/5 dark:bg-white/10 relative overflow-hidden">
                {/* gradient fill */}
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#bdeee0] via-[#93c5fd] to-[#c084fc] transition-[width] duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Slider thumb */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-ui2-accentInk dark:bg-white border-2 border-white dark:border-black shadow-sm pointer-events-none transition-[left] duration-100"
                style={{ left: `calc(${progressPercent}% - 7px)` }}
              />

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
            <div className="flex justify-between items-center text-xs font-mono text-ui2-inkFaint dark:text-white/40 mt-1">
              <span>{formatNeuTime(displayTime)}</span>
              <span>{formatNeuTime(duration)}</span>
            </div>
          </div>

          {/* Centered controls: prev icon, large white circular play/pause button (shadow-ui2-soft, dark icon) center, next icon */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 my-3">
            <button
              onClick={onPrev}
              className="p-3 rounded-full text-ui2-ink dark:text-white hover:text-ui2-accentInk dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              title="Previous Track"
            >
              <SkipBack size={22} className="fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center bg-white dark:bg-white text-ui2-accentInk dark:text-black shadow-ui2-soft hover:scale-105 active:scale-95 transition-all cursor-pointer border border-black/5 dark:border-transparent"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={24} className="fill-current" />
              ) : (
                <Play size={24} className="fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-3 rounded-full text-ui2-ink dark:text-white hover:text-ui2-accentInk dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              title="Next Track"
            >
              <SkipForward size={22} className="fill-current" />
            </button>
          </div>

          {/* Row of secondary icons below (like, shuffle, comment/lyrics), evenly spaced, ui2-inkFaint color */}
          <div className="flex items-center justify-between w-full px-2 pt-2 text-ui2-inkFaint dark:text-white/40 border-t border-black/5 dark:border-white/10 mt-1">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isFavorite ? 'text-rose-500 scale-110' : 'hover:text-ui2-ink dark:hover:text-white'
              }`}
              title="Favorite"
            >
              <Heart size={19} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
            </button>

            <button
              onClick={() => setActiveDrawer(activeDrawer === 'queue' ? null : 'queue')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeDrawer === 'queue' ? 'text-ui2-accentInk dark:text-white font-bold scale-110' : 'hover:text-ui2-ink dark:hover:text-white'
              }`}
              title="Queue"
            >
              <ListMusic size={19} />
            </button>

            <button
              onClick={() => setActiveDrawer(activeDrawer === 'equalizer' ? null : 'equalizer')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeDrawer === 'equalizer' ? 'text-ui2-accentInk dark:text-white font-bold scale-110' : 'hover:text-ui2-ink dark:hover:text-white'
              }`}
              title="Equalizer"
            >
              <SlidersHorizontal size={19} />
            </button>

            <button
              onClick={() => onAddToQueue && track && onAddToQueue(track)}
              className="p-2 rounded-xl hover:text-ui2-ink dark:hover:text-white transition-all cursor-pointer"
              title="Add to queue"
            >
              <Plus size={19} />
            </button>

            <button
              onClick={() => setActiveDrawer(activeDrawer === 'options' ? null : 'options')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeDrawer === 'options' ? 'text-ui2-accentInk dark:text-white font-bold scale-110' : 'hover:text-ui2-ink dark:hover:text-white'
              }`}
              title="Player Options"
            >
              <MoreHorizontal size={19} />
            </button>
          </div>

        </div>

        {/* Floating Bottom Action Dock */}
        <div className="w-full rounded-2xl px-6 py-2.5 mt-3 flex items-center justify-between bg-white/70 dark:bg-[#12141f]/85 backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none text-ui2-inkFaint dark:text-white/50">
          <button
            onClick={() => setActiveDrawer(activeDrawer === 'queue' ? null : 'queue')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawer === 'queue' ? 'text-ui-brand font-bold scale-110' : 'hover:text-ui-ink'
            }`}
            title="Up Next Queue"
          >
            <ListMusic size={20} />
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === 'equalizer' ? null : 'equalizer')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawer === 'equalizer' ? 'text-ui-brand font-bold scale-110' : 'hover:text-ui-ink'
            }`}
            title="Audio Equalizer"
          >
            <SlidersHorizontal size={19} />
          </button>

          <button
            onClick={onOpenLibrary}
            className="p-2 rounded-xl hover:text-ui-ink transition-all cursor-pointer"
            title="Music Library"
          >
            <Library size={19} />
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === 'options' ? null : 'options')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawer === 'options' ? 'text-ui-brand font-bold scale-110' : 'hover:text-ui-ink'
            }`}
            title="Player Options"
          >
            <MoreHorizontal size={19} />
          </button>
        </div>
      </div>

      {/* Interactive Overlay Drawers (Queue / Equalizer / Options) */}
      {activeDrawer && (
        <div 
          onClick={() => setActiveDrawer(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl p-6 relative max-h-[80vh] flex flex-col bg-white/95 dark:bg-[#151724]/95 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-ui2-float dark:shadow-none text-ui2-ink dark:text-white animate-slideUp"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/10">
              <h3 className="text-base font-bold flex items-center gap-2 text-ui2-ink dark:text-white">
                {activeDrawer === 'queue' && <><ListMusic size={18} /> Up Next Queue ({queue.length})</>}
                {activeDrawer === 'equalizer' && <><SlidersHorizontal size={18} /> Sound Studio Equalizer</>}
                {activeDrawer === 'options' && <><MoreHorizontal size={18} /> Player Options & Modes</>}
              </h3>
              <button 
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 border border-black/5 dark:border-white/10 text-ui2-ink dark:text-white"
              >
                <X size={15} />
              </button>
            </div>

            {/* Queue Content */}
            {activeDrawer === 'queue' && (
              <div className="overflow-y-auto flex-1 space-y-2 pr-1 scrollbar-thin">
                {queue.length === 0 ? (
                  <p className="text-xs text-center py-8 text-ui2-inkSoft dark:text-white/50">
                    Queue is empty. Search for songs to add!
                  </p>
                ) : (
                  queue.map((item, idx) => {
                    const isCurrent = idx === currentIndex;
                    return (
                      <div
                        key={item.id + idx}
                        onClick={() => {
                          onPlayTrackIndex(idx);
                          setActiveDrawer(null);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                          isCurrent 
                            ? 'bg-ui2-accentInk dark:bg-white/20 text-white shadow-md' 
                            : 'bg-black/5 hover:bg-black/10 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] border border-black/5 dark:border-white/10 text-ui2-ink dark:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{item.title}</p>
                            <p className={`text-[10px] truncate ${isCurrent ? 'text-white/70' : 'text-ui2-inkSoft dark:text-white/50'}`}>
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
                            className={`p-1.5 rounded-lg opacity-60 hover:opacity-100 ${isCurrent ? 'text-white' : 'text-ui-inkSoft hover:text-rose-500'}`}
                            title="Remove"
                          >
                            <Trash2 size={13} />
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
                    <div className="flex justify-between text-xs font-semibold text-ui-ink">
                      <span>{fx}</span>
                      <span className="text-ui-inkSoft">{60 + i * 10}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden bg-ui-line">
                      <div 
                        className="h-full rounded-full bg-ui-brandInk"
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
                  className="w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all bg-ui-cardSoft hover:bg-ui-card border border-ui-line text-ui-ink"
                >
                  <span>Search Online YouTube Catalog</span>
                  <span className="font-mono text-[10px] text-ui-inkSoft">Ctrl + K</span>
                </button>
                <button 
                  onClick={onOpenLibrary}
                  className="w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all bg-ui-cardSoft hover:bg-ui-card border border-ui-line text-ui-ink"
                >
                  <span>Open Full Music Library</span>
                  <span className="text-ui-inkSoft">→</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
