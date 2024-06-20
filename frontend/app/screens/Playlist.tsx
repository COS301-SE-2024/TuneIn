import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SongList from '../components/SongList'; // Import the SongList component

const Playlist = () => {
  const router = useRouter();

  // Sample data for songs
  const [songs, setSongs] = useState([
    {
      songName: 'Eternal Sunshine',
      artist: 'Ariana Grande',
      albumCoverUrl: 'https://t2.genius.com/unsafe/300x300/https%3A%2F%2Fimages.genius.com%2F08e2633706582e13bc20f44637441996.1000x1000x1.png',
      voteCount: 0,
      showVoting: true, // Show voting for this song
    },
    {
      songName: 'bye',
      artist: 'Ariana Grande',
      albumCoverUrl: 'https://t2.genius.com/unsafe/300x300/https%3A%2F%2Fimages.genius.com%2F08e2633706582e13bc20f44637441996.1000x1000x1.png',
      voteCount: 0,
      showVoting: true, // Do not show voting for this song
    },
    {
      songName: 'supernatural',
      artist: 'Ariana Grande',
      albumCoverUrl: 'https://t2.genius.com/unsafe/300x300/https%3A%2F%2Fimages.genius.com%2F08e2633706582e13bc20f44637441996.1000x1000x1.png',
      voteCount: 0,
      showVoting: false,
    },
    {
      songName: 'yes, and?',
      artist: 'Ariana Grande',
      albumCoverUrl: 'https://t2.genius.com/unsafe/300x300/https%3A%2F%2Fimages.genius.com%2F08e2633706582e13bc20f44637441996.1000x1000x1.png',
      voteCount: 0,
      showVoting: false,
    },
    {
      songName: 'true story',
      artist: 'Ariana Grande',
      albumCoverUrl: 'https://t2.genius.com/unsafe/300x300/https%3A%2F%2Fimages.genius.com%2F08e2633706582e13bc20f44637441996.1000x1000x1.png',
      voteCount: 0,
      showVoting: false,
    },
    // Add more songs here
  ]);

  // Function to swap songs based on vote count
  const swapSongs = (index, direction) => {
    const newSongs = [...songs];
    const currentSong = newSongs[index];
    let swapIndex = index;

    if (direction === 'up') {
      while (swapIndex > 0 && currentSong.voteCount > newSongs[swapIndex - 1].voteCount) {
        swapIndex--;
      }
    } else if (direction === 'down') {
      while (swapIndex < newSongs.length - 1 && currentSong.voteCount < newSongs[swapIndex + 1].voteCount) {
        swapIndex++;
      }
    }

    if (swapIndex !== index) {
      newSongs.splice(index, 1);
      newSongs.splice(swapIndex, 0, currentSong);
      setSongs(newSongs);
    }
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
        {songs.map((song, index) => (
          <SongList
            key={index}
            songNumber={index + 1} // Pass the song number
            songName={song.songName}
            artist={song.artist}
            albumCoverUrl={song.albumCoverUrl}
            voteCount={song.voteCount} // Pass vote count to SongList
            showVoting={song.showVoting}
            index={index} // Pass index for swapping
            swapSongs={swapSongs} // Pass swapSongs function
          />
        ))}
      </View>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Add Song</Text>
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
  saveButton: {
    backgroundColor: '#08BDBD',
    borderRadius: 24,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    width :'95%',
    marginBottom: 15,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Playlist;
