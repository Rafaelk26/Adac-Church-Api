const express = require('express');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;

const API_KEY = 'AIzaSyCGLK8e2xkpGIZC_c31GQSpsLq0qYstrFM';
const CHANNEL_ID = 'UCHG4HehgHbGnPZD0bWPBD9g';
const CACHE_FILE = 'cache.json';
const CACHE_DURATION = 60 * 60 * 1000 * 60;

app.use(cors());

const saveCache = (data) => {
  fs.writeFileSync(CACHE_FILE, JSON.stringify({
    timestamp: Date.now(),
    data
  }));
};

const loadCache = () => {
  if (fs.existsSync(CACHE_FILE)) {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    if (Date.now() - cache.timestamp < CACHE_DURATION) {
      return cache.data;
    }
  }
  return null;
};

app.get('/api/videos', async (req, res) => {
  try {
    let videos = loadCache();

    if (!videos) {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: API_KEY,
          channelId: CHANNEL_ID,
          part: 'snippet',
          order: 'date',
          maxResults: 5
        }
      });

      videos = response.data.items.map(item => ({
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        videoId: item.id.videoId
      }));

      saveCache(videos);
    }

    res.json(videos);
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Erro ao buscar vídeos' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
