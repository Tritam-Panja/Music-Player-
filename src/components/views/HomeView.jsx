import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Sparkles, 
  Flame, 
  Radio, 
  Music, 
  ChevronRight, 
  ChevronLeft, 
  Globe, 
  Disc3, 
  Library, 
  Search,
  ExternalLink,
  ListPlus
} from 'lucide-react';
import { searchEngine } from '../../services/searchEngine';

// Handpicked reference songs matching user's Spotify trending showcase
const SPOTIFY_TRENDING_SONGS = [
  {
    id: 'mirzapur-vaaroon',
    ytQuery: 'Vaaroon Forever Mirzapur The Movie Anand Bhaskar',
    title: "Vaaroon Forever - From \"Mirzapur The Movie\"",
    artist: "Anand Bhaskar, Romy, Shreya Ghoshal, Ginny...",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
    duration: 214
  },
  {
    id: 'sadhu-parvati',
    ytQuery: 'Parvati Sadhu Tiwari',
    title: "Parvati",
    artist: "Sadhu Tiwari",
    thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80",
    duration: 232
  },
  {
    id: 'mirzapur-do-numbari',
    ytQuery: 'Do Numbari Mirzapur The Movie Dhanda Nyoliwala',
    title: "Do Numbari - From \"Mirzapur The Movie\"",
    artist: "Dhanda Nyoliwala",
    thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80",
    duration: 198
  },
  {
    id: 'sammi-meri-waar',
    ytQuery: 'Sammi Meri Waar Luminexa',
    title: "Sammi Meri Waar",
    artist: "Luminexa",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
    duration: 220
  },
  {
    id: 'radhimaa-think-indie',
    ytQuery: 'Radhimaa From Think Indie Sai Abhyankkar',
    title: "Radhimaa - From \"Think Indie\"",
    artist: "Sai Abhyankkar, Nargis Teji, Asma Teji, Vivek",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
    duration: 205
  },
  {
    id: 'rathinamaa-minnal',
    ytQuery: 'Rathinamaa Female Version Saurav Srivastava Gnanavel',
    title: "Rathinamaa - Female Version",
    artist: "Saurav Srivastava, Gnanavel",
    thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
    duration: 240
  }
];

// Popular artists matching user's Spotify reference image
const SPOTIFY_POPULAR_ARTISTS = [
  {
    id: 'artist-pritam',
    name: 'Pritam',
    role: 'Artist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    searchQuery: 'Pritam best hits songs'
  },
  {
    id: 'artist-ar-rahman',
    name: 'A.R. Rahman',
    role: 'Artist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    searchQuery: 'AR Rahman masterpiece hits'
  },
  {
    id: 'artist-arijit-singh',
    name: 'Arijit Singh',
    role: 'Artist',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    searchQuery: 'Arijit Singh romantic hits'
  },
  {
    id: 'artist-sachin-jigar',
    name: 'Sachin-Jigar',
    role: 'Artist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    searchQuery: 'Sachin Jigar top chart songs'
  },
  {
    id: 'artist-vishal-shekhar',
    name: 'Vishal-Shekhar',
    role: 'Artist',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    searchQuery: 'Vishal Shekhar Bollywood hits'
  },
  {
    id: 'artist-anirudh',
    name: 'Anirudh Ravichander',
    role: 'Artist',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    searchQuery: 'Anirudh Ravichander top hits'
  }
];

