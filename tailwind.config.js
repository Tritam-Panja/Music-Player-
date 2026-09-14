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
        },
        neu: {
          bg: '#f3f2ee',
          'bg-dark': '#ebe8e1',
          card: '#faf9f6',
          espresso: '#2e221b',
          'espresso-dark': '#241a14',
          chocolate: '#3d2b20',
          taupe: '#8f8075',
          'taupe-light': '#b8ada5',
          groove: '#e6e1d8',
          'groove-dark': '#d8d2c6',
        },
        ui: {
          page: '#eef0ec',
          gradA: '#dff3ea',
          gradB: '#e9e6f7',
          card: '#ffffff',
          cardSoft: '#f6f5f1',
          ink: '#1c1b19',
          inkSoft: '#6b6660',
          inkFaint: '#9a948c',
          brand: '#c4956a',
          brandInk: '#2e221b',
          line: 'rgba(28,27,25,0.08)',
        },
        ui2: {
          ink: '#1c1b1f',
          inkSoft: '#6f6d76',
          inkFaint: '#9a97a1',
          accentInk: '#231f1c',
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
        'neu-card': '16px 20px 42px rgba(165, 150, 135, 0.28), -12px -12px 30px rgba(255, 255, 255, 0.95)',
        'neu-card-sm': '8px 12px 24px rgba(165, 150, 135, 0.22), -8px -8px 20px rgba(255, 255, 255, 0.95)',
        'neu-button': '5px 7px 15px rgba(165, 150, 135, 0.28), -5px -5px 12px rgba(255, 255, 255, 0.95)',
        'neu-button-pressed': 'inset 3px 3px 6px rgba(165, 150, 135, 0.35), inset -3px -3px 6px rgba(255, 255, 255, 0.8)',
        'neu-button-play': '8px 12px 24px rgba(46, 34, 27, 0.38), -4px -4px 12px rgba(255, 255, 255, 0.85)',
        'neu-groove': 'inset 2px 2px 5px rgba(165, 150, 135, 0.35), inset -2px -2px 5px rgba(255, 255, 255, 0.85)',
        'ui-card': '0 12px 30px rgba(60,50,40,0.10)',
        'ui-soft': '0 4px 14px rgba(60,50,40,0.08)',
        'ui2-float': '0 18px 40px rgba(60,50,90,0.14)',
        'ui2-soft': '0 6px 18px rgba(60,50,90,0.10)',
      },
      backgroundImage: {
        'ui2-gradient': 'linear-gradient(135deg, #bdeee0, #cfe0f5 35%, #e3d3f2 65%, #f2d9e6)',
        'ui2-gradient-dark': 'linear-gradient(135deg, #0a0d17 0%, #111827 30%, #1c1535 65%, #0d1222 100%)',
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
