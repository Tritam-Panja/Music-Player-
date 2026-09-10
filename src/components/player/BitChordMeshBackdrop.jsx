import React, { useMemo, useState, useEffect } from 'react';

// Generates a rich harmonic palette based on string hash
function generateHarmonicPalette(seedStr) {
  if (!seedStr) {
    return {
      c1: 'rgba(56, 189, 248, 0.45)', // Sky blue
      c2: 'rgba(168, 85, 247, 0.45)', // Purple
      c3: 'rgba(236, 72, 153, 0.40)', // Pink
      c4: 'rgba(30, 41, 59, 0.95)'    // Deep slate
    };
  }

  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }

  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 60) % 360;
  const h3 = (h1 + 180) % 360;

  return {
    c1: `hsla(${h1}, 75%, 55%, 0.45)`,
    c2: `hsla(${h2}, 80%, 50%, 0.40)`,
    c3: `hsla(${h3}, 70%, 45%, 0.35)`,
    c4: '#0a0d14'
  };
}

export default function BitChordMeshBackdrop({ track, isPlaying }) {
  const [colors, setColors] = useState(() => generateHarmonicPalette('default'));

  useEffect(() => {
    if (track) {
      const seed = track.id || track.title || 'bitchord';
      setColors(generateHarmonicPalette(seed));
    }
  }, [track?.id, track?.title]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#07090e]">
      {/* 1. Base Blurred Artwork Underlay */}
      {track?.thumbnail && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 scale-125 blur-3xl transition-opacity duration-1000"
          style={{ backgroundImage: `url(${track.thumbnail})` }}
        />
      )}

      {/* 2. BitChord Living Mesh Gradient Blobs */}
      <div className="absolute inset-0 w-full h-full">
        {/* Blob 1 - Top Left Harmonic */}
        <div 
          className={`absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[130px] opacity-70 transition-all duration-1000 ${
            isPlaying ? 'animate-pulse scale-105' : 'scale-100'
          }`}
          style={{ background: colors.c1 }}
        />

        {/* Blob 2 - Top Right Accent */}
        <div 
          className="absolute top-10 right-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-60 transition-all duration-1000"
          style={{ background: colors.c2 }}
        />

        {/* Blob 3 - Center Pulsing Sub-bass aura */}
        <div 
          className="absolute top-1/3 left-1/4 w-[750px] h-[750px] rounded-full blur-[160px] opacity-50 transition-all duration-1000"
          style={{ background: colors.c3 }}
        />

        {/* Blob 4 - Bottom Vignette Ambient */}
        <div 
          className="absolute -bottom-40 left-1/3 w-[800px] h-[500px] rounded-full blur-[150px] opacity-75 transition-all duration-1000"
          style={{ background: colors.c1 }}
        />
      </div>

      {/* 3. Deep Obsidian Vignette Mask */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#07090e]/60 via-[#07090e]/40 to-[#07090e]/85 backdrop-blur-[60px]"
      />

      {/* 4. Fine Grain / Frosted Haze Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
