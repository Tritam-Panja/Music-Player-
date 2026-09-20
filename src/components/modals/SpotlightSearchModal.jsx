import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Play, Plus, Clock, TrendingUp, Music, Flame } from 'lucide-react';
import { searchEngine } from '../../services/searchEngine';
import { formatTime } from '../../utils/formatters';

const ROW_GRADIENTS = [
  'from-rose-500/30 to-purple-600/30',
  'from-amber-500/30 to-orange-600/30',
  'from-emerald-500/30 to-teal-600/30',
  'from-blue-500/30 to-indigo-600/30',
  'from-violet-500/30 to-fuchsia-600/30',
  'from-cyan-500/30 to-blue-600/30',
];

export default function SpotlightSearchModal({
  isOpen,
  onClose,
  onPlayTrack,
  onAddToQueue,
  theme = 'dark'
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('liquid_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const inputRef = useRef(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // Load trending tracks if empty
      const fetchTrending = searchEngine.getTrending ? searchEngine.getTrending() : searchEngine.getTrendingCharts();
      Promise.resolve(fetchTrending)
        .then((tracks) => {
          if (tracks && tracks.length > 0) setTrending(tracks);
        })
        .catch((err) => console.warn('Trending fetch warning:', err));
    } else {
      setQuery('');
      setResults([]);
      setSuggestions([]);
    }
  }, [isOpen]);

  // Handle live suggestions
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const suggs = await searchEngine.getSuggestions(query);
        setSuggestions(suggs || []);
      } catch (e) {
        console.warn('Suggestions error:', e);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const saveSearchQuery = (term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setRecentSearches((prev) => {
      const updated = [clean, ...prev.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem('liquid_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeRecentSearch = (termToRemove, e) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== termToRemove);
      try {
        localStorage.setItem('liquid_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Execute Search
  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    saveSearchQuery(q);
    setIsLoading(true);
    setSuggestions([]);

    try {
      const searchRes = await searchEngine.search(q, 'video');
      setResults(searchRes || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-safe sm:pt-20 p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[78vh] bg-im-card border border-im-line shadow-im-float animate-in zoom-in-95 duration-200 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input (styled like HomeView / Navbar search bar) */}
        <div className="p-3 sm:p-4 border-b border-im-line">
          <div className="flex items-center gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-im-card2 border border-im-line focus-within:border-white/20 transition-all group">
            <Search size={18} className="text-im-inkFaint group-focus-within:text-white transition-colors flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search songs, artists or playlists"
              placeholder="Search YouTube Music (e.g. Starboy, Lofi, Synthwave)..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-im-inkFaint focus:outline-none font-medium border-none p-0"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-lg text-im-inkFaint hover:text-white transition-colors cursor-pointer flex-shrink-0"
                title="Clear query"
              >
                <X size={16} />
              </button>
            )}
            <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-im-inkFaint border border-im-line hidden sm:inline-block flex-shrink-0">
              ESC
            </kbd>
          </div>
        </div>

        {/* Suggestions Bar */}
        {suggestions.length > 0 && results.length === 0 && (
          <div className="px-5 py-2 border-b border-im-line bg-im-bg flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-semibold text-im-inkFaint flex-shrink-0">
              Suggestions:
            </span>
            {suggestions.slice(0, 5).map((sugg, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sugg);
                  handleSearch(sugg);
                }}
                className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 cursor-pointer transition-all bg-im-card hover:bg-im-card2 border border-im-line text-im-ink hover:text-white"
              >
                {sugg}
              </button>
            ))}
          </div>
        )}

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-im-inkFaint">Searching YouTube Music...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1.5">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-im-inkFaint">
                Tracks Found ({results.length})
              </div>
              {results.map((track, idx) => (
                <div
                  key={track.id || idx}
                  onClick={() => {
                    onPlayTrack(track, results);
                    onClose();
                  }}
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-im-card hover:bg-im-card2 border border-im-line transition-all duration-200 cursor-pointer shadow-sm hover:shadow-im-float"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* 46px rounded thumbnail (matching track row style) */}
                    <div className={`relative w-[46px] h-[46px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]} border border-im-line shadow-xs`}>
                      <img
                        loading="lazy"
                        decoding="async"
                        src={track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={14} className="fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:underline">
                        {track.title}
                      </h4>
                      <p className="text-[11px] font-medium text-im-inkFaint truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {track.duration && (
                      <span className="text-[11px] font-mono text-im-inkFaint hidden sm:inline">
                        {formatTime(track.duration)}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(track);
                      }}
                      className="p-1.5 rounded-lg text-im-inkFaint hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Add to Queue"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Idle State: Show Recent Searches if available, plus Top Trending */
            <div className="space-y-4 py-1">
              {/* Recent Searches (if any) */}
              {recentSearches.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-im-inkFaint">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} />
                      Recent Searches
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {recentSearches.map((term, i) => (
                      <div
                        key={term + i}
                        onClick={() => {
                          setQuery(term);
                          handleSearch(term);
                        }}
                        className="group flex items-center justify-between p-2 rounded-xl bg-im-card hover:bg-im-card2 border border-im-line transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-[38px] h-[38px] rounded-lg bg-im-card2 border border-im-line flex items-center justify-center text-im-inkFaint flex-shrink-0 group-hover:text-white">
                            <Clock size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-xs text-white truncate group-hover:underline">
                              {term}
                            </h4>
                            <p className="text-[10px] text-im-inkFaint truncate">
                              Search query
                            </p>
                          </div>
                        </div>

                        {/* Dismiss icon in im-inkFaint */}
                        <button
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="p-1.5 text-im-inkFaint hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                          title="Remove search"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Worldwide */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-white">
                  <Flame size={15} className="text-orange-400" />
                  <span>Top Trending Worldwide</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {trending.slice(0, 8).map((track, idx) => (
                    <div
                      key={track.id || idx}
                      onClick={() => {
                        onPlayTrack(track, trending);
                        onClose();
                      }}
                      className="group flex items-center gap-3 p-2 rounded-xl bg-im-card hover:bg-im-card2 border border-im-line transition-all duration-200 cursor-pointer shadow-sm"
                    >
                      <div className={`relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]} border border-im-line`}>
                        <img
                          loading="lazy"
                          decoding="async"
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play size={12} className="fill-white text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate group-hover:underline">
                          {track.title}
                        </p>
                        <p className="text-[10px] text-im-inkFaint truncate mt-0.5">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spotlight Footer */}
        <div className="px-5 py-2.5 border-t border-im-line bg-im-bg flex items-center justify-between text-[11px] text-im-inkFaint">
          <span>Press Enter to search • Click track to play</span>
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Zero Ads Pipeline
          </span>
        </div>
      </div>
    </div>
  );
}
