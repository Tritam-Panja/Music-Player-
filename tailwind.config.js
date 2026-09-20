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
        im: {
          bg: '#0a0a0c',
          card: '#141316',
          card2: '#1c1b1f',
          ink: '#ffffff',
          inkSoft: 'rgba(255,255,255,0.62)',
          inkFaint: 'rgba(255,255,255,0.38)',
          line: 'rgba(255,255,255,0.08)',
          navBg: 'rgba(255,255,255,0.06)',
        },
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '24px',
        '3xl': '40px',
      },
      boxShadow: {
        'im-float': '0 20px 50px rgba(0,0,0,0.55)',
      },
      backgroundImage: {
        'im-mood-chill': 'linear-gradient(160deg,#d98a3a,#8a4a1e)',
        'im-mood-commute': 'linear-gradient(160deg,#8a6fd6,#4a3a8f)',
        'im-mood-energize': 'linear-gradient(160deg,#4a3ad6,#2a1a6f)',
        'im-mood-feelgood': 'linear-gradient(160deg,#c43a7a,#6f1a4a)',
        'im-mood-focus': 'linear-gradient(160deg,#c4552e,#7a2a12)',
        'im-mood-party': 'linear-gradient(160deg,#3a7ac4,#1a3a7a)',
        'im-hero': 'linear-gradient(160deg,#c76b8a,#5b3a63)',
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
