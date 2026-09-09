/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glass: {
          surface: 'rgba(255, 255, 255, 0.04)',
          surfaceHover: 'rgba(255, 255, 255, 0.08)',
          card: 'rgba(20, 20, 28, 0.55)',
          border: 'rgba(255, 255, 255, 0.09)',
          borderHover: 'rgba(255, 255, 255, 0.22)',
          highlight: 'rgba(255, 255, 255, 0.15)',
        },
        neon: {
          cyan: '#00F0FF',
          purple: '#A855F7',
          pink: '#EC4899',
          green: '#10B981',
          blue: '#3B82F6',
        }
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '24px',
        '3xl': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
        'glass-glow': '0 0 35px -5px rgba(168, 85, 247, 0.35)',
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.4)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
      },
      animation: {
        'fluid-slow': 'fluid 18s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'equalizer': 'equalize 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        fluid: {
          '0%': { transform: 'scale(1) translate(0px, 0px) rotate(0deg)' },
          '50%': { transform: 'scale(1.15) translate(30px, -20px) rotate(15deg)' },
          '100%': { transform: 'scale(1.05) translate(-25px, 25px) rotate(-10deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'blur(60px)' },
          '50%': { opacity: '0.7', filter: 'blur(80px)' },
        },
        equalize: {
          '0%': { height: '20%' },
          '100%': { height: '100%' },
        }
      }
    },
  },
  plugins: [],
}
