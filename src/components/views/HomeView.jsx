import React from 'react';
import { Play, Sparkles, Clock, Flame, Radio } from 'lucide-react';
import YoutubeIcon from '../ui/YoutubeIcon';
import { formatDuration } from '../../utils/formatters';

const FEATURED_CHILL_MIXES = [
  {
    id: 'synthwave-retro',
    title: 'Cyberpunk Synthwave & Retrowave',
    author: 'Neon Drive',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60',
    tracks: [
      { id: '7NOSDKb0HlU', title: 'Synthwave Radio - Chill Synth', artist: 'Lofi Cosmic', duration: 240, thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500' },
      { id: '4xDzrJKXOOY', title: 'Synthwave Chill / Night City Beats', artist: 'Retrowave Boy', duration: 215, thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500' }
    ]
  },
  {
    id: 'deep-focus-code',
    title: 'Deep Coding Focus & Ambient Beats',
    author: 'Code & Coffee',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60',
    tracks: [
      { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio - Beats to Study/Relax to', artist: 'Lofi Girl', duration: 210, thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500' }
    ]
  },
  {
    id: 'lofi-cafe-vibes',
    title: 'Tokyo Cafe Lofi Rain & Chillhop',
    author: 'Tokyo Chill',
    thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=60',
    tracks: [
      { id: '5yx6BWlEVcY', title: 'Chillhop Summer Vibes', artist: 'Chillhop Music', duration: 185, thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500' }
    ]
  }
];

export default function HomeView({
  playlists,
  history,
  onPlayTrack,
  onPlayPlaylist,
  onSelectPlaylist,
  onOpenImportModal
}) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 pb-36">
      {/* Greeting & Top Quick Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{getGreeting()}</span>
              <Sparkles size={24} className="text-cyan-400" />
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Zero ads, zero subscriptions, seamless liquid audio streaming.
            </p>
          </div>
        </div>

        {/* Quick Grid (Top 6 Mixes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {playlists.slice(0, 6).map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className="group flex items-center gap-4 p-2.5 rounded-2xl glass-card cursor-pointer"
            >
              <img
                src={pl.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                alt={pl.title}
                className="w-16 h-16 rounded-xl object-cover shadow-md flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                  {pl.title}
                </h4>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {pl.tracks?.length || 0} tracks
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayPlaylist(pl);
                }}
                className="w-11 h-11 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 active:scale-95 shadow-neon-cyan transition-all mr-2 flex-shrink-0"
                title="Play Playlist"
              >
                <Play size={18} className="fill-black ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Connect YouTube Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-red-600/20 via-purple-600/15 to-cyan-600/20 border border-white/10 backdrop-blur-2xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold">
            <YoutubeIcon size={15} className="text-red-400" />
            <span>YouTube Integration</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white">
            Sync your favorite YouTube Playlists
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Paste any public or unlisted YouTube Music or YouTube playlist URL to stream all tracks with zero ads, high speed, and real-time synced lyrics.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-cyan-300 shadow-neon-cyan/40 hover:scale-105 active:scale-95 transition-all"
            >
              <Radio size={16} />
              <span>Import Playlist Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Mixes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-purple-400" />
            <h3 className="text-xl font-bold text-white">Curated Liquid Mixes</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {FEATURED_CHILL_MIXES.map((mix) => (
            <div
              key={mix.id}
              onClick={() => onPlayPlaylist(mix)}
              className="group p-3.5 rounded-2xl glass-card cursor-pointer flex flex-col"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                <img
                  src={mix.thumbnail}
                  alt={mix.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayPlaylist(mix);
                  }}
                  className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-cyan-400 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 active:scale-95 shadow-neon-cyan transition-all"
                >
                  <Play size={18} className="fill-black ml-0.5" />
                </button>
              </div>

              <h4 className="font-bold text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                {mix.title}
              </h4>
              <p className="text-xs text-slate-400 truncate mt-1">
                {mix.author}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Played History */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={19} className="text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Recently Played</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {history.slice(0, 6).map((track, idx) => (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => onPlayTrack(track)}
                className="group p-3 rounded-2xl glass-card cursor-pointer flex flex-col"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5">
                  <img
                    src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play size={20} className="fill-white text-white" />
                  </div>
                </div>
                <h4 className="font-semibold text-xs text-white truncate group-hover:text-cyan-300">
                  {track.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {track.artist}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
