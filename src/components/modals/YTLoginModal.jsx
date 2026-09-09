import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, LogOut, Sparkles, UserCheck, ShieldCheck, Music2, Link2, ArrowRight } from 'lucide-react';
import YoutubeIcon from '../ui/YoutubeIcon';
import { ytAuthService } from '../../services/ytAuthService';

export default function YTLoginModal({ 
  isOpen, 
  onClose, 
  user, 
  onUserChange, 
  onSyncComplete 
}) {
  const [googleEmail, setGoogleEmail] = useState('tritampanja444@gmail.com');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  // Single 1-Click Google Sign-In Handler
  const handleGoogleSignIn = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    // 1. If running inside Electron desktop app -> In-app Google window (BitChord style)
    if (typeof window !== 'undefined' && window.electronAPI?.openLoginWindow) {
      try {
        const loggedUser = await ytAuthService.loginWithElectron();
        onUserChange(loggedUser);
        const synced = await ytAuthService.syncUserLibrary();
        onSyncComplete(synced);
        setSuccessMsg(`Welcome, ${loggedUser.name}! Your YouTube Music library has been synced.`);
        setIsLoading(false);
        return;
      } catch (err) {
        console.warn('Electron login error, falling back to direct connect:', err);
      }
    }

    // 2. Web Browser: Seamless 1-Click Google Connect (Zero broken OAuth client IDs)
    try {
      const loggedUser = await ytAuthService.loginWithGoogle(googleEmail);
      onUserChange(loggedUser);
      const synced = await ytAuthService.syncUserLibrary();
      onSyncComplete(synced);
      setSuccessMsg(`Connected as ${loggedUser.name}! Your YouTube Music playlists have been synced.`);
    } catch (err) {
      setError(err.message || 'Failed to connect Google account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportPlaylist = async (e) => {
    if (e) e.preventDefault();
    if (!playlistUrl.trim()) return;

    setIsImporting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const pl = await ytAuthService.importPlaylist(playlistUrl);
      const synced = await ytAuthService.syncUserLibrary();
      onSyncComplete(synced);
      setSuccessMsg(`Imported playlist "${pl.title}" into your library!`);
      setPlaylistUrl('');
    } catch (err) {
      setError(err.message || 'Failed to import playlist.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSyncNow = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const synced = await ytAuthService.syncUserLibrary();
      onSyncComplete(synced);
      setSuccessMsg('Successfully synced your YouTube Music playlists!');
    } catch (err) {
      setError(err.message || 'Failed to sync library.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    ytAuthService.logout();
    onUserChange(null);
    setSuccessMsg(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/15 text-red-500 border border-red-500/20 flex items-center justify-center">
              <YoutubeIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Connect YouTube Music</h3>
              <p className="text-[11px] text-slate-400">Sync all your personal playlists & liked songs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status feedback alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {user ? (
            /* Connected State */
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-xl object-cover border border-white/15 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 mb-0.5">
                    <UserCheck size={13} /> Connected Account
                  </div>
                  <h4 className="font-bold text-white text-sm truncate">{user.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user.email || user.handle || 'YouTube Music'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleSyncNow}
                  disabled={isLoading}
                  className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-black font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                  <span>Sync Library</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/[0.08] text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Disconnect</span>
                </button>
              </div>

              {/* Import Extra YouTube Playlist by URL */}
              <div className="pt-2 border-t border-white/[0.06]">
                <form onSubmit={handleImportPlaylist} className="space-y-2">
                  <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                    <Link2 size={12} className="text-red-400" />
                    <span>Import Any YouTube Playlist Link</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={playlistUrl}
                      onChange={(e) => setPlaylistUrl(e.target.value)}
                      placeholder="Paste youtube.com/playlist?list=..."
                      className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
                    />
                    <button
                      type="submit"
                      disabled={isImporting || !playlistUrl.trim()}
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {isImporting ? <RefreshCw size={12} className="animate-spin" /> : <ArrowRight size={13} />}
                      <span>Import</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 justify-center pt-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Zero ads, zero telemetry. Synced locally in your app.</span>
              </div>
            </div>
          ) : (
            /* Logged Out: Seamless Google Sign In */
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <h4 className="text-base font-bold text-white tracking-tight">
                  Sign In with Google
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Connect your Google account to automatically sync your YouTube Music playlists, mixes & favorites.
                </p>
              </div>

              {/* Account selection / prefill input */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Google Account / Email:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Prominent Official Google Sign-In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>{isLoading ? 'Connecting & Syncing...' : 'Continue with Google'}</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center pt-1">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Zero complex OAuth setup • Instant 1-click sync</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
