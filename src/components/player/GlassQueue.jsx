import React from 'react';
import { X, Play, Trash2, ListMusic, Music } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

const ROW_GRADIENTS = [
  'from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2]',
  'from-[#cfe0f5] via-[#e3d3f2] to-[#f2d9e6]',
  'from-[#f2d9e6] via-[#bdeee0] to-[#cfe0f5]',
  'from-[#dff3ea] via-[#e9e6f7] to-[#bdeee0]',
  'from-[#fed6e3] via-[#a8edea] to-[#cfe0f5]',
];

export default function GlassQueue({ 
  queue, 
  currentIndex, 
  isOpen, 
  onClose, 
  onPlayTrack, 
  onRemoveTrack,
  onClearQueue 
}) {
  if (!isOpen) return null;

  const currentTrack = queue[currentIndex];
  const upcomingTracks = queue.slice(currentIndex + 1);

  return (
    <div className="fixed top-0 right-0 bottom-20 sm:bottom-24 w-80 sm:w-96 z-40 bg-white/50 dark:bg-[#0c0d15]/95 backdrop-blur-xl border-l border-black/5 dark:border-white/10 shadow-ui2-float flex flex-col text-ui2-ink dark:text-white animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/[0.04]">
        <div className="flex items-center gap-2 text-ui2-ink dark:text-white font-bold text-sm sm:text-base">
          <ListMusic size={18} className="text-ui2-ink dark:text-white" />
          <span>Play Queue</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 dark:bg-white/10 border border-black/5 dark:border-white/10 text-ui2-inkSoft dark:text-white/70 font-medium shadow-xs">
            {queue.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {queue.length > 1 && (
            <button
              onClick={onClearQueue}
              className="p-1.5 rounded-lg text-ui2-inkFaint dark:text-white/40 hover:text-rose-500 hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear upcoming queue"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Close queue"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Queue Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {/* Now Playing */}
        {currentTrack && (
          <div>
            <span className="text-[11px] font-bold text-ui2-inkSoft dark:text-white/40 uppercase tracking-wider block mb-2 px-1">
              Now Playing
            </span>
            <div className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.08] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-ui2-soft">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-[46px] h-[46px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2] shadow-xs border border-black/5 dark:border-white/10">
                  <img 
                    src={currentTrack.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
                    alt={currentTrack.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-ui2-ink dark:text-white truncate">{currentTrack.title}</h4>
                  <p className="text-[11px] font-medium text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">{currentTrack.artist}</p>
                </div>
              </div>
              <div className="flex gap-1 items-end h-4 pr-1 flex-shrink-0">
                <div className="w-1 bg-ui2-accentInk dark:bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 bg-ui2-accentInk dark:bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.3s' }} />
                <div className="w-1 bg-ui2-accentInk dark:bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        {/* Next Up */}
        <div>
          <span className="text-[11px] font-bold text-ui2-inkSoft dark:text-white/40 uppercase tracking-wider block mb-2 px-1">
            Next Up ({upcomingTracks.length})
          </span>

          {upcomingTracks.length === 0 ? (
            <div className="text-center py-8 px-4 text-ui2-inkFaint dark:text-white/40">
              <Music size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium text-ui2-inkSoft dark:text-white/50">No upcoming tracks.</p>
              <p className="text-[11px] text-ui2-inkFaint dark:text-white/30 mt-0.5">Add songs from playlists or search!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingTracks.map((track, idx) => {
                const actualIndex = currentIndex + 1 + idx;
                return (
                  <div
                    key={`${track.id}-${actualIndex}`}
                    className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/70 hover:bg-white/90 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none hover:shadow-ui2-soft transition-all duration-200 cursor-pointer"
                  >
                    <div 
                      className="flex items-center gap-3 min-w-0 flex-1"
                      onClick={() => onPlayTrack(actualIndex)}
                    >
                      {/* 46px rounded-xl thumbnail (gradient placeholder, vary the gradient per row) */}
                      <div className={`relative w-[46px] h-[46px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]} shadow-xs border border-black/5 dark:border-white/10`}>
                        <img 
                          loading="lazy"
                          decoding="async"
                          src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
                          alt={track.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play size={14} className="text-white fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Title bold + artist muted */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs sm:text-sm text-ui2-ink dark:text-white truncate group-hover:text-ui2-accentInk dark:group-hover:text-white group-hover:underline">
                          {track.title}
                        </h4>
                        <p className="text-[11px] font-medium text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">{track.artist}</p>
                      </div>
                    </div>

                    {/* Right action: Duration or Remove on hover */}
                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                      <span className="text-[11px] font-mono text-ui2-inkFaint dark:text-white/40 group-hover:hidden">
                        {formatDuration(track.duration)}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTrack(actualIndex);
                        }}
                        className="hidden group-hover:flex p-1.5 text-ui2-inkFaint dark:text-white/40 hover:text-rose-500 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title="Remove from queue"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
