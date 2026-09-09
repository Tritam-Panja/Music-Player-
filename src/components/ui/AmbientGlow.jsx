import React from 'react';

export default function AmbientGlow({ currentTrack }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top Left Fluid Sphere */}
      <div 
        className="ambient-glow-sphere w-[550px] h-[550px] -top-32 -left-32 bg-gradient-to-br from-cyan-600 via-blue-700 to-transparent animate-fluid-slow"
        style={{ animationDuration: '24s' }}
      />

      {/* Top Right Fluid Sphere */}
      <div 
        className="ambient-glow-sphere w-[600px] h-[600px] -top-40 -right-40 bg-gradient-to-bl from-purple-600 via-pink-600 to-transparent animate-fluid-slow"
        style={{ animationDuration: '28s', animationDelay: '-5s' }}
      />

      {/* Bottom Center Reactive Halo */}
      <div 
        className="ambient-glow-sphere w-[700px] h-[400px] -bottom-32 left-1/2 -translate-x-1/2 bg-gradient-to-t from-violet-700 via-fuchsia-800 to-transparent animate-fluid-slow"
        style={{ animationDuration: '20s', animationDelay: '-10s' }}
      />

      {/* Subtle Noise / Mesh Texture Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0,transparent_100%)]" />
    </div>
  );
}
