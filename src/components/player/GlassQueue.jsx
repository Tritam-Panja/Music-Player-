import React from 'react';
import { X, Play, Trash2, ListMusic, Music } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

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
    <div className="fixed top-0 right-0 bottom-24 w-80 sm:w-96 z-40 glass-panel border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <ListMusic size={20} className="text-cyan-400" />
          <span>Play Queue</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
            {queue.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 1 && (
            <button
              onClick={onClearQueue}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
              title="Clear upcoming queue"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Queue Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Now Playing */}
        {currentTrack && (
          <div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-2 px-2">
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <img 
                src={currentTrack.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
                alt={currentTrack.title}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
              </div>
              <div className="flex gap-1 items-end h-4 pr-2">
                <div className="w-1 bg-cyan-400 rounded-full animate-equalizer" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 bg-cyan-400 rounded-full animate-equalizer" style={{ animationDelay: '0.3s' }} />
                <div className="w-1 bg-cyan-400 rounded-full animate-equalizer" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        {/* Next Up */}
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-2">
            Next Up ({upcomingTracks.length})
          </span>

          {upcomingTracks.length === 0 ? (
            <div className="text-center py-8 px-4 text-slate-500">
              <Music size={28} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">No upcoming tracks.</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Add songs from playlists or search!</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {upcomingTracks.map((track, idx) => {
                const actualIndex = currentIndex + 1 + idx;
                return (
                  <div
                    key={`${track.id}-${actualIndex}`}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors cursor-pointer"
                  >
                    <div 
                      className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                      onClick={() => onPlayTrack(actualIndex)}
                    >
                      <img 
                        src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={16} className="text-white fill-white" />
                      </div>
                    </div>

                    <div 
                      className="flex-1 min-w-0"
                      onClick={() => onPlayTrack(actualIndex)}
                    >
                      <p className="text-xs font-medium text-slate-200 truncate group-hover:text-cyan-300">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{track.artist}</p>
                    </div>

                    <span className="text-[11px] text-slate-500 group-hover:hidden">
                      {formatDuration(track.duration)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTrack(actualIndex);
                      }}
                      className="hidden group-hover:block p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove from queue"
                    >
                      <X size={14} />
                    </button>
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
