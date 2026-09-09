import React, { useEffect, useRef } from 'react';

export default function VisualizerCanvas({ isPlaying, className = 'w-full h-12' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let step = 0;

    const render = () => {
      // Set actual canvas pixels to match display size
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      if (!isPlaying) {
        // Flat resting line with subtle shimmer
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        return;
      }

      step += 0.05;

      // Draw primary glowing sine wave
      ctx.beginPath();
      const waveGradient = ctx.createLinearGradient(0, 0, width, 0);
      waveGradient.addColorStop(0, '#00F0FF');
      waveGradient.addColorStop(0.5, '#A855F7');
      waveGradient.addColorStop(1, '#EC4899');

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = waveGradient;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 10;

      for (let x = 0; x < width; x += 3) {
        const freq1 = Math.sin((x * 0.02) + step) * (height * 0.28);
        const freq2 = Math.cos((x * 0.035) - (step * 0.8)) * (height * 0.15);
        const freq3 = Math.sin((x * 0.008) + (step * 1.4)) * (height * 0.1);
        const y = centerY + freq1 + freq2 + freq3;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Reset shadow for secondary translucent harmonics
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';

      for (let x = 0; x < width; x += 4) {
        const y = centerY + Math.sin((x * 0.025) - (step * 1.2)) * (height * 0.2);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`rounded-lg pointer-events-none transition-opacity duration-500 ${isPlaying ? 'opacity-90' : 'opacity-40'} ${className}`} 
    />
  );
}
