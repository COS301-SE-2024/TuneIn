import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router'; // Import useNavigation hook
import { Room } from '../components/models/Room';

const RoomPage: React.FC = () => {
  const { room } = useLocalSearchParams();
  const roomData: Room = JSON.parse(room as string);
  const navigation = useNavigation(); // Get navigation object

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back when back button is pressed
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>{'< Back'}</Text>
      </TouchableOpacity>
      <Image source={{ uri: roomData.backgroundImage }} style={styles.backgroundImage} />
      <Text style={styles.name}>{roomData.name}</Text>
      <Text style={styles.songName}>{roomData.songName}</Text>
      <Text style={styles.artistName}>{roomData.artistName}</Text>
      <Text style={styles.description}>{roomData.description}</Text>
      <Image source={{ uri: roomData.userProfile }} style={styles.userProfile} />
      <Text style={styles.username}>{roomData.username}</Text>
      <View style={styles.tagsContainer}>
        {roomData.tags.map((tag, index) => (
          <Text key={index} style={styles.tag}>{tag}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF', // Blue color for iOS-like back button
  },
  backgroundImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  songName: {
    fontSize: 18,
    marginTop: 5,
  },
  artistName: {
    fontSize: 18,
    marginTop: 5,
  },
  description: {
    fontSize: 16,
    marginTop: 10,
  },
  userProfile: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: 10,
  },
  username: {
    fontSize: 16,
    marginTop: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#ddd',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
});

export default RoomPage;
