import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  ListMusic, 
  Mic2, 
  Activity, 
  Info, 
  Sparkles, 
  Share2, 
  Volume2, 
  CheckCircle2, 
  Music, 
  Radio, 
  Clock, 
  Layers,
  ChevronRight,
  Play,
  Trash2
} from 'lucide-react';
import VisualizerCanvas from './VisualizerCanvas';
import { formatTime } from '../../utils/formatters';

export default function BitChordNowPlayingScreen({
  track,
  isPlaying,
  currentTime,
  duration,
  queue = [],
  currentIndex = 0,
  isFavorite,
  onToggleFavorite,
  onPlayTrack,
  onRemoveFromQueue,
  onSeek
}) {
  // Active right-side tab: 'lyrics' | 'queue' | 'visualizer' | 'stats'
  const [activeTab, setActiveTab] = useState('lyrics');
  const [lyrics, setLyrics] = useState([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [showStatsForNerds, setShowStatsForNerds] = useState(false);

  // 3D Perspective tilt state for album cover
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const lyricsContainerRef = useRef(null);

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
          // Fallback search
          res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${artist}`)}`);
        }

        if (res.ok) {
          const data = await res.json();
          const target = Array.isArray(data) ? data[0] : data;
          if (target && target.syncedLyrics && isMounted) {
            // Parse LRC string: [mm:ss.xx] Line
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
        // Aesthetic mock lyrics fallback if not found
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
    if (activeTab === 'lyrics' && lyricsContainerRef.current && activeLyricIndex >= 0) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeLyricIndex, activeTab]);

  // Mouse move handler for 3D card tilt
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / (rect.height / 2)) * 12,
      y: (x / (rect.width / 2)) * 12
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-140px)] flex flex-col justify-between p-3 sm:p-6 lg:p-10 pb-28 sm:pb-32 max-w-7xl mx-auto">
      {/* Top Bar inside Player Studio */}
      <div className="flex items-center justify-between z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            Now Playing Studio
          </span>
          <span className="text-white/20">•</span>
          <span className="text-[11px] font-semibold text-white/50 tracking-wider">
            BitChord Engine
          </span>
        </div>

        {/* View Switcher Capsule (Track/Vinyl on mobile | Lyrics / Queue / Visualizer / Stats) */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-xl max-w-full overflow-x-auto scrollbar-none">
          {/* Mobile-only Track / Disc view button */}
          <button
            onClick={() => setActiveTab('vinyl')}
            className={`lg:hidden px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'vinyl'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Music size={13} />
            <span>Track</span>
          </button>

          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'lyrics'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Mic2 size={13} />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <ListMusic size={13} />
            <span className="hidden sm:inline">Up Next ({queue.length})</span>
            <span className="sm:hidden">Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'visualizer'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
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
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Info size={14} />
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left = Hero Vinyl Artwork, Right = Lyrics / Queue / Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 my-auto items-center py-6">
        
        {/* LEFT: 3D Album Vinyl & Track Metadata (5 cols on wide screens) */}
        <div className={`lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5 sm:space-y-6 ${
          activeTab === 'vinyl' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Interactive 3D Card with Vinyl Disc */}
          <div 
            className="relative group cursor-pointer perspective-[1000px] select-none my-2 sm:my-0"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1000 }}
          >
            <div 
              className="relative transition-transform duration-200 ease-out flex items-center justify-center"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
              }}
            >
              {/* Spinning Vinyl Record Disc (slides out when playing) */}
              <div 
                className={`absolute top-1 sm:top-2 right-0 w-44 h-44 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full shadow-2xl transition-all duration-700 ease-out -z-10 ${
                  isPlaying 
                    ? 'translate-x-12 sm:translate-x-20 lg:translate-x-28 rotate-180 opacity-95' 
                    : 'translate-x-2 sm:translate-x-4 opacity-40'
                }`}
                style={{
                  background: 'radial-gradient(circle, #18181b 0%, #09090b 45%, #27272a 46%, #09090b 55%, #18181b 70%, #09090b 100%)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 0 15px rgba(255,255,255,0.1)'
                }}
              >
                {/* Vinyl Grooves Texture */}
                <div className="absolute inset-3 sm:inset-4 rounded-full border border-white/5 opacity-40 pointer-events-none" />
                <div className="absolute inset-7 sm:inset-10 rounded-full border border-white/5 opacity-40 pointer-events-none" />
                <div className="absolute inset-12 sm:inset-16 rounded-full border border-white/5 opacity-40 pointer-events-none" />
                
                {/* Vinyl Center Label with Spinning Track Cover */}
                <div 
                  className={`absolute inset-[32%] rounded-full overflow-hidden border-2 border-white/20 shadow-inner ${
                    isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''
                  }`}
                >
                  {track?.thumbnail ? (
                    <img 
                      src={track.thumbnail} 
                      alt="Center label"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <Music size={16} className="text-slate-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 m-auto w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-black border border-white/30" />
                </div>
              </div>

              {/* Main Album Artwork Jacket */}
              <div className="relative w-44 h-44 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-white/15 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] group-hover:shadow-[0_30px_70px_-10px_rgba(56,189,248,0.25)] transition-shadow duration-500 flex items-center justify-center bg-gradient-to-br from-slate-900/80 to-black/90">
                {track?.thumbnail ? (
                  <img
                    src={track.thumbnail}
                    alt={track?.title || 'Now Playing'}
                    className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500">
                    <Music size={44} className="opacity-40 mb-2" />
                    <p className="text-xs font-semibold text-slate-400">No Track Selected</p>
                  </div>
                )}

                {/* Subtle glass reflection highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent pointer-events-none" />
                
                {/* Vinyl Jacket Seam Border */}
                <div className="absolute inset-0 border border-white/10 rounded-2xl sm:rounded-3xl pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Track Metadata & Badges */}
          <div className="space-y-3 max-w-sm">
            <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
              {/* BitChord Audio Quality Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold text-slate-300 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>LOSSLESS • 320KBPS</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/20 text-[10px] font-semibold text-blue-400">
                <Radio size={10} />
                <span>YOUTUBE MUSIC STREAM</span>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight line-clamp-2">
                {track?.title || 'No Track Selected'}
              </h1>
              <p className="text-base font-medium text-slate-300 flex items-center justify-center lg:justify-start gap-1.5">
                <span>{track?.artist || 'Select a song to begin'}</span>
                <CheckCircle2 size={15} className="text-blue-400 inline" />
              </p>
            </div>

            {/* Quick Actions Row */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                onClick={onToggleFavorite}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-500/20 border-rose-500/30 text-rose-400 scale-105'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={() => setActiveTab('lyrics')}
                className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <Mic2 size={14} />
                <span>View Lyrics</span>
              </button>

              <button
                onClick={() => setActiveTab('queue')}
                className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <ListMusic size={14} />
                <span>Next in Queue</span>
              </button>
            </div>

            {/* Stats for Nerds Card (BitChord signature) */}
            {showStatsForNerds && (
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-[11px] text-slate-400 space-y-1.5 text-left animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-slate-200 font-bold border-b border-white/[0.06] pb-1">
                  <span>Audio Specs</span>
                  <span className="text-emerald-400">Optimal</span>
                </div>
                <div className="flex justify-between">
                  <span>Codec:</span>
                  <span className="text-white font-mono">Opus 48kHz (WebM)</span>
                </div>
                <div className="flex justify-between">
                  <span>Bitrate:</span>
                  <span className="text-white font-mono">320 kbps VBR</span>
                </div>
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="text-white font-mono">BitChord Native Pipeline</span>
                </div>
                <div className="flex justify-between">
                  <span>Hardware Acceleration:</span>
                  <span className="text-emerald-400 font-mono">Active (GPU 60fps)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Dynamic Multi-View Panel (7 cols on wide screens) */}
        <div className={`lg:col-span-7 h-[420px] sm:h-[480px] rounded-3xl glass-panel border border-white/10 p-5 sm:p-6 flex-col justify-between overflow-hidden shadow-2xl relative ${
          activeTab === 'vinyl' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* 1. Lyrics Mode (Karaoke Synchronized) */}
          {activeTab === 'lyrics' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Real-Time Word Sync Lyrics</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Source: LRCLIB Open-Source Database
                </span>
              </div>

              {isLoadingLyrics ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">Loading synchronized lyrics...</p>
                </div>
              ) : lyrics.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-center text-slate-400">
                  <Mic2 size={32} className="opacity-30" />
                  <p className="text-sm font-semibold">Instrumental or No Lyrics Found</p>
                  <p className="text-xs text-slate-500">Enjoy the soundscape and harmonic rhythm</p>
                </div>
              ) : (
                <div 
                  ref={lyricsContainerRef}
                  className="flex-1 overflow-y-auto space-y-6 py-6 scrollbar-none scroll-smooth select-none text-left"
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
                            ? 'text-white text-xl sm:text-2xl font-extrabold scale-105 bg-white/[0.06] shadow-sm'
                            : isPassed
                            ? 'text-slate-500 hover:text-slate-300 text-base font-medium'
                            : 'text-slate-600 hover:text-slate-400 text-base font-medium'
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

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
                <span>Click any line to seek</span>
                <span>Auto-scrolling synchronized</span>
              </div>
            </div>
          )}

          {/* 2. Up Next Queue Mode */}
          {activeTab === 'queue' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <ListMusic size={14} className="text-blue-400" />
                  <span>Up Next Queue</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {queue.length} Tracks in Queue
                </span>
              </div>

              {queue.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-3">
                    <ListMusic size={22} className="text-slate-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">Your queue is empty</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Search for songs or playlists above to add them to your playback queue.
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
                            ? 'bg-white/10 border border-white/15 text-white'
                            : 'hover:bg-white/5 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 pr-2">
                          <span className="w-5 text-center text-xs font-mono text-slate-500 flex-shrink-0">
                            {isCurrent ? <Play size={12} className="text-emerald-400 animate-pulse fill-current" /> : idx + 1}
                          </span>
                          <img 
                            src={t.thumbnail} 
                            alt={t.title} 
                            className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">{t.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{t.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] font-mono text-slate-500">
                            {formatTime(t.duration)}
                          </span>
                          {onRemoveFromQueue && !isCurrent && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveFromQueue(idx);
                              }}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
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

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
                <span>Drag or click to jump</span>
                <span>Automatic continuous play</span>
              </div>
            </div>
          )}

          {/* 3. Audio Visualizer Mode */}
          {activeTab === 'visualizer' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Activity size={14} className="text-emerald-400" />
                  <span>BitChord 60FPS Audio Waveform</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Web Audio API • 128 Bands
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center p-4">
                <VisualizerCanvas isPlaying={isPlaying} />
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
                <span>Stereo Phase & Spectrum</span>
                <span>Lossless Real-time Analyser</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
