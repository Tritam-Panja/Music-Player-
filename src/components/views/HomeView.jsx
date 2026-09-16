import React, { useState, useEffect } from 'react';
import { 
  Menu,
  Mic,
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
  ListPlus,
  MoreVertical
} from 'lucide-react';
import { searchEngine } from '../../services/searchEngine';
import { ytSearchService } from '../../services/youtube/YouTubeSearchService';
import { historyService } from '../../services/historyService';

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

// Helper to extract unique popular artists from real trending track results
const extractArtistsFromTracks = (tracks) => {
  if (!Array.isArray(tracks) || tracks.length === 0) return [];
  const seen = new Set();
  const artists = [];

  for (const track of tracks) {
    if (!track.artist || track.artist === 'Unknown Artist' || track.artist === 'Various Artists') continue;
    // Extract first artist if multiple exist (e.g. "Anand Bhaskar, Romy" -> "Anand Bhaskar")
    const cleanName = track.artist.split(/[,&/|•]/)[0].replace(/\s*-\s*Topic$/i, '').trim();
    if (cleanName && cleanName.length > 1 && !seen.has(cleanName.toLowerCase())) {
      seen.add(cleanName.toLowerCase());
      artists.push({
        id: `artist-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: cleanName,
        role: 'Artist',
        avatar: track.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
        searchQuery: `${cleanName} top hits`
      });
    }
    if (artists.length >= 8) break;
  }
  return artists;
};

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
  const [isLoading, setIsLoading] = useState(true);
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [popularArtists, setPopularArtists] = useState([]);
  const [relatedTracks, setRelatedTracks] = useState([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [relatedSourceTrack, setRelatedSourceTrack] = useState(null);
  const [isPlayingId, setIsPlayingId] = useState(null);
  const [historyTick, setHistoryTick] = useState(0);

  useEffect(() => {
    setHistoryTick(t => t + 1);
  }, [history]);

  useEffect(() => {
    const onStorage = (e) => {
      if (!e || e.key === 'playback_history') {
        setHistoryTick(t => t + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // "Because you played [track name]": pick single most recent track and search for related tracks
  useEffect(() => {
    const recentOne = historyService.getRecentlyPlayed(1);
    const targetTrack = (recentOne && recentOne.length > 0) ? recentOne[0] : null;

    if (!targetTrack) {
      setRelatedTracks([]);
      setRelatedSourceTrack(null);
      setIsRelatedLoading(false);
      return;
    }

    // Avoid refetching if same track is already loaded
    if (relatedSourceTrack && (relatedSourceTrack.id === targetTrack.id || (relatedSourceTrack.title === targetTrack.title && relatedSourceTrack.artist === targetTrack.artist))) {
      return;
    }

    let isMounted = true;
    setRelatedSourceTrack(targetTrack);
    setIsRelatedLoading(true);

    const searchQuery = targetTrack.artist && targetTrack.artist !== 'Unknown Artist'
      ? targetTrack.artist
      : targetTrack.title;

    ytSearchService.search(searchQuery, 'video')
      .then((results) => {
        if (!isMounted) return;
        if (Array.isArray(results) && results.length > 0) {
          // Exclude the played track itself if possible, limit to 6
          const filtered = results.filter(t => t.id !== targetTrack.id && t.title !== targetTrack.title);
          const finalTracks = (filtered.length >= 2 ? filtered : results).slice(0, 6);
          setRelatedTracks(finalTracks);
        } else {
          setRelatedTracks([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch related tracks for because you played:', err);
        if (isMounted) setRelatedTracks([]);
      })
      .finally(() => {
        if (isMounted) setIsRelatedLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [historyTick]);

  // Fetch real trending tracks and popular artists using existing services/endpoints
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadTrendingData = async () => {
      let fetchedTracks = null;

      // 1. Primary: searchEngine.getTrendingCharts() / ytSearchService.getTrending()
      try {
        const charts = await searchEngine.getTrendingCharts();
        if (Array.isArray(charts) && charts.length > 0) {
          fetchedTracks = charts;
        }
      } catch (err) {
        console.warn('searchEngine.getTrendingCharts failed:', err);
      }

      // 2. Fallback: dev server /api/trending middleware
      if (!fetchedTracks) {
        try {
          const res = await fetch('/api/trending');
          if (res.ok) {
            const data = await res.json();
            if (data?.success && Array.isArray(data.results) && data.results.length > 0) {
              fetchedTracks = data.results.map(t => ytSearchService.normalizeTrack(t) || t);
            }
          }
        } catch (err) {
          console.warn('/api/trending fetch failed:', err);
        }
      }

      // 3. Fallback: direct search query for global top hits
      if (!fetchedTracks) {
        try {
          const searchRes = await searchEngine.search('Top Global Hits 2026', 'video');
          if (Array.isArray(searchRes) && searchRes.length > 0) {
            fetchedTracks = searchRes;
          }
        } catch (err) {
          console.warn('searchEngine top hits search failed:', err);
        }
      }

      if (!isMounted) return;

      if (fetchedTracks && fetchedTracks.length > 0) {
        setTrendingTracks(fetchedTracks);
        const derived = extractArtistsFromTracks(fetchedTracks);
        setPopularArtists(derived.length > 0 ? derived : SPOTIFY_POPULAR_ARTISTS);
      } else {
        // Fall back to old hardcoded arrays only if the real fetch fails
        setTrendingTracks(SPOTIFY_TRENDING_SONGS);
        setPopularArtists(SPOTIFY_POPULAR_ARTISTS);
      }
      setIsLoading(false);
    };

    loadTrendingData();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayTrending = trendingTracks.length > 0 ? trendingTracks : SPOTIFY_TRENDING_SONGS;
  const displayArtists = popularArtists.length > 0 ? popularArtists : SPOTIFY_POPULAR_ARTISTS;

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
          }, displayTrending);
          return;
        }
      } catch {}
    }
    onPlayTrack(track, displayTrending);
  };

  // Handle clicking an artist: searches artist top hits and plays first track
  const handleArtistClick = async (artist) => {
    setIsPlayingId(artist.id);
    try {
      const results = await searchEngine.search(artist.searchQuery || `${artist.name} songs`, 'video');
      if (results && results.length > 0) {
        onPlayTrack(results[0], results);
      } else {
        onOpenSearch && onOpenSearch();
      }
    } catch {
      onOpenSearch && onOpenSearch();
    }
  };

  const recentTracks = ((history && history.length > 0) ? history : displayTrending).slice(0, 5);
  const recommendedList = displayTrending.length > 4 ? displayTrending.slice(2, 6) : displayTrending.slice(0, 4);
  const album1 = FEATURED_CURATED_MIXES[0] || displayTrending[0];
  const album2 = FEATURED_CURATED_MIXES[1] || displayTrending[1];
  const recentHistory = historyService.getRecentlyPlayed(10);

  const ROW_GRADIENTS = [
    'from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2]',
    'from-[#cfe0f5] via-[#e3d3f2] to-[#f2d9e6]',
    'from-[#f2d9e6] via-[#bdeee0] to-[#cfe0f5]',
    'from-[#dff3ea] via-[#e9e6f7] to-[#bdeee0]',
    'from-[#fed6e3] via-[#a8edea] to-[#cfe0f5]',
  ];

  return (
    <div className="w-full flex-1 overflow-y-auto overflow-x-hidden select-none px-4 sm:px-6 md:px-8 py-4 space-y-6 max-w-4xl mx-auto scrollbar-none">
      {/* =========================================================================
          1. TOP BAR
          Hamburger icon left, brand mark center, circular avatar (36px, gradient placeholder bg) right
         ========================================================================= */}
      <div className="w-full flex items-center justify-between py-1">
        {/* Hamburger icon left */}
        <button
          type="button"
          onClick={() => onViewChange && onViewChange('library')}
          className="p-2 -ml-2 text-ui2-ink dark:text-white hover:text-ui2-accentInk dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 rounded-full transition-all cursor-pointer"
          title="Menu / Library"
        >
          <Menu size={22} />
        </button>

        {/* Brand mark center */}
        <div className="flex items-center gap-2 font-black text-base tracking-tight text-ui2-ink dark:text-white select-none">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2] shadow-xs flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-ui2-accentInk dark:bg-white" />
          </div>
          <span>Liquid Music</span>
        </div>

        {/* Circular avatar (36px, gradient placeholder bg) right */}
        <div
          onClick={() => onViewChange && onViewChange('library')}
          className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#bdeee0] via-[#cfe0f5] to-[#f2d9e6] p-0.5 shadow-sm flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title="Profile / Library"
        >
          <div className="w-full h-full rounded-full bg-white/60 dark:bg-[#161822] backdrop-blur-xs flex items-center justify-center text-xs font-bold text-ui2-ink dark:text-white">
            LM
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. SEARCH BAR
          Pill shape, bg-white/75 with backdrop-blur, magnifying glass left, small circular gradient mic button right, shadow-ui2-soft
         ========================================================================= */}
      <div className="w-full">
        <div
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-white/75 dark:bg-white/[0.07] backdrop-blur-md shadow-ui2-soft dark:shadow-none border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Search size={18} className="text-ui2-inkFaint group-hover:text-ui2-ink dark:text-white/40 dark:group-hover:text-white transition-colors flex-shrink-0" />
            <input
              type="text"
              readOnly
              placeholder="Search songs, albums, artists..."
              onClick={onOpenSearch}
              onFocus={onOpenSearch}
              className="w-full bg-transparent text-xs sm:text-sm text-ui2-ink dark:text-white placeholder:text-ui2-inkFaint dark:placeholder:text-white/40 focus:outline-none cursor-pointer border-none p-0"
            />
          </div>

          {/* Small circular gradient mic button on the right inside the pill */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSearch && onOpenSearch();
            }}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-[#cfe0f5] via-[#e3d3f2] to-[#f2d9e6] dark:from-[#353a50] dark:to-[#222538] flex items-center justify-center text-ui2-ink dark:text-white shadow-sm hover:scale-105 active:scale-95 transition-transform flex-shrink-0 ml-2 cursor-pointer"
            title="Voice Search"
          >
            <Mic size={13} className="text-ui2-ink dark:text-white" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          RECENTLY PLAYED SECTION (historyService)
          Reads from historyService.getRecentlyPlayed(10)
         ========================================================================= */}
      {recentHistory && recentHistory.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-ui2-ink dark:text-white">
              Recently Played
            </h2>
            <button
              onClick={() => onViewChange && onViewChange('library')}
              className="text-xs font-semibold text-ui2-inkSoft hover:text-ui2-ink dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer hover:underline"
            >
              See all
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {recentHistory.map((track, idx) => (
              <div
                key={`recent-history-${track.id || idx}-${idx}`}
                onClick={() => handlePlayTrending(track)}
                className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/70 hover:bg-white/90 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none hover:shadow-ui2-soft transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
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
                      <Play size={14} className="fill-white text-white ml-0.5" />
                    </div>
                  </div>

                  {/* Title bold + artist muted */}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-ui2-ink dark:text-white truncate group-hover:text-ui2-accentInk dark:group-hover:text-white group-hover:underline">
                      {track.title}
                    </h4>
                    <p className="text-[11px] font-medium text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Kebab icon right */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="ml-2 p-1.5 text-ui2-inkFaint hover:text-ui2-ink dark:text-white/40 dark:hover:text-white transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer flex-shrink-0"
                  title="More options"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          3. "ALBUMS" SECTION
          Two side-by-side cards (rounded-2xl, distinct gradient backgrounds, small circular play button bottom-right, label bottom-left in white text), with "See all" link, shadow-ui2-float
         ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-ui2-ink dark:text-white">
            Albums
          </h2>
          <button
            onClick={() => onOpenSearch && onOpenSearch()}
            className="text-xs font-semibold text-ui2-inkSoft hover:text-ui2-ink dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer hover:underline"
          >
            See all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Album Card 1 */}
          {album1 && (
            <div
              onClick={() => onPlayPlaylist ? onPlayPlaylist(album1) : handlePlayTrending(album1)}
              className="group relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl p-3 sm:p-4 flex flex-col justify-between overflow-hidden shadow-ui2-float cursor-pointer transition-transform duration-300 hover:scale-[1.02] bg-gradient-to-br from-[#3b82f6] via-[#8b5cf6] to-[#ec4899]"
            >
              {album1.thumbnail && (
                <img
                  loading="lazy"
                  decoding="async"
                  src={album1.thumbnail}
                  alt={album1.title}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <div className="relative z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white">
                  Album
                </span>
              </div>

              {/* Bottom Content: Label bottom-left in white text, small circular play button bottom-right */}
              <div className="relative z-10 flex items-end justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-sm group-hover:underline">
                    {album1.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-medium text-white/80 truncate mt-0.5">
                    {album1.author || 'Curated Mix'}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-white text-ui2-accentInk flex items-center justify-center shadow-md flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Play size={14} className="fill-current ml-0.5" />
                </div>
              </div>
            </div>
          )}

          {/* Album Card 2 */}
          {album2 && (
            <div
              onClick={() => onPlayPlaylist ? onPlayPlaylist(album2) : handlePlayTrending(album2)}
              className="group relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl p-3 sm:p-4 flex flex-col justify-between overflow-hidden shadow-ui2-float cursor-pointer transition-transform duration-300 hover:scale-[1.02] bg-gradient-to-br from-[#06b6d4] via-[#3b82f6] to-[#6366f1]"
            >
              {album2.thumbnail && (
                <img
                  loading="lazy"
                  decoding="async"
                  src={album2.thumbnail}
                  alt={album2.title}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <div className="relative z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white">
                  Album
                </span>
              </div>

              {/* Bottom Content: Label bottom-left in white text, small circular play button bottom-right */}
              <div className="relative z-10 flex items-end justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-sm group-hover:underline">
                    {album2.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-medium text-white/80 truncate mt-0.5">
                    {album2.author || 'Curated Mix'}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-white text-ui2-accentInk flex items-center justify-center shadow-md flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Play size={14} className="fill-current ml-0.5" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          POPULAR ARTISTS SECTION
         ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-ui2-ink dark:text-white">
            Popular artists
          </h2>
          <button
            onClick={() => onOpenSearch && onOpenSearch()}
            className="text-xs font-semibold text-ui2-inkSoft hover:text-ui2-ink dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer hover:underline"
          >
            See all
          </button>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {[...Array(6)].map((_, i) => (
              <div key={`artist-skeleton-${i}`} className="flex flex-col items-center flex-shrink-0 min-w-[90px] sm:min-w-[105px] animate-pulse">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/10 dark:bg-white/10 mb-2 border border-black/5 dark:border-white/10" />
                <div className="h-3 w-16 bg-black/10 dark:bg-white/10 rounded-full mb-1" />
                <div className="h-2 w-10 bg-black/5 dark:bg-white/5 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {displayArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => handleArtistClick(artist)}
                className="group flex flex-col items-center text-center cursor-pointer flex-shrink-0 min-w-[90px] sm:min-w-[105px]"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-2 shadow-xs border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity ${
                    isPlayingId === artist.id ? 'opacity-100' : ''
                  }`}>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-ui2-accentInk dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md">
                      <Play size={12} className="fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="font-bold text-xs text-ui2-ink dark:text-white truncate max-w-[90px] sm:max-w-[105px] group-hover:underline">
                  {artist.name}
                </h4>
                <p className="text-[10px] font-medium text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">
                  {artist.role || 'Artist'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          4. "RECENTLY PLAYED" SECTION
          Track rows with a 46px rounded-xl thumbnail (gradient placeholder, vary gradient per row), title bold + artist muted, kebab icon right, "See all" link
         ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-ui2-ink dark:text-white">
            Recently played
          </h2>
          <button
            onClick={() => onViewChange && onViewChange('library')}
            className="text-xs font-semibold text-ui2-inkSoft hover:text-ui2-ink dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer hover:underline"
          >
            See all
          </button>
        </div>

        {isLoading && (!history || history.length === 0) ? (
          <div className="flex flex-col gap-2">
            {[...Array(4)].map((_, idx) => (
              <div
                key={`trending-row-skeleton-${idx}`}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white/50 dark:bg-white/[0.04] backdrop-blur-sm border border-black/5 dark:border-white/10 animate-pulse"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-[46px] h-[46px] rounded-xl bg-black/10 dark:bg-white/10 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-40 bg-black/10 dark:bg-white/10 rounded-full mb-1.5" />
                    <div className="h-2.5 w-24 bg-black/5 dark:bg-white/5 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentTracks.map((track, idx) => (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => handlePlayTrending(track)}
                className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/70 hover:bg-white/90 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none hover:shadow-ui2-soft transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
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
                      <Play size={14} className="fill-white text-white ml-0.5" />
                    </div>
                  </div>

                  {/* Title bold + artist muted */}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-ui2-ink dark:text-white truncate group-hover:text-ui2-accentInk dark:group-hover:text-white group-hover:underline">
                      {track.title}
                    </h4>
                    <p className="text-[11px] font-medium text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Kebab icon right */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="ml-2 p-1.5 text-ui2-inkFaint hover:text-ui2-ink dark:text-white/40 dark:hover:text-white transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer flex-shrink-0"
                  title="More options"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          "BECAUSE YOU PLAYED [TRACK NAME]" SECTION
         ========================================================================= */}
      {relatedSourceTrack && (relatedTracks.length > 0 || isRelatedLoading) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-ui2-ink dark:text-white truncate">
              Because you played <span className="text-ui2-accentInk dark:text-white/90">"{relatedSourceTrack.title}"</span>
            </h2>
            <button
              onClick={() => onOpenSearch && onOpenSearch()}
              className="text-xs font-semibold text-ui2-inkSoft hover:text-ui2-ink dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer hover:underline flex-shrink-0 ml-2"
            >
              See all
            </button>
          </div>

          {isRelatedLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={`related-skeleton-${idx}`}
                  className="p-3 rounded-2xl bg-white/50 dark:bg-white/[0.04] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-xs animate-pulse flex flex-col justify-between"
                >
                  <div className="aspect-square w-full rounded-xl bg-black/10 dark:bg-white/10 mb-2.5" />
                  <div className="h-3 w-3/4 bg-black/10 dark:bg-white/10 rounded-full mb-1.5" />
                  <div className="h-2.5 w-1/2 bg-black/5 dark:bg-white/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {relatedTracks.map((item, idx) => (
                <div
                  key={`because-played-${item.id}-${idx}`}
                  onClick={() => onPlayTrack ? onPlayTrack(item, relatedTracks) : handlePlayTrending(item)}
                  className="group relative p-3 rounded-2xl bg-white/70 hover:bg-white/90 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none hover:shadow-ui2-float transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  <div className={`relative aspect-square w-full rounded-xl overflow-hidden bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]} mb-2.5 shadow-xs border border-black/5 dark:border-white/10`}>
                    <img
                      loading="lazy"
                      decoding="async"
                      src={item.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                      isPlayingId === item.id
                        ? 'opacity-100 scale-100 bg-ui2-accentInk dark:bg-white text-white dark:text-black'
                        : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 bg-ui2-ink dark:bg-white text-white dark:text-black'
                    }`}>
                      <Play size={12} className="fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-ui2-ink dark:text-white truncate group-hover:underline">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-medium text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">
                      {item.artist || item.author || 'Related'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          5. "RECOMMENDED" SECTION
         ========================================================================= */}
      <section className="space-y-3 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-ui2-ink dark:text-white">
            Recommended
          </h2>
          <button
            onClick={() => onOpenSearch && onOpenSearch()}
            className="text-xs font-semibold text-ui2-inkSoft hover:text-ui2-ink dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer hover:underline"
          >
            See all
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, idx) => (
              <div
                key={`recommended-skeleton-${idx}`}
                className="p-3 rounded-2xl bg-white/50 dark:bg-white/[0.04] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-xs animate-pulse flex flex-col justify-between"
              >
                <div className="aspect-square w-full rounded-xl bg-black/10 dark:bg-white/10 mb-2.5" />
                <div className="h-3 w-3/4 bg-black/10 dark:bg-white/10 rounded-full mb-1.5" />
                <div className="h-2.5 w-1/2 bg-black/5 dark:bg-white/5 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {recommendedList.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => handlePlayTrending(item)}
                className="group relative p-3 rounded-2xl bg-white/70 hover:bg-white/90 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-ui2-soft dark:shadow-none hover:shadow-ui2-float transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className={`relative aspect-square w-full rounded-xl overflow-hidden bg-gradient-to-br ${ROW_GRADIENTS[(idx + 2) % ROW_GRADIENTS.length]} mb-2.5 shadow-xs border border-black/5 dark:border-white/10`}>
                  <img
                    loading="lazy"
                    decoding="async"
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                    isPlayingId === item.id
                      ? 'opacity-100 scale-100 bg-ui2-accentInk dark:bg-white text-white dark:text-black'
                      : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 bg-ui2-ink dark:bg-white text-white dark:text-black'
                  }`}>
                    <Play size={12} className="fill-current ml-0.5" />
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-ui2-ink dark:text-white truncate group-hover:underline">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-medium text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">
                    {item.artist || item.author || 'Recommended'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default React.memo(HomeView);
