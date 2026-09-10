import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
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
  Mic2, 
  ListMusic, 
  Radio, 
  Sparkles,
  Music,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { formatDuration, formatTime } from '../../utils/formatters';

export default function MobileNowPlayingModal({
  isOpen,
  onClose,
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  isFavorite,
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
  onPlayTrack,
  onRemoveFromQueue
}) {
  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'lyrics' | 'queue'
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [lyrics, setLyrics] = useState([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const lyricsContainerRef = useRef(null);

  // Sync seek slider
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

  // Fetch Synced Lyrics when lyrics tab is open
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
        console.warn('Lyrics error:', err);
      }

      if (isMounted) {
        setLyrics([]);
        setIsLoadingLyrics(false);
      }
    };

    fetchLyrics();
    return () => { isMounted = false; };
  }, [track?.id]);

  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#07080e]/95 backdrop-blur-3xl flex flex-col justify-between p-4 sm:p-6 text-white animate-in slide-in-from-bottom duration-300 select-none overflow-hidden">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <button 
          onClick={onClose}
          className="p-2 -ml-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Minimize"
        >
          <ChevronDown size={26} />
        </button>

        <div className="text-center flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Playing From
          </span>
          <span className="text-xs font-extrabold text-white truncate max-w-[200px]">
            {activeTab === 'lyrics' ? 'Real-Time Lyrics' : activeTab === 'queue' ? `Up Next Queue (${queue.length})` : 'Now Playing Studio'}
          </span>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab(activeTab === 'lyrics' ? 'player' : 'lyrics')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'lyrics' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'
            }`}
            title="Lyrics"
          >
            <Mic2 size={15} />
          </button>
          <button
            onClick={() => setActiveTab(activeTab === 'queue' ? 'player' : 'queue')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'queue' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'
            }`}
            title="Queue"
          >
            <ListMusic size={15} />
          </button>
        </div>
      </div>

      {/* Main Body Content based on Active Tab */}
      <div className="flex-1 flex flex-col justify-center my-auto min-h-0 py-2">
        
        {/* VIEW 1: Main Artwork & Player View */}
        {activeTab === 'player' && (
          <div className="flex flex-col items-center justify-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Big Hero Artwork */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 max-w-[70vw] max-h-[70vw] rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/15 flex-shrink-0">
              <img 
                src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'} 
                alt={track.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
            </div>

            {/* Quality Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>LOSSLESS • 320KBPS</span>
            </div>
          </div>
        )}

        {/* VIEW 2: Real-time Synchronized Lyrics */}
        {activeTab === 'lyrics' && (
          <div className="h-full max-h-[50vh] flex flex-col justify-between overflow-hidden glass-card rounded-2xl border border-white/10 p-4 animate-in fade-in duration-200">
            {isLoadingLyrics ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-xs">Loading lyrics...</p>
              </div>
            ) : lyrics.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
                <Mic2 size={30} className="opacity-30" />
                <p className="text-sm font-semibold">No Lyrics Available</p>
                <p className="text-xs text-slate-500">Enjoy the audio track</p>
              </div>
            ) : (
              <div 
                ref={lyricsContainerRef}
                className="flex-1 overflow-y-auto space-y-4 py-3 scrollbar-none text-center"
              >
                {lyrics.map((line, idx) => {
                  const isActive = currentTime >= line.time && (idx === lyrics.length - 1 || currentTime < lyrics[idx + 1].time);
                  return (
                    <p
                      key={idx}
                      onClick={() => onSeek(line.time)}
                      className={`cursor-pointer transition-all duration-300 ${
                        isActive 
                          ? 'text-white text-lg font-extrabold scale-105' 
                          : 'text-slate-500 hover:text-slate-300 text-sm font-medium'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Up Next Queue */}
        {activeTab === 'queue' && (
          <div className="h-full max-h-[50vh] flex flex-col justify-between overflow-hidden glass-card rounded-2xl border border-white/10 p-3 animate-in fade-in duration-200">
            {queue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <ListMusic size={26} className="text-slate-500 mb-2" />
                <p className="text-xs font-semibold text-slate-300">Queue is empty</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 py-2 scrollbar-thin">
                {queue.map((t, idx) => {
                  const isCurrent = idx === currentIndex;
                  return (
                    <div
                      key={`${t.id}-${idx}`}
                      onClick={() => onPlayTrack && onPlayTrack(idx)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-white/15 border border-white/20 text-white font-bold'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <img 
                          src={t.thumbnail} 
                          alt={t.title} 
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs truncate">{t.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{t.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-mono text-slate-500">
                          {formatTime(t.duration)}
                        </span>
                        {onRemoveFromQueue && !isCurrent && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromQueue(idx);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400"
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
          </div>
        )}

      </div>

      {/* Bottom Track Info, Scrubber & Full Controls */}
      <div className="space-y-4 pt-2">
        {/* Track Title, Artist & Favorite Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-white truncate">
              {track.title}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
              <span>{track.artist}</span>
              <CheckCircle2 size={13} className="text-blue-400 flex-shrink-0" />
            </p>
          </div>

          <button
            onClick={onToggleFavorite}
            className={`p-2.5 rounded-full border transition-all cursor-pointer flex-shrink-0 ${
              isFavorite
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-500 scale-105'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Interactive Scrub Slider */}
        <div className="space-y-1">
          <div className="relative flex items-center group">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={displayTime}
              onChange={handleSeekChange}
              onMouseUp={handleSeekCommit}
              onTouchEnd={handleSeekCommit}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{formatDuration(displayTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Playback Controls Row (Shuffle, Prev, Play/Pause, Next, Repeat) */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isShuffle ? 'text-emerald-400' : 'text-slate-500 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>

          <button
            onClick={onPrev}
            className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Previous"
          >
            <SkipBack size={26} />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={24} className="fill-black" />
            ) : (
              <Play size={24} className="fill-black ml-1" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Next"
          >
            <SkipForward size={26} />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              repeatMode !== 'off' ? 'text-emerald-400' : 'text-slate-500 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        {/* Volume Slider Row */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <button 
            onClick={onToggleMute}
            className="text-slate-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>

      </div>

    </div>
  );
}
