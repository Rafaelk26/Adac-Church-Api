const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 216000 });
const PORT = 3001;

const API_KEY = 'AIzaSyCGLK8e2xkpGIZC_c31GQSpsLq0qYstrFM';
const CHANNEL_ID = 'UCHG4HehgHbGnPZD0bWPBD9g';

app.use(cors());

app.get('/api/videos', async (req, res) => {
  const cachedVideos = cache.get('videos');

  if (cachedVideos) {
    // Retorna vídeos do cache se disponíveis
    return res.json(cachedVideos);
  } else {
    try {
      // Faz a requisição à API do YouTube
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: API_KEY,
          channelId: CHANNEL_ID,
          part: 'snippet',
          order: 'date',
          maxResults: 5
        }
      });

      const videos = response.data.items.map(item => ({
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        videoId: item.id.videoId
      }));

      // Armazena os vídeos no cache
      cache.set('videos', videos);

      return res.json(videos);
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error.response ? error.response.data : error.message);
      return res.status(500).json({ error: 'Erro ao buscar vídeos' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