const FEATURED_CURATED_MIXES = [
  {
    id: 'cyberpunk-synth',
    title: 'Cyberpunk Synthwave 2026',
    author: 'Neon Drive',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    tracks: [
      { id: '7NOSDKb0HlU', title: 'Synthwave Radio - Chill Synth', artist: 'Neon Drive', duration: 240, thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500' },
      { id: '4xDzrJKXOOY', title: 'Synthwave Chill / Night City', artist: 'Retrowave Boy', duration: 215, thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500' }
    ]
  },
  {
    id: 'deep-focus-code',
    title: 'Deep Coding & Flow State',
    author: 'Code & Coffee',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=80',
    tracks: [
      { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio - Study Beats', artist: 'Lofi Girl', duration: 210, thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500' }
    ]
  },
  {
    id: 'tokyo-cafe-rain',
    title: 'Tokyo Cafe Rainy Lofi',
    author: 'Tokyo Chill Records',
    thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
    tracks: [
      { id: '5yx6BWlEVcY', title: 'Chillhop Summer Vibes', artist: 'Chillhop Music', duration: 185, thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500' }
    ]
  },
  {
    id: 'minimal-piano-calm',
    title: 'Minimalist Acoustic Piano',
    author: 'Nordic Calm Studio',
    thumbnail: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=500&auto=format&fit=crop&q=80',
    tracks: [
      { id: 'jfKfPfyJRdk', title: 'Gentle Acoustic Piano Sleep', artist: 'Nordic Calm', duration: 195, thumbnail: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=500' }
    ]
  }
];

function HomeView({
  playlists = [],
  history = [],
  onPlayTrack,
  onPlayPlaylist,
  onSelectPlaylist,
  onOpenImportModal,
  onOpenSearch,
  onViewChange,
  theme = 'light'
}) {
  const isDark = theme === 'dark';
  const [activeCategory, setActiveCategory] = useState('all');
  const [trendingTracks, setTrendingTracks] = useState(SPOTIFY_TRENDING_SONGS);
  const [isPlayingId, setIsPlayingId] = useState(null);

  // Attempt to load live trending songs from searchEngine/backend if available
  useEffect(() => {
    let isMounted = true;
    searchEngine.getTrendingCharts()
      .then((charts) => {
        if (isMounted && Array.isArray(charts) && charts.length > 0) {
          // Merge handpicked reference songs with live charts for richness
          const merged = [...SPOTIFY_TRENDING_SONGS];
          charts.forEach(t => {
            if (!merged.some(m => m.id === t.id)) {
              merged.push(t);
            }
          });
          setTrendingTracks(merged);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle playing a trending track (resolves query on-demand if needed)
  const handlePlayTrending = async (track) => {
    setIsPlayingId(track.id);
    if (track.ytQuery && (!track.id || track.id.startsWith('mirzapur-') || track.id.startsWith('sadhu-') || track.id.startsWith('sammi-') || track.id.startsWith('radhimaa-') || track.id.startsWith('rathinamaa-'))) {
      try {
        const res = await searchEngine.search(track.ytQuery, 'video');
        if (res && res.length > 0) {
          onPlayTrack({
            ...res[0],
            title: track.title,
            artist: track.artist,
            thumbnail: track.thumbnail || res[0].thumbnail
          }, trendingTracks);
          return;
        }
      } catch {}
    }
    onPlayTrack(track, trendingTracks);
  };

  // Handle clicking an artist: searches artist top hits and plays first track
  const handleArtistClick = async (artist) => {
    setIsPlayingId(artist.id);
    try {
      const results = await searchEngine.search(artist.searchQuery, 'video');
      if (results && results.length > 0) {
        onPlayTrack(results[0], results);
      } else {
        onOpenSearch && onOpenSearch();
      }
    } catch {
      onOpenSearch && onOpenSearch();
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row flex-1 overflow-hidden select-none">
      {/* =========================================================================
          1. LEFT SIDEBAR ("Your Library" - Spotify Desktop Reference)
          Visible on large screens (lg:), clean & collapsible on mobile
         ========================================================================= */}
      <aside className={`hidden lg:flex w-72 xl:w-80 flex-col flex-shrink-0 m-3 mr-0 rounded-2xl p-4 gap-4 transition-colors duration-300 ${
        isDark
          ? 'bg-[#181a20] border border-[#262933] neu-card-shadow neu-dark'
          : 'bg-[#faf9f6] border border-[#e8e2d8] neu-card-shadow'
      }`}>
        {/* Sidebar Header: "Your Library" + "+ Create" */}
        <div className="flex items-center justify-between px-1">
          <button 
            onClick={() => onViewChange && onViewChange('library')}
            className={`flex items-center gap-2.5 font-extrabold text-sm transition-colors cursor-pointer group ${
              isDark ? 'text-[#f3efe8] hover:text-[#c4956a]' : 'text-[#2e221b] hover:text-[#3c2b20]'
            }`}
          >
            <Library size={18} className="transition-transform group-hover:scale-110" />
            <span>Your Library</span>
          </button>

          <button
            onClick={onOpenImportModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8] hover:scale-105 active:scale-95'
                : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b] hover:scale-105 active:scale-95'
            }`}
            title="Create or import playlist"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Create</span>
          </button>
        </div>

        {/* Action Cards Container */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-none">
          {/* Card 1: Create your first playlist */}
          <div className={`p-4 rounded-2xl transition-all ${
            isDark
              ? 'bg-[#1b1d23] border border-[#282c37] neu-groove-inset neu-dark'
              : 'bg-[#f1eee8] border border-[#e6dfd3] neu-groove-inset'
          }`}>
            <h4 className={`text-xs font-extrabold tracking-tight ${
              isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
            }`}>
              Create your first playlist
            </h4>
            <p className={`text-[11px] mt-1 font-medium leading-snug ${
              isDark ? 'text-[#828694]' : 'text-[#8f8075]'
            }`}>
              It's easy, we'll help you import or curate your sound.
            </p>
            <button
              onClick={onOpenImportModal}
              className={`mt-3.5 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#f3efe8] text-[#131417] hover:bg-white active:scale-95 shadow-md'
                  : 'bg-[#2e221b] text-[#faf9f6] hover:bg-[#1f1712] active:scale-95 shadow-md'
              }`}
            >
              Create playlist
            </button>
          </div>

          {/* Card 2: Let's find some podcasts to follow / Discover mixes */}
          <div className={`p-4 rounded-2xl transition-all ${
            isDark
              ? 'bg-[#1b1d23] border border-[#282c37] neu-groove-inset neu-dark'
              : 'bg-[#f1eee8] border border-[#e6dfd3] neu-groove-inset'
          }`}>
            <h4 className={`text-xs font-extrabold tracking-tight ${
              isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
            }`}>
              Explore curated audio mixes
            </h4>
            <p className={`text-[11px] mt-1 font-medium leading-snug ${
              isDark ? 'text-[#828694]' : 'text-[#8f8075]'
            }`}>
              We'll keep you updated on trending songs & radio.
            </p>
            <button
              onClick={() => onOpenSearch && onOpenSearch()}
              className={`mt-3.5 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#f3efe8] text-[#131417] hover:bg-white active:scale-95 shadow-md'
                  : 'bg-[#2e221b] text-[#faf9f6] hover:bg-[#1f1712] active:scale-95 shadow-md'
              }`}
            >
              Browse podcasts
            </button>
          </div>

          {/* User's Existing Playlists Section (if any) */}
          {playlists.length > 0 && (
            <div className="pt-2">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-1 ${
                isDark ? 'text-[#828694]' : 'text-[#8f8075]'
              }`}>
                Your Playlists ({playlists.length})
              </span>
              <div className="mt-2 space-y-1">
                {playlists.slice(0, 5).map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => onSelectPlaylist(pl.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all group ${
                      isDark
                        ? 'hover:bg-[#20222a]'
                        : 'hover:bg-[#ebe6dc]'
                    }`}
                  >
                    <img loading="lazy" decoding="async" src={pl.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                      alt={pl.title}
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate group-hover:underline ${
                        isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
                      }`}>
                        {pl.title}
                      </p>
                      <p className={`text-[10px] truncate ${
                        isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                      }`}>
                        Playlist • {pl.tracks?.length || 0} tracks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer Links & Language Switcher (Spotify Web Reference) */}
        <div className={`pt-3 border-t text-[10px] space-y-2.5 ${
          isDark ? 'border-[#262933] text-[#828694]' : 'border-[#e8e2d8] text-[#8f8075]'
        }`}>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="hover:underline cursor-pointer">Legal</span>
            <span className="hover:underline cursor-pointer">Safety & Privacy</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Cookies</span>
            <span className="hover:underline cursor-pointer">About Ads</span>
            <span className="hover:underline cursor-pointer">Accessibility</span>
          </div>

          <div>
            <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
              isDark
                ? 'border-[#363a47] text-[#f3efe8] hover:border-white hover:scale-105'
                : 'border-[#d4cbbe] text-[#2e221b] hover:border-[#2e221b] hover:scale-105'
            }`}>
              <Globe size={13} />
              <span>English</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN CONTENT AREA (Trending Songs + Popular Artists + Featured Mixes)
          Desktop Grid / Carousel & Mobile Full-Width Swipe Optimized
         ========================================================================= */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-7 space-y-7 pb-36 scrollbar-none">
        
        {/* Mobile / Desktop Filter Chips (All, Music, Podcasts) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'music', label: 'Music' },
            { id: 'podcasts', label: 'Podcasts' },
            { id: 'trending', label: 'Trending Hits' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                activeCategory === tab.id
                  ? isDark
                    ? 'bg-[#f3efe8] text-[#131417] shadow-md scale-102'
                    : 'bg-[#2e221b] text-[#faf9f6] shadow-md scale-102'
                  : isDark
                    ? 'bg-[#1b1d23] text-[#828694] hover:text-[#f3efe8] border border-[#262933]'
                    : 'bg-[#faf9f6] text-[#8f8075] hover:text-[#2e221b] border border-[#e8e2d8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* =========================================================================
            SECTION 1: TRENDING SONGS (Spotify Reference Showcase)
           ========================================================================= */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 ${
                isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
              }`}>
                <span>Trending songs</span>
                <Flame size={18} className="text-rose-500 fill-rose-500" />
              </h2>
            </div>
            <button
              onClick={() => onOpenSearch && onOpenSearch()}
              className={`text-xs font-bold transition-colors cursor-pointer hover:underline flex items-center gap-0.5 ${
                isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
              }`}
            >
              <span>Show all</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Cards: Responsive Grid on Desktop / Smooth Horizontal Carousel on Mobile */}
          <div className="flex lg:grid lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto lg:overflow-visible pb-2.5 lg:pb-0 snap-x scrollbar-none -mx-1 px-1">
            {trendingTracks.slice(0, 10).map((track, idx) => (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => handlePlayTrending(track)}
                className={`group min-w-[155px] sm:min-w-[170px] lg:min-w-0 p-3 rounded-2xl cursor-pointer flex flex-col transition-all duration-300 flex-shrink-0 snap-start active:scale-98 ${
                  isDark
                    ? 'bg-[#181a20] border border-[#262933] hover:bg-[#20222a] hover:border-[#382417]'
                    : 'bg-[#faf9f6] border border-[#e8e2d8] hover:bg-[#f6f2ec] hover:border-[#c4956a]/40'
                } glass-card`}
              >
                {/* Square Album Cover with Hover / Touch Play Button */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-black/5 shadow-inner">
                  <img loading="lazy" decoding="async" src={track.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500'}
                    alt={track.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    
                  />
                  
                  {/* Floating Play Button (Spotify Style with Neuphorism Touch) */}
                  <div className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                    isPlayingId === track.id
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                  } ${
                    isDark 
                      ? 'bg-[#c4956a] text-[#131417] neu-play-shadow' 
                      : 'bg-[#2e221b] text-[#faf9f6] neu-play-shadow'
                  }`}>
                    <Play size={16} className="fill-current ml-0.5" />
                  </div>
                </div>

                {/* Song Title */}
                <h3 className={`text-xs font-bold leading-tight truncate group-hover:underline ${
                  isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
                }`}>
                  {track.title}
                </h3>

                {/* Subtitle / Artist Credits */}
                <p className={`text-[11px] font-medium truncate mt-1 ${
                  isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                }`}>
                  {track.artist}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: POPULAR ARTISTS (Circular Cards - Spotify Reference)
           ========================================================================= */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 ${
                isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
              }`}>
                <span>Popular artists</span>
                <Sparkles size={17} className="text-amber-500" />
              </h2>
            </div>
            <button
              onClick={() => onOpenSearch && onOpenSearch()}
              className={`text-xs font-bold transition-colors cursor-pointer hover:underline flex items-center gap-0.5 ${
                isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
              }`}
            >
              <span>Show all</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Circular Artist Avatars: Horizontal scroll on mobile / Grid on desktop */}
          <div className="flex lg:grid lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto lg:overflow-visible pb-2.5 lg:pb-0 snap-x scrollbar-none -mx-1 px-1">
            {SPOTIFY_POPULAR_ARTISTS.map((artist) => (
              <div
                key={artist.id}
                onClick={() => handleArtistClick(artist)}
                className={`group min-w-[135px] sm:min-w-[150px] lg:min-w-0 p-3 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all duration-300 flex-shrink-0 snap-start active:scale-98 ${
                  isDark
                    ? 'bg-[#181a20] border border-[#262933] hover:bg-[#20222a]'
                    : 'bg-[#faf9f6] border border-[#e8e2d8] hover:bg-[#f6f2ec]'
                } glass-card`}
              >
                {/* Circular Avatar with Floating Play Overlay */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-3 shadow-md">
                  <img loading="lazy" decoding="async" src={artist.avatar}
                    alt={artist.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    
                  />
                  <div className={`absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                    isPlayingId === artist.id
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                  } ${
                    isDark 
                      ? 'bg-[#c4956a] text-[#131417]' 
                      : 'bg-[#2e221b] text-[#faf9f6]'
                  }`}>
                    <Play size={14} className="fill-current ml-0.5" />
                  </div>
                </div>

                {/* Artist Name */}
                <h3 className={`text-xs font-bold leading-tight truncate w-full group-hover:underline ${
                  isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
                }`}>
                  {artist.name}
                </h3>

                {/* Subtitle ("Artist") */}
                <p className={`text-[11px] font-medium mt-0.5 ${
                  isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                }`}>
                  {artist.role}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: FEATURED MIXES & RADIO
           ========================================================================= */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 ${
              isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
            }`}>
              <span>Featured mixes & radio</span>
              <Radio size={17} className="text-emerald-500" />
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {FEATURED_CURATED_MIXES.map((mix) => (
              <div
                key={mix.id}
                onClick={() => onPlayPlaylist(mix)}
                className={`group p-3 rounded-2xl cursor-pointer flex flex-col transition-all duration-300 ${
                  isDark
                    ? 'bg-[#181a20] border border-[#262933] hover:bg-[#20222a]'
                    : 'bg-[#faf9f6] border border-[#e8e2d8] hover:bg-[#f6f2ec]'
                } glass-card`}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-black/5">
                  <img loading="lazy" decoding="async" src={mix.thumbnail}
                    alt={mix.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    
                  />
                  <div className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl ${
                    isDark ? 'bg-[#c4956a] text-[#131417]' : 'bg-[#2e221b] text-[#faf9f6]'
                  }`}>
                    <Play size={16} className="fill-current ml-0.5" />
                  </div>
                </div>

                <h3 className={`text-xs font-bold leading-tight truncate group-hover:underline ${
                  isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
                }`}>
                  {mix.title}
                </h3>
                <p className={`text-[11px] font-medium truncate mt-0.5 ${
                  isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                }`}>
                  {mix.author} • Mix
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: RECENTLY PLAYED (Jump Back In)
           ========================================================================= */}
        <section className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight ${
                isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
              }`}>
                Recently played
              </h2>
              {history.length === 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-[#262933] text-[#c4956a]' : 'bg-[#e8e2d8] text-[#3d2b20]'
                }`}>
                  Starter Mix
                </span>
              )}
            </div>
          </div>

          <div className="flex lg:grid lg:grid-cols-6 gap-3 overflow-x-auto lg:overflow-visible pb-2.5 lg:pb-0 snap-x scrollbar-none -mx-1 px-1">
            {((history && history.length > 0) ? history : trendingTracks).slice(0, 6).map((track, idx) => (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => handlePlayTrending(track)}
                className={`group min-w-[140px] sm:min-w-[150px] lg:min-w-0 p-2.5 rounded-2xl cursor-pointer flex flex-col transition-all flex-shrink-0 snap-start ${
                  isDark
                    ? 'bg-[#181a20] border border-[#262933] hover:bg-[#20222a]'
                    : 'bg-[#faf9f6] border border-[#e8e2d8] hover:bg-[#f6f2ec]'
                } glass-card`}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-black/5">
                  <img loading="lazy" decoding="async" src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play size={16} className="fill-white text-white" />
                  </div>
                </div>
                <h4 className={`font-bold text-xs truncate ${
                  isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
                }`}>
                  {track.title}
                </h4>
                <p className={`text-[10px] truncate mt-0.5 ${
                  isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                }`}>
                  {track.artist}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default React.memo(HomeView);
