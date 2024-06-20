import { useState } from 'react';
import { Alert } from 'react-native';
import { useSpotifyDevices } from './useSpotifyDevices'; // Import the custom devices hook

export const useSpotifyPlayback = (accessToken: string) => {
  const [selectedTrackUri, setSelectedTrackUri] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { getDeviceId } = useSpotifyDevices(accessToken); // Use the custom devices hook

  const handlePlayback = async (action: string, uri: string | null = null, offset: number | null = null) => {
    try {
      if (!accessToken) {
        throw new Error('Access token not found');
      }
      const activeDevice = await getDeviceId();
      if (!activeDevice) {
        throw new Error('No active device found');
      }

      let url = '';
      let method = '';
      let body: any = null;

      switch (action) {
        case 'play':
          if (uri) {
            body = {
              "uris": [uri], // Place the uri inside an array
              "position_ms": offset || 0 // Adjust milliseconds as needed
            };
          }
          url = `https://api.spotify.com/v1/me/player/play?device_id=${activeDevice}`;
          method = 'PUT';
          break;
        case 'pause':
          url = `https://api.spotify.com/v1/me/player/pause?device_id=${activeDevice}`;
          method = 'PUT';
          break;
        case 'next':
          url = `https://api.spotify.com/v1/me/player/next?device_id=${activeDevice}`;
          method = 'POST';
          break;
        case 'previous':
          url = `https://api.spotify.com/v1/me/player/previous?device_id=${activeDevice}`;
          method = 'POST';
          break;
        default:
          throw new Error('Unknown action');
      }

      console.log('Request URL:', url);
      console.log('Request Method:', method);
      if (body) {
        console.log('Request Body:', JSON.stringify(body, null, 2));
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined, // Only include body if it's not null
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      if (action === 'play') {
        setSelectedTrackUri(uri || ''); // Store the selected track URI
      } else if (action === 'pause') {
        setSelectedTrackUri(''); // Clear the selected track URI to stop playback
      }
    } catch (err) {
      setError('An error occurred while controlling playback');
      console.error('An error occurred while controlling playback', err);
      if (err.message === 'No active device found') {
        Alert.alert('No Active Device', 'Please ensure a device is active on Spotify.');
      }
    }
  };

  return {
    handlePlayback,
    selectedTrackUri,
    error,
  };
};
