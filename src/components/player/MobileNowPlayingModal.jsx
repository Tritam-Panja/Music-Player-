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
    <div className="fixed inset-0 z-50 flex flex-col justify-between pt-safe pb-safe px-4 sm:px-6 animate-in slide-in-from-bottom duration-300 select-none overflow-hidden bg-white/90 dark:bg-[#0d0e16]/95 backdrop-blur-2xl text-ui2-ink dark:text-white">
      
      {/* Top Row: chevron-down/back icon left, "Now playing" label centered in uppercase small text, small circular avatar right */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <button 
          onClick={onClose}
          className="p-2 -ml-1 rounded-full text-ui2-ink dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
          title="Minimize"
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

      {/* Main Body Content based on Active Tab */}
      <div className="flex-1 flex flex-col justify-center my-auto min-h-0 py-2">
        
        {/* VIEW 1: Main Artwork View */}
        {activeTab === 'player' && (
          <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Large square album art, rounded-2xl, shadow-ui2-float, gradient placeholder background */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 max-w-[72vw] max-h-[72vw] aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2] shadow-ui2-float dark:shadow-none border border-black/5 dark:border-white/10 flex items-center justify-center">
              {track.thumbnail ? (
                <img 
                  src={track.thumbnail} 
                  alt={track.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              ) : (
                <Music size={52} className="text-ui2-inkFaint/40 dark:text-white/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/15 pointer-events-none" />
            </div>

            {/* Quality Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none text-ui2-inkSoft dark:text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>LOSSLESS • 320KBPS</span>
            </div>
          </div>
        )}

        {/* VIEW 2: Real-time Synchronized Lyrics */}
        {activeTab === 'lyrics' && (
          <div className="h-full max-h-[50vh] flex flex-col justify-between overflow-hidden rounded-2xl p-4 animate-in fade-in duration-200 bg-white/80 dark:bg-[#141622]/85 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-ui2-float dark:shadow-none">
            {isLoadingLyrics ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-ui2-inkSoft dark:text-white/50">
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin border-ui2-accentInk dark:border-white" />
                <p className="text-xs text-ui2-inkSoft dark:text-white/50">Loading lyrics...</p>
              </div>
            ) : lyrics.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
                <Mic2 size={30} className="mx-auto opacity-30 text-ui2-inkFaint dark:text-white/30" />
                <p className="text-sm font-semibold text-ui2-ink dark:text-white">No Lyrics Available</p>
                <p className="text-xs text-ui2-inkSoft dark:text-white/50">Enjoy the audio track</p>
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
                          ? 'text-ui2-accentInk dark:text-white text-lg font-extrabold scale-105' 
                          : 'text-ui2-inkSoft dark:text-white/50 hover:text-ui2-ink dark:hover:text-white text-sm font-medium'
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
          <div className="h-full max-h-[50vh] flex flex-col justify-between overflow-hidden rounded-2xl p-3 animate-in fade-in duration-200 bg-white/80 dark:bg-[#141622]/85 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-ui2-float dark:shadow-none">
            {queue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <ListMusic size={26} className="mb-2 text-ui2-inkFaint dark:text-white/40" />
                <p className="text-xs font-semibold text-ui2-inkSoft dark:text-white/50">Queue is empty</p>
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
                          ? 'bg-ui2-accentInk dark:bg-white/20 text-white shadow-md'
                          : 'hover:bg-black/5 dark:hover:bg-white/10 text-ui2-ink dark:text-white'
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
                          <p className={`text-[10px] truncate ${isCurrent ? 'text-white/80' : 'text-ui2-inkSoft dark:text-white/50'}`}>{t.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-mono ${isCurrent ? 'text-white/80' : 'text-ui2-inkSoft dark:text-white/50'}`}>
                          {formatTime(t.duration)}
                        </span>
                        {onRemoveFromQueue && !isCurrent && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromQueue(idx);
                            }}
                            className="p-1 text-ui2-inkFaint dark:text-white/40 hover:text-rose-500 transition-colors"
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

      {/* Bottom Track Info, Scrubber & Full Controls Card */}
      <div className="space-y-3 p-5 sm:p-6 rounded-3xl bg-white/85 dark:bg-[#141622]/85 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-ui2-float dark:shadow-none">
        {/* Title bold, artist muted below it */}
        <div className="text-center px-2">
          <h2 className="text-xl sm:text-2xl font-black text-ui2-ink dark:text-white truncate tracking-tight">
            {track.title}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">
            {track.artist}
          </p>
        </div>

        {/* Thin progress bar (5px, rounded, gradient fill) with time labels below */}
        <div className="space-y-1">
          <div className="relative flex items-center h-4">
            <div className="w-full h-[5px] rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#bdeee0] via-[#93c5fd] to-[#c084fc] transition-[width] duration-100"
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
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 z-20"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-ui2-inkFaint dark:text-white/40">
            <span>{formatDuration(displayTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Centered playback controls: prev icon, large white circular play/pause button (shadow-ui2-soft, dark icon) center, next icon */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 my-1">
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
            title={isPlaying ? 'Pause' : 'Play'}
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

        {/* Row of secondary icons (like, shuffle, lyrics) below controls, evenly spaced, ui2-inkFaint color */}
        <div className="flex items-center justify-between w-full px-3 pt-1 text-ui2-inkFaint dark:text-white/40 border-t border-black/5 dark:border-white/10">
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
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isShuffle ? 'text-ui2-accentInk dark:text-white font-bold' : 'hover:text-ui2-ink dark:hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'lyrics' ? 'player' : 'lyrics')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'lyrics' ? 'text-ui2-accentInk dark:text-white font-bold' : 'hover:text-ui2-ink dark:hover:text-white'
            }`}
            title="Lyrics"
          >
            <Mic2 size={18} />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              repeatMode !== 'off' ? 'text-ui2-accentInk dark:text-white font-bold' : 'hover:text-ui2-ink dark:hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'queue' ? 'player' : 'queue')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'queue' ? 'text-ui2-accentInk dark:text-white font-bold' : 'hover:text-ui2-ink dark:hover:text-white'
            }`}
            title="Queue"
          >
            <ListMusic size={19} />
          </button>
        </div>

        {/* Volume Slider Row */}
        <div className="flex items-center gap-3 px-2 pt-1 border-t border-black/5">
          <button 
            onClick={onToggleMute}
            className="transition-colors flex-shrink-0 cursor-pointer text-ui2-inkFaint hover:text-ui2-ink"
          >
            {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <div className="relative flex-1 flex items-center h-3">
            <div className="absolute inset-x-0 h-[4px] rounded-full overflow-hidden bg-black/5">
              <div 
                className="h-full rounded-full bg-ui2-accentInk"
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
