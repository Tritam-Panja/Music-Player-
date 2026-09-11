import React, { useEffect, useState, useRef } from 'react';
import { lyricsService } from '../../services/lyricsService';
import { playerService } from '../../core/player/PlayerService';
import { X, Mic2, Sparkles, Music } from 'lucide-react';

export default function LyricsView({ track, currentTime, isOpen, onClose }) {
  const [lyricsData, setLyricsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const activeLineRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!track || !isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setLyricsData(null);
    setActiveLineIndex(-1);

    lyricsService.getLyrics(track.title, track.artist, track.duration)
      .then(res => {
        if (isMounted) {
          setLyricsData(res);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [track?.id, isOpen]);

  // Track active line based on current playback timestamp
  useEffect(() => {
    if (!lyricsData?.synced || lyricsData.synced.length === 0) return;

    const lines = lyricsData.synced;
    let foundIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        foundIndex = i;
      } else {
        break;
      }
    }

    if (foundIndex !== activeLineIndex) {
      setActiveLineIndex(foundIndex);
    }
  }, [currentTime, lyricsData]);

  // Smoothly scroll active line to center of view
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-3xl animate-in fade-in duration-300">
      {/* Liquid Ambient Backlight */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/25 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Panel */}
      <div className="relative w-full max-w-4xl h-[85vh] flex flex-col glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <img 
              src={track?.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
              alt={track?.title}
              className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-white/10"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white line-clamp-1">{track?.title}</h3>
                {lyricsData?.isSynced && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                    <Sparkles size={12} /> Synced
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400">{track?.artist}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Close Lyrics"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lyrics Body */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto px-6 py-12 md:px-16 text-center space-y-7 scroll-smooth"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Fetching real-time synced lyrics...</p>
            </div>
          ) : lyricsData?.synced ? (
            lyricsData.synced.map((line, idx) => {
              const isActive = idx === activeLineIndex;
              const isPast = idx < activeLineIndex;

              return (
                <p
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => playerService.seek(line.time)}
                  className={`cursor-pointer transition-all duration-300 select-none ${
                    isActive 
                      ? 'text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 scale-105 drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]' 
                      : isPast
                        ? 'text-lg md:text-xl font-medium text-slate-400/60 hover:text-slate-200'
                        : 'text-lg md:text-xl font-medium text-slate-500/40 hover:text-slate-300'
                  }`}
                >
                  {line.text}
                </p>
              );
            })
          ) : lyricsData?.plain ? (
            <div className="whitespace-pre-line text-lg text-slate-300 leading-relaxed font-medium">
              {lyricsData.plain}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <div className="p-4 rounded-full bg-white/5 border border-white/10 text-slate-400">
                <Music size={32} />
              </div>
              <p className="text-base font-semibold text-slate-200">No synced lyrics found for this track</p>
              <p className="text-xs text-slate-500">Enjoy the music or try another song from YouTube</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
