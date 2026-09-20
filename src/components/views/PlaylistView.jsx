import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Shuffle, 
  Heart, 
  Music, 
  Search, 
  Trash2, 
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

  const ROW_GRADIENTS = [
    'from-rose-500/30 to-purple-600/30',
    'from-amber-500/30 to-orange-600/30',
    'from-emerald-500/30 to-teal-600/30',
    'from-blue-500/30 to-indigo-600/30',
    'from-violet-500/30 to-fuchsia-600/30',
    'from-cyan-500/30 to-blue-600/30',
  ];

  return (
    <div className="w-full flex-1 overflow-y-auto overflow-x-hidden select-none px-4 sm:px-6 md:px-8 py-4 space-y-6 max-w-4xl mx-auto scrollbar-none pb-36 text-white">
      {/* =========================================================================
          HERO HEADER CARD
          Rounded-2xl hero card with gradient background, playlist/artist name in bold white
         ========================================================================= */}
      <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden shadow-im-float border border-im-line bg-gradient-to-br from-[#c76b8a]/40 via-[#5b3a63]/50 to-im-card transition-all group">
        {/* Background photo placeholder / overlay */}
        {playlist.thumbnail ? (
          <img 
            loading="lazy"
            decoding="async"
            src={playlist.thumbnail} 
            alt={playlist.title} 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 transition-transform duration-700 group-hover:scale-105 pointer-events-none"
          />
        ) : null}
        
        {/* Darkening bottom-to-top and radial gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-im-bg via-im-bg/60 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between min-h-[160px] sm:min-h-[180px] gap-4">
          {/* Top metadata badge */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10">
              {playlist.author || 'Playlist'}
            </span>
            <span className="text-xs font-medium text-im-inkFaint">
              {tracks.length} {tracks.length === 1 ? 'song' : 'songs'} • {totalMinutes} min
            </span>
          </div>

          {/* Playlist Title & Description */}
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white truncate [text-shadow:_0_2px_14px_rgba(0,0,0,0.8)]">
              {playlist.title}
            </h1>
            {playlist.description && (
              <p className="text-xs sm:text-sm font-medium text-white/70 mt-1.5 line-clamp-2 max-w-2xl [text-shadow:_0_1px_8px_rgba(0,0,0,0.8)]">
                {playlist.description}
              </p>
            )}
          </div>

          {/* Controls & Search row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (isCurrentPlaylistPlaying) {
                    onTogglePlay();
                  } else {
                    onPlayPlaylist(playlist);
                  }
                }}
                className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isCurrentPlaylistPlaying ? 'Pause' : 'Play All'}
              >
                {isCurrentPlaylistPlaying ? (
                  <Pause size={18} className="fill-current text-black" />
                ) : (
                  <Play size={18} className="fill-current text-black ml-0.5" />
                )}
              </button>

              <button
                onClick={() => onPlayPlaylist(playlist, true)}
                className="p-2.5 rounded-xl bg-im-card hover:bg-im-card2 border border-im-line text-white transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                title="Shuffle Play"
              >
                <Shuffle size={16} />
              </button>

              {onDeletePlaylist && (
                <button
                  onClick={() => onDeletePlaylist(playlist.id)}
                  className="p-2.5 rounded-xl bg-im-card hover:bg-rose-500/20 hover:text-rose-400 border border-im-line text-im-inkFaint transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                  title="Delete Playlist"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Filter search input */}
            <div className="relative w-44 sm:w-56">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-im-inkFaint pointer-events-none" />
              <input 
                type="text"
                placeholder="Filter tracks..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-full outline-none transition-all bg-im-card/80 border border-im-line focus:border-white/20 focus:bg-im-card text-white placeholder:text-im-inkFaint"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TRACKS LIST (Matching HomeView.jsx's track row style)
         ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-white">
            Tracks
          </h2>
          <span className="text-xs font-semibold text-im-inkFaint">
            {filteredTracks.length} {filteredTracks.length === 1 ? 'song' : 'songs'}
          </span>
        </div>

        {filteredTracks.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-im-inkFaint bg-im-card rounded-2xl border border-im-line p-6 shadow-sm">
            <Music size={32} className="mx-auto opacity-40 text-im-inkFaint" />
            <p className="text-sm font-semibold text-white">No songs found in this playlist</p>
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
                  className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 cursor-pointer border ${
                    isThisCurrent
                      ? 'bg-im-card2 border-white/20 shadow-im-float'
                      : 'bg-im-card hover:bg-im-card2 border-im-line shadow-sm hover:shadow-im-float'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* 46px rounded thumbnail (matching HomeView.jsx style) */}
                    <div className={`relative w-[46px] h-[46px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]} border border-im-line shadow-xs`}>
                      <img
                        loading="lazy"
                        decoding="async"
                        src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
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

                    {/* Title bold white + artist in im-inkFaint */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:underline">
                        {track.title}
                      </h4>
                      <p className="text-[11px] font-medium text-im-inkFaint truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Kebab icon */}
                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    {track.duration && (
                      <span className="text-[11px] font-mono text-im-inkFaint mr-1 hidden sm:inline">
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
                          ? 'text-rose-500 hover:text-rose-400'
                          : 'text-im-inkFaint hover:text-white hover:bg-white/5'
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
                      className="p-1.5 text-im-inkFaint hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer flex-shrink-0"
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
