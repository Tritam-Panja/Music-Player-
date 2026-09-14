import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Play, 
  Heart, 
  Clock, 
  Music, 
  ListPlus, 
  TrendingUp, 
  Sparkles, 
  Flame, 
  Radio, 
  ExternalLink,
  Mic
} from 'lucide-react';
import { searchEngine } from '../../services/searchEngine';
import { formatDuration, formatViews } from '../../utils/formatters';

const GENRE_TAGS = [
  { label: 'All', value: 'all' },
  { label: 'Tracks', value: 'video' },
  { label: 'Playlists', value: 'playlist' },
  { label: 'Lofi Beats', query: 'lofi hip hop beats' },
  { label: 'Synthwave', query: 'synthwave retrowave 80s' },
  { label: 'Coding Chill', query: 'chill coding music' },
  { label: 'Global Top Hits', query: 'top hits 2026' },
  { label: 'Acoustic', query: 'acoustic chill songs' },
  { label: 'Cyberpunk', query: 'cyberpunk edm' },
];

const ROW_GRADIENTS = [
  'from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2]',
  'from-[#cfe0f5] via-[#e3d3f2] to-[#f2d9e6]',
  'from-[#f2d9e6] via-[#bdeee0] to-[#cfe0f5]',
  'from-[#dff3ea] via-[#e9e6f7] to-[#bdeee0]',
  'from-[#fed6e3] via-[#a8edea] to-[#cfe0f5]',
];

