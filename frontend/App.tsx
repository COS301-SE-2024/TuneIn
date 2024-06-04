// App.tsx
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import RoomCardWidget from './src/components/RoomCardWidget';
import { RoomCard } from './src/components/models/RoomCard';

const sampleRoomCard: RoomCard = {
  backgroundImage: 'https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=600',
  name: 'Chill Vibes',
  songName: 'Song Title',
  artistName: 'Artist Name',
  description: 'A description of the room goes here.',
  userProfile: 'https://example.com/user.jpg',
  username: 'User123',
  tags: ['Tag1', 'Tag2', 'Tag3'],
};

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <RoomCardWidget roomCard={sampleRoomCard} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
