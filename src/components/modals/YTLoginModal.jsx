import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  LogOut, 
  Sparkles, 
  UserCheck, 
  ArrowRight,
  AtSign,
  Monitor
} from 'lucide-react';
import YoutubeIcon from '../ui/YoutubeIcon';
import { ytConnectionService, ConnectionStatus } from '../../services/youtube/YouTubeConnectionService';
import { ytAuthService } from '../../services/ytAuthService';

export default function YTLoginModal({ 
  isOpen, 
  onClose, 
  user, 
  onUserChange, 
  onSyncComplete,
  theme = 'dark'
}) {
  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);
  const [activeTab, setActiveTab] = useState(isElectron ? 'desktop' : 'handle'); // 'handle' | 'desktop'
  const [handleInput, setHandleInput] = useState('');
  const [connState, setConnState] = useState(ytConnectionService.getState());
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const unsub = ytConnectionService.subscribe((state) => {
      setConnState(state);
      if (state.user) {
        onUserChange(state.user);
      }
    });
    return () => unsub();
  }, [onUserChange]);

  if (!isOpen) return null;

  const isConnecting = [
    ConnectionStatus.CONNECTING,
    ConnectionStatus.ESTABLISHING_SESSION,
    ConnectionStatus.VALIDATING_SESSION
  ].includes(connState.status);

  const getStatusText = () => {
    switch (connState.status) {
      case ConnectionStatus.CONNECTING:
        return 'Connecting...';
      case ConnectionStatus.ESTABLISHING_SESSION:
        return 'Establishing secure handshake...';
      case ConnectionStatus.VALIDATING_SESSION:
        return 'Validating session with YouTube...';
      case ConnectionStatus.CONNECTED:
        return 'Connected';
      case ConnectionStatus.CONNECTION_FAILED:
        return 'Connection Failed';
      default:
        return 'Disconnected';
    }
  };

  const handleConnectGoogle = async () => {
    setSuccessMsg(null);
    try {
      const loggedUser = await ytConnectionService.connectWithGoogleOAuth();
      setSuccessMsg(`Connected successfully as ${loggedUser.name}!`);
    } catch (err) {}
  };

  const handleConnectHandle = async (e) => {
    if (e) e.preventDefault();
    setSuccessMsg(null);
    try {
      const loggedUser = await ytConnectionService.connectWithChannelHandle(handleInput);
      setSuccessMsg(`Channel @${loggedUser.handle} linked successfully!`);
      setHandleInput('');
    } catch (err) {}
  };

  const handleConnectElectron = async () => {
    setSuccessMsg(null);
    try {
      const loggedUser = await ytConnectionService.connectWithElectron();
      setSuccessMsg(`Welcome, ${loggedUser.name}! Real session verified.`);
    } catch (err) {}
  };

  const handleDisconnect = () => {
    ytConnectionService.disconnect();
    onUserChange(null);
    setSuccessMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden bg-im-card border border-im-line shadow-im-float text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-im-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-im-card2 border border-im-line flex items-center justify-center text-red-400 shadow-sm">
              <YoutubeIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">
                YouTube Music Connection
              </h3>
              <p className="text-[11px] text-im-inkFaint">
                Optional account sync • Guest Mode is active
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
        <div className="p-6 space-y-4">
          {/* Guest Mode Assurance Banner */}
          <div className="p-3.5 rounded-2xl flex items-start gap-2.5 bg-im-card2 border border-im-line">
            <Sparkles size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-im-inkSoft leading-relaxed">
              <span className="font-bold text-white">Guest Mode is active by default.</span> You can search, explore, and play any song without signing into Google.
            </div>
          </div>

          {/* Connection Error Alert */}
          {connState.error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0 text-rose-400" />
              <span>{connState.error.userMessage || connState.error.message}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Connected View */}
          {connState.isConnected && connState.user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-im-card2 border border-im-line">
                <img
                  src={connState.user.picture}
                  alt={connState.user.name}
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-400"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold truncate text-white">
                      {connState.user.name}
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-[10px] text-im-inkFaint truncate mt-0.5">
                    {connState.user.email || connState.user.handle || 'Connected Session'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDisconnect}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/20"
                >
                  <LogOut size={14} />
                  <span>Disconnect</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white text-black hover:bg-white/90"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Connection Options */
            <div className="space-y-4">
              {/* Primary Google OAuth Button (white primary) */}
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                className="w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2.5 cursor-pointer transition-all disabled:opacity-50 bg-white text-black hover:bg-white/90 shadow-md active:scale-95"
              >
                {isConnecting ? (
                  <RefreshCw size={15} className="animate-spin text-black" />
                ) : (
                  <YoutubeIcon size={16} />
                )}
                <span>{isConnecting ? getStatusText() : 'Continue with Google'}</span>
              </button>

              {/* Alternative Options Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-im-line" />
                <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-im-inkFaint">
                  or
                </span>
                <div className="flex-grow border-t border-im-line" />
              </div>

              {/* Strategy Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-im-card2 border border-im-line">
                {isElectron && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('desktop')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'desktop'
                        ? 'bg-white text-black shadow-xs'
                        : 'text-im-inkFaint hover:text-white'
                    }`}
                  >
                    Desktop Sign-In
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('handle')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'handle'
                      ? 'bg-white text-black shadow-xs'
                      : 'text-im-inkFaint hover:text-white'
                  }`}
                >
                  Channel Handle
                </button>
              </div>

              {/* In-App Desktop Sign-In */}
              {isElectron && activeTab === 'desktop' && (
                <div className="space-y-3">
                  <p className="text-xs text-im-inkFaint">
                    Opens a secure Google login window to verify your real YouTube Music account.
                  </p>
                  <button
                    onClick={handleConnectElectron}
                    disabled={isConnecting}
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all bg-white text-black hover:bg-white/90 shadow-sm"
                  >
                    {isConnecting ? (
                      <RefreshCw size={14} className="animate-spin text-black" />
                    ) : (
                      <Monitor size={14} />
                    )}
                    <span>{isConnecting ? getStatusText() : 'Open Google Sign-In Window'}</span>
                  </button>
                </div>
              )}

              {/* Public Channel Handle Option */}
              {activeTab === 'handle' && (
                <form onSubmit={handleConnectHandle} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-im-inkFaint">
                      YouTube Channel Handle
                    </label>
                    <div className="relative">
                      <AtSign size={14} className="absolute left-3 top-3 text-im-inkFaint" />
                      <input
                        type="text"
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value)}
                        placeholder="username or channel name"
                        className="w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition-all bg-im-card2 border border-im-line text-white placeholder:text-im-inkFaint focus:border-white/30"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isConnecting || !handleInput.trim()}
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 bg-white text-black hover:bg-white/90 shadow-sm"
                  >
                    {isConnecting ? (
                      <RefreshCw size={14} className="animate-spin text-black" />
                    ) : (
                      <UserCheck size={14} />
                    )}
                    <span>{isConnecting ? getStatusText() : 'Link Public Channel'}</span>
                  </button>
                </form>
              )}

              {/* Prominent Continue as Guest Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 bg-im-card2 hover:bg-white/10 border border-im-line text-im-inkSoft hover:text-white"
                >
                  <span>Continue as Guest</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
