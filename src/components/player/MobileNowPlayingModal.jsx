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
  onRemoveFromQueue,
  theme = 'light'
}) {
  const isDark = theme === 'dark';
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
    <div className={`fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 animate-in slide-in-from-bottom duration-300 select-none overflow-hidden transition-colors ${
      isDark ? 'neu-canvas-bg neu-dark text-[#f3efe8]' : 'neu-canvas-bg text-[#2e221b]'
    }`}>
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <button 
          onClick={onClose}
          className={`p-2 -ml-1 rounded-2xl transition-colors cursor-pointer ${
            isDark 
              ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]' 
              : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
          }`}
          title="Minimize"
        >
          <ChevronDown size={22} />
        </button>

        <div className="text-center flex flex-col items-center">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${
            isDark ? 'text-[#828694]' : 'text-[#8f8075]'
          }`}>
            Playing From
          </span>
          <span className={`text-xs font-extrabold truncate max-w-[200px] ${
            isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
          }`}>
            {activeTab === 'lyrics' ? 'Real-Time Lyrics' : activeTab === 'queue' ? `Up Next Queue (${queue.length})` : 'Now Playing Studio'}
          </span>
        </div>

        {/* Tab Switcher Pills */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl ${
          isDark ? 'bg-[#111215] neu-groove-inset neu-dark' : 'bg-[#e8e2d8] neu-groove-inset'
        }`}>
          <button
            onClick={() => setActiveTab(activeTab === 'lyrics' ? 'player' : 'lyrics')}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'lyrics' 
                ? isDark ? 'bg-[#1b1d23] text-[#c4956a] neu-btn-shadow neu-dark' : 'bg-[#faf9f6] text-[#3c2b20] neu-btn-shadow' 
                : isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
            title="Lyrics"
          >
            <Mic2 size={15} />
          </button>
          <button
            onClick={() => setActiveTab(activeTab === 'queue' ? 'player' : 'queue')}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'queue' 
                ? isDark ? 'bg-[#1b1d23] text-[#c4956a] neu-btn-shadow neu-dark' : 'bg-[#faf9f6] text-[#3c2b20] neu-btn-shadow' 
                : isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
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
            {/* Big Teardrop Artwork */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 max-w-[70vw] max-h-[70vw]">
              <div className={`absolute inset-0 rounded-[50%_14%_50%_50%] transition-colors ${
                isDark 
                  ? 'bg-[#1b1d23] shadow-[12px_16px_32px_rgba(0,0,0,0.8),-6px_-6px_18px_rgba(255,255,255,0.03)]' 
                  : 'bg-[#faf9f6] shadow-[12px_16px_32px_rgba(165,150,135,0.3),-8px_-8px_20px_rgba(255,255,255,0.95)]'
              }`} />
              <div className={`absolute inset-1.5 rounded-[50%_14%_50%_50%] p-1 shadow-inner ${
                isDark 
                  ? 'bg-gradient-to-tr from-[#252830] via-[#333845] to-[#1c1d24]' 
                  : 'bg-gradient-to-tr from-[#d6cfc5] via-[#f7f5f2] to-[#b8aca0]'
              }`}>
                <div className="w-full h-full rounded-[50%_12%_50%_50%] overflow-hidden relative">
                  <img 
                    src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'} 
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/20 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Quality Pill */}
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold ${
              isDark ? 'bg-[#111215] neu-groove-inset neu-dark text-[#828694]' : 'bg-[#e8e2d8] neu-groove-inset text-[#8f8075]'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>LOSSLESS • 320KBPS</span>
            </div>
          </div>
        )}

        {/* VIEW 2: Real-time Synchronized Lyrics */}
        {activeTab === 'lyrics' && (
          <div className={`h-full max-h-[50vh] flex flex-col justify-between overflow-hidden rounded-3xl p-4 animate-in fade-in duration-200 ${
            isDark ? 'bg-[#1b1d23] neu-card-shadow neu-dark' : 'bg-[#faf9f6] neu-card-shadow'
          }`}>
            {isLoadingLyrics ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
                  isDark ? 'border-[#c4956a]' : 'border-[#3c2b20]'
                }`} />
                <p className={`text-xs ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>Loading lyrics...</p>
              </div>
            ) : lyrics.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
                <Mic2 size={30} className={`mx-auto opacity-30 ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`} />
                <p className={`text-sm font-semibold ${isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'}`}>No Lyrics Available</p>
                <p className={`text-xs ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>Enjoy the audio track</p>
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
                          ? isDark ? 'text-[#c4956a] text-lg font-extrabold scale-105' : 'text-[#3c2b20] text-lg font-extrabold scale-105'
                          : isDark ? 'text-[#828694] hover:text-[#f3efe8] text-sm font-medium' : 'text-[#8f8075] hover:text-[#2e221b] text-sm font-medium'
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
          <div className={`h-full max-h-[50vh] flex flex-col justify-between overflow-hidden rounded-3xl p-3 animate-in fade-in duration-200 ${
            isDark ? 'bg-[#1b1d23] neu-card-shadow neu-dark' : 'bg-[#faf9f6] neu-card-shadow'
          }`}>
            {queue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <ListMusic size={26} className={`mb-2 ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`} />
                <p className={`text-xs font-semibold ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>Queue is empty</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 py-2 scrollbar-thin">
                {queue.map((t, idx) => {
                  const isCurrent = idx === currentIndex;
                  return (
                    <div
                      key={`${t.id}-${idx}`}
                      onClick={() => onPlayTrack && onPlayTrack(idx)}
                      className={`flex items-center justify-between p-2 rounded-2xl cursor-pointer transition-all ${
                        isCurrent
                          ? isDark ? 'bg-[#382417] text-white shadow-md' : 'bg-[#3c2b20] text-white shadow-md'
                          : isDark ? 'hover:bg-[#232630] text-[#f3efe8]' : 'hover:bg-[#ece6dc] text-[#2e221b]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <img 
                          src={t.thumbnail} 
                          alt={t.title} 
                          className="w-9 h-9 rounded-xl object-cover shadow-sm flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{t.title}</p>
                          <p className={`text-[10px] truncate ${isCurrent ? 'text-white/80' : isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>{t.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-mono ${isCurrent ? 'text-white/80' : isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                          {formatTime(t.duration)}
                        </span>
                        {onRemoveFromQueue && !isCurrent && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromQueue(idx);
                            }}
                            className={`p-1 ${isDark ? 'text-[#828694] hover:text-rose-400' : 'text-[#8f8075] hover:text-rose-500'}`}
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
      <div className={`space-y-4 pt-3 p-4 rounded-[32px] ${
        isDark ? 'bg-[#1b1d23] neu-card-shadow neu-dark' : 'bg-[#faf9f6] neu-card-shadow'
      }`}>
        {/* Track Title, Artist & Favorite Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className={`text-base sm:text-lg font-extrabold truncate ${
              isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
            }`}>
              {track.title}
            </h2>
            <p className={`text-xs font-semibold flex items-center gap-1.5 mt-0.5 truncate ${
              isDark ? 'text-[#828694]' : 'text-[#8f8075]'
            }`}>
              <span>{track.artist}</span>
              <CheckCircle2 size={13} className="text-blue-500 flex-shrink-0" />
            </p>
          </div>

          <button
            onClick={onToggleFavorite}
            className={`p-2.5 rounded-2xl transition-all cursor-pointer flex-shrink-0 ${
              isFavorite
                ? 'text-rose-500 scale-105'
                : isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Interactive Scrub Slider */}
        <div className="space-y-1">
          <div className="relative flex items-center h-4">
            <div className={`w-full h-2 rounded-full overflow-hidden ${
              isDark ? 'bg-[#111215] neu-groove-inset neu-dark' : 'bg-[#e8e2d8] neu-groove-inset'
            }`}>
              <div 
                className={`h-full rounded-full ${
                  isDark ? 'bg-[#c4956a]' : 'bg-[#3d2b20]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={displayTime}
              onChange={handleSeekChange}
              onMouseUp={handleSeekCommit}
              onTouchEnd={handleSeekCommit}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-4"
            />
          </div>

          <div className={`flex items-center justify-between text-[11px] font-mono ${
            isDark ? 'text-[#828694]' : 'text-[#8f8075]'
          }`}>
            <span>{formatDuration(displayTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Playback Controls Row (Shuffle, Prev, Play/Pause, Next, Repeat) */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isShuffle 
                ? isDark ? 'text-[#c4956a]' : 'text-[#3c2b20]' 
                : isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>

          <button
            onClick={onPrev}
            className={`p-2 transition-colors cursor-pointer ${
              isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
            title="Previous"
          >
            <SkipBack size={24} />
          </button>

          <button
            onClick={onTogglePlay}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isDark ? 'bg-[#382417] neu-play-shadow neu-dark' : 'bg-[#3c2b20] neu-play-shadow'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={22} className="fill-white" />
            ) : (
              <Play size={22} className="fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className={`p-2 transition-colors cursor-pointer ${
              isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
            title="Next"
          >
            <SkipForward size={24} />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              repeatMode !== 'off' 
                ? isDark ? 'text-[#c4956a]' : 'text-[#3c2b20]' 
                : isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        {/* Volume Slider Row */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <button 
            onClick={onToggleMute}
            className={`transition-colors flex-shrink-0 cursor-pointer ${
              isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <div className="relative flex-1 flex items-center h-3">
            <div className={`absolute inset-x-0 h-[4px] rounded-full overflow-hidden ${
              isDark ? 'bg-[#111215] neu-groove-inset neu-dark' : 'bg-[#e8e2d8] neu-groove-inset'
            }`}>
              <div 
                className={`h-full rounded-full ${isDark ? 'bg-[#c4956a]' : 'bg-[#3d2b20]'}`}
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
