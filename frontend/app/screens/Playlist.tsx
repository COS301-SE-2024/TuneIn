import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SongList from '../components/SongList'; // Import the SongList component

interface Track {
  id: string;
  name: string;
  artistNames: string;
  albumArtUrl: string;
  voteCount: number;
  showVoting: boolean;
}

const Playlist = () => {
  const router = useRouter();
  const { queue, currentTrackIndex,Room_id,mine } = useLocalSearchParams();
  console.log("playlist owner: ", mine);
  // Ensure queue is correctly typed as an array of Track objects
  const [playlist, setPlaylist] = useState<Track[]>([]);

  useEffect(() => {
    if (typeof queue === 'string') {
      // Assuming queue is a JSON string, parse it into an array of Track objects
      const parsedQueue = JSON.parse(queue) as Track[];
      setPlaylist(parsedQueue);
    } else if (Array.isArray(queue)) {
      // If queue is already an array (for testing purposes or other scenarios)
      setPlaylist(queue);
    }
  }, [queue]);

  useEffect(() => {
    console.log('Current Track Index:', currentTrackIndex);
  }, [currentTrackIndex]);

  const navigateToAddSong = () => {

    router.navigate({
      pathname: "/screens/rooms/EditPlaylist",
      params: { queue: queue,
        currentTrackIndex: currentTrackIndex,
        Room_id: Room_id,
       },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.pageName}>Playlist</Text>
      </View>
      <View style={styles.songListContainer}>
        {playlist.map((track, index) => (
          <SongList
            key={index}
            songNumber={index + 1} // Assuming index starts from 1
            songName={track.name}
            artist={track.artistNames}
            albumCoverUrl={track.albumArtUrl}
            voteCount={track.voteCount}
            showVoting={track.showVoting}
            index={index} // Pass index for swapping (if needed)
            highlighted={index == currentTrackIndex} // Highlight the currently playing song
          />
        ))}
      </View>
      {mine ? (
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={navigateToAddSong}>
          <Text style={styles.addButtonText}>Add Song</Text>
        </TouchableOpacity>
      </View>
      ) : (
				<View></View>
			)}
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
