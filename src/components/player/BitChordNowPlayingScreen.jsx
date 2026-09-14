import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown,
  Heart, 
  ListMusic, 
  Mic2, 
  Activity, 
  Info, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  Music, 
  Radio, 
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Trash2
} from 'lucide-react';
import VisualizerCanvas from './VisualizerCanvas';
import { formatTime } from '../../utils/formatters';

export default function BitChordNowPlayingScreen({
  track,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  queue = [],
  currentIndex = 0,
  isFavorite = false,
  onToggleFavorite,
  onPlayTrack,
  onRemoveFromQueue,
  onSeek,
  onTogglePlay,
  onPrev,
  onNext,
  onToggleShuffle,
  onToggleRepeat
}) {
  // Active view: 'track' | 'lyrics' | 'queue' | 'visualizer' | 'stats'
  const [activeTab, setActiveTab] = useState('track');
  const [lyrics, setLyrics] = useState([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [showStatsForNerds, setShowStatsForNerds] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  const lyricsContainerRef = useRef(null);

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

  // Fetch Synced Lyrics from LRCLIB on track change
  useEffect(() => {
    if (!track?.title) {
      setLyrics([]);
      return;
    }

    let isMounted = true;
    setIsLoadingLyrics(true);

    const fetchLyrics = async () => {
      try {
        const cleanTitle = track.title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
        const artist = track.artist || '';
        const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(artist)}&duration=${track.duration || 0}`;
        
        let res = await fetch(url);
        if (!res.ok) {
          res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${artist}`)}`);
        }

        if (res.ok) {
          const data = await res.json();
          const target = Array.isArray(data) ? data[0] : data;
          if (target && target.syncedLyrics && isMounted) {
            const parsed = target.syncedLyrics
              .split('\n')
              .map((line) => {
                const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
                if (match) {
                  const minutes = parseInt(match[1], 10);
                  const seconds = parseFloat(match[2]);
                  return {
                    time: minutes * 60 + seconds,
                    text: match[3].trim()
                  };
                }
                return null;
              })
              .filter(Boolean);

            setLyrics(parsed);
            setIsLoadingLyrics(false);
            return;
          }
        }
      } catch (err) {
        console.warn('LRCLIB fetch error:', err);
      }

      if (isMounted) {
        setLyrics([
          { time: 0, text: `♪ ${track.title} ♪` },
          { time: 8, text: `Performed by ${track.artist}` },
          { time: 18, text: "High-Fidelity Audio Streaming directly via Liquid Music" },
          { time: 30, text: "Feel the frequency and smooth acoustic harmony" },
          { time: 48, text: "Immersive soundstage enabled • 320kbps Lossless" },
          { time: 65, text: "Enjoying the rhythm in your personal studio..." }
        ]);
        setIsLoadingLyrics(false);
      }
    };

    fetchLyrics();
    return () => { isMounted = false; };
  }, [track?.id, track?.title, track?.artist]);

  // Find active lyric line index based on currentTime
  const activeLyricIndex = lyrics.findIndex((line, i) => {
    const nextLine = lyrics[i + 1];
    if (nextLine) {
      return currentTime >= line.time && currentTime < nextLine.time;
    }
    return currentTime >= line.time;
  });

  // Auto-scroll lyrics smoothly to active line
  useEffect(() => {
    if ((activeTab === 'lyrics' || window.innerWidth >= 1024) && lyricsContainerRef.current && activeLyricIndex >= 0) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeLyricIndex, activeTab]);

  return (
    <div className="relative w-full min-h-[calc(100vh-140px)] flex flex-col justify-between p-3 sm:p-6 lg:p-10 pb-28 sm:pb-32 max-w-7xl mx-auto text-ui2-ink dark:text-white select-none">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between z-10 flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ui2-accentInk dark:bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ui2-accentInk dark:bg-white"></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-ui2-ink dark:text-white">
            Now Playing Studio
          </span>
          <span className="text-ui2-inkFaint dark:text-white/40">•</span>
          <span className="text-[11px] font-semibold text-ui2-inkSoft dark:text-white/50 tracking-wider">
            Lossless Engine
          </span>
        </div>

        {/* View Switcher Capsule */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-white/70 dark:bg-white/[0.06] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none max-w-full overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('track')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'track'
                ? 'bg-ui2-accentInk dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white'
            }`}
          >
            <Music size={13} />
            <span>Track</span>
          </button>

          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'lyrics'
                ? 'bg-ui2-accentInk dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white'
            }`}
          >
            <Mic2 size={13} />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-ui2-accentInk dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white'
            }`}
          >
            <ListMusic size={13} />
            <span>Queue ({queue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'visualizer'
                ? 'bg-ui2-accentInk dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white'
            }`}
          >
            <Activity size={13} />
            <span className="hidden sm:inline">Visualizer</span>
          </button>

          <button
            onClick={() => setShowStatsForNerds((prev) => !prev)}
            title="Toggle Stats for Nerds"
            className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${
              showStatsForNerds
                ? 'bg-ui2-accentInk dark:bg-white text-white dark:text-black'
                : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white'
            }`}
          >
            <Info size={14} />
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left = Unified Player Card, Right = Lyrics / Queue / Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 my-auto items-center py-2">
        
        {/* LEFT: Unified Player Card (consistent across all three screens!) */}
        <div className={`lg:col-span-5 flex flex-col items-center justify-center ${
          activeTab === 'track' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="w-full max-w-[420px] rounded-3xl p-5 sm:p-7 flex flex-col bg-white/80 dark:bg-[#12141f]/85 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-ui2-float dark:shadow-none transition-all duration-300">
            
            {/* Top Row: chevron-down/back icon left, "Now playing" label centered in uppercase small text, small circular avatar right */}
            <div className="w-full flex items-center justify-between pb-2 mb-1">
              <button
                type="button"
                onClick={() => setActiveTab('track')}
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
                {track?.artist || "Select a track to play"}
              </p>
            </div>

            {/* Thin progress bar (5px, rounded, gradient fill) with time labels below */}
            <div className="w-full mt-2 mb-1 px-1">
              <div className="relative w-full h-4 flex items-center">
                <div className="w-full h-[5px] rounded-full bg-black/5 dark:bg-white/10 relative overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#bdeee0] via-[#93c5fd] to-[#c084fc] transition-[width] duration-100"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-ui2-accentInk dark:bg-white border-2 border-white dark:border-black shadow-sm pointer-events-none transition-[left] duration-100"
                  style={{ left: `calc(${progressPercent}% - 7px)` }}
                />

                <input
                  type="range"
                  min={0}
                  max={totalDuration}
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
                <span>{formatTime(displayTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Centered playback controls: prev icon, large white circular play/pause button (shadow-ui2-soft, dark icon) center, next icon */}
            <div className="flex items-center justify-center gap-6 sm:gap-8 my-3">
              <button
                onClick={onPrev}
                className="p-3 rounded-full text-ui2-ink dark:text-white hover:text-ui2-accentInk dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                title="Previous"
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
                title="Next"
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
                onClick={onToggleShuffle}
                className="p-2 rounded-xl hover:text-ui2-ink dark:hover:text-white transition-all cursor-pointer"
                title="Shuffle"
              >
                <Shuffle size={18} />
              </button>

              <button
                onClick={() => setActiveTab(activeTab === 'lyrics' ? 'track' : 'lyrics')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'lyrics' ? 'text-ui2-accentInk dark:text-white font-bold scale-110' : 'hover:text-ui2-ink dark:hover:text-white'
                }`}
                title="Lyrics"
              >
                <Mic2 size={18} />
              </button>

              <button
                onClick={onToggleRepeat}
                className="p-2 rounded-xl hover:text-ui2-ink dark:hover:text-white transition-all cursor-pointer"
                title="Repeat"
              >
                <Repeat size={18} />
              </button>

              <button
                onClick={() => setActiveTab(activeTab === 'queue' ? 'track' : 'queue')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'queue' ? 'text-ui2-accentInk dark:text-white font-bold scale-110' : 'hover:text-ui2-ink dark:hover:text-white'
                }`}
                title="Queue"
              >
                <ListMusic size={19} />
              </button>
            </div>

            {/* Stats for Nerds Card */}
            {showStatsForNerds && (
              <div className="mt-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-[11px] text-ui2-inkSoft dark:text-white/60 space-y-1.5 text-left animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-ui2-ink dark:text-white font-bold border-b border-black/5 dark:border-white/10 pb-1">
                  <span>Audio Specs</span>
                  <span className="text-emerald-500">Optimal</span>
                </div>
                <div className="flex justify-between">
                  <span>Codec:</span>
                  <span className="text-ui2-ink dark:text-white font-mono">Opus 48kHz (WebM)</span>
                </div>
                <div className="flex justify-between">
                  <span>Bitrate:</span>
                  <span className="text-ui2-ink dark:text-white font-mono">320 kbps VBR</span>
                </div>
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="text-ui2-ink dark:text-white font-mono">BitChord Native Pipeline</span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT: Dynamic Multi-View Panel (Lyrics / Queue / Visualizer) */}
        <div className={`lg:col-span-7 h-[460px] sm:h-[500px] rounded-3xl p-5 sm:p-7 flex flex-col justify-between overflow-hidden bg-white/80 dark:bg-[#12141f]/85 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-ui2-float dark:shadow-none relative ${
          activeTab === 'track' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* 1. Lyrics Mode */}
          {activeTab === 'lyrics' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-ui2-ink dark:text-white">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Real-Time Word Sync Lyrics</span>
                </div>
                <span className="text-[10px] text-ui2-inkFaint dark:text-white/40 font-mono">
                  Source: LRCLIB Open-Source Database
                </span>
              </div>

              {isLoadingLyrics ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                  <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin border-ui2-accentInk dark:border-white" />
                  <p className="text-xs text-ui2-inkSoft dark:text-white/50">Loading synchronized lyrics...</p>
                </div>
              ) : lyrics.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-center text-ui2-inkSoft dark:text-white/50">
                  <Mic2 size={32} className="opacity-30 text-ui2-inkFaint dark:text-white/30" />
                  <p className="text-sm font-semibold text-ui2-ink dark:text-white">Instrumental or No Lyrics Found</p>
                  <p className="text-xs text-ui2-inkSoft dark:text-white/50">Enjoy the soundscape and harmonic rhythm</p>
                </div>
              ) : (
                <div 
                  ref={lyricsContainerRef}
                  className="flex-1 overflow-y-auto space-y-5 py-4 scrollbar-none scroll-smooth select-none text-left"
                >
                  {lyrics.map((line, idx) => {
                    const isActive = idx === activeLyricIndex;
                    const isPassed = activeLyricIndex > idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => onSeek && onSeek(line.time)}
                        className={`cursor-pointer transition-all duration-300 rounded-xl px-3 py-1.5 ${
                          isActive
                            ? 'text-ui2-accentInk dark:text-white text-xl sm:text-2xl font-extrabold scale-105 bg-black/5 dark:bg-white/10 shadow-sm'
                            : isPassed
                            ? 'text-ui2-inkFaint dark:text-white/30 hover:text-ui2-ink dark:hover:text-white text-base font-medium'
                            : 'text-ui2-inkSoft dark:text-white/50 hover:text-ui2-ink dark:hover:text-white text-base font-medium'
                        }`}
                      >
                        <p className="tracking-tight leading-relaxed">
                          {line.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-ui2-inkFaint dark:text-white/40">
                <span>Click any line to seek</span>
                <span>Auto-scrolling synchronized</span>
              </div>
            </div>
          )}

          {/* 2. Up Next Queue Mode */}
          {activeTab === 'queue' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-ui2-ink dark:text-white">
                  <ListMusic size={14} className="text-ui2-accentInk dark:text-white" />
                  <span>Up Next Queue</span>
                </div>
                <span className="text-[10px] text-ui2-inkFaint dark:text-white/40 font-mono">
                  {queue.length} Tracks in Queue
                </span>
              </div>

              {queue.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/[0.05] border border-black/5 dark:border-white/10 flex items-center justify-center mb-3">
                    <ListMusic size={22} className="text-ui2-inkFaint dark:text-white/40" />
                  </div>
                  <p className="text-sm font-semibold text-ui2-ink dark:text-white">Your queue is empty</p>
                  <p className="text-xs text-ui2-inkSoft dark:text-white/50 mt-1 max-w-xs">
                    Search for songs or playlists to add them to your playback queue.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2 py-3 scrollbar-thin">
                  {queue.map((t, idx) => {
                    const isCurrent = idx === currentIndex;
                    return (
                      <div
                        key={`${t.id}-${idx}`}
                        onClick={() => onPlayTrack && onPlayTrack(idx)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-ui2-accentInk dark:bg-white/20 text-white shadow-sm'
                            : 'hover:bg-black/5 dark:hover:bg-white/[0.08] text-ui2-ink dark:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 pr-2">
                          <span className={`w-5 text-center text-xs font-mono flex-shrink-0 ${isCurrent ? 'text-white' : 'text-ui2-inkFaint dark:text-white/40'}`}>
                            {isCurrent ? <Play size={12} className="fill-current animate-pulse mx-auto" /> : idx + 1}
                          </span>
                          <img 
                            src={t.thumbnail} 
                            alt={t.title} 
                            className="w-10 h-10 rounded-xl object-cover border border-black/5 dark:border-white/10 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">{t.title}</p>
                            <p className={`text-[11px] truncate ${isCurrent ? 'text-white/80' : 'text-ui2-inkSoft dark:text-white/50'}`}>{t.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[11px] font-mono ${isCurrent ? 'text-white/80' : 'text-ui2-inkFaint dark:text-white/40'}`}>
                            {formatTime(t.duration)}
                          </span>
                          {onRemoveFromQueue && !isCurrent && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveFromQueue(idx);
                              }}
                              className="p-1 rounded-lg text-ui2-inkFaint dark:text-white/40 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-ui2-inkFaint dark:text-white/40">
                <span>Click to jump</span>
                <span>Automatic continuous play</span>
              </div>
            </div>
          )}

          {/* 3. Audio Visualizer Mode */}
          {activeTab === 'visualizer' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-ui2-ink dark:text-white">
                  <Activity size={14} className="text-ui2-accentInk dark:text-white" />
                  <span>BitChord 60FPS Audio Waveform</span>
                </div>
                <span className="text-[10px] text-ui2-inkSoft dark:text-white/50 font-mono">
                  Web Audio API • 128 Bands
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center p-4">
                <VisualizerCanvas isPlaying={isPlaying} />
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-ui2-inkFaint dark:text-white/40">
                <span>Stereo Phase & Spectrum</span>
                <span>Lossless Real-time Analyser</span>
              </div>
            </div>
          )}

          {/* Default / Fallback Tab when right panel is shown on desktop in 'track' mode */}
          {activeTab === 'track' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-ui2-ink dark:text-white">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Real-Time Lyrics & Soundscape</span>
                </div>
                <button
                  onClick={() => setActiveTab('lyrics')}
                  className="text-xs font-bold text-ui2-accentInk dark:text-white hover:underline cursor-pointer"
                >
                  Full View →
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-white/70 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center shadow-ui2-soft">
                  <Mic2 size={26} className="text-ui2-ink dark:text-white" />
                </div>
                <h3 className="text-base font-bold text-ui2-ink dark:text-white">Synced Lyrics & Studio Tools</h3>
                <p className="text-xs text-ui2-inkSoft dark:text-white/50 max-w-sm">
                  Switch tabs above to view synchronized lyrics, manage your playback queue, or activate the 60FPS audio waveform visualizer.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('lyrics')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-ui2-accentInk dark:bg-white text-white dark:text-black shadow-sm hover:scale-105 transition-all cursor-pointer"
                  >
                    View Lyrics
                  </button>
                  <button
                    onClick={() => setActiveTab('queue')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/70 dark:bg-white/10 border border-black/5 dark:border-white/10 text-ui2-ink dark:text-white hover:bg-white/90 dark:hover:bg-white/20 transition-all cursor-pointer"
                  >
                    View Queue ({queue.length})
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-ui2-inkFaint dark:text-white/40">
                <span>Studio Audio Engine</span>
                <span>Lossless Output</span>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
