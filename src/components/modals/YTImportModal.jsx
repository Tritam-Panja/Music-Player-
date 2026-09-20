import React, { useState } from 'react';
import { X, Download, CheckCircle2, AlertCircle } from 'lucide-react';
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

export default function YTImportModal({ isOpen, onClose, onImportSuccess, theme = 'dark' }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl rounded-3xl overflow-hidden bg-im-card border border-im-line shadow-im-float text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-im-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-im-card2 border border-im-line flex items-center justify-center text-red-400 shadow-sm">
              <YoutubeIcon size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Import YouTube Playlist
              </h3>
              <p className="text-xs text-im-inkFaint">
                Zero ads, completely free, instant sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-im-inkFaint hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Input field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-im-inkFaint block">
              YouTube or YouTube Music Playlist URL
            </label>
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="https://www.youtube.com/playlist?list=..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchPreview()}
                className="flex-1 text-sm px-4 py-3 rounded-2xl outline-none font-medium transition-all bg-im-card2 border border-im-line text-white placeholder:text-im-inkFaint focus:border-white/30"
              />
              <button
                onClick={handleFetchPreview}
                disabled={isLoading || !urlInput.trim()}
                className="px-6 py-3 rounded-2xl bg-white text-black hover:bg-white/90 disabled:opacity-40 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Fetch</span>
                )}
              </button>
            </div>
          </div>

          {/* Quick sample buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] block font-medium text-im-inkFaint">
              Or try one of these:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PLAYLISTS.map((sp) => (
                <button
                  key={sp.name}
                  onClick={() => {
                    setUrlInput(sp.url);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all bg-im-card2 hover:bg-white/10 border border-im-line text-im-inkSoft hover:text-white"
                >
                  {sp.name}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Card */}
          {preview && (
            <div className="p-4 rounded-2xl space-y-4 animate-in fade-in duration-300 bg-im-card2 border border-im-line">
              <div className="flex items-center gap-4">
                <img
                  src={preview.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                  alt={preview.title}
                  className="w-16 h-16 rounded-xl object-cover shadow-md border border-im-line"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-0.5">
                    <CheckCircle2 size={14} /> Ready to import
                  </div>
                  <h4 className="font-bold text-sm truncate text-white">
                    {preview.title}
                  </h4>
                  <p className="text-xs truncate text-im-inkFaint">
                    {preview.author} • {preview.tracks.length} tracks
                  </p>
                </div>
              </div>

              <button
                onClick={handleSavePlaylist}
                className="w-full py-3.5 rounded-2xl bg-white text-black hover:bg-white/90 font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
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
