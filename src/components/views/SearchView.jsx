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
  ExternalLink 
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
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 pb-36">
      {/* Search Input Bar with Autocomplete Dropdown */}
      <div className="relative max-w-2xl">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search YouTube for songs, artists, playlists, mixes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsSuggestionsOpen(true)}
            className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 text-white placeholder-slate-400 text-sm pl-11 pr-4 py-3.5 rounded-2xl border border-white/10 focus:border-cyan-400/50 shadow-glass-sm outline-none transition-all"
          />
        </div>

        {/* Live Suggestions Dropdown */}
        {isSuggestionsOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-30 glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden py-2 backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-150">
            {suggestions.map((sug, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSearchChange(sug);
                  setIsSuggestionsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 cursor-pointer text-xs font-medium text-slate-200 transition-colors"
              >
                <Search size={14} className="text-slate-400" />
                <span className="truncate">{sug}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Genre & Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
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
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-black shadow-neon-cyan/40 scale-105'
                  : 'bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
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
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                  Top Result
                </span>
                <div 
                  onClick={() => onPlayTrack(topResult)}
                  className="group relative flex-1 p-6 rounded-3xl glass-card flex flex-col justify-between cursor-pointer border border-white/10 hover:border-cyan-400/40 transition-all"
                >
                  <div>
                    <img 
                      src={topResult.thumbnail} 
                      alt={topResult.title}
                      className="w-28 h-28 rounded-2xl object-cover shadow-xl border border-white/15 mb-4 group-hover:scale-105 transition-transform"
                    />
                    <h3 className="text-xl font-extrabold text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
                      {topResult.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-slate-300">{topResult.artist}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold uppercase">
                        Song
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <span className="text-xs text-slate-400 font-mono">
                      {formatDuration(topResult.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(topResult);
                      }}
                      className="w-12 h-12 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-neon-cyan group-hover:scale-110 active:scale-95 transition-all"
                      title="Play Song"
                    >
                      <Play size={20} className="fill-black ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Songs List */}
            <div className="lg:col-span-7 flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                Songs
              </span>
              <div className="space-y-1">
                {otherResults.slice(0, 5).map((track, idx) => {
                  const isFav = isFavorite(track.id);
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => onPlayTrack(track)}
                      className="group flex items-center gap-3.5 px-3 py-2 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-colors"
                    >
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={track.thumbnail} 
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play size={16} className="fill-white text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-cyan-300">
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{track.artist}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToQueue(track);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
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

                        <span className="text-xs font-mono text-slate-400 w-10 text-right">
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
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                More Results
              </span>
              <div className="space-y-1">
                {otherResults.slice(5).map((track, idx) => {
                  const isFav = isFavorite(track.id);
                  return (
                    <div
                      key={`more-${track.id}-${idx}`}
                      onClick={() => onPlayTrack(track)}
                      className="group flex items-center gap-3.5 px-3 py-2 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-colors"
                    >
                      <img 
                        src={track.thumbnail} 
                        alt={track.title}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-cyan-300">
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToQueue(track);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
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
                            isFav ? 'text-pink-500' : 'text-slate-400 hover:text-white opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                        </button>

                        <span className="text-xs font-mono text-slate-400 w-10 text-right">
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
              <TrendingUp size={20} className="text-cyan-400" />
              <h3 className="text-xl font-bold text-white">Global Top Charts</h3>
              <span className="text-xs font-semibold text-slate-400 ml-1">• Streaming Live</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {trendingTracks.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track)}
                  className="group p-3.5 rounded-2xl glass-card cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    <img 
                      src={track.thumbnail} 
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(track);
                      }}
                      className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 active:scale-95 shadow-neon-cyan transition-all"
                    >
                      <Play size={16} className="fill-black ml-0.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-xs text-white truncate group-hover:text-cyan-300">
                    {track.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
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
