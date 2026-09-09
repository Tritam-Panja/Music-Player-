import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

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

// Proxy endpoint for resolving Piped / Invidious streams if client faces CORS restrictions
app.get('/api/stream-proxy', async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'videoId required' });

  // Public Piped instances
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
        // Sort highest quality audio
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
      // try next instance
    }
  }

  res.status(502).json({ error: 'Audio stream resolver currently unavailable, use YouTube fallback' });
});

app.listen(PORT, () => {
  console.log(`Liquid Music server running on http://localhost:${PORT}`);
});
