import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform, Animated, Easing, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons'; // Import FontAwesome5 for Spotify-like icons
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SongRoomWidget from '../components/SongRoomWidget';
import CommentWidget from '../components/CommentWidget';

type Message = {
  username: string;
  message: string;
  profilePictureUrl: string;
  me?: boolean;
};

const ChatRoomScreen: React.FC = () => {
  const router = useRouter();
  const [isChatExpanded, setChatExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { username: 'JohnDoe', message: 'This is a sample comment.', profilePictureUrl: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg' },
    { username: 'JaneSmith', message: 'Another sample comment here.', profilePictureUrl: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg' },
    { username: 'Me', message: 'This is my own message.', profilePictureUrl: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg', me: true },
  ]);
  const [isPlaying, setIsPlaying] = useState(false); // State to toggle play/pause
  const [isRoomCreator, setIsRoomCreator] = useState(true); // Replace with actual logic to determine if the user is the creator

  // Get screen height to calculate the expanded height
  const screenHeight = Dimensions.get('window').height;
  const collapsedHeight = 60;
  const expandedHeight = screenHeight - 80; // Adjust as needed for your layout
  const animatedHeight = useRef(new Animated.Value(collapsedHeight)).current;

  const navigateToAdvancedSettings = () => {
    router.navigate("/screens/AdvancedSettings");
  };

  const navigateToPlaylist = () => {
    router.navigate("/screens/Playlist");
  };

  const navigateToLyrics = () => {
    router.navigate("/screens/Lyrics");
  };

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { username: 'Me', message, profilePictureUrl: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg', me: true }]);
      setMessage(''); // Clear input after sending message
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
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

  const navigateToRoomInfo = () => {
    router.navigate("/screens/RoomInfo");
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>×</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={isRoomCreator ? navigateToAdvancedSettings : navigateToRoomInfo}>
          <FontAwesome5 name="ellipsis-h" size={15} color="black" />
        </TouchableOpacity>
      </View>
      {!isChatExpanded && (
        <View style={{ paddingHorizontal: 10, paddingBottom: 40, flex: 1 }}>
          <SongRoomWidget
            songName="Eternal Sunshine"
            artist="Ariana Grande"
            albumCoverUrl="https://t2.genius.com/unsafe/300x300/https%3A%2F%2Fimages.genius.com%2F08e2633706582e13bc20f44637441996.1000x1000x1.png"
            progress={0.5}
            time1="1:30"
            time2="3:00"
          />
          {isRoomCreator && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, paddingHorizontal: 50 }}>
              <TouchableOpacity>
                <FontAwesome5 name="step-backward" size={30} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={togglePlayPause}>
                <FontAwesome5 name={isPlaying ? "pause" : "play"} size={30} color="black" />
              </TouchableOpacity>
              <TouchableOpacity>
                <FontAwesome5 name="step-forward" size={30} color="black" />
              </TouchableOpacity>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 70, paddingHorizontal: 50 }}>
            <TouchableOpacity onPress={navigateToPlaylist} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="playlist-play" size={37} color="black" />
              <Text style={{ marginLeft: 5, fontSize: 19 }}>Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={navigateToLyrics} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="music-clef-treble" size={33} color="black" />
              <Text style={{ marginLeft: 5, fontSize: 19 }}>Lyrics</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <Animated.View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: animatedHeight, backgroundColor: '#E8EBF2', borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 5, paddingHorizontal: 20, paddingTop: 10 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 10 }}
          onPress={toggleChat}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Chat Messages</Text>
          <FontAwesome5 name={isChatExpanded ? "chevron-down" : "chevron-up"} size={16} style={{ marginLeft: 5 }} />
        </TouchableOpacity>
        {isChatExpanded && (
          <>
            <View style={{ flex: 1 }}>
              <ScrollView style={{ marginTop: 10, flex: 1 }}>
                <View style={{ marginBottom: 10 }}>
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#D1D5DB', paddingBottom: 10 }}></View>
                  <View style={{ marginTop: 10 }}>
                    {messages.map((msg, index) => (
                      <CommentWidget
                        key={index}
                        username={msg.username}
                        message={msg.message}
                        profilePictureUrl={msg.profilePictureUrl}
                        me={msg.me}
                      />
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inputContainer}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg' }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
              <TextInput
                placeholder="Message..."
                style={styles.input}
                value={message}
                onChangeText={setMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Image source={{ uri: 'https://img.icons8.com/material-outlined/24/000000/filled-sent.png' }} style={styles.sendIcon} />
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    backgroundColor: '#E8EBF2',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginRight: 10,
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  sendButton: {
    padding: 10,
  },
  sendIcon: {
    width: 24,
    height: 24,
  },
});

export default ChatRoomScreen;
