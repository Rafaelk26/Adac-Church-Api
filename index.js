const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 259200 });
const PORT = 3001;

const API_KEY = 'AIzaSyCGLK8e2xkpGIZC_c31GQSpsLq0qYstrFM';
const CHANNEL_ID = 'UCHG4HehgHbGnPZD0bWPBD9g';

app.use(cors());

app.get('/api/videos', async (req, res) => {
  const cachedVideos = cache.get('videos');
  const lastVideoId = cache.get('lastVideoId');

  if (cachedVideos && lastVideoId) {
    try {
      // Verifica se há novos vídeos
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: API_KEY,
          channelId: CHANNEL_ID,
          part: 'snippet',
          order: 'date',
          maxResults: 1
        }
      });

      const latestVideoId = response.data.items[0].id.videoId;

      if (lastVideoId === latestVideoId) {
        // Se o vídeo mais recente não mudou, usa o cache
        return res.json(cachedVideos);
      }

      // Se mudou, atualiza o cache com novos dados
      const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: API_KEY,
          channelId: CHANNEL_ID,
          part: 'snippet',
          order: 'date',
          maxResults: 5
        }
      });

      const videos = videoResponse.data.items.map(item => ({
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        videoId: item.id.videoId
      }));

      cache.set('videos', videos);
      cache.set('lastVideoId', latestVideoId);

      return res.json(videos);
    } catch (error) {
      console.error('Erro ao verificar novos vídeos:', error.response ? error.response.data : error.message);
      return res.status(500).json({ error: 'Erro ao verificar novos vídeos' });
    }
  } else {
    // Cache inicial ou cache expirado
    try {
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

      const latestVideoId = response.data.items[0].id.videoId;

      cache.set('videos', videos);
      cache.set('lastVideoId', latestVideoId);

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
