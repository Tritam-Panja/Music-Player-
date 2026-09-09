import React, { useState, useEffect } from 'react';
import { Search, Play, Plus, Heart, Clock, Music, ListPlus, Radio, Sparkles } from 'lucide-react';
import { ytService } from '../../services/ytService';
import { formatDuration } from '../../utils/formatters';

const SUGGESTED_TAGS = [
  'Lofi Hip Hop',
  'Synthwave 80s',
  'Coding Chillout',
  'Piano Ambient',
  'Cyberpunk 2077',
  'Acoustic Covers',
  'Deep House Sunset'
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
  const [filter, setFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search
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
        const items = await ytService.search(searchQuery, filter);
        if (isMounted) {
          setResults(items);
          setIsLoading(false);
        }
      } catch (e) {
        if (isMounted) setIsLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [searchQuery, filter]);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 pb-36">
      {/* Category Pills & Trending Tags */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {['all', 'tracks', 'playlists'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-white text-black shadow-neon-cyan/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Suggested Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => onSearchChange(tag)}
              className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 whitespace-nowrap transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {isLoading ? 'Searching YouTube...' : `Results for "${searchQuery}"`}
          </span>
          {results.length > 0 && <span>{results.length} results</span>}
        </div>
      )}

      {/* Results List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Fetching YouTube results...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-1">
          {results.map((item, idx) => {
            const isFav = isFavorite(item.id);

            return (
              <div
                key={`${item.id}-${idx}`}
                className="group flex items-center gap-4 px-3 py-2.5 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors"
              >
                {/* Thumbnail & Play button */}
                <div 
                  className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => onPlayTrack(item)}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play size={18} className="fill-white text-white" />
                  </div>
                </div>

                {/* Info */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onPlayTrack(item)}
                >
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-cyan-300">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {item.artist}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAddToQueue(item)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    title="Add to queue"
                  >
                    <ListPlus size={16} />
                  </button>

                  <button
                    onClick={() => onToggleFavorite(item)}
                    className={`p-2 rounded-xl transition-colors ${
                      isFav 
                        ? 'text-pink-500' 
                        : 'text-slate-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100'
                    }`}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                  </button>

                  <span className="text-xs text-slate-400 font-mono w-12 text-right">
                    {formatDuration(item.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-20 text-slate-500">
          <Music size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-slate-300">No tracks found</p>
          <p className="text-xs text-slate-500 mt-1">Try another search keyword or song name</p>
        </div>
      ) : (
        /* Empty State / Discovery Cards */
        <div className="text-center py-16 text-slate-400 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-cyan-400">
            <Search size={28} />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Search Anything on YouTube</h3>
            <p className="text-xs text-slate-400 mt-1">
              Find any song, artist, live session, or DJ set. Stream directly with high-definition audio and zero advertisements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