export default function SearchView({
  searchQuery,
  onSearchChange,
  onPlayTrack,
  onAddToQueue,
  onToggleFavorite,
  isFavorite,
  onImportPlaylist
}) {
  const [filterType, setFilterType] = useState('video');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Load initial global trending charts
  useEffect(() => {
    searchEngine.getTrendingCharts().then((tracks) => {
      setTrendingTracks(tracks);
    });
  }, []);

  // Fetch real-time suggestions as user types
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      const list = await searchEngine.getSuggestions(searchQuery);
      setSuggestions(list.slice(0, 6));
      setIsSuggestionsOpen(list.length > 0);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Execute Search with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const items = await searchEngine.search(searchQuery, filterType);
        if (isMounted) {
          setResults(items);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) setIsLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [searchQuery, filterType]);

  const topResult = results.length > 0 ? results[0] : null;
  const otherResults = results.length > 1 ? results.slice(1) : [];

  return (
    <div className="w-full flex-1 overflow-y-auto overflow-x-hidden select-none px-4 sm:px-6 md:px-8 py-6 space-y-6 max-w-5xl mx-auto scrollbar-none text-ui2-ink dark:text-white pb-36">
      {/* Search Input Bar with Autocomplete Dropdown (matching HomeView.jsx search bar style) */}
      <div className="relative max-w-2xl">
        <div className="w-full flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-full bg-white/75 dark:bg-white/[0.07] backdrop-blur-md shadow-ui2-soft dark:shadow-none border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 focus-within:border-black/20 dark:focus-within:border-white/30 focus-within:shadow-ui2-float transition-all group">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Search size={18} className="text-ui2-inkFaint dark:text-white/40 group-focus-within:text-ui2-ink dark:group-focus-within:text-white transition-colors flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search songs, albums, artists, mixes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setIsSuggestionsOpen(true)}
              className="w-full bg-transparent text-xs sm:text-sm text-ui2-ink dark:text-white placeholder:text-ui2-inkFaint dark:placeholder:text-white/40 focus:outline-none border-none p-0"
            />
          </div>

          {/* Small circular gradient mic button on the right inside the pill */}
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-gradient-to-br from-[#cfe0f5] via-[#e3d3f2] to-[#f2d9e6] dark:from-[#353a50] dark:to-[#222538] flex items-center justify-center text-ui2-ink dark:text-white shadow-sm hover:scale-105 active:scale-95 transition-transform flex-shrink-0 ml-2 cursor-pointer"
            title="Voice Search"
          >
            <Mic size={13} className="text-ui2-ink dark:text-white" />
          </button>
        </div>

        {/* Live Suggestions Dropdown */}
        {isSuggestionsOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white/90 dark:bg-[#12141e]/95 backdrop-blur-lg rounded-2xl border border-black/5 dark:border-white/10 shadow-ui2-float dark:shadow-none overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-150">
            {suggestions.map((sug, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSearchChange(sug);
                  setIsSuggestionsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-xs font-medium text-ui2-ink dark:text-white transition-colors"
              >
                <Search size={14} className="text-ui2-inkFaint dark:text-white/40" />
                <span className="truncate">{sug}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Genre & Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {GENRE_TAGS.map((tag, idx) => {
          const isActive = tag.query ? searchQuery === tag.query : (tag.value === filterType && !searchQuery);
          return (
            <button
              key={idx}
              onClick={() => {
                if (tag.query) {
                  onSearchChange(tag.query);
                } else if (tag.value) {
                  setFilterType(tag.value);
                }
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white/90 dark:bg-white/20 text-ui2-ink dark:text-white shadow-ui2-soft dark:shadow-none border border-black/5 dark:border-white/15 scale-105'
                  : 'bg-white/50 dark:bg-white/[0.05] hover:bg-white/80 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 text-ui2-inkSoft dark:text-white/60 hover:text-ui2-ink dark:hover:text-white shadow-xs'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-ui2-inkSoft dark:text-white/60">
          <div className="w-8 h-8 border-2 border-ui2-ink dark:border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Searching millions of songs on YouTube...</p>
        </div>
      )}

      {/* Active Results View */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Result + Top Songs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Result Card */}
            {topResult && (
              <div className="lg:col-span-5 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-ui2-inkFaint dark:text-white/40 mb-3 block">
                  Top Result
                </span>
                <div 
                  onClick={() => onPlayTrack(topResult)}
                  className="group relative flex-1 p-6 rounded-3xl bg-white/70 hover:bg-white/85 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] backdrop-blur-md border border-black/5 dark:border-white/10 shadow-ui2-float dark:shadow-none flex flex-col justify-between cursor-pointer transition-all"
                >
                  <div>
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-ui2-soft dark:shadow-none border border-black/5 dark:border-white/10 mb-4 bg-gradient-to-br from-[#bdeee0] via-[#cfe0f5] to-[#e3d3f2]">
                      <img 
                        src={topResult.thumbnail} 
                        alt={topResult.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="text-xl font-extrabold text-ui2-ink dark:text-white line-clamp-2 group-hover:underline transition-colors">
                      {topResult.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-ui2-inkSoft dark:text-white/60">{topResult.artist}</span>
                      <span className="text-ui2-inkFaint dark:text-white/40">•</span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-white/10 text-ui2-ink dark:text-white font-bold uppercase border border-black/5 dark:border-white/10 shadow-xs">
                        Song
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <span className="text-xs text-ui2-inkFaint dark:text-white/40 font-mono font-medium">
                      {formatDuration(topResult.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(topResult);
                      }}
                      className="w-11 h-11 rounded-full bg-white dark:bg-white text-ui2-accentInk dark:text-black border border-black/5 flex items-center justify-center shadow-ui2-soft group-hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Play Song"
                    >
                      <Play size={18} className="fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Songs List */}
            <div className="lg:col-span-7 flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-ui2-inkFaint dark:text-white/40 mb-3 block">
                Songs
              </span>
              <div className="flex flex-col gap-2">
                {otherResults.slice(0, 5).map((track, idx) => {
                  const isFav = isFavorite(track.id);
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => onPlayTrack(track)}
                      className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/70 hover:bg-white/90 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none hover:shadow-ui2-soft transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* 46px rounded-xl thumbnail (gradient placeholder, vary the gradient per row) */}
                        <div className={`relative w-[46px] h-[46px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]} shadow-xs border border-black/5 dark:border-white/10`}>
                          <img 
                            loading="lazy"
                            decoding="async"
                            src={track.thumbnail} 
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play size={14} className="fill-white text-white ml-0.5" />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-ui2-ink dark:text-white truncate group-hover:text-ui2-accentInk dark:group-hover:text-white group-hover:underline">
                            {track.title}
                          </h4>
                          <p className="text-[11px] font-medium text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToQueue(track);
                          }}
                          className="p-1.5 text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Add to queue"
                        >
                          <ListPlus size={15} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(track);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isFav 
                              ? 'text-rose-500' 
                              : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100'
                          }`}
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                        </button>

                        <span className="text-[11px] font-mono text-ui2-inkFaint dark:text-white/40 w-10 text-right">
                          {formatDuration(track.duration)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Remaining Tracks Table */}
          {otherResults.length > 5 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ui2-inkFaint dark:text-white/40 mb-3 block">
                More Results
              </span>
              <div className="flex flex-col gap-2">
                {otherResults.slice(5).map((track, idx) => {
                  const isFav = isFavorite(track.id);
                  return (
                    <div
                      key={`more-${track.id}-${idx}`}
                      onClick={() => onPlayTrack(track)}
                      className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/70 hover:bg-white/90 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none hover:shadow-ui2-soft transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`relative w-[46px] h-[46px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[(idx + 5) % ROW_GRADIENTS.length]} shadow-xs border border-black/5 dark:border-white/10`}>
                          <img 
                            loading="lazy"
                            decoding="async"
                            src={track.thumbnail} 
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play size={14} className="fill-white text-white ml-0.5" />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-ui2-ink dark:text-white truncate group-hover:text-ui2-accentInk dark:group-hover:text-white group-hover:underline">
                            {track.title}
                          </h4>
                          <p className="text-[11px] font-medium text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToQueue(track);
                          }}
                          className="p-1.5 text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Add to queue"
                        >
                          <ListPlus size={15} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(track);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isFav ? 'text-rose-500' : 'text-ui2-inkFaint dark:text-white/40 hover:text-ui2-ink dark:hover:text-white opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                        </button>

                        <span className="text-[11px] font-mono text-ui2-inkFaint dark:text-white/40 w-10 text-right">
                          {formatDuration(track.duration)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Idle / Trending Global Charts View (when no search query entered) */}
      {!isLoading && results.length === 0 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-ui2-ink dark:text-white" />
              <h3 className="text-xl font-bold text-ui2-ink dark:text-white">Global Top Charts</h3>
              <span className="text-xs font-semibold text-ui2-inkSoft dark:text-white/50 ml-1">• Streaming Live</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {trendingTracks.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track)}
                  className="group p-3.5 rounded-2xl bg-white/70 hover:bg-white/90 dark:bg-white/[0.05] dark:hover:bg-white/[0.10] backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none hover:shadow-ui2-soft cursor-pointer flex flex-col transition-all"
                >
                  <div className={`relative aspect-square rounded-xl overflow-hidden mb-3 bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]} shadow-xs border border-black/5 dark:border-white/10`}>
                    <img 
                      loading="lazy"
                      decoding="async"
                      src={track.thumbnail} 
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(track);
                      }}
                      className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-white dark:bg-white text-ui2-accentInk dark:text-black flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 active:scale-95 shadow-ui2-soft border border-black/5 transition-all cursor-pointer"
                    >
                      <Play size={15} className="fill-current ml-0.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-xs text-ui2-ink dark:text-white truncate group-hover:underline">
                    {track.title}
                  </h4>
                  <p className="text-[11px] font-medium text-ui2-inkSoft dark:text-white/50 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
