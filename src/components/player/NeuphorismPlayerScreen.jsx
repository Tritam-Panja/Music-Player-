import React, { useState } from 'react';
import { 
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
  Repeat
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
  const isDark = theme === 'dark';
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
    if (!seconds || isNaN(seconds) || seconds < 0) return '0.00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}.${s < 10 ? '0' : ''}${s}`;
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
    <div className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-5 relative select-none animate-fadeIn">
      
      {/* 1. Mobile-First Device Wrapper */}
      <div className="w-full max-w-[400px] flex flex-col items-center">

        {/* 2. Top Artist Filter Pills (as in reference image) */}
        <div className="w-full mb-3 flex items-center justify-center gap-5 overflow-x-auto scrollbar-none py-1.5 px-2">
          {artistList.map((artist, i) => {
            const isActive = selectedArtist === artist || (i === 1 && !selectedArtist);
            return (
              <button
                key={artist + i}
                onClick={() => setSelectedArtist(artist)}
                className="relative py-1 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer group"
              >
                <span className={`${
                  isActive 
                    ? isDark ? 'text-[#f3efe8] font-bold' : 'text-[#2e221b] font-bold' 
                    : isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
                }`}>
                  {artist}
                </span>
                {isActive && (
                  <span className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full transition-all ${
                    isDark ? 'bg-[#c4956a]' : 'bg-[#3d2b20]'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Main Floating Neuphorism Card */}
        <div className={`w-full rounded-[38px] p-5 sm:p-6 flex flex-col relative transition-all duration-300 ${
          isDark 
            ? 'bg-[#1b1d23] neu-card-shadow neu-dark' 
            : 'bg-[#faf9f6] neu-card-shadow'
        }`}>
          
          {/* Header Row: Musical Waveform Badge + "Play Music" */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${
              isDark 
                ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]' 
                : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
            }`}>
              <div className="flex items-center gap-[2px] h-3.5">
                <span className={`w-[2.5px] rounded-full transition-all ${isDark ? 'bg-[#c4956a]' : 'bg-[#2e221b]'} ${isPlaying ? 'h-3 animate-pulse' : 'h-1.5'}`} />
                <span className={`w-[2.5px] rounded-full transition-all ${isDark ? 'bg-[#c4956a]' : 'bg-[#2e221b]'} ${isPlaying ? 'h-4 animate-bounce' : 'h-3'}`} />
                <span className={`w-[2.5px] rounded-full transition-all ${isDark ? 'bg-[#c4956a]' : 'bg-[#2e221b]'} ${isPlaying ? 'h-2 animate-pulse' : 'h-1'}`} />
                <span className={`w-[2.5px] rounded-full transition-all ${isDark ? 'bg-[#c4956a]' : 'bg-[#2e221b]'} ${isPlaying ? 'h-3.5 animate-bounce' : 'h-2.5'}`} />
              </div>
            </div>
            <h1 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'}`}>
              Play Music
            </h1>
          </div>

          {/* 4. Teardrop Album Art Frame */}
          <div className="relative w-full flex items-center justify-center my-1">
            <div className="relative w-48 h-48 sm:w-52 sm:h-52">
              
              {/* Outer soft shadow shape */}
              <div className={`absolute inset-0 rounded-[50%_14%_50%_50%] transition-colors ${
                isDark 
                  ? 'bg-[#1b1d23] shadow-[10px_14px_28px_rgba(0,0,0,0.8),-6px_-6px_18px_rgba(255,255,255,0.03)]' 
                  : 'bg-[#faf9f6] shadow-[10px_14px_28px_rgba(165,150,135,0.3),-8px_-8px_20px_rgba(255,255,255,0.95)]'
              }`} />
              
              {/* Beveled Metallic / Silver Ring */}
              <div className={`absolute inset-1.5 rounded-[50%_14%_50%_50%] p-1 shadow-inner ${
                isDark 
                  ? 'bg-gradient-to-tr from-[#252830] via-[#333845] to-[#1c1d24]' 
                  : 'bg-gradient-to-tr from-[#d6cfc5] via-[#f7f5f2] to-[#b8aca0]'
              }`}>
                
                {/* Inner Image Container */}
                <div className="w-full h-full rounded-[50%_12%_50%_50%] overflow-hidden relative bg-[#1c1e24]">
                  <img
                    src={track?.thumbnail || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500"}
                    alt={track?.title || "Track Cover"}
                    className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
                  />
                  
                  {/* Diagonal Light Sheen Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/20 pointer-events-none" />
                </div>
              </div>

            </div>
          </div>

          {/* 5. Track Title & Artist */}
          <div className="text-center mt-4">
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight truncate px-2 ${
              isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
            }`}>
              {track?.title || "Dusk Till Dawn"}
            </h2>
            <p className={`text-xs sm:text-sm font-semibold mt-0.5 truncate px-4 ${
              isDark ? 'text-[#9c9489]' : 'text-[#8f8075]'
            }`}>
              {track?.artist || "Zayn Malik ft. Sia"}
            </p>
          </div>

          {/* 6. Action Row: Heart (Favorite) & Plus (Add) */}
          <div className="flex items-center justify-between px-2 mt-3">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isFavorite 
                  ? 'text-rose-500 scale-110' 
                  : isDark 
                    ? 'text-[#f3efe8] hover:text-rose-500 active:scale-90' 
                    : 'text-[#2e221b] hover:text-rose-500 active:scale-90'
              }`}
              title="Favorite track"
            >
              <Heart size={20} className={isFavorite ? "fill-rose-500" : ""} />
            </button>

            <button
              onClick={() => onAddToQueue && track && onAddToQueue(track)}
              className={`p-2 active:scale-90 rounded-xl transition-all cursor-pointer ${
                isDark ? 'text-[#f3efe8] hover:text-white' : 'text-[#2e221b] hover:text-[#3d2b20]'
              }`}
              title="Add to queue"
            >
              <Plus size={22} className="stroke-[2.5]" />
            </button>
          </div>

          {/* 7. Progress Scrub Slider */}
          <div className="w-full px-2 mt-1">
            <div className="relative w-full h-4 flex items-center">
              {/* Inset background track */}
              <div className={`w-full h-2 rounded-full relative overflow-hidden ${
                isDark ? 'bg-[#111215] neu-groove-inset neu-dark' : 'bg-[#e8e3da] neu-groove-inset'
              }`}>
                {/* Active filled track */}
                <div 
                  className={`h-full rounded-full transition-[width] duration-100 ${
                    isDark ? 'bg-[#c4956a]' : 'bg-[#3d2b20]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Slider thumb */}
              <div 
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow-[0_2px_6px_rgba(0,0,0,0.4)] pointer-events-none transition-[left] duration-100 ${
                  isDark 
                    ? 'bg-[#c4956a] border-[#1b1d23]' 
                    : 'bg-[#3d2b20] border-white'
                }`}
                style={{ left: `calc(${progressPercent}% - 8px)` }}
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

            {/* Time labels */}
            <div className={`flex justify-between items-center text-[11px] font-bold mt-1 ${
              isDark ? 'text-[#9c9489]' : 'text-[#8f8075]'
            }`}>
              <span>{formatNeuTime(displayTime)}</span>
              <span>{formatNeuTime(duration)}</span>
            </div>
          </div>

          {/* 8. Playback Controls Deck (Prev, Play/Pause, Next) */}
          <div className="flex items-center justify-center gap-6 mt-4 mb-2">
            {/* Previous Track */}
            <button
              onClick={onPrev}
              className={`w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer ${
                isDark 
                  ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]' 
                  : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
              }`}
              title="Previous Track"
            >
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                isDark ? 'border-[#262933]' : 'border-[#e6e0d5]'
              }`}>
                <SkipBack size={18} className={isDark ? 'fill-[#f3efe8]' : 'fill-[#2e221b]'} />
              </div>
            </button>

            {/* Play / Pause Button (Rich Chocolate with Outer Ring) */}
            <button
              onClick={onTogglePlay}
              className={`w-18 h-18 rounded-full border-4 flex items-center justify-center text-white cursor-pointer group transition-all ${
                isDark 
                  ? 'bg-[#382417] neu-play-shadow neu-dark border-[#1b1d23]' 
                  : 'bg-[#3c2b20] neu-play-shadow border-[#faf9f6]'
              }`}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-6 bg-white rounded-full" />
                  <span className="w-1.5 h-6 bg-white rounded-full" />
                </div>
              ) : (
                <Play size={26} className="fill-white ml-1 group-hover:scale-105 transition-transform" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={onNext}
              className={`w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer ${
                isDark 
                  ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]' 
                  : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
              }`}
              title="Next Track"
            >
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                isDark ? 'border-[#262933]' : 'border-[#e6e0d5]'
              }`}>
                <SkipForward size={18} className={isDark ? 'fill-[#f3efe8]' : 'fill-[#2e221b]'} />
              </div>
            </button>
          </div>

        </div>

        {/* 9. Aesthetic Subtitle Tag (as seen in reference) */}
        <p className={`text-[11px] font-semibold tracking-wider text-center mt-4 select-none ${
          isDark ? 'text-[#828694]/70' : 'text-[#8f8075]/75'
        }`}>
          Neuphorism by. @nadzifafinudin_
        </p>

        {/* 10. Floating Bottom Action Dock */}
        <div className={`w-full rounded-[28px] px-6 py-3.5 mt-3 flex items-center justify-between transition-colors ${
          isDark 
            ? 'bg-[#1b1d23] neu-pill-shadow neu-dark text-[#f3efe8]' 
            : 'bg-[#faf9f6] neu-pill-shadow text-[#2e221b]'
        }`}>
          {/* Queue Drawer Button */}
          <button
            onClick={() => setActiveDrawer(activeDrawer === 'queue' ? null : 'queue')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawer === 'queue' 
                ? isDark ? 'text-[#c4956a] scale-110 font-bold' : 'text-[#3c2b20] scale-110 font-bold' 
                : isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
            title="Up Next Queue"
          >
            <ListMusic size={22} className="stroke-[2.2]" />
          </button>

          {/* Equalizer / Audio FX Button */}
          <button
            onClick={() => setActiveDrawer(activeDrawer === 'equalizer' ? null : 'equalizer')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawer === 'equalizer' 
                ? isDark ? 'text-[#c4956a] scale-110 font-bold' : 'text-[#3c2b20] scale-110 font-bold' 
                : isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
            title="Audio Equalizer"
          >
            <SlidersHorizontal size={20} className="stroke-[2.2]" />
          </button>

          {/* Library Button */}
          <button
            onClick={onOpenLibrary}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
            title="Music Library"
          >
            <Library size={20} className="stroke-[2.2]" />
          </button>

          {/* Options / More Button */}
          <button
            onClick={() => setActiveDrawer(activeDrawer === 'options' ? null : 'options')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawer === 'options' 
                ? isDark ? 'text-[#c4956a] scale-110 font-bold' : 'text-[#3c2b20] scale-110 font-bold' 
                : isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
            title="Player Options"
          >
            <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
              <MoreHorizontal size={14} className="stroke-[3]" />
            </div>
          </button>
        </div>
      </div>

      {/* 11. Interactive Overlay Drawers (Queue / Equalizer / Options) */}
      {activeDrawer && (
        <div 
          onClick={() => setActiveDrawer(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-[36px] p-6 relative max-h-[80vh] flex flex-col animate-slideUp ${
              isDark 
                ? 'bg-[#1b1d23] neu-card-shadow neu-dark text-[#f3efe8]' 
                : 'bg-[#faf9f6] neu-card-shadow text-[#2e221b]'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 mb-3 border-b ${
              isDark ? 'border-[#262933]' : 'border-[#e8e2d8]'
            }`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${
                isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
              }`}>
                {activeDrawer === 'queue' && <><ListMusic size={18} /> Up Next Queue ({queue.length})</>}
                {activeDrawer === 'equalizer' && <><SlidersHorizontal size={18} /> Sound Studio Equalizer</>}
                {activeDrawer === 'options' && <><MoreHorizontal size={18} /> Player Options & Modes</>}
              </h3>
              <button 
                onClick={() => setActiveDrawer(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  isDark 
                    ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]' 
                    : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            {/* Queue Content */}
            {activeDrawer === 'queue' && (
              <div className="overflow-y-auto flex-1 space-y-2 pr-1 scrollbar-thin">
                {queue.length === 0 ? (
                  <p className={`text-xs text-center py-8 ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
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
                            ? isDark 
                              ? 'bg-[#382417] text-white shadow-md' 
                              : 'bg-[#3d2b20] text-white shadow-md'
                            : isDark
                              ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8] hover:translate-x-1'
                              : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b] hover:translate-x-1'
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
                            <p className={`text-[10px] truncate ${isCurrent ? 'text-white/70' : isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
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
                            className={`p-1.5 rounded-lg opacity-60 hover:opacity-100 ${isCurrent ? 'text-white' : isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}
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
                    <div className={`flex justify-between text-xs font-semibold ${isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'}`}>
                      <span>{fx}</span>
                      <span className={isDark ? 'text-[#828694]' : 'text-[#8f8075]'}>{60 + i * 10}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      isDark ? 'bg-[#111215] neu-groove-inset neu-dark' : 'bg-[#e8e3da] neu-groove-inset'
                    }`}>
                      <div 
                        className={`h-full rounded-full ${isDark ? 'bg-[#c4956a]' : 'bg-[#3d2b20]'}`}
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
                  className={`w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all ${
                    isDark 
                      ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]' 
                      : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
                  }`}
                >
                  <span>Search Online YouTube Catalog</span>
                  <span className={`font-mono text-[10px] ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>Ctrl + K</span>
                </button>
                <button 
                  onClick={onOpenLibrary}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all ${
                    isDark 
                      ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]' 
                      : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
                  }`}
                >
                  <span>Open Full Music Library</span>
                  <span className={isDark ? 'text-[#828694]' : 'text-[#8f8075]'}>→</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
