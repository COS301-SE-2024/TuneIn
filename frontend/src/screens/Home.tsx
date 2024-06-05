import React from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';

import RoomCardWidget from '../components/RoomCardWidget';
import { RoomCard } from '../components/models/RoomCard';
import AppCarousel from '../components/AppCarousel';

interface HomeProps {
  // Define props if any
}

const Home: React.FC<HomeProps> = () => {
  const sampleRoomCards: RoomCard[] = [
    {
      backgroundImage: 'https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=600',
      name: 'Chill Vibes',
      songName: 'Song Title',
      artistName: 'Artist Name',
      description: 'A description of the room goes here.',
      userProfile: 'https://w7.pngwing.com/pngs/205/731/png-transparent-default-avatar-thumbnail.png',
      username: 'User123',
      tags: ['Tag1', 'Tag2', 'Tag3'],
    },
    {
      backgroundImage: 'https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=600',
      name: 'Chill Vibes',
      songName: 'Song Title',
      artistName: 'Artist Name',
      description: 'A description of the room goes here.',
      userProfile: 'https://w7.pngwing.com/pngs/205/731/png-transparent-default-avatar-thumbnail.png',
      username: 'User123',
      tags: ['Tag1', 'Tag2', 'Tag3'],
    }
    // Add more RoomCard objects as needed
  ];

  const renderItem = ({ item }: { item: RoomCard }) => (
    <RoomCardWidget roomCard={item} />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Text style={styles.title}>Welcome to the Home Page!</Text>
      <AppCarousel data={sampleRoomCards} renderItem={renderItem}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingTop: StatusBar.currentHeight || 0, // Ensure that paddingTop respects the status bar height
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
});

export default Home;
