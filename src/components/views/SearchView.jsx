import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Play, Plus, Clock } from 'lucide-react';
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

export default function SearchView({
  onPlayTrack,
  onAddToQueue,
  searchQuery = '',
  onSearchChange,
  initialQuery = '',
  theme = 'dark'
}) {
  const [query, setQuery] = useState(searchQuery || initialQuery || '');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
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

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Synchronize when external searchQuery prop changes
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== query) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);

  // Handle live suggestions debounced
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

  // Debounced search call on query change
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    if (trimmed.length < 2) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchRes = await searchEngine.search(trimmed, 'video');
        if (isMounted) {
          setResults(searchRes || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
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
    e?.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== termToRemove);
      try {
        localStorage.setItem('liquid_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('liquid_recent_searches');
    } catch {}
  };

  // Execute Search manually (e.g. on Enter key, suggestion click, or recent search click)
  const handleSearch = async (searchQueryTerm) => {
    const q = searchQueryTerm !== undefined ? searchQueryTerm : query;
    if (!q || !q.trim()) return;

    saveSearchQuery(q);
    setIsLoading(true);
    setSuggestions([]);

    try {
      const searchRes = await searchEngine.search(q.trim(), 'video');
      setResults(searchRes || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  return (
    <div className="w-full flex-1 overflow-y-auto overflow-x-hidden select-none px-4 sm:px-6 md:px-8 py-6 space-y-6 max-w-4xl mx-auto scrollbar-none text-white pb-36">
      {/* "Search" Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Search</h1>
        <p className="text-xs sm:text-sm font-medium text-im-inkFaint">
          Search songs, artists, and playlists on YouTube Music
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="flex items-center gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-im-card border border-im-line focus-within:border-white/20 transition-all group shadow-sm">
          <Search size={18} className="text-im-inkFaint group-focus-within:text-white transition-colors flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (onSearchChange) onSearchChange(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            aria-label="Search songs, artists or playlists"
            placeholder="Search YouTube Music (e.g. Starboy, Lofi, Synthwave)..."
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-im-inkFaint focus:outline-none font-medium border-none p-0"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                if (onSearchChange) onSearchChange('');
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
        </div>
      </div>

      {/* Suggestions Bar */}
      {suggestions.length > 0 && results.length === 0 && (
        <div className="px-4 py-2 rounded-2xl border border-im-line bg-im-card flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-im-inkFaint flex-shrink-0">
            Suggestions:
          </span>
          {suggestions.slice(0, 8).map((sugg, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sugg);
                if (onSearchChange) onSearchChange(sugg);
                handleSearch(sugg);
              }}
              className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 cursor-pointer transition-all bg-im-card2 hover:bg-white/10 border border-im-line text-im-ink hover:text-white"
            >
              {sugg}
            </button>
          ))}
        </div>
      )}

      {/* Results Container */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-im-inkFaint">Searching YouTube Music...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-im-inkFaint">
              Tracks Found ({results.length})
            </div>
            <div className="flex flex-col gap-1.5">
              {results.map((track, idx) => (
                <div
                  key={track.id || idx}
                  onClick={() => onPlayTrack?.(track, results)}
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
                    {track.duration ? (
                      <span className="text-[11px] font-mono text-im-inkFaint hidden sm:inline">
                        {formatTime(track.duration)}
                      </span>
                    ) : null}
                    {onAddToQueue && (
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
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Idle / Empty State: Show Recent Searches */
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Clock size={16} className="text-im-inkFaint" />
                <span>Recent searches</span>
              </h2>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs text-im-inkFaint hover:text-white transition-colors cursor-pointer font-semibold hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            {recentSearches.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {recentSearches.map((term, i) => (
                  <div
                    key={term + i}
                    onClick={() => {
                      setQuery(term);
                      if (onSearchChange) onSearchChange(term);
                      handleSearch(term);
                    }}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-im-card hover:bg-im-card2 border border-im-line transition-all duration-200 cursor-pointer shadow-sm hover:shadow-im-float"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-[36px] h-[36px] rounded-lg bg-im-card2 border border-im-line flex items-center justify-center text-im-inkFaint flex-shrink-0 group-hover:text-white">
                        <Clock size={15} />
                      </div>
                      <span className="font-semibold text-xs sm:text-sm text-white truncate group-hover:underline">
                        {term}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => removeRecentSearch(term, e)}
                      className="p-1.5 text-im-inkFaint hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                      title="Dismiss search"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-2 text-im-inkFaint bg-im-card rounded-2xl border border-im-line p-6">
                <Clock size={32} className="mx-auto opacity-30 text-white" />
                <p className="text-sm font-semibold text-white">No recent searches</p>
                <p className="text-xs text-im-inkFaint">Search for songs, artists, or playlists to see them here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
