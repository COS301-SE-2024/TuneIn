import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const messages = [
  { id: '1', text: 'Hey there!', sender: 'John Doe', me: false },
  { id: '2', text: 'Hi! How are you?', sender: 'Me', me: true },
  // Add more dummy messages
];

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const { name } = useLocalSearchParams(); // Remove avatar from useLocalSearchParams
  const router = useRouter();

  const avatarUrl = 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg'; // Direct URL for avatar

  const handleSend = () => {
    if (message.trim()) {
      messages.push({ id: String(messages.length + 1), text: message, sender: 'Me', me: true });
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} /> 
        <Text style={styles.headerTitle}>{name}</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.me ? styles.messageContainerMe : styles.messageContainerOther
          ]}>
            {!item.me && (
              <Image source={{ uri: avatarUrl }} style={styles.messageAvatar} /> 
            )}
            <View style={[
              styles.messageBubble,
              item.me ? styles.messageBubbleMe : styles.messageBubbleOther
            ]}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Message..."
          style={styles.input}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Image source={{ uri: 'https://img.icons8.com/material-outlined/24/000000/filled-sent.png' }} style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  messagesContainer: {
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  messageContainerMe: {
    justifyContent: 'flex-end',
  },
  messageContainerOther: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    maxWidth: '75%',
  },
  messageBubbleMe: {
    backgroundColor: '#08bdbd', // Updated to verdigris color
    alignSelf: 'flex-end',
  },
  messageBubbleOther: {
    backgroundColor: '#ECECEC',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginRight: 20,
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 10,
  },
  sendButton: {
    padding: 10,
  },
  sendIcon: {
    width: 24,
    height: 24,
  },
});

export default ChatScreen;
