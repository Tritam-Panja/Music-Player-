import React, { useState, useEffect } from 'react';
import { Play, Music, MoreVertical, Plus, Sparkles, ChevronLeft } from 'lucide-react';
import { searchEngine } from '../../services/searchEngine';
import { formatDuration } from '../../utils/formatters';

const MOODS = [
  {
    id: 'chill',
    name: 'Chill',
    query: 'chill vibes lofi playlist',
    bgClass: 'bg-im-mood-chill',
    label: 'Lo-Fi & Downtempo'
  },
  {
    id: 'commute',
    name: 'Commute',
    query: 'hip hop commute mix',
    bgClass: 'bg-im-mood-commute',
    label: 'Hip-Hop & Drive'
  },
  {
    id: 'energize',
    name: 'Energize',
    query: 'pump up workout songs',
    bgClass: 'bg-im-mood-energize',
    label: 'High Power & EDM'
  },
  {
    id: 'feelgood',
    name: 'Feel good',
    query: 'feel good indie playlist',
    bgClass: 'bg-im-mood-feelgood',
    label: 'Upbeat Indie Pop'
  },
  {
    id: 'focus',
    name: 'Focus',
    query: 'lofi focus study playlist',
    bgClass: 'bg-im-mood-focus',
    label: 'Study & Deep Work'
  },
  {
    id: 'party',
    name: 'Party',
    query: 'party dance hits playlist',
    bgClass: 'bg-im-mood-party',
    label: 'Dance Hits & Bangers'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    query: 'gaming hits playlist',
    bgClass: 'bg-im-mood-gaming',
    label: 'High Energy & Beats'
  },
  {
    id: 'romance',
    name: 'Romance',
    query: 'romantic bollywood hits playlist',
    bgClass: 'bg-im-mood-romance',
    label: 'Romantic Melodies'
  }
];

const ROW_GRADIENTS = [
  'from-rose-500/30 to-purple-600/30',
  'from-amber-500/30 to-orange-600/30',
  'from-emerald-500/30 to-teal-600/30',
  'from-blue-500/30 to-indigo-600/30',
  'from-violet-500/30 to-fuchsia-600/30',
  'from-cyan-500/30 to-blue-600/30',
];

