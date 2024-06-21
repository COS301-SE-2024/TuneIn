import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SongComponent from '../components/SongComponent'; // Make sure this path is correct

const AddSongPage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [songs, setSongs] = useState([
    {
      id: '1',
      name: 'Eternal Sunshine',
      artist: 'Ariana Grande',
      albumCoverUrl: 'https://t2.genius.com/unsafe/300x300/https%3A%2F%2Fimages.genius.com%2F08e2633706582e13bc20f44637441996.1000x1000x1.png',
    },
    {
      id: '2',
      name: 'bye',
      artist: 'Ariana Grande',
      albumCoverUrl: 'https://t2.genius.com/unsafe/300x300/https%3A%2F%2Fimages.genius.com%2F08e2633706582e13bc20f44637441996.1000x1000x1.png',
    },
    {
      id: '3',
      name: 'supernatural',
      artist: 'Ariana Grande',
      albumCoverUrl: 'https://t2.genius.com/unsafe/300x300/https%3A%2F%2Fimages.genius.com%2F08e2633706582e13bc20f44637441996.1000x1000x1.png',
    },
    
    // Add more songs here
  ]);

  const removeSong = (id: string) => {
    setSongs(songs.filter(song => song.id !== id));
  };

  const navigateToPlaylist = () => {
    router.navigate("/screens/Playlist");
  };

  const addSong = () => {
    // Add functionality to add a new song
    // For demonstration, a new song is added to the list with a hardcoded value
    const newSong = {
      id: `${songs.length + 1}`,
      name: `New Song ${songs.length + 1}`,
      artist: 'New Artist',
      albumCoverUrl: 'https://via.placeholder.com/300',
    };
    setSongs([...songs, newSong]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.pageName}>Add Song</Text>
      </View>
      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <FlatList
        data={songs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SongComponent song={item} onRemove={removeSong} />
        )}
      />
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={navigateToPlaylist}>
          <Text style={styles.saveButtonText}>Add To Playlist ({songs.length})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
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
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 8,
    height: 40,
    width: '100%',
  },
  input: {
    flex: 1,
    marginLeft: 8,
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
    width: '95%',
    marginBottom: 15,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default AddSongPage;
