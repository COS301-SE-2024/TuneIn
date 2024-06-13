import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Dimensions, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const chats = [
  { id: '1', name: 'John Doe', lastMessage: 'Hey there!', avatar: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
  { id: '2', name: 'Jane Smith', lastMessage: 'What\'s up?', avatar: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
  // Add more dummy chats
];

const ChatListScreen = () => {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    // Handle search functionality here
    // You can filter 'chats' array based on 'searchQuery'
    // For simplicity, let's console log the searchQuery
    console.log('Searching for:', searchQuery);
  };

  return (
    
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 20 }}>
        <View >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
        
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
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#D1D5DB' }}
            onPress={() => router.push(`/screens/ChatScreen?name=${item.name}&avatar=${item.avatar}`)}
          >
            <Image source={{ uri: item.avatar }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
              <Text style={{ fontSize: 14, color: 'gray' }}>{item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
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
