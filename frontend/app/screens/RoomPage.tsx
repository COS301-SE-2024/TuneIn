import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Animated, TextInput, KeyboardAvoidingView, Platform, Dimensions, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Room } from '../models/Room';
import { useSpotifyPlayback } from '../hooks/useSpotifyPlayback';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import CommentWidget from '../components/CommentWidget';
import { LinearGradient } from 'expo-linear-gradient';

const getQueue = () => {
  return [
    {
      albumArtUrl: "https://i.scdn.co/image/ab67616d0000b2731ea0c62b2339cbf493a999ad",
      artistNames: "Kendrick Lamar",
      explicit: true,
      id: "6AI3ezQ4o3HUoP6Dhudph3",
      name: "Not Like Us",
      preview_url: null,
      uri: "spotify:track:6AI3ezQ4o3HUoP6Dhudph3"
    },
    {
      albumArtUrl: "https://i.scdn.co/image/ab67616d0000b2736a6387ab37f64034cdc7b367",
      artistNames: "Outkast",
      explicit: false,
      id: "2PpruBYCo4H7WOBJ7Q2EwM",
      name: "Hey Ya!",
      preview_url: "https://p.scdn.co/mp3-preview/d24b3c4135ced9157b0ea3015a6bcc048e0c2e3a?cid=4902747b9d7c4f4195b991f29f8a680a",
      uri: "spotify:track:2PpruBYCo4H7WOBJ7Q2EwM"
    }
  ];
};

// Example usage:
const queue = getQueue();
console.log(queue);

