import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router'; // Assuming useLocalSearchParams and useNavigation are available
import { Room } from '../models/Room';
import { useSpotifyPlayback } from '../hooks/useSpotifyPlayback';
import { FontAwesome5 } from '@expo/vector-icons'; // Import FontAwesome5 icons from expo

const RoomPage = () => {
  const { room } = useLocalSearchParams();
  const roomData = JSON.parse(room);
  const navigation = useNavigation();
  const { handlePlayback } = useSpotifyPlayback(); // Initialize Spotify playback hook

  const [playlist, setPlaylist] = useState<any[]>([]); // Update type as per your actual playlist item type
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0); // Index of currently playing track
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // Playback state
  const [duration, setDuration] = useState<number>(0); // Duration of the currently playing track
  const [position, setPosition] = useState<number>(0); // Current position within the track
  const [isPlaylistExpanded, setIsPlaylistExpanded] = useState<boolean>(true); // State to track playlist expansion

  const trackPositionIntervalRef = useRef<NodeJS.Timeout | null>(null); // Reference to track position interval
  const playlistHeight = useRef(new Animated.Value(0)).current; // Animated value for playlist height

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(`http://192.168.56.1:4000/room/${roomData.id}/playlist`);
        const data = await response.json();
        setPlaylist(data.playlist);
      } catch (error) {
        console.error('Error fetching playlist:', error);
      }
    };

    fetchPlaylist();
  }, [roomData.id]);

  useEffect(() => {
    



    return () => {
      if (trackPositionIntervalRef.current) {
        clearInterval(trackPositionIntervalRef.current);
      }
    };
  }, [isPlaying, handlePlayback]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const playPauseTrack = (track, index) => {
    if (!track) {
      console.error('Invalid track:', track);
      return;
    }

    if (index === currentTrackIndex && isPlaying) {
      handlePlayback('pause');
      setIsPlaying(false);
    } else {
      handlePlayback('play', track.uri).then(() => {
        setCurrentTrackIndex(index);
        setIsPlaying(true);
      });
      
    }
  };

  const playNextTrack = () => {
    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < playlist.length) {
      const nextTrack = playlist[nextIndex];
      playPauseTrack(nextTrack, nextIndex);
    }
  };

  const playPreviousTrack = () => {
    const previousIndex = currentTrackIndex - 1;
    if (previousIndex >= 0) {
      const previousTrack = playlist[previousIndex];
      playPauseTrack(previousTrack, previousIndex);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const togglePlaylist = () => {
    Animated.timing(playlistHeight, {
      toValue: isPlaylistExpanded ? 0 : 200, // Adjust the height value as needed
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsPlaylistExpanded((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Image source={{ uri: roomData.backgroundImage }} style={styles.backgroundImage} />
      <Text style={styles.roomName}>{roomData.name}</Text>
      
      <View style={styles.trackDetails}>
        <Image source={{ uri: playlist[currentTrackIndex]?.albumArtUrl }} style={styles.albumArt} />
        <View style={styles.trackInfo}>
          <Text style={styles.trackName}>{playlist[currentTrackIndex]?.name}</Text>
          <Text style={styles.trackArtist}>{playlist[currentTrackIndex]?.artistNames}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={playPreviousTrack}>
          <FontAwesome5 name="step-backward" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => playPauseTrack(playlist[currentTrackIndex], currentTrackIndex)}>
          <FontAwesome5 name={isPlaying ? "pause" : "play"} size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={playNextTrack}>
          <FontAwesome5 name="step-forward" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.playlistToggle} onPress={togglePlaylist}>
        <Text style={styles.playlistToggleText}>{isPlaylistExpanded ? 'Hide Playlist' : 'Show Playlist'}</Text>
      </TouchableOpacity>

      <Animated.ScrollView
        style={[styles.playlistContainer, { maxHeight: playlistHeight }]}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {playlist.map((track, index) => (
          <TouchableOpacity
            key={track.id}
            style={[
              styles.track,
              index === currentTrackIndex && { backgroundColor: '#f0f0f0' }, // Highlight current track
            ]}
            onPress={() => playPauseTrack(track, index)}
          >
            <Image source={{ uri: track.albumArtUrl }} style={styles.albumArt} />
            <View style={styles.trackInfo}>
              <Text style={styles.trackName}>{track.name}</Text>
              <Text style={styles.trackArtist}>{track.artistNames}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#1d4ed8',
    fontSize: 18,
  },
  backgroundImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    backgroundColor: 'transparent', // Transparent background
    padding: 12,
    marginHorizontal: 8,
  },
  trackDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  trackTime: {
    fontSize: 12,
    color: '#666',
  },
  playlistContainer: {
    maxHeight: 200, // Initial height for collapsed state
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
  },
  playlistToggle: {
    alignItems: 'center',
    marginVertical: 8,
  },
  playlistToggleText: {
    color: '#1d4ed8',
    fontSize: 16,
  },
});

export default RoomPage;
