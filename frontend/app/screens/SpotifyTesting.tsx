// SpotifyTestingPage.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import SongCard from '../components/Spotify/SongCard';

const SpotifyTestingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        setAccessToken(token);
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
      if (!accessToken) {
        throw new Error('Access token not found');
      }

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spotify Testing Page</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter search query..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title="Search" onPress={handleSearch} />
      <ScrollView style={styles.resultsContainer}>
        {searchResults.map((track, index) => (
          <SongCard key={index} track={track} />
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
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default SpotifyTestingPage;
