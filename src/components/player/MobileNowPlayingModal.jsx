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
  Music,
  Trash2
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { lyricsService } from '../../services/lyricsService';

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
  autoplay = true,
  onToggleAutoplay,
  onPlayTrack,
  onRemoveFromQueue,
  theme = 'dark'
}) {
  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'lyrics' | 'queue'
  const [lyrics, setLyrics] = useState([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef(null);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  // Fetch Synced Lyrics only when modal is open and track exists
  useEffect(() => {
    if (!isOpen || !track?.title) {
      setLyrics([]);
      return;
    }

    let isMounted = true;
    setIsLoadingLyrics(true);

    lyricsService.getLyrics(track.title, track.artist, track.duration || duration || 0)
      .then((data) => {
        if (!isMounted) return;
        if (data?.synced && Array.isArray(data.synced)) {
          setLyrics(data.synced);
        } else if (data?.plain) {
          const lines = data.plain.split('\n').filter(Boolean).map((text, idx) => ({
            time: idx * 5,
            text
          }));
          setLyrics(lines);
        } else {
          setLyrics([]);
        }
        setIsLoadingLyrics(false);
      })
      .catch(() => {
        if (isMounted) {
          setLyrics([]);
          setIsLoadingLyrics(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, track?.title, track?.artist, track?.duration, duration]);

  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between pt-safe pb-safe px-4 sm:px-6 animate-in slide-in-from-bottom duration-300 select-none overflow-hidden bg-im-bg/95 backdrop-blur-2xl text-white">
      
      {/* Top Row: chevron-down/back icon left, "Now playing" label centered, small circular avatar right */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <button 
          onClick={onClose}
          className="p-2 -ml-1 rounded-full text-white hover:bg-white/10 transition-all cursor-pointer"
          title="Minimize"
        >
          <ChevronDown size={22} />
        </button>

        <span className="text-[11px] font-black uppercase tracking-widest text-im-inkFaint">
          NOW PLAYING
        </span>

        <div className="w-[32px] h-[32px] rounded-full bg-im-card2 border border-im-line p-0.5 shadow-xs flex items-center justify-center flex-shrink-0">
          <div className="w-full h-full rounded-full bg-im-card flex items-center justify-center text-[10px] font-bold text-white">
            LM
          </div>
        </div>
      </div>

      {/* Main Body Content based on Active Tab */}
      <div className="flex-1 flex flex-col justify-center my-auto min-h-0 py-2">
        
        {/* VIEW 1: Main Artwork View */}
        {activeTab === 'player' && (
          <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Large square album art */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 max-w-[72vw] max-h-[72vw] aspect-square rounded-2xl overflow-hidden bg-im-card border border-im-line shadow-im-float flex items-center justify-center">
              {track.thumbnail ? (
                <img 
                  src={track.thumbnail} 
                  alt={track.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              ) : (
                <Music size={52} className="text-im-inkFaint/40" />
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/15 pointer-events-none" />
            </div>

            {/* Quality Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold bg-im-card border border-im-line text-im-inkSoft shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>LOSSLESS • 320KBPS</span>
            </div>
          </div>
        )}

        {/* VIEW 2: Real-time Synchronized Lyrics */}
        {activeTab === 'lyrics' && (
          <div className="h-full max-h-[50vh] flex flex-col justify-between overflow-hidden rounded-2xl p-4 animate-in fade-in duration-200 bg-im-card border border-im-line shadow-im-float">
            {isLoadingLyrics ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-im-inkSoft">
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin border-white" />
                <p className="text-xs text-im-inkSoft">Loading lyrics...</p>
              </div>
            ) : lyrics.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1">
                <Mic2 size={30} className="mx-auto opacity-30 text-im-inkFaint" />
                <p className="text-sm font-semibold text-white">No Lyrics Available</p>
                <p className="text-xs text-im-inkSoft">Enjoy the audio track</p>
              </div>
            ) : (
              <div 
                ref={lyricsContainerRef}
                className="overflow-y-auto space-y-4 py-8 text-center scrollbar-none flex-1"
              >
                {lyrics.map((l, idx) => {
                  const isActive = currentTime >= l.time && (idx === lyrics.length - 1 || currentTime < lyrics[idx + 1].time);
                  return (
                    <p
                      key={idx}
                      onClick={() => onSeek && onSeek(l.time)}
                      className={`cursor-pointer transition-all duration-300 ${
                        isActive 
                          ? 'text-white text-lg font-extrabold scale-105' 
                          : 'text-im-inkSoft hover:text-white text-sm font-medium'
                      }`}
                    >
                      {l.text || '...'}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Up Next Queue */}
        {activeTab === 'queue' && (
          <div className="h-full max-h-[50vh] flex flex-col justify-between overflow-hidden rounded-2xl p-3 animate-in fade-in duration-200 bg-im-card border border-im-line shadow-im-float">
            {queue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <ListMusic size={26} className="mb-2 text-im-inkFaint" />
                <p className="text-xs font-semibold text-im-inkSoft">Queue is empty</p>
              </div>
            ) : (
              <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 scrollbar-thin">
                {queue.map((t, idx) => {
                  const isCurrent = idx === currentIndex;
                  return (
                    <div
                      key={`${t.id}-${idx}`}
                      onClick={() => onPlayTrack && onPlayTrack(t)}
                      className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-im-card2 border border-white/20 text-white shadow-md'
                          : 'hover:bg-white/10 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={t.thumbnail} 
                          alt="" 
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-white">{t.title}</p>
                          <p className={`text-[10px] truncate ${isCurrent ? 'text-white/80' : 'text-im-inkSoft'}`}>{t.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-[10px] font-mono ${isCurrent ? 'text-white/80' : 'text-im-inkSoft'}`}>
                          {formatDuration(t.duration)}
                        </span>
                        {onRemoveFromQueue && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromQueue(idx);
                            }}
                            className="p-1 text-im-inkFaint hover:text-rose-500 transition-colors"
                            title="Remove"
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
      <div className="space-y-3 p-5 sm:p-6 rounded-3xl bg-im-card border border-im-line shadow-im-float">
        {/* Title bold, artist muted below it */}
        <div className="text-center px-2">
          <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
            {track.title}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-im-inkSoft truncate mt-0.5">
            {track.artist}
          </p>
        </div>

        {/* Thin progress bar (4px, rounded, white fill) with time labels below */}
        <div className="space-y-1">
          <div className="relative flex items-center h-4">
            <div className="w-full h-[4px] rounded-full bg-white/15 overflow-hidden">
              <div 
                className="h-full rounded-full bg-white transition-[width] duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={displayTime}
              onChange={handleSeekChange}
              onMouseUp={handleSeekCommit}
              onTouchEnd={handleSeekCommit}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 z-20"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-im-inkFaint">
            <span>{formatDuration(displayTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Centered playback controls */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 my-1">
          <button
            onClick={onPrev}
            className="p-3 rounded-full text-white hover:text-white/80 hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
            title="Previous"
          >
            <SkipBack size={22} className="fill-current text-white" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center bg-white text-black shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={24} className="fill-current text-black" />
            ) : (
              <Play size={24} className="fill-current text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-3 rounded-full text-white hover:text-white/80 hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
            title="Next"
          >
            <SkipForward size={22} className="fill-current text-white" />
          </button>
        </div>

        {/* Row of secondary icons */}
        <div className="flex items-center justify-between w-full px-3 pt-1 text-im-inkFaint border-t border-im-line">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isFavorite ? 'text-rose-500 scale-110' : 'hover:text-white'
            }`}
            title="Favorite"
          >
            <Heart size={19} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
          </button>

          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isShuffle ? 'text-white font-bold' : 'hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'lyrics' ? 'player' : 'lyrics')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'lyrics' ? 'text-white font-bold' : 'hover:text-white'
            }`}
            title="Lyrics"
          >
            <Mic2 size={18} />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              repeatMode !== 'off' ? 'text-white font-bold' : 'hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>

          <button
            onClick={onToggleAutoplay}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              autoplay ? 'text-white font-bold' : 'hover:text-white'
            }`}
            title={`Autoplay / Radio: ${autoplay ? 'On' : 'Off'}`}
          >
            <Radio size={18} />
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'queue' ? 'player' : 'queue')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'queue' ? 'text-white font-bold' : 'hover:text-white'
            }`}
            title="Queue"
          >
            <ListMusic size={19} />
          </button>
        </div>

        {/* Volume Slider Row */}
        <div className="flex items-center gap-3 px-2 pt-1 border-t border-im-line">
          <button 
            onClick={onToggleMute}
            className="transition-colors flex-shrink-0 cursor-pointer text-im-inkFaint hover:text-white"
          >
            {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <div className="relative flex-1 flex items-center h-3">
            <div className="absolute inset-x-0 h-[4px] rounded-full overflow-hidden bg-white/15">
              <div 
                className="h-full rounded-full bg-white"
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
