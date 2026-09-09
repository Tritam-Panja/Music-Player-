# 🌊 Liquid Music

> **Free, Open-Source, Zero-Ad Music Player with a Liquid Glass Interface and YouTube Playlist Synchronization.**  
> Stream millions of songs, import your personal YouTube playlists, enjoy real-time synced lyrics, and experience high-performance audio with zero lag.

---

## ✨ Features

- 💎 **Liquid Glass Interface**: High-performance translucent glassmorphism with `backdrop-filter: blur(24px)`.
- 🎨 **Adaptive Ambient Backlight**: Dynamic fluid light gradients that adaptively react to album art colors.
- ⚡ **Zero Ads & Zero Lag**: Instant audio playback powered by open-source streaming resolvers.
- 📺 **YouTube Playlist Sync**: Paste any public or unlisted YouTube or YouTube Music playlist link to import and stream immediately.
- 🎤 **Real-Time Synced Lyrics**: Powered by [LRCLIB](https://lrclib.net/) with karaoke-style glowing active lines and click-to-seek playback.
- 📊 **Liquid 60fps Audio Visualizer**: Real-time canvas audio wave reactive to playback rhythm.
- 🔀 **Queue & Library Management**: Reorder upcoming songs, like favorite tracks, and search tracks with instant filtering.
- ⌨️ **Global & Local Shortcuts**:
  - `Space`: Play / Pause
  - `Arrow Left` / `Arrow Right`: Seek -5s / +5s
  - `M`: Toggle Mute
  - `L`: Toggle Real-time Synced Lyrics
  - `Q`: Toggle Play Queue
- 📦 **Cross-Platform**:
  - **Desktop**: Electron native app (Windows `.exe`, Linux `.AppImage`, macOS `.dmg`).
  - **Mobile**: Capacitor & Progressive Web App (PWA) with lockscreen controls.
  - **Web**: Lightweight static SPA deployable on Vercel, Netlify, or GitHub Pages.

---

## 🚀 Quick Start (Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/liquid-music.git
cd liquid-music
npm install
```

### 2. Run Web Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 💻 Desktop App (Windows .exe / macOS / Linux)

### Run Electron in Development:
```bash
npm run electron:dev
```

### Build Downloadable Installer (.exe):
```bash
npm run electron:build
```
The output `.exe` installer and portable standalone executable will be located in the `dist-electron/` folder.

---

## 📱 Mobile App (Android APK / Capacitor)

```bash
npm run cap:sync
npx cap add android
npm run cap:open:android
```
Open in Android Studio and click **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate your downloadable `.apk`.

---

## 🤖 Automated GitHub Releases (CI/CD)

This repository includes `.github/workflows/release.yml`.  
Whenever you push a git tag (e.g. `git tag v1.0.0 && git push origin v1.0.0`), GitHub Actions will automatically:
1. Build the production web bundle.
2. Compile and package the Windows installer (`.exe`).
3. Attach the downloadable `.exe` binary to the GitHub Releases page for anyone to download!

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, HTML5 Canvas Visualizer
- **Desktop**: Electron 35, Electron Builder
- **Mobile**: Capacitor 7, MediaSession API
- **APIs**: YouTube IFrame API / Invidious / Piped API, LRCLIB Synced Lyrics API
- **Backend (Optional MERN)**: Express, Node.js, MongoDB

---

## 📄 License
MIT License. Free and open-source for everyone.
