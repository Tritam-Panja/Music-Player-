import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Play, Plus, Clock, TrendingUp, Sparkles, Music, Flame } from 'lucide-react';
import { searchEngine } from '../../services/searchEngine';
import { formatTime } from '../../utils/formatters';

export default function SpotlightSearchModal({
  isOpen,
  onClose,
  onPlayTrack,
  onAddToQueue,
  theme = 'light'
}) {
  const isDark = theme === 'dark';
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-2xl rounded-[32px] overflow-hidden flex flex-col max-h-[78vh] animate-in zoom-in-95 duration-200 transition-colors ${
          isDark 
            ? 'bg-[#1b1d23] neu-card-shadow neu-dark text-[#f3efe8] border border-[#262933]' 
            : 'bg-[#faf9f6] neu-card-shadow text-[#2e221b] border border-[#e8e2d8]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className={`flex items-center gap-3 px-6 py-4 border-b ${
          isDark ? 'border-[#262933]' : 'border-[#e8e2d8]'
        }`}>
          <Search size={18} className={`flex-shrink-0 ${isDark ? 'text-[#c4956a]' : 'text-[#3c2b20]'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search YouTube Music (e.g. Starboy, Lofi, Synthwave, Coldplay)..."
            className={`w-full bg-transparent text-sm focus:outline-none font-medium ${
              isDark ? 'text-[#f3efe8] placeholder-[#828694]' : 'text-[#2e221b] placeholder-[#8f8075]'
            }`}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className={`p-1 rounded-lg cursor-pointer ${
                isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
              }`}
            >
              <X size={16} />
            </button>
          )}
          <kbd className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border hidden sm:inline-block ${
            isDark ? 'bg-[#111215] text-[#828694] border-[#262933]' : 'bg-[#e8e2d8] text-[#2e221b] border-[#d8d0c2]'
          }`}>
            ESC
          </kbd>
        </div>

        {/* Suggestions Bar */}
        {suggestions.length > 0 && results.length === 0 && (
          <div className={`px-6 py-2 border-b flex items-center gap-2 overflow-x-auto scrollbar-none ${
            isDark ? 'border-[#262933] bg-[#14151a]' : 'border-[#e8e2d8] bg-[#f0ebe3]'
          }`}>
            <span className={`text-[11px] font-semibold flex-shrink-0 ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
              Suggestions:
            </span>
            {suggestions.slice(0, 5).map((sugg, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sugg);
                  handleSearch(sugg);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold flex-shrink-0 cursor-pointer transition-all ${
                  isDark 
                    ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8] hover:text-[#c4956a]' 
                    : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b] hover:text-[#3c2b20]'
                }`}
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
              <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${
                isDark ? 'border-[#c4956a]' : 'border-[#3c2b20]'
              }`} />
              <p className={`text-xs ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>Searching YouTube Music...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1.5">
              <div className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-[#828694]' : 'text-[#8f8075]'
              }`}>
                Tracks Found ({results.length})
              </div>
              {results.map((track) => (
                <div
                  key={track.id}
                  onClick={() => {
                    onPlayTrack(track, results);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer group ${
                    isDark 
                      ? 'hover:bg-[#232630] text-[#f3efe8]' 
                      : 'hover:bg-[#ece6dc] text-[#2e221b]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[#3c2b20]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={16} className="text-white fill-current ml-0.5" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold truncate transition-colors ${
                        isDark ? 'group-hover:text-[#c4956a]' : 'group-hover:text-[#3c2b20]'
                      }`}>
                        {track.title}
                      </h4>
                      <p className={`text-[11px] truncate ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[11px] font-mono ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                      {formatTime(track.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(track);
                      }}
                      className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                        isDark ? 'text-[#828694] hover:text-[#f3efe8] hover:bg-[#282c37]' : 'text-[#8f8075] hover:text-[#2e221b] hover:bg-[#e2dcd2]'
                      }`}
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
              <div className={`flex items-center gap-2 px-3 text-xs font-bold ${
                isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'
              }`}>
                <Flame size={15} className="text-orange-500" />
                <span>Top Trending Worldwide</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {trending.slice(0, 8).map((track) => (
                  <div
                    key={track.id}
                    onClick={() => {
                      onPlayTrack(track, trending);
                      onClose();
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer group ${
                      isDark 
                        ? 'bg-[#1b1d23] neu-btn-shadow neu-dark hover:bg-[#232630]' 
                        : 'bg-[#faf9f6] neu-btn-shadow hover:bg-[#ece6dc]'
                    }`}
                  >
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-10 h-10 rounded-xl object-cover shadow-sm flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate transition-colors ${
                        isDark ? 'text-[#f3efe8] group-hover:text-[#c4956a]' : 'text-[#2e221b] group-hover:text-[#3c2b20]'
                      }`}>
                        {track.title}
                      </p>
                      <p className={`text-[10px] truncate ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
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
        <div className={`px-6 py-3 border-t flex items-center justify-between text-[11px] ${
          isDark ? 'border-[#262933] text-[#828694]' : 'border-[#e8e2d8] text-[#8f8075]'
        }`}>
          <span>Press Enter to search • Click track to play instantly</span>
          <span className={`flex items-center gap-1.5 font-semibold ${
            isDark ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Zero Ads YouTube Pipeline
          </span>
        </div>
      </div>
    </div>
  );
}
