import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native'; // Replace Dimensions with ScrollView
import { useRouter } from 'expo-router'; 
import SongRoomWidget from '../components/SongRoomWidget';
import CommentWidget from '../components/CommentWidget';

const ChatRoomScreen: React.FC = () => {
  const router = useRouter();
  const [isChatExpanded, setChatExpanded] = useState(false);
  const [message, setMessage] = useState('');

  const navigateToRoomDetails = () => {
    router.navigate("/screens/RoomDetails");
  };

  const sendMessage = () => {
    // Logic to send message
    setMessage(''); // Clear input after sending message
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>×</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Chat Room</Text>
        <TouchableOpacity onPress={navigateToRoomDetails}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={{ paddingHorizontal: 10, paddingBottom: 40, flex: 1 }}>
        <SongRoomWidget
          songName="Your Song Name"
          artist="Your Artist"
          progress={0.5}
          time1="1:30"
          time2="3:00"
        />
        <TouchableOpacity
          style={{ backgroundColor: '#8B8FA8', borderRadius: 30, height: 50, alignItems: 'center', justifyContent: 'center', elevation: 5, marginTop: 10 }}
          onPress={() => setChatExpanded(!isChatExpanded)}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Toggle Chat</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          {isChatExpanded && (
            <ScrollView style={{ marginTop: 10, flex: 1 }}>
              <View style={{ marginBottom: 10 }}>
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#D1D5DB', paddingBottom: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Chat Messages</Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <CommentWidget
                    username="JohnDoe"
                    message="This is a sample comment."
                    profilePictureUrl="https://example.com/profile_picture.jpg"
                  />
                  <CommentWidget
                    username="JaneSmith"
                    message="Another sample comment here."
                    profilePictureUrl="https://example.com/profile_picture.jpg"
                  />
                  {/* <CommentWidget
                    username="AliceWonder"
                    message="Yet another comment for demonstration."
                    profilePictureUrl="https://example.com/profile_picture.jpg"
                  /> */}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 0 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#8B8FA8', marginRight: 10 }}>
            <Image
              source={{ uri: 'https://example.com/profile_picture.jpg' }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          </View>
          <TextInput
            style={{ flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, padding: 10 }}
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity onPress={sendMessage} style={{ marginLeft: 10, padding: 10, backgroundColor: '#8B8FA8', borderRadius: 20 }}>
            <Text style={{ color: 'white' }}>Send</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default ChatRoomScreen;
