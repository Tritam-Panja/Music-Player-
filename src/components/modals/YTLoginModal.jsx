import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  LogOut, 
  Sparkles, 
  UserCheck, 
  ShieldCheck, 
  Music2, 
  Link2, 
  ArrowRight,
  Key,
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
  theme = 'light'
}) {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('token'); // 'token' | 'handle' | 'desktop'
  const [tokenInput, setTokenInput] = useState('');
  const [handleInput, setHandleInput] = useState('');
  const [connState, setConnState] = useState(ytConnectionService.getState());
  const [successMsg, setSuccessMsg] = useState(null);

  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);

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

  const handleConnectToken = async (e) => {
    if (e) e.preventDefault();
    setSuccessMsg(null);
    try {
      const loggedUser = await ytConnectionService.connectWithToken(tokenInput);
      setSuccessMsg(`Connected successfully as ${loggedUser.name}!`);
      setTokenInput('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className={`relative w-full max-w-md rounded-[32px] overflow-hidden transition-colors ${
        isDark 
          ? 'bg-[#1b1d23] neu-card-shadow neu-dark text-[#f3efe8] border border-[#262933]' 
          : 'bg-[#faf9f6] neu-card-shadow text-[#2e221b] border border-[#e8e2d8]'
      }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${
          isDark ? 'border-[#262933]' : 'border-[#e8e2d8]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-[#111215] neu-groove-inset neu-dark text-red-400' : 'bg-[#e8e2d8] neu-groove-inset text-red-500'
            }`}>
              <YoutubeIcon size={20} />
            </div>
            <div>
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'}`}>
                YouTube Music Connection
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                Optional account sync • Guest Mode is always active
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-[#828694] hover:text-[#f3efe8]' : 'text-[#8f8075] hover:text-[#2e221b]'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Guest Mode Assurance Banner */}
          <div className={`p-3.5 rounded-2xl flex items-start gap-2.5 ${
            isDark ? 'bg-[#111215] border border-[#262933]' : 'bg-[#f4efe8] border border-[#e8dfd2]'
          }`}>
            <Sparkles size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">Guest Mode is active by default.</span> You can search, explore, and play any song without signing into Google.
            </div>
          </div>

          {/* Connection Error Alert */}
          {connState.error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/25 text-rose-500 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0 text-rose-500" />
              <span>{connState.error.userMessage || connState.error.message}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Connected View */}
          {connState.isConnected && connState.user ? (
            <div className="space-y-4">
              <div className={`flex items-center gap-3.5 p-3.5 rounded-2xl ${
                isDark ? 'bg-[#111215] neu-groove-inset neu-dark' : 'bg-[#e8e2d8] neu-groove-inset'
              }`}>
                <img
                  src={connState.user.picture}
                  alt={connState.user.name}
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-bold truncate ${isDark ? 'text-[#f3efe8]' : 'text-[#2e221b]'}`}>
                      {connState.user.name}
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <p className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                    {connState.user.email || connState.user.handle || 'Connected Session'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDisconnect}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isDark 
                      ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25' 
                      : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                  }`}
                >
                  <LogOut size={14} />
                  <span>Disconnect</span>
                </button>
                <button
                  onClick={onClose}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#f3efe8]' 
                      : 'bg-[#faf9f6] neu-btn-shadow text-[#2e221b]'
                  }`}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Connection Options */
            <div className="space-y-4">
              {/* Strategy Tabs */}
              <div className={`flex items-center p-1 rounded-xl ${
                isDark ? 'bg-[#111215] neu-groove-inset neu-dark' : 'bg-[#e8e2d8] neu-groove-inset'
              }`}>
                {isElectron && (
                  <button
                    onClick={() => setActiveTab('desktop')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'desktop'
                        ? isDark ? 'bg-[#1b1d23] text-[#f3efe8] neu-btn-shadow neu-dark' : 'bg-[#faf9f6] text-[#2e221b] neu-btn-shadow'
                        : isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                    }`}
                  >
                    Desktop Sign-In
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('token')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'token'
                      ? isDark ? 'bg-[#1b1d23] text-[#f3efe8] neu-btn-shadow neu-dark' : 'bg-[#faf9f6] text-[#2e221b] neu-btn-shadow'
                      : isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                  }`}
                >
                  Google Token
                </button>
                <button
                  onClick={() => setActiveTab('handle')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'handle'
                      ? isDark ? 'bg-[#1b1d23] text-[#f3efe8] neu-btn-shadow neu-dark' : 'bg-[#faf9f6] text-[#2e221b] neu-btn-shadow'
                      : isDark ? 'text-[#828694]' : 'text-[#8f8075]'
                  }`}
                >
                  Channel Handle
                </button>
              </div>

              {/* In-App Desktop Sign-In */}
              {isElectron && activeTab === 'desktop' && (
                <div className="space-y-3">
                  <p className={`text-xs ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                    Opens a secure Google login window to verify your real YouTube Music account.
                  </p>
                  <button
                    onClick={handleConnectElectron}
                    disabled={isConnecting}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isDark ? 'bg-[#c4956a] text-[#131417] neu-play-shadow' : 'bg-[#2e221b] text-[#faf9f6] neu-play-shadow'
                    }`}
                  >
                    {isConnecting ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Monitor size={14} />
                    )}
                    <span>{isConnecting ? getStatusText() : 'Open Google Sign-In Window'}</span>
                  </button>
                </div>
              )}

              {/* OAuth Token Option */}
              {activeTab === 'token' && (
                <form onSubmit={handleConnectToken} className="space-y-3">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                      Google OAuth Access Token
                    </label>
                    <div className="relative">
                      <Key size={14} className={`absolute left-3 top-3 ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`} />
                      <input
                        type="password"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="ya29.a0AfH6SM..."
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition-all ${
                          isDark 
                            ? 'bg-[#111215] border border-[#262933] text-[#f3efe8] focus:border-[#c4956a]' 
                            : 'bg-[#faf9f6] border border-[#e8e2d8] text-[#2e221b] focus:border-[#2e221b]'
                        }`}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isConnecting || !tokenInput.trim()}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 ${
                      isDark ? 'bg-[#c4956a] text-[#131417] neu-play-shadow' : 'bg-[#2e221b] text-[#faf9f6] neu-play-shadow'
                    }`}
                  >
                    {isConnecting ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <ShieldCheck size={14} />
                    )}
                    <span>{isConnecting ? getStatusText() : 'Validate & Connect Session'}</span>
                  </button>
                </form>
              )}

              {/* Public Channel Handle Option */}
              {activeTab === 'handle' && (
                <form onSubmit={handleConnectHandle} className="space-y-3">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`}>
                      YouTube Channel Handle
                    </label>
                    <div className="relative">
                      <AtSign size={14} className={`absolute left-3 top-3 ${isDark ? 'text-[#828694]' : 'text-[#8f8075]'}`} />
                      <input
                        type="text"
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value)}
                        placeholder="username or channel name"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition-all ${
                          isDark 
                            ? 'bg-[#111215] border border-[#262933] text-[#f3efe8] focus:border-[#c4956a]' 
                            : 'bg-[#faf9f6] border border-[#e8e2d8] text-[#2e221b] focus:border-[#2e221b]'
                        }`}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isConnecting || !handleInput.trim()}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 ${
                      isDark ? 'bg-[#c4956a] text-[#131417] neu-play-shadow' : 'bg-[#2e221b] text-[#faf9f6] neu-play-shadow'
                    }`}
                  >
                    {isConnecting ? (
                      <RefreshCw size={14} className="animate-spin" />
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
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-[#1b1d23] neu-btn-shadow neu-dark text-[#828694] hover:text-[#f3efe8]'
                      : 'bg-[#faf9f6] neu-btn-shadow text-[#8f8075] hover:text-[#2e221b]'
                  }`}
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
