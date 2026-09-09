import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Shuffle, 
  Heart, 
  Clock, 
  Music, 
  Search, 
  Trash2, 
  Share2, 
  ListPlus 
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export default function PlaylistView({
  playlist,
  currentTrack,
  isPlaying,
  isFavorite,
  onPlayTrack,
  onPlayPlaylist,
  onTogglePlay,
  onToggleFavorite,
  onAddToQueue,
  onDeletePlaylist
}) {
  const [filterText, setFilterText] = useState('');

  if (!playlist) return null;

  const tracks = playlist.tracks || [];
  const filteredTracks = filterText
    ? tracks.filter(t => 
        t.title.toLowerCase().includes(filterText.toLowerCase()) ||
        t.artist.toLowerCase().includes(filterText.toLowerCase())
      )
    : tracks;

  const totalDurationSeconds = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalDurationSeconds / 60);

  const isCurrentPlaylistPlaying = isPlaying && tracks.some(t => t.id === currentTrack?.id);

  return (
    <div className="flex-1 overflow-y-auto pb-36">
      {/* Hero Header with Frosted Glass & Ambient Blurred Backdrop */}
      <div className="relative p-6 md:p-10 border-b border-white/10 overflow-hidden">
        {/* Background Blurred Glow */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 filter blur-3xl scale-125 pointer-events-none"
          style={{ backgroundImage: `url(${playlist.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090a10]/60 to-[#090a10]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
          <img 
            src={playlist.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
            alt={playlist.title}
            className="w-48 h-48 md:w-56 md:h-56 rounded-3xl object-cover shadow-2xl border border-white/15"
          />

          <div className="flex-1 text-center md:text-left space-y-2">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
              Playlist
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              {playlist.title}
            </h1>
            <p className="text-sm text-slate-300 line-clamp-2 max-w-2xl">
              {playlist.description || 'Imported YouTube playlist'}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-2 pt-2 text-xs text-slate-400 font-medium">
              <span className="text-white font-semibold">{playlist.author || 'User'}</span>
              <span>•</span>
              <span>{tracks.length} songs</span>
              <span>•</span>
              <span>about {totalMinutes} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-6 md:px-10 py-5 flex items-center justify-between gap-4 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (isCurrentPlaylistPlaying) {
                onTogglePlay();
              } else {
                onPlayPlaylist(playlist);
              }
            }}
            className="w-14 h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-neon-cyan hover:scale-105 active:scale-95 transition-all"
            title={isCurrentPlaylistPlaying ? 'Pause' : 'Play All'}
          >
            {isCurrentPlaylistPlaying ? (
              <Pause size={24} className="fill-black" />
            ) : (
              <Play size={24} className="fill-black ml-1" />
            )}
          </button>

          <button
            onClick={() => onPlayPlaylist(playlist, true)}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Shuffle Play"
          >
            <Shuffle size={20} />
          </button>
        </div>

        {/* Search within playlist */}
        <div className="relative w-48 sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Filter in playlist..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-white/5 text-white placeholder-slate-400 text-xs pl-9 pr-3 py-2 rounded-xl border border-white/10 focus:border-cyan-400/50 outline-none"
          />
        </div>
      </div>

      {/* Tracks Table */}
      <div className="px-6 md:px-10 py-4">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-slate-400 border-b border-white/10 mb-2 uppercase tracking-wider">
          <span className="col-span-1 text-center">#</span>
          <span className="col-span-6 md:col-span-5">Title</span>
          <span className="hidden md:block col-span-4">Artist</span>
          <span className="col-span-5 md:col-span-2 text-right flex items-center justify-end gap-1">
            <Clock size={14} />
          </span>
        </div>

        {/* Tracks List */}
        {filteredTracks.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Music size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No songs found in this playlist</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTracks.map((track, idx) => {
              const isThisPlaying = currentTrack?.id === track.id && isPlaying;
              const isThisCurrent = currentTrack?.id === track.id;
              const isFav = isFavorite(track.id);

              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track, playlist)}
                  className={`group grid grid-cols-12 gap-4 items-center px-4 py-2.5 rounded-2xl cursor-pointer transition-colors border ${
                    isThisCurrent
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'hover:bg-white/5 border-transparent hover:border-white/5'
                  }`}
                >
                  {/* Number / Play Indicator */}
                  <div className="col-span-1 text-center text-xs text-slate-400 font-mono">
                    {isThisPlaying ? (
                      <div className="flex gap-0.5 justify-center items-end h-3">
                        <div className="w-0.5 bg-cyan-400 rounded-full animate-equalizer" style={{ animationDelay: '0.1s' }} />
                        <div className="w-0.5 bg-cyan-400 rounded-full animate-equalizer" style={{ animationDelay: '0.3s' }} />
                        <div className="w-0.5 bg-cyan-400 rounded-full animate-equalizer" style={{ animationDelay: '0.2s' }} />
                      </div>
                    ) : (
                      <span className="group-hover:hidden">{idx + 1}</span>
                    )}
                    <Play 
                      size={14} 
                      className={`hidden ${isThisPlaying ? '' : 'group-hover:inline'} fill-white text-white mx-auto`} 
                    />
                  </div>

                  {/* Title & Thumbnail */}
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                    <img 
                      src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
                      alt={track.title}
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        isThisCurrent ? 'text-cyan-300' : 'text-white group-hover:text-cyan-300'
                      }`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate md:hidden">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Artist */}
                  <div className="hidden md:block col-span-4 min-w-0 text-xs text-slate-400 truncate">
                    {track.artist}
                  </div>

                  {/* Duration & Actions */}
                  <div className="col-span-5 md:col-span-2 flex items-center justify-end gap-2 text-xs font-mono text-slate-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(track);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Add to queue"
                    >
                      <ListPlus size={15} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(track);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav 
                          ? 'text-pink-500' 
                          : 'text-slate-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100'
                      }`}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                    </button>

                    <span className="w-10 text-right">{formatDuration(track.duration)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
