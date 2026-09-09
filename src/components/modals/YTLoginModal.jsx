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
  const [handleInput, setHandleInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [showAdvancedToken, setShowAdvancedToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleConnectHandle = async (e) => {
    e.preventDefault();
    if (!handleInput.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const loggedUser = await ytAuthService.loginWithHandle(handleInput);
      onUserChange(loggedUser);
      // Auto-sync initial library
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
              <h3 className="text-base font-bold text-white">YouTube Account & Library</h3>
              <p className="text-xs text-slate-400">Sync all your personal playlists & liked music</p>
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
                    {user.email || user.handle || 'YouTube Account'}
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
                  <span>Sync Library Now</span>
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
                <span>Credentials stored locally. Zero ads, zero tracking.</span>
              </div>
            </div>
          ) : (
            /* Logged Out / Connect State */
            <div className="space-y-5">
              {/* Quick Connect by Handle / Username */}
              <form onSubmit={handleConnectHandle} className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                  Connect by YouTube Handle or Channel ID
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

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 border-t border-white/10" />
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Or</span>
                <div className="flex-1 border-t border-white/10" />
              </div>

              {/* Advanced OAuth / Token Option */}
              {!showAdvancedToken ? (
                <button
                  type="button"
                  onClick={() => setShowAdvancedToken(true)}
                  className="w-full py-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Connect with Google OAuth Access Token (Private Playlists)
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
          )}
        </div>
      </div>
    </div>
  );
}
