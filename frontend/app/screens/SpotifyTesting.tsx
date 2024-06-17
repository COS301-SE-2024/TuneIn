import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VITE_SPOTIFY_CLIENT_ID, VITE_REDIRECT_TARGET } from '@env';

const clientId = VITE_SPOTIFY_CLIENT_ID;
const redirectTarget = VITE_REDIRECT_TARGET;

const SpotifyTestingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [savedToken, setSavedToken] = useState('');

  const scopes = [
    "user-read-email",
    "user-library-read",
    "user-read-recently-played",
    "user-top-read",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public" // or "playlist-modify-private"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        setAccessToken(token);
        setSavedToken(token);
        const sdk = SpotifyApi.withUserAuthorization(clientId, redirectTarget, scopes);
        const response = await sdk.search('The Beatles', ['artist']);
        setSearchResults(response.artists.items);
      } else {
        setError('Access token not found');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error('An error occurred while fetching data', err);
    }
  };

  const handleSearch = async () => {
    try {
      const token = accessToken || (await AsyncStorage.getItem('accessToken'));
      if (token) {
        const sdk = SpotifyApi.withUserAuthorization(clientId, redirectTarget, scopes);
        const response = await sdk.search(searchQuery, ['track']);
        setSearchResults(response.tracks.items);
      } else {
        setError('Access token not found');
      }
    } catch (err) {
      setError('An error occurred while searching');
      console.error('An error occurred while searching', err);
    }
  };

  const handleSaveToken = async () => {
    try {
      await AsyncStorage.setItem('accessToken', accessToken);
      setSavedToken(accessToken);
      Alert.alert('Success', 'Token saved successfully!');
    } catch (err) {
      console.error('Error saving token:', err);
      Alert.alert('Error', 'Failed to save token.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spotify Testing Page</Text>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenTitle}>Access Token:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter token..."
          value={accessToken}
          onChangeText={setAccessToken}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveToken}>
          <Text style={styles.buttonText}>Save Token</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenTitle}>Saved Token:</Text>
        <Text style={styles.token}>{savedToken}</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter search query..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
      <ScrollView style={styles.resultsContainer}>
        {searchResults.map((item, index) => (
          <View key={index} style={styles.resultItem}>
            <Text>{item.name}</Text>
          </View>
        ))}
      </ScrollView>
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
  tokenContainer: {
    marginBottom: 20,
  },
  tokenTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  token: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#1DB954',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1DB954',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  resultsContainer: {
    flex: 1,
    marginTop: 10,
    marginBottom: 20,
  },
  resultItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default SpotifyTestingPage;
