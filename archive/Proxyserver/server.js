const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

let roomPlaylists = {}; // In-memory storage for room playlists

// Endpoint to refresh Spotify token
app.post('/refresh_token', async function(req, res) {
  const refresh_token = req.body.refresh_token;
  const authOptions = {
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    data: new URLSearchParams({
      'grant_type': 'refresh_token',
      'refresh_token': refresh_token
    })
  };

  try {
    const response = await axios(authOptions);
    
    if (response.status === 200) {
      const { access_token, refresh_token } = response.data;
      res.status(200).json({
        'access_token': access_token,
        'refresh_token': refresh_token
      });
    } else {
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Endpoint to get playlist for a room
app.get('/room/:roomId/playlist', (req, res) => {
  const roomId = req.params.roomId;
  const playlist = roomPlaylists[roomId] || [];
  res.status(200).json({ playlist });
});

// Endpoint to save playlist for a room
app.post('/room/:roomId/playlist', (req, res) => {
  const roomId = req.params.roomId;
  const { playlist } = req.body;

  if (!Array.isArray(playlist)) {
    return res.status(400).json({ error: 'Playlist must be an array' });
  }

  roomPlaylists[roomId] = playlist;
  res.status(200).json({ message: 'Playlist saved successfully' });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
