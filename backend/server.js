import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { YouTube } from 'youtube-sr';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory fallback if MongoDB is not connected
let memoryPlaylists = [];
let isDbConnected = false;

// Connect to MongoDB if MONGO_URI is provided
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      isDbConnected = true;
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.warn('MongoDB connection failed, running with in-memory sync:', err.message);
    });
}

// Health check & status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Liquid Music API',
    database: isDbConnected ? 'MongoDB connected' : 'Standalone / In-memory mode',
    timestamp: new Date().toISOString()
  });
});

// Search API for production web hosting
app.get('/api/search', async (req, res) => {
  const { q, type = 'video' } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required', results: [] });
  }

  try {
    const results = await YouTube.search(q, {
      limit: 25,
      type: type === 'playlist' ? 'playlist' : 'video'
    });

    if (Array.isArray(results) && results.length > 0) {
      const formatted = results.map(item => ({
        id: item.id,
        type: item.type || (item.videos ? 'playlist' : 'video'),
        title: item.title,
        artist: item.channel?.name || 'Unknown Artist',
        duration: item.duration ? Math.floor(item.duration / 1000) : 0,
        thumbnail: item.thumbnail?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
        views: item.views || 0,
        uploaded: item.uploadedAt || ''
      }));

      return res.json({ success: true, results: formatted });
    }
  } catch (err) {
    // Fallback to Innertube if youtube-sr encounters parsing error (e.g. browseId)
  }

  try {
    const response = await fetch('https://www.youtube.com/youtubei/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        context: { client: { clientName: 'WEB', clientVersion: '2.20240101.00.00' } },
        query: q
      })
    });

    if (response.ok) {
      const data = await response.json();
      const sections = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
      const tracks = [];

      for (const section of sections) {
        const items = section.itemSectionRenderer?.contents || [];
        for (const item of items) {
          const vr = item.videoRenderer;
          if (vr && vr.videoId && vr.title?.runs?.[0]?.text) {
            const thumb = vr.thumbnail?.thumbnails?.[vr.thumbnail.thumbnails.length - 1]?.url;
            tracks.push({
              id: vr.videoId,
              type: 'video',
              title: vr.title.runs[0].text,
              artist: vr.ownerText?.runs?.[0]?.text || 'Unknown Artist',
              duration: 210,
              thumbnail: thumb || `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`,
              views: 0,
              uploaded: vr.publishedTimeText?.simpleText || ''
            });
          }
        }
      }

      return res.json({ success: true, results: tracks });
    }
  } catch (fallbackErr) {
    return res.status(500).json({ error: fallbackErr.message, results: [] });
  }

  return res.json({ success: true, results: [] });
});

// Suggestions API
app.get('/api/suggestions', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ suggestions: [] });

  try {
    const response = await fetch(
      `https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&hl=en&gl=us&ds=yt&q=${encodeURIComponent(q)}`
    );
    const text = await response.text();
    const jsonMatch = text.match(/^[^(]*\((.*)\);?$/);
    let suggestions = [];
    if (jsonMatch && jsonMatch[1]) {
      const data = JSON.parse(jsonMatch[1]);
      if (Array.isArray(data[1])) {
        suggestions = data[1].map(item => item[0]).filter(Boolean);
      }
    }
    return res.json({ suggestions });
  } catch {
    return res.json({ suggestions: [] });
  }
});

// Trending API
app.get('/api/trending', async (req, res) => {
  try {
    const results = await YouTube.search('Top Global Hits 2026', { limit: 20, type: 'video' });
    const formatted = results.map(item => ({
      id: item.id,
      type: 'video',
      title: item.title,
      artist: item.channel?.name || 'Top Artist',
      duration: item.duration ? Math.floor(item.duration / 1000) : 0,
      thumbnail: item.thumbnail?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
      views: item.views || 0,
      uploaded: item.uploadedAt || ''
    }));

    return res.json({ success: true, results: formatted });
  } catch (err) {
    return res.status(500).json({ error: err.message, results: [] });
  }
});

// Playlist sync endpoints
app.get('/api/playlists', (req, res) => {
  res.json({ success: true, playlists: memoryPlaylists });
});

app.post('/api/playlists', (req, res) => {
  const { playlist } = req.body;
  if (!playlist) return res.status(400).json({ error: 'Playlist data required' });
  
  const existingIndex = memoryPlaylists.findIndex(p => p.id === playlist.id);
  if (existingIndex >= 0) {
    memoryPlaylists[existingIndex] = playlist;
  } else {
    memoryPlaylists.push(playlist);
  }
  
  res.json({ success: true, playlist });
});

// Stream proxy endpoint
app.get('/api/stream-proxy', async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'videoId required' });

  const pipedInstances = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.privacydev.net',
    'https://piped-api.lunar.icu'
  ];

  for (const instance of pipedInstances) {
    try {
      const response = await fetch(`${instance}/streams/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        const audioStreams = data.audioStreams || [];
        audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
        if (audioStreams.length > 0) {
          return res.json({
            success: true,
            streamUrl: audioStreams[0].url,
            format: audioStreams[0].format,
            bitrate: audioStreams[0].bitrate,
            title: data.title,
            uploader: data.uploader,
            duration: data.duration
          });
        }
      }
    } catch (err) {
      // try next
    }
  }

  res.status(502).json({ error: 'Audio stream resolver currently unavailable, use YouTube fallback' });
});

// Serve frontend dist if available (full-stack production deployment)
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Liquid Music server running on http://localhost:${PORT}`);
});