export default function ExploreView({
  onNavigate,
  onViewChange,
  onPlayTrack,
  onPlayPlaylist,
  onAddToQueue,
  currentTrack,
  isPlaying
}) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [moodThumbnails, setMoodThumbnails] = useState({});

  // On mount, fetch one representative thumbnail per mood
  useEffect(() => {
    let isMounted = true;

    const fetchThumbnails = async () => {
      for (const mood of MOODS) {
        if (!isMounted) break;
        try {
          const searchRes = await searchEngine.search(mood.query, 'video');
          if (isMounted && Array.isArray(searchRes) && searchRes.length > 0) {
            const firstThumb = searchRes[0]?.thumbnail;
            if (firstThumb) {
              setMoodThumbnails((prev) => ({
                ...prev,
                [mood.id]: firstThumb
              }));
            }
          }
        } catch (err) {
          console.warn(`ExploreView: Failed to load thumbnail for ${mood.id}:`, err);
        }
      }
    };

    fetchThumbnails();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMoodClick = async (mood) => {
    setSelectedMood(mood);
    setIsLoading(true);
    setHasError(false);

    try {
      const searchRes = await searchEngine.search(mood.query, 'video');
      if (Array.isArray(searchRes) && searchRes.length > 0) {
        setResults(searchRes);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.warn('Mood search failed:', err);
      setHasError(true);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearMood = () => {
    setSelectedMood(null);
    setResults([]);
    setHasError(false);
  };

  return (
    <div className="w-full flex-1 overflow-y-auto overflow-x-hidden select-none px-4 sm:px-6 md:px-8 py-4 space-y-6 max-w-5xl mx-auto scrollbar-none pb-36 text-white">
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Explore
        </h1>
        <p className="text-xs sm:text-sm font-medium text-im-inkFaint mt-1">
          Explore trending moods and curated sonic spaces
        </p>
      </div>

      {/* Moods & Moments Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            Moods & moments
          </h2>
          {selectedMood && (
            <button
              type="button"
              onClick={handleClearMood}
              className="text-xs font-semibold text-im-inkFaint hover:text-white transition-colors cursor-pointer"
            >
              Reset filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {MOODS.map((mood) => {
            const isSelected = selectedMood?.id === mood.id;
            const thumbUrl = moodThumbnails[mood.id];
            return (
              <div
                key={mood.id}
                onClick={() => handleMoodClick(mood)}
                className={`group relative aspect-[16/10] sm:aspect-[2/1] min-h-[110px] sm:min-h-[130px] rounded-2xl overflow-hidden shadow-im-float cursor-pointer transition-all duration-300 hover:scale-[1.02] border ${
                  isSelected ? 'border-white ring-2 ring-white/50 scale-[1.02]' : 'border-im-line hover:border-white/20'
                }`}
              >
                {/* Background image if fetched */}
                {thumbUrl && (
                  <img
                    loading="lazy"
                    decoding="async"
                    src={thumbUrl}
                    alt={mood.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Mood gradient at ~75% opacity over image */}
                <div className={`absolute inset-0 ${mood.bgClass} opacity-75 transition-opacity`} />

                {/* Dark gradient scrim at bottom for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                <div className="relative z-10 p-4 sm:p-5 h-full flex flex-col justify-between">
                  {/* Play button top-right */}
                  <div className="flex items-center justify-end">
                    <div className={`w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all duration-200 ${
                      isSelected ? 'opacity-100 scale-105 bg-white text-black' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <Play size={13} className={`ml-0.5 ${isSelected ? 'fill-black text-black' : 'fill-white text-white'}`} />
                    </div>
                  </div>

                  {/* Mood name and subtitle text in bold white, positioned bottom-left */}
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)]">
                      {mood.name}
                    </h3>
                    <p className="text-[11px] font-bold text-white/90 [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)] mt-0.5 truncate">
                      {mood.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Search Results Section */}
      {selectedMood && (
        <section className="space-y-3 pt-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                {selectedMood.name} Tracks
              </h2>
              <span className="text-xs font-semibold text-im-inkFaint">
                • {results.length} {results.length === 1 ? 'song' : 'songs'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleClearMood}
              className="text-xs font-semibold text-im-inkFaint hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-im-inkSoft">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Curating {selectedMood.name} vibes...</p>
            </div>
          )}

          {/* Error / Empty State */}
          {!isLoading && (hasError || results.length === 0) && (
            <div className="text-center py-12 space-y-2 text-im-inkFaint bg-im-card rounded-2xl border border-im-line p-6 shadow-sm">
              <Music size={32} className="mx-auto opacity-40 text-im-inkFaint" />
              <p className="text-sm font-semibold text-white">No tracks found</p>
              <p className="text-xs text-im-inkFaint">Try another mood or check your internet connection</p>
            </div>
          )}

          {/* Results List */}
          {!isLoading && results.length > 0 && (
            <div className="flex flex-col gap-2">
              {results.map((item, idx) => {
                const isCurrent = currentTrack?.id === item.id;
                const isThisPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={`explore-${item.id}-${idx}`}
                    onClick={() => onPlayTrack && onPlayTrack(item, results)}
                    className="group flex items-center justify-between p-2.5 rounded-2xl bg-im-card hover:bg-im-card2 border border-im-line transition-all duration-200 cursor-pointer shadow-sm hover:shadow-im-float"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* 46px rounded-xl thumbnail */}
                      <div className={`relative w-[46px] h-[46px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${ROW_GRADIENTS[idx % ROW_GRADIENTS.length]} border border-im-line shadow-xs`}>
                        <img
                          loading="lazy"
                          decoding="async"
                          src={item.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                          isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          {isThisPlaying ? (
                            <div className="flex gap-0.5 justify-center items-end h-3">
                              <div className="w-0.5 bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.1s' }} />
                              <div className="w-0.5 bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.3s' }} />
                              <div className="w-0.5 bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.2s' }} />
                            </div>
                          ) : (
                            <Play size={14} className="fill-white text-white ml-0.5" />
                          )}
                        </div>
                      </div>

                      {/* Title & Artist */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:underline">
                          {item.title}
                        </h4>
                        <p className="text-[11px] font-medium text-im-inkFaint truncate mt-0.5">
                          {item.artist || item.author || selectedMood.name}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                      {item.duration && (
                        <span className="text-[11px] font-mono text-im-inkFaint hidden sm:inline mr-1">
                          {formatDuration(item.duration)}
                        </span>
                      )}

                      {onAddToQueue && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToQueue(item);
                          }}
                          className="p-1.5 text-im-inkFaint hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          title="Add to queue"
                        >
                          <Plus size={16} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-im-inkFaint hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
                        title="More options"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
