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
  const isDark = theme === 'dark';
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
    <div className="flex-1 overflow-y-auto pb-36 space-y-6">
      {/* Hero Header in Neuphorism Card */}
      <div className={`p-6 md:p-8 rounded-[38px] transition-all ${
        isDark ? 'bg-[#1b1d23] neu-card-shadow neu-dark' : 'bg-[#faf9f6] neu-card-shadow'
      }`}>
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
          <img 
            src={playlist.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
            alt={playlist.title}
            className="w-44 h-44 md:w-52 md:h-52 rounded-3xl object-cover shadow-lg"
          />

          <div className="flex-1 text-center md:text-left space-y-2">
            <span className={`text-[11px] uppercase tracking-widest font-extrabold ${
              isDark ? 'text-[#c4956a]' : 'text-[#3c2b20]'
            }`}>
              Playlist
            </span>
            <h1 className={`text-2xl md:text-4xl font-black tracking-tight ${
              isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
            }`}>
              {playlist.title}
            </h1>
            <p className={`text-xs line-clamp-2 max-w-2xl font-medium ${
              isDark ? 'text-[#828694]' : 'text-[#8f8075]'
            }`}>
              {playlist.description || 'Imported YouTube playlist'}
            </p>

            <div className={`flex items-center justify-center md:justify-start gap-2 pt-2 text-xs font-semibold ${
              isDark ? 'text-[#828694]' : 'text-[#8f8075]'
            }`}>
              <span className={isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'}>{playlist.author || 'User'}</span>
              <span>•</span>
              <span>{tracks.length} songs</span>
              <span>•</span>
              <span>about {totalMinutes} min</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className={`mt-6 pt-5 flex items-center justify-between gap-4 border-t ${
          isDark ? 'border-[#262933]' : 'border-[#e8e2d8]'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isCurrentPlaylistPlaying) {
                  onTogglePlay();
                } else {
                  onPlayPlaylist(playlist);
                }
              }}
              className="w-13 h-13 rounded-full bg-[#3c2b20] hover:bg-[#4d3729] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={isCurrentPlaylistPlaying ? 'Pause' : 'Play All'}
            >
              {isCurrentPlaylistPlaying ? (
                <Pause size={20} className="fill-white" />
              ) : (
                <Play size={20} className="fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => onPlayPlaylist(playlist, true)}
              className={`p-3 rounded-2xl transition-all cursor-pointer ${
                isDark 
                  ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8] hover:scale-105 active:scale-95' 
                  : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b] hover:scale-105 active:scale-95'
              }`}
              title="Shuffle Play"
            >
              <Shuffle size={18} />
            </button>

            {onDeletePlaylist && (
              <button
                onClick={() => onDeletePlaylist(playlist.id)}
                className={`p-3 rounded-2xl transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-rose-400 hover:scale-105 active:scale-95' 
                    : 'bg-[#faf9f6] neu-btn-shadow text-rose-500 hover:scale-105 active:scale-95'
                }`}
                title="Delete Playlist"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          {/* Search within playlist */}
          <div className="relative w-48 sm:w-64">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-[#828694]' : 'text-[#8f8075]'
            }`} />
            <input 
              type="text"
              placeholder="Filter in playlist..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className={`w-full text-xs pl-9 pr-3 py-2 rounded-2xl outline-none transition-all ${
                isDark 
                  ? 'bg-[#111215] neu-groove-inset neu-dark text-[#f3efe8] placeholder-[#828694]' 
                  : 'bg-[#e8e2d8] neu-groove-inset text-[#2e221b] placeholder-[#8f8075]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Tracks Table in Neuphorism Card */}
      <div className={`p-4 md:p-6 rounded-[36px] ${
        isDark ? 'bg-[#1b1d23] neu-card-shadow neu-dark' : 'bg-[#faf9f6] neu-card-shadow'
      }`}>
        {/* Table Header */}
        <div className={`grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-bold border-b mb-2 uppercase tracking-wider ${
          isDark ? 'text-[#828694] border-[#262933]' : 'text-[#8f8075] border-[#e8e2d8]'
        }`}>
          <span className="col-span-1 text-center">#</span>
          <span className="col-span-6 md:col-span-5">Title</span>
          <span className="hidden md:block col-span-4">Artist</span>
          <span className="col-span-5 md:col-span-2 text-right flex items-center justify-end gap-1">
            <Clock size={13} />
          </span>
        </div>

        {/* Tracks List */}
        {filteredTracks.length === 0 ? (
          <div className={`text-center py-16 space-y-2 ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
            <Music size={32} className="mx-auto opacity-40" />
            <p className="text-sm font-semibold">No songs found in this playlist</p>
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
                  className={`group grid grid-cols-12 gap-4 items-center px-4 py-2.5 rounded-2xl cursor-pointer transition-all ${
                    isThisCurrent
                      ? isDark
                        ? 'bg-[#382417] text-white shadow-md'
                        : 'bg-[#3d2b20] text-white shadow-md'
                      : isDark
                        ? 'hover:bg-[#232630] text-[#f3efe8]'
                        : 'hover:bg-[#ece6dc] text-[#2e221b]'
                  }`}
                >
                  {/* Number / Play Indicator */}
                  <div className={`col-span-1 text-center text-xs font-mono ${
                    isThisCurrent ? 'text-white' : isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                  }`}>
                    {isThisPlaying ? (
                      <div className="flex gap-0.5 justify-center items-end h-3">
                        <div className="w-0.5 bg-current rounded-full animate-equalizer" style={{ animationDelay: '0.1s' }} />
                        <div className="w-0.5 bg-current rounded-full animate-equalizer" style={{ animationDelay: '0.3s' }} />
                        <div className="w-0.5 bg-current rounded-full animate-equalizer" style={{ animationDelay: '0.2s' }} />
                      </div>
                    ) : (
                      <span className="group-hover:hidden">{idx + 1}</span>
                    )}
                    <Play 
                      size={14} 
                      className={`hidden ${isThisPlaying ? '' : 'group-hover:inline'} fill-current mx-auto`} 
                    />
                  </div>

                  {/* Title & Thumbnail */}
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                    <img 
                      src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'} 
                      alt={track.title}
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">
                        {track.title}
                      </p>
                      <p className={`text-xs truncate md:hidden ${
                        isThisCurrent ? 'text-white/80' : isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                      }`}>
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Artist */}
                  <div className={`hidden md:block col-span-4 min-w-0 text-xs truncate ${
                    isThisCurrent ? 'text-white/80' : isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                  }`}>
                    {track.artist}
                  </div>

                  {/* Duration & Actions */}
                  <div className={`col-span-5 md:col-span-2 flex items-center justify-end gap-2 text-xs font-mono ${
                    isThisCurrent ? 'text-white' : isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                  }`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(track);
                      }}
                      className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
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
                          ? 'text-rose-500' 
                          : 'opacity-60 hover:opacity-100'
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

export default React.memo(PlaylistView);
