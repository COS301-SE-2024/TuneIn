import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SongList from '../components/SongList'; // Import the SongList component

interface Track {
  id: string;
  songName: string;
  artist: string;
  albumCoverUrl: string;
  voteCount: number;
  showVoting: boolean;
}

const Playlist = () => {
  const router = useRouter();
  const { queue, currentTrackIndex } = useLocalSearchParams();

  // Initialize songs state with an empty array
  const [songs, setSongs] = useState<Track[]>([]);

  useEffect(() => {
    // Ensure queue is properly initialized
    if (queue && queue.length > 0) {
      // Set songs state with the queue received from useLocalSearchParams
      setSongs(queue);
    } else {
      // Handle case when queue is empty or undefined (optional)
      console.warn('Queue is empty or undefined.');
    }
  }, [queue]); // Update songs state when queue changes

  const navigateToAddSong = () => {
    router.push('screens/AddSongPage');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.pageName}>Songs</Text>
      </View>
      <View style={styles.songListContainer}>
        {/* Check if songs is defined before mapping */}
        {songs && songs.map((song, index) => (
          <SongList
            key={index}
            songNumber={index + 1} // Pass the song number
            songName={song.songName}
            artist={song.artist}
            albumCoverUrl={song.albumCoverUrl}
            voteCount={song.voteCount} // Pass vote count to SongList
            showVoting={song.showVoting}
            index={index} // Pass index for swapping
            highlighted={index === currentTrackIndex} // Highlight the current playing song
          />
        ))}
      </View>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={navigateToAddSong}>
          <Text style={styles.addButtonText}>Add Song</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  pageName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  songListContainer: {
    flex: 1,
    marginTop: 16,
  },
  addButtonContainer: {
    alignItems: 'center',
    padding: 16,
  },
  addButton: {
    backgroundColor: '#08BDBD',
    borderRadius: 24,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    width: '95%',
    marginBottom: 15,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Playlist;
