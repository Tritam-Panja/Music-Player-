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
  ListPlus,
  MoreVertical
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

function PlaylistView({
  playlist,
  currentTrack,
  isPlaying,
  isFavorite,
  onPlayTrack,
  onPlayPlaylist,
  onTogglePlay,
  onToggleFavorite,
  onAddToQueue,
  onDeletePlaylist,
  theme = 'light'
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

  const ROW_GRADIENTS = [
    'from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2]',
    'from-[#cfe0f5] via-[#e3d3f2] to-[#f2d9e6]',
    'from-[#f2d9e6] via-[#bdeee0] to-[#cfe0f5]',
    'from-[#dff3ea] via-[#e9e6f7] to-[#bdeee0]',
    'from-[#fed6e3] via-[#a8edea] to-[#cfe0f5]',
  ];

  return (
    <div className="w-full flex-1 overflow-y-auto overflow-x-hidden select-none px-4 sm:px-6 md:px-8 py-4 space-y-6 max-w-4xl mx-auto scrollbar-none pb-36 text-ui2-ink dark:text-white">
      {/* =========================================================================
          HERO HEADER CARD
          Rounded-2xl card containing:
          - White caption band on top: "THIS IS" (small uppercase in ui2-inkFaint) + artist/playlist name (large bold heading)
          - Gradient photo placeholder band below caption (rounded corners only on bottom of card)
         ========================================================================= */}
      <div className="rounded-2xl bg-white/80 dark:bg-[#12141f]/80 backdrop-blur-md shadow-ui2-float dark:shadow-none border border-black/5 dark:border-white/10 overflow-hidden flex flex-col transition-all">
        {/* White Caption Band on top */}
        <div className="p-5 sm:p-6 bg-white/95 dark:bg-[#151724]/90 flex flex-col justify-between border-b border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest font-black text-ui2-inkFaint dark:text-white/40">
              THIS IS
            </span>
            <span className="text-xs font-semibold text-ui2-inkSoft dark:text-white/50">
              {tracks.length} {tracks.length === 1 ? 'song' : 'songs'} • {totalMinutes} min
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-ui2-ink dark:text-white mt-1.5 truncate">
            {playlist.title}
          </h1>

          {playlist.description && (
            <p className="text-xs font-medium text-ui2-inkSoft dark:text-white/50 mt-1 line-clamp-1">
              {playlist.description}
            </p>
          )}

          {/* Controls & Search row within caption */}
          <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (isCurrentPlaylistPlaying) {
                    onTogglePlay();
                  } else {
                    onPlayPlaylist(playlist);
                  }
                }}
                className="w-10 h-10 rounded-full bg-ui2-accentInk dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isCurrentPlaylistPlaying ? 'Pause' : 'Play All'}
              >
                {isCurrentPlaylistPlaying ? (
                  <Pause size={18} className="fill-current" />
                ) : (
                  <Play size={18} className="fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => onPlayPlaylist(playlist, true)}
                className="p-2.5 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-ui2-ink dark:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Shuffle Play"
              >
                <Shuffle size={16} />
              </button>

              {onDeletePlaylist && (
                <button
                  onClick={() => onDeletePlaylist(playlist.id)}
                  className="p-2.5 rounded-xl bg-black/5 hover:bg-rose-50 hover:text-rose-500 dark:bg-white/10 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 text-ui2-inkFaint dark:text-white/40 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Delete Playlist"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Filter in playlist */}
            <div className="relative w-40 sm:w-56">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ui2-inkFaint dark:text-white/40" />
              <input 
                type="text"
                placeholder="Filter tracks..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-full outline-none transition-all bg-black/5 dark:bg-white/10 border border-transparent focus:border-black/10 dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#1b1d2a] text-ui2-ink dark:text-white placeholder:text-ui2-inkFaint dark:placeholder:text-white/40"
              />
            </div>
          </div>
        </div>

        {/* Gradient photo placeholder band below caption (rounded corners only on bottom of card) */}
        <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-b-2xl overflow-hidden bg-gradient-to-br from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2]">
          {playlist.thumbnail ? (
            <img 
              src={playlist.thumbnail} 
              alt={playlist.title} 
              className="w-full h-full object-cover mix-blend-overlay opacity-80"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music size={48} className="text-ui2-inkFaint/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          <div className="absolute bottom-3 left-4 text-white">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-md">
              {playlist.author || 'Curated Playlist'}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TRACKS LIST (Matching HomeView.jsx's track row style)
         ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-ui2-ink dark:text-white">
            Tracks
          </h2>
          <span className="text-xs font-semibold text-ui2-inkFaint dark:text-white/40">
            {filteredTracks.length} {filteredTracks.length === 1 ? 'song' : 'songs'}
          </span>
        </div>

        {filteredTracks.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-ui2-inkFaint dark:text-white/40 bg-white/50 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 p-6">
            <Music size={32} className="mx-auto opacity-40" />
            <p className="text-sm font-semibold">No songs found in this playlist</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredTracks.map((track, idx) => {
              const isThisPlaying = currentTrack?.id === track.id && isPlaying;
              const isThisCurrent = currentTrack?.id === track.id;
              const isFav = isFavorite(track.id);

              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track, playlist)}
                  className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all duration-200 border border-black/5 dark:border-white/10 ${
                    isThisCurrent
                      ? 'bg-ui2-accentInk dark:bg-white/20 text-white shadow-ui2-soft dark:shadow-none'
                      : 'bg-white/70 hover:bg-white/90 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] backdrop-blur-sm text-ui2-ink dark:text-white shadow-sm dark:shadow-none hover:shadow-ui2-soft'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* 46px rounded thumbnail (gradient placeholder, vary gradient per row) */}
                    <div className={`relative w-[46px] h-[46px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]} shadow-xs border border-black/5 dark:border-white/10`}>
                      <img
                        loading="lazy"
                        decoding="async"
                        src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity ${
                        isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        {isThisPlaying ? (
                          <div className="flex gap-0.5 justify-center items-end h-3">
                            <div className="w-0.5 bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.1s' }} />
                            <div className="w-0.5 bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.3s' }} />
                            <div className="w-0.5 bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.2s' }} />
                          </div>
                        ) : (
                          <Play size={14} className="fill-white text-white ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Title bold + artist muted */}
                    <div className="min-w-0 flex-1">
                      <h4 className={`font-bold text-xs sm:text-sm truncate group-hover:underline ${
                        isThisCurrent ? 'text-white' : 'text-ui2-ink dark:text-white'
                      }`}>
                        {track.title}
                      </h4>
                      <p className={`text-[11px] truncate mt-0.5 ${
                        isThisCurrent ? 'text-white/80' : 'text-ui2-inkSoft dark:text-white/50'
                      }`}>
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Kebab icon */}
                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    {track.duration && (
                      <span className={`text-[11px] font-mono mr-1 hidden sm:inline ${
                        isThisCurrent ? 'text-white/80' : 'text-ui2-inkFaint dark:text-white/40'
                      }`}>
                        {formatDuration(track.duration)}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(track);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isFav
                          ? 'text-rose-500'
                          : isThisCurrent
                            ? 'text-white/70 hover:text-white'
                            : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white'
                      }`}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isThisCurrent
                          ? 'text-white/70 hover:text-white hover:bg-white/10'
                          : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                      title="More options"
                    >
                      <MoreVertical size={16} />
                    </button>
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

export default React.memo(PlaylistView);
