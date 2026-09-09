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

export default function YTImportModal({ isOpen, onClose, onImportSuccess }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 border border-red-500/20 flex items-center justify-center">
              <YoutubeIcon size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import YouTube Playlist</h3>
              <p className="text-xs text-slate-400">Zero ads, completely free, instant sync</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Input field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              YouTube or YouTube Music Playlist URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://www.youtube.com/playlist?list=..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchPreview()}
                className="flex-1 bg-white/5 text-white placeholder-slate-500 text-sm px-4 py-3 rounded-2xl border border-white/10 focus:border-cyan-400/50 outline-none transition-all"
              />
              <button
                onClick={handleFetchPreview}
                disabled={isLoading || !urlInput.trim()}
                className="px-5 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-bold text-sm shadow-neon-cyan transition-all flex items-center gap-2"
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
            <span className="text-[11px] text-slate-400 block font-medium">Or try one of these:</span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PLAYLISTS.map((sp) => (
                <button
                  key={sp.name}
                  onClick={() => {
                    setUrlInput(sp.url);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition-colors"
                >
                  {sp.name}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Card */}
          {preview && (
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-4">
                <img
                  src={preview.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                  alt={preview.title}
                  className="w-16 h-16 rounded-xl object-cover shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-0.5">
                    <CheckCircle2 size={14} /> Ready to import
                  </div>
                  <h4 className="font-bold text-white text-sm truncate">{preview.title}</h4>
                  <p className="text-xs text-slate-400 truncate">{preview.author} • {preview.tracks.length} tracks</p>
                </div>
              </div>

              <button
                onClick={handleSavePlaylist}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-black font-extrabold text-sm shadow-glass-glow transition-all flex items-center justify-center gap-2"
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
