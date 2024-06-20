import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import SongCard from '../components/Spotify/SongCard';
import WebView from 'react-native-webview';
import { VITE_SPOTIFY_CLIENT_ID, VITE_SPOTIFY_CLIENT_SECRET } from '@env';
import axios from 'axios';

const clientId = VITE_SPOTIFY_CLIENT_ID;
const clientSecret = VITE_SPOTIFY_CLIENT_SECRET;

interface Track {
  uri: string;
  // Add other track properties as needed
}

const SpotifyTestingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [refreshToken, setRefreshToken] = useState<string>('');
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedTrackUri, setSelectedTrackUri] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const storedRefreshToken = await AsyncStorage.getItem('refresh_token');
      if (token) {
        setAccessToken(token);
        await refreshAccessTokenIfNeeded(token);
        await getDevices(token);
      }
      if (storedRefreshToken) {
        setRefreshToken(storedRefreshToken);
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error('An error occurred while fetching data', err);
    }
  };

  const handleTokenChange = async (token: string) => {
    try {
      setAccessToken(token);
      await AsyncStorage.setItem('access_token', token);
      await getDevices(token);
    } catch (err) {
      setError('An error occurred while saving token');
      console.error('An error occurred while saving token', err);
    }
  };

  const handleRefreshTokenChange = async (token: string) => {
    try {
      setRefreshToken(token);
      await AsyncStorage.setItem('refresh_token', token);
    } catch (err) {
      setError('An error occurred while saving refresh token');
      console.error('An error occurred while saving refresh token', err);
    }
  };

  const getRefreshToken = async (): Promise<void> => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem('refresh_token');
      if (!storedRefreshToken) throw new Error('No refresh token found');
      console.log('refreshToken from getRefreshToken:', refreshToken);
      const response = await axios.post('http://localhost:3000/refresh_token', {
        refresh_token: refreshToken,
      });

      if (!response) throw new Error('Failed to refresh token');

      const data = await response.data;
      await AsyncStorage.setItem('access_token', data.access_token);
      console.log(`access_token`, data.access_token);
    } catch (err) {
      setError('An error occurred while refreshing token');
      console.error('An error occurred while refreshing token', err);
    }
  };

  const refreshAccessTokenIfNeeded = async (token: string) => {
    // Placeholder function to check if token is expired
    const isTokenExpired = false; // Replace with actual expiration check logic

    if (isTokenExpired) {
      await getRefreshToken();
    }
  };

  const getDevices = async (token: string) => {
    try {
      await refreshAccessTokenIfNeeded(token);

      const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setDevices(data.devices);
    } catch (err) {
      setError('An error occurred while fetching devices');
      console.error('An error occurred while fetching devices', err);
    }
  };

  const getDeviceId = async (): Promise<string | null> => {
    try {
      await getDevices(accessToken);
      if (devices.length > 0) {
        console.log("Device ID: ",devices[0].id)
        return devices[0].id; // Return the ID of the first device
      } else {
        Alert.alert('No Devices Found', 'No devices are currently active.');
        return null;
      }
    } catch (err) {
      setError('An error occurred while getting the device ID');
      console.error('An error occurred while getting the device ID', err);
      return null;
    }
  };

  const handleSearch = async () => {
    try {
      if (!accessToken) {
        throw new Error('Access token not found');
      }

      await refreshAccessTokenIfNeeded(accessToken);

      const response = await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.tracks.items);
    } catch (err) {
      setError('An error occurred while searching');
      console.error('An error occurred while searching', err);
    }
  };

  const handlePlayback = async (action: string, uri: string | null = null) => {
    try {
      if (!accessToken) {
        throw new Error('Access token not found');
      }

      await refreshAccessTokenIfNeeded(accessToken);

      const activeDevice = await getDeviceId();
      if (!activeDevice) {
        throw new Error('No active device found');
      }

      let url = '';
      let method = '';
      let body = {};

      switch (action) {
        case 'play':
          if (uri) {
            body = {
              context_uri: uri,
              offset: { position: 4 }, // Adjust position as needed (zero-indexed)
              position_ms: 120000 // Adjust milliseconds as needed
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
      console.log('Request Body:', body);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spotify Testing Page</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter access token..."
        value={accessToken}
        onChangeText={handleTokenChange}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter refresh token..."
        value={refreshToken}
        onChangeText={handleRefreshTokenChange}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter search query..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title="Search" onPress={handleSearch} />
      <Button title="Test Refresh Token" onPress={getRefreshToken} />
      <ScrollView style={styles.resultsContainer}>
        {searchResults.map((track, index) => (
          <SongCard key={index} track={track} onPlay={() => handlePlayback('play', track.uri)} />
        ))}
      </ScrollView>
      {selectedTrackUri && (
        <View style={styles.webViewContainer}>
          <WebView
            source={{ uri: `https://open.spotify.com/embed/track/${encodeURIComponent(selectedTrackUri)}` }}
            style={{ width: '100%', height: 300 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
          />
        </View>
      )}

      <View style={styles.controls}>
        <Button title="Pause" onPress={() => handlePlayback('pause')} />
        <Button title="Next" onPress={() => handlePlayback('next')} />
        <Button title="Previous" onPress={() => handlePlayback('previous')} />
      </View>
      {error && <Text style={styles.error}>Error: {error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  resultsContainer: {
    flex: 1,
    marginTop: 10,
  },
  webViewContainer: {
    marginTop: 20,
    marginBottom: 20,
    height: 300,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default SpotifyTestingPage;
