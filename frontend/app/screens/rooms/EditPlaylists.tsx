import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, ScrollView, StyleSheet, Alert, Text, Image } from 'react-native';
import SongCard from '../../components/Spotify/SongCard';
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth';
import { useSpotifySearch } from '../../hooks/useSpotifySearch';
import { useLocalSearchParams } from 'expo-router'; // Assuming useLocalSearchParams is correctly implemented

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  explicit: boolean;
  preview_url: string; // URL for previewing the song
  uri: string; // URI used to play the song
}

interface SimplifiedTrack {
  id: string;
  name: string;
  artistNames: string;
  albumArtUrl: string;
  explicit: boolean;
  preview_url: string;
  uri: string;
}

const EditPlaylist: React.FC = () => {
  const { roomId, playlists: initialPlaylist } = useLocalSearchParams(); // Assuming useLocalSearchParams returns roomId and playlists
  const { accessToken } = useSpotifyAuth();
  const { searchResults, handleSearch } = useSpotifySearch(accessToken);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playlist, setPlaylist] = useState<SimplifiedTrack[]>([]);

  const addToPlaylist = (track: Track) => {
    const simplifiedTrack: SimplifiedTrack = {
      id: track.id,
      name: track.name,
      artistNames: track.artists.map(artist => artist.name).join(', '),
      albumArtUrl: track.album.images[0].url,
      explicit: track.explicit,
      preview_url: track.preview_url,
      uri: track.uri,
    };
    setPlaylist(prevPlaylist => [...prevPlaylist, simplifiedTrack]);
  };

  const removeFromPlaylist = (trackId: string) => {
    setPlaylist(prevPlaylist => prevPlaylist.filter(track => track.id !== trackId));
  };

  const savePlaylist = () => {
    console.log('Playlist saved:', playlist);
    Alert.alert('Playlist Saved', 'Playlist saved successfully.');
    // Add any logic to save the playlist to the backend if necessary
  };

  const playPreview = (previewUrl: string) => {
    const audio = new Audio(previewUrl);
    audio.play();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for songs..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title="Search" onPress={() => handleSearch(searchQuery)} />

      {/* Selected Playlist Section */}
      <ScrollView style={styles.selectedContainer}>
        <Text style={styles.selectedTitle}>Selected Tracks</Text>
        {playlist.map(track => (
          <View key={track.id} style={styles.selectedItem}>
            <Image source={{ uri: track.albumArtUrl }} style={styles.albumArt} />
            <View style={styles.trackInfo}>
              <Text style={styles.trackName}>{track.name}</Text>
              <Text style={styles.artistName}>{track.artistNames}</Text>
              {track.explicit && <Text style={styles.explicitTag}>Explicit</Text>}
            </View>
            <Button title="Remove" onPress={() => removeFromPlaylist(track.id)} />
          </View>
        ))}
      </ScrollView>

      {/* Search Results Section */}
      <ScrollView style={styles.resultsContainer}>
        {searchResults.map(track => (
          <SongCard
            key={track.id}
            track={track}
            onPlay={() => playPreview(track.preview_url)}
            onAdd={() => addToPlaylist(track)}
            onRemove={() => removeFromPlaylist(track.id)}
            isAdded={playlist.some(selectedTrack => selectedTrack.id === track.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <Button title="Save Playlist" onPress={savePlaylist} disabled={playlist.length === 0} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  selectedContainer: {
    maxHeight: 200,
    marginBottom: 10,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 5,
  },
  albumArt: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistName: {
    fontSize: 14,
    color: '#666',
  },
  explicitTag: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
  },
  resultsContainer: {
    flex: 1,
    marginTop: 10,
  },
  saveButtonContainer: {
    marginTop: 20,
  },
});

export default EditPlaylist;