const RoomPage = () => {
  const { room } = useLocalSearchParams();
  const roomData = JSON.parse(room);
  const router = useRouter();
  const { handlePlayback } = useSpotifyPlayback();

  const [queue, setQueue] = useState<any[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);
  const [isQueueExpanded, setIsQueueExpanded] = useState<boolean>(false);
  const [isChatExpanded, setChatExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { username: 'JohnDoe', message: 'This is a sample comment.', profilePictureUrl: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg' },
    { username: 'JaneSmith', message: 'Another sample comment here.', profilePictureUrl: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg' },
    { username: 'Me', message: 'This is my own message.', profilePictureUrl: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg', me: true },
  ]);

  const trackPositionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const queueHeight = useRef(new Animated.Value(0)).current;
  const collapsedHeight = 60;
  const screenHeight = Dimensions.get('window').height;
  const expandedHeight = screenHeight - 80;
  const animatedHeight = useRef(new Animated.Value(collapsedHeight)).current;

  useEffect(() => {
    const fetchQueue = async () => {
      console.log('Fetching queue');
      const data = getQueue();
      setQueue(data);
    };

    fetchQueue();
  }, [roomData.id]);

  useEffect(() => {
    return () => {
      if (trackPositionIntervalRef.current) {
        clearInterval(trackPositionIntervalRef.current);
      }
    };
  }, [isPlaying, handlePlayback]);

  const handleGoBack = () => {
    // router.goBack();
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
    if (nextIndex < queue.length) {
      const nextTrack = queue[nextIndex];
      playPauseTrack(nextTrack, nextIndex);
    }
  };

  const playPreviousTrack = () => {
    const previousIndex = currentTrackIndex - 1;
    if (previousIndex >= 0) {
      const previousTrack = queue[previousIndex];
      playPauseTrack(previousTrack, previousIndex);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const toggleQueue = () => {
    Animated.timing(queueHeight, {
      toValue: isQueueExpanded ? 0 : 200,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsQueueExpanded((prev) => !prev);
  };

  const toggleChat = () => {
    Animated.timing(animatedHeight, {
      toValue: isChatExpanded ? collapsedHeight : expandedHeight,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
    setChatExpanded(!isChatExpanded);
  };

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { username: 'Me', message, profilePictureUrl: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg', me: true }]);
      setMessage('');
    }
  };

  const navigateToPlaylist = () => {
    console.log("Queue: ",queue);
    console.log("currentTrackIndex: ",currentTrackIndex);
    router.navigate({
      pathname: "/screens/Playlist",
      params: { queue: queue,
        currentTrackIndex: currentTrackIndex
       },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {/* Background Image with overlay */}
      <Image source={{ uri: roomData.backgroundImage }} style={styles.backgroundImage} />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(255,255,255,1)']}
        style={styles.gradientOverlay}
      />
      <View style={styles.contentContainer}>
        {/* Room Details */}
        <View style={styles.roomDetails}>
          <Text style={styles.roomName}>{roomData.name}</Text>
          <Text style={styles.description}>{roomData.description}</Text>
          <View style={styles.tagsContainer}>
            {roomData.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>{tag}</Text>
            ))}
          </View>
        </View>
        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Image source={{ uri: roomData.userProfile }} style={styles.userImage} />
          <Text style={styles.username}>{roomData.username}</Text>
        </View>
      </View>

      <View style={styles.trackDetails}>
        <Image source={{ uri: queue[currentTrackIndex]?.albumArtUrl }} style={styles.nowPlayingAlbumArt} />
        <View style={styles.trackInfo}>
          <Text style={styles.nowPlayingTrackName}>{queue[currentTrackIndex]?.name}</Text>
          <Text style={styles.nowPlayingTrackArtist}>{queue[currentTrackIndex]?.artistNames}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={playPreviousTrack}>
          <FontAwesome5 name="step-backward" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => playPauseTrack(queue[currentTrackIndex], currentTrackIndex)}>
          <FontAwesome5 name={isPlaying ? "pause" : "play"} size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={playNextTrack}>
          <FontAwesome5 name="step-forward" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.queueButton} onPress={navigateToPlaylist}>
        <Text style={styles.queueButtonText}>Queue</Text>
      </TouchableOpacity>

      <Animated.ScrollView
        style={[styles.queueContainer, { maxHeight: queueHeight }]}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {queue.map((track, index) => (
          <TouchableOpacity
            key={track.id}
            style={[
              styles.track,
              index === currentTrackIndex ? styles.currentTrack : styles.queueTrack,
            ]}
            onPress={() => playPauseTrack(track, index)}
          >
            <Image source={{ uri: track.albumArtUrl }} style={styles.queueAlbumArt} />
            <View style={styles.trackInfo}>
              <Text style={styles.queueTrackName}>{track.name}</Text>
              <Text style={styles.queueTrackArtist}>{track.artistNames}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      <Animated.View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: animatedHeight, backgroundColor: '#E8EBF2', borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 5, paddingHorizontal: 10, paddingTop: 10 }}>
        <TouchableOpacity onPress={toggleChat} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{isChatExpanded ? 'Hide Chat' : 'Show Chat'}</Text>
          <MaterialIcons name={isChatExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={20} style={{ marginLeft: 10 }} />
        </TouchableOpacity>
        {isChatExpanded && (
          <>
            <ScrollView style={{ flex: 1, marginTop: 10 }}>
              {messages.map((msg, index) => (
                <CommentWidget key={index} username={msg.username} message={msg.message} profilePictureUrl={msg.profilePictureUrl} me={msg.me} />
              ))}
            </ScrollView>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <TextInput
                  style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}
                  placeholder="Type your message..."
                  value={message}
                  onChangeText={setMessage}
                  onSubmitEditing={sendMessage}
                />
                <TouchableOpacity onPress={sendMessage} style={{ marginLeft: 10 }}>
                  <MaterialIcons name="send" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backgroundImage: {
    width: '100%',
    height: '35%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '35%',
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 10,
  },
  userImage: {
    width: 36,
    height: 36,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'blue',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  roomDetails: {
    alignItems: 'center',
    marginTop: 60,
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  tag: {
    fontSize: 14,
    color: 'white',
    backgroundColor: 'gray',
    borderRadius: 10,
    padding: 5,
    marginHorizontal: 5,
  },
  trackDetails: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  nowPlayingAlbumArt: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  nowPlayingTrackName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  nowPlayingTrackArtist: {
    fontSize: 18,
    color: 'gray',
  },
  queueAlbumArt: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  trackInfo: {
    marginLeft: 20,
  },
  queueTrackName: {
    fontSize: 16,
  },
  queueTrackArtist: {
    fontSize: 14,
    color: 'gray',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  controlButton: {
    marginHorizontal: 20,
  },
  queueButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  queueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  queueContainer: {
    paddingHorizontal: 20,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  currentTrack: {
    backgroundColor: '#f0f0f0',
  },
  queueTrack: {
    backgroundColor: 'white',
  },
});

export default RoomPage;
