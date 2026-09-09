import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, LogOut, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';
import YoutubeIcon from '../ui/YoutubeIcon';
import { ytAuthService } from '../../services/ytAuthService';

export default function YTLoginModal({ 
  isOpen, 
  onClose, 
  user, 
  onUserChange, 
  onSyncComplete 
}) {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.openLoginWindow;
  const [handleInput, setHandleInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [showAdvancedToken, setShowAdvancedToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleElectronGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedUser = await ytAuthService.loginWithElectron();
      onUserChange(loggedUser);
      const synced = await ytAuthService.syncUserLibrary();
      onSyncComplete(synced);
      setSuccessMsg(`Welcome, ${loggedUser.name}! Your YouTube Music library has been synchronized.`);
    } catch (err) {
      setError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectHandle = async (e) => {
    e.preventDefault();
    if (!handleInput.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const loggedUser = await ytAuthService.loginWithHandle(handleInput);
      onUserChange(loggedUser);
      const synced = await ytAuthService.syncUserLibrary();
      onSyncComplete(synced);
      setSuccessMsg(`Connected as ${loggedUser.name}! Your YouTube library has been synced.`);
    } catch (err) {
      setError(err.message || 'Failed to connect YouTube account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectToken = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const loggedUser = await ytAuthService.loginWithAccessToken(tokenInput);
      onUserChange(loggedUser);
      const synced = await ytAuthService.syncUserLibrary();
      onSyncComplete(synced);
      setSuccessMsg(`Welcome, ${loggedUser.name}! Your YouTube playlists have been synced.`);
    } catch (err) {
      setError(err.message || 'Invalid or expired Google OAuth Token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const synced = await ytAuthService.syncUserLibrary();
      onSyncComplete(synced);
      setSuccessMsg('Successfully refreshed all your YouTube playlists!');
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
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/20 flex items-center justify-center">
              <YoutubeIcon size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">YouTube Music Account</h3>
              <p className="text-xs text-slate-400">Stream your personal playlists, liked music, and history</p>
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
        <div className="p-6 space-y-6">
          {/* Status feedback */}
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
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-white/15 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-0.5">
                    <UserCheck size={14} /> Connected Account
                  </div>
                  <h4 className="font-bold text-white text-base truncate">{user.name}</h4>
                  <p className="text-xs text-slate-400 truncate">
                    {user.email || user.handle || 'YouTube Music Account'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSyncNow}
                  disabled={isLoading}
                  className="py-3 px-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs shadow-neon-cyan transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  <span>Sync Playlists Now</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={14} />
                  <span>Disconnect</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
                <ShieldCheck size={13} className="text-cyan-400" />
                <span>Zero tracking, zero ads. Encrypted locally on your computer.</span>
              </div>
            </div>
          ) : (
            /* Logged Out / Connect State */
            <div className="space-y-5">
              {/* If in Electron: BitChord-style 1-Click In-App Google Sign-In */}
              {isElectron && (
                <div className="space-y-2">
                  <button
                    onClick={handleElectronGoogleLogin}
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-black font-bold text-sm shadow-glass-glow flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{isLoading ? 'Signing In...' : 'Sign In with Google (BitChord Method)'}</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    Official Google login popup. Supports 2FA, passkeys, and personal playlists.
                  </p>
                </div>
              )}

              {isElectron && (
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Or Connect by Handle</span>
                  <div className="flex-1 border-t border-white/10" />
                </div>
              )}

              {/* Quick Connect by Handle / Username */}
              <form onSubmit={handleConnectHandle} className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                  YouTube Channel Handle or Channel ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="@YourYouTubeHandle or Channel URL"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    className="flex-1 bg-white/5 text-white placeholder-slate-500 text-sm px-4 py-3 rounded-2xl border border-white/10 focus:border-cyan-400/50 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !handleInput.trim()}
                    className="px-5 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-bold text-sm shadow-neon-cyan transition-all"
                  >
                    {isLoading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant connect without any API credentials. Syncs your public and unlisted playlists.
                </p>
              </form>

              {/* Advanced OAuth Token Option for Web */}
              <div className="pt-1">
                {!showAdvancedToken ? (
                  <button
                    type="button"
                    onClick={() => setShowAdvancedToken(true)}
                    className="w-full py-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    Connect with Google OAuth Access Token
                  </button>
                ) : (
                  <form onSubmit={handleConnectToken} className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                      Google OAuth Access Token
                    </label>
                    <input
                      type="password"
                      placeholder="ya29.a0AfH6SMC..."
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className="w-full bg-white/5 text-white placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl border border-white/10 focus:border-cyan-400/50 outline-none font-mono text-xs"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !tokenInput.trim()}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs transition-all"
                    >
                      {isLoading ? 'Validating Token...' : 'Authorize & Sync Liked Songs'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
