const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

const API_KEY = 'AIzaSyCGLK8e2xkpGIZC_c31GQSpsLq0qYstrFM';
const CHANNEL_ID = 'UCHG4HehgHbGnPZD0bWPBD9g';

app.use(cors());


// Últimos 5 cultos
app.get('/api/videos', async (req, res) => {
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

    res.json(videos);
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Erro ao buscar vídeos' });
  }
});


app.get('/api/videos/last/', async (req, res) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: API_KEY,
        channelId: CHANNEL_ID,
        part: 'snippet',
        order: 'date',
        maxResults: 1
      }
    });

    const videos = response.data.items.map(item => ({
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
      videoId: item.id.videoId
    }));

    res.json(videos);
  } catch (error) {
    console.error('Erro ao buscar o vídeo:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Erro ao buscar o vídeo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
