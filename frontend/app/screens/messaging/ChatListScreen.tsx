import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatItem from '../../components/ChatItem';
import { Chat } from '../../models/chat';
import { useRouter } from 'expo-router';


const chats: Chat[] = [
  { id: '1', name: 'John Doe', lastMessage: 'Hey there!', avatar: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
  { id: '2', name: 'Jane Smith', lastMessage: 'What\'s up?', avatar: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
  // Add more dummy chats
];

const ChatListScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.chatHeader}>Chats    </Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a user..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ChatItem chat={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  chatHeader: {
    flex: 1, 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingVertical: 0,
  },
  searchIconContainer: {
    padding: 10,
  },
});

export default ChatListScreen;
