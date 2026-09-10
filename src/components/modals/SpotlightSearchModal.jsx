import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Play, Plus, Clock, TrendingUp, Sparkles, Music, Flame } from 'lucide-react';
import { searchEngine } from '../../services/searchEngine';
import { formatTime } from '../../utils/formatters';

export default function SpotlightSearchModal({
  isOpen,
  onClose,
  onPlayTrack,
  onAddToQueue
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Execute Search
  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setSuggestions([]);

    try {
      const searchRes = await searchEngine.search(q, { limit: 20 });
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[78vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <Search size={18} className="text-sky-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search YouTube Music (e.g. Starboy, Lofi, Synthwave, Coldplay)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hidden sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Suggestions Bar */}
        {suggestions.length > 0 && results.length === 0 && (
          <div className="px-6 py-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-400 flex-shrink-0">Suggestions:</span>
            {suggestions.slice(0, 5).map((sugg, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sugg);
                  handleSearch(sugg);
                }}
                className="px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
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
              <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Searching YouTube Music...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1.5">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tracks Found ({results.length})
              </div>
              {results.map((track) => (
                <div
                  key={track.id}
                  onClick={() => {
                    onPlayTrack(track);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={16} className="text-white fill-current" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-sky-400 transition-colors">
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] font-mono text-slate-500">
                      {formatTime(track.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(track);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Add to Queue"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty / Idle State: Show Trending */
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 px-3 text-xs font-bold text-slate-300">
                <Flame size={15} className="text-orange-400" />
                <span>Top Trending Worldwide</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trending.slice(0, 8).map((track) => (
                  <div
                    key={track.id}
                    onClick={() => {
                      onPlayTrack(track);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-all cursor-pointer group"
                  >
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate group-hover:text-sky-400 transition-colors">
                        {track.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Spotlight Footer */}
        <div className="px-6 py-3 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-[11px] text-slate-500">
          <span>Press Enter to search • Click track to play instantly</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Zero Ads YouTube Pipeline
          </span>
        </div>
      </div>
    </div>
  );
}
