import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ensure assets work with Electron & Capacitor
  server: {
    port: 5173,
    host: true
  }
})
