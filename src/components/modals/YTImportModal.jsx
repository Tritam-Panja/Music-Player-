import React, { useState } from 'react';
import { X, Download, CheckCircle2, AlertCircle, Sparkles, Music2 } from 'lucide-react';
import YoutubeIcon from '../ui/YoutubeIcon';
import { ytService } from '../../services/ytService';

const SAMPLE_PLAYLISTS = [
  {
    name: 'Chill Lofi Beats',
    url: 'https://www.youtube.com/playlist?list=PLofht4PTcKYnaH8w5gkDCtd8BRkhUhoWB'
  },
  {
    name: 'Synthwave / Retrowave',
    url: 'https://www.youtube.com/playlist?list=PLRBp0Fe2GpgnIh0HN-65204285171'
  }
];

export default function YTImportModal({ isOpen, onClose, onImportSuccess, theme = 'light' }) {
  const isDark = theme === 'dark';
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  if (!isOpen) return null;

  const handleFetchPreview = async () => {
    setError(null);
    const playlistId = ytService.extractPlaylistId(urlInput);

    if (!playlistId) {
      setError('Please enter a valid YouTube or YouTube Music playlist link or ID.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await ytService.fetchPlaylist(playlistId);
      setPreview(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch playlist details. Make sure the playlist is public or unlisted.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlaylist = () => {
    if (preview) {
      onImportSuccess(preview);
      onClose();
      // Reset
      setUrlInput('');
      setPreview(null);
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-xl rounded-[32px] overflow-hidden transition-colors ${
        isDark 
          ? 'bg-[#1b1d23] neu-card-shadow neu-dark text-[#f3efe8] border border-[#262933]' 
          : 'bg-[#faf9f6] neu-card-shadow text-[#2e221b] border border-[#e8e2d8]'
      }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${
          isDark ? 'border-[#262933]' : 'border-[#e8e2d8]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-[#111215] neu-groove-inset neu-dark text-red-400' : 'bg-[#e8e2d8] neu-groove-inset text-red-500'
            }`}>
              <YoutubeIcon size={18} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'}`}>
                Import YouTube Playlist
              </h3>
              <p className={`text-xs ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                Zero ads, completely free, instant sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Input field */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-[#828694]' : 'text-[#8f8075]'
            }`}>
              YouTube or YouTube Music Playlist URL
            </label>
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="https://www.youtube.com/playlist?list=..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchPreview()}
                className={`flex-1 text-sm px-4 py-3 rounded-2xl outline-none font-medium transition-all ${
                  isDark 
                    ? 'bg-[#111215] neu-groove-inset neu-dark text-[#f3efe8] placeholder-[#828694]' 
                    : 'bg-[#e8e2d8] neu-groove-inset text-[#2e221b] placeholder-[#8f8075]'
                }`}
              />
              <button
                onClick={handleFetchPreview}
                disabled={isLoading || !urlInput.trim()}
                className="px-6 py-3 rounded-2xl bg-[#3c2b20] hover:bg-[#4d3729] disabled:opacity-40 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Fetch</span>
                )}
              </button>
            </div>
          </div>

          {/* Quick sample buttons */}
          <div className="space-y-1.5">
            <span className={`text-[11px] block font-medium ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
              Or try one of these:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PLAYLISTS.map((sp) => (
                <button
                  key={sp.name}
                  onClick={() => {
                    setUrlInput(sp.url);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    isDark 
                      ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8] hover:text-[#c4956a]' 
                      : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b] hover:text-[#3c2b20]'
                  }`}
                >
                  {sp.name}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/25 text-rose-500 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Card */}
          {preview && (
            <div className={`p-4 rounded-2xl space-y-4 animate-in fade-in duration-300 ${
              isDark 
                ? 'bg-[#111215] neu-groove-inset neu-dark' 
                : 'bg-[#f0ebe3] neu-groove-inset'
            }`}>
              <div className="flex items-center gap-4">
                <img
                  src={preview.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                  alt={preview.title}
                  className="w-16 h-16 rounded-xl object-cover shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold mb-0.5">
                    <CheckCircle2 size={14} /> Ready to import
                  </div>
                  <h4 className={`font-bold text-sm truncate ${isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'}`}>
                    {preview.title}
                  </h4>
                  <p className={`text-xs truncate ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                    {preview.author} • {preview.tracks.length} tracks
                  </p>
                </div>
              </div>

              <button
                onClick={handleSavePlaylist}
                className="w-full py-3.5 rounded-2xl bg-[#3c2b20] hover:bg-[#4d3729] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <Download size={16} />
                <span>Save to Library & Start Listening</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
