import React from 'react';
import { Play } from 'lucide-react';
import YoutubeIcon from '../ui/YoutubeIcon';

const FEATURED_CHILL_MIXES = [
  {
    id: 'synthwave-retro',
    title: 'Cyberpunk Synthwave',
    author: 'Neon Drive',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60',
    tracks: [
      { id: '7NOSDKb0HlU', title: 'Synthwave Radio - Chill Synth', artist: 'Lofi Cosmic', duration: 240, thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500' },
      { id: '4xDzrJKXOOY', title: 'Synthwave Chill / Night City', artist: 'Retrowave Boy', duration: 215, thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500' }
    ]
  },
  {
    id: 'deep-focus-code',
    title: 'Deep Coding Focus',
    author: 'Code & Coffee',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60',
    tracks: [
      { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio - Study Beats', artist: 'Lofi Girl', duration: 210, thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500' }
    ]
  },
  {
    id: 'lofi-cafe-vibes',
    title: 'Tokyo Cafe Lofi Rain',
    author: 'Tokyo Chill',
    thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=60',
    tracks: [
      { id: '5yx6BWlEVcY', title: 'Chillhop Summer Vibes', artist: 'Chillhop Music', duration: 185, thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500' }
    ]
  },
  {
    id: 'piano-ambient',
    title: 'Minimalist Piano Ambient',
    author: 'Nordic Calm',
    thumbnail: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=500&auto=format&fit=crop&q=60',
    tracks: [
      { id: 'jfKfPfyJRdk', title: 'Gentle Acoustic Piano Sleep', artist: 'Calm Studio', duration: 195, thumbnail: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=500' }
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
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 pb-36">
      {/* Greeting Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {getGreeting()}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Ad-free music streaming from YouTube Music
        </p>

        {/* Quick Grid (Top Mixes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
          {playlists.slice(0, 6).map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className="group flex items-center gap-3.5 p-2 rounded-2xl glass-card cursor-pointer border border-white/[0.05] hover:border-white/10"
            >
              <img
                src={pl.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                alt={pl.title}
                className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs text-white truncate group-hover:underline">
                  {pl.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {pl.tracks?.length || 0} tracks
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayPlaylist(pl);
                }}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm hover:scale-105 active:scale-95 transition-all mr-1.5 flex-shrink-0"
                title="Play"
              >
                <Play size={14} className="fill-black ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Curated Mixes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white tracking-tight">Featured Mixes</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {FEATURED_CHILL_MIXES.map((mix) => (
            <div
              key={mix.id}
              onClick={() => onPlayPlaylist(mix)}
              className="group p-3 rounded-2xl glass-card cursor-pointer flex flex-col"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5">
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
                  className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Play size={14} className="fill-black ml-0.5" />
                </button>
              </div>

              <h4 className="font-semibold text-xs text-white truncate">
                {mix.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {mix.author}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Played */}
      {history.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-white tracking-tight mb-3">Recently Played</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {history.slice(0, 6).map((track, idx) => (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => onPlayTrack(track)}
                className="group p-2.5 rounded-xl glass-card cursor-pointer flex flex-col"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                  <img
                    src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play size={16} className="fill-white text-white" />
                  </div>
                </div>
                <h4 className="font-medium text-xs text-white truncate">
                  {track.title}
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
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
