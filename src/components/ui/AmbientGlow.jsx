import React from 'react';

export default function AmbientGlow({ currentTrack }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top Ambient Gradient */}
      <div 
        className="ambient-glow-sphere w-[700px] h-[700px] -top-64 left-1/4 bg-gradient-to-br from-indigo-600/30 via-purple-700/20 to-transparent animate-fluid-slow"
        style={{ animationDuration: '32s' }}
      />

      {/* Bottom Right Soft Aura */}
      <div 
        className="ambient-glow-sphere w-[600px] h-[600px] -bottom-48 -right-32 bg-gradient-to-tl from-cyan-600/20 via-blue-800/15 to-transparent animate-fluid-slow"
        style={{ animationDuration: '28s', animationDelay: '-8s' }}
      />

      {/* Center Subdued Diffuse Light */}
      <div 
        className="ambient-glow-sphere w-[800px] h-[500px] top-1/3 left-1/2 -translate-x-1/2 bg-gradient-to-b from-fuchsia-900/15 via-violet-900/10 to-transparent animate-fluid-slow"
        style={{ animationDuration: '36s', animationDelay: '-14s' }}
      />

      {/* Fine Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(7,8,12,0.85)_100%)]" />
    </div>
  );
}
