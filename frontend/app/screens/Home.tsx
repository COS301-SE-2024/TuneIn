import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { Link } from "expo-router";
import RoomCardWidget from '../components/RoomCardWidget';
import { Room } from '../components/models/Room';
import AppCarousel from '../components/AppCarousel';

const Home: React.FC = () => {
  const sampleRoomCards: Room[] = [
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
  ];

  const renderItem = ({ item }: { item: Room }) => (
    <Link
      href={{
        pathname: '/screens/RoomPage',
        params: { room: JSON.stringify(item) },
      }}
      style={styles.link}
    >
      <RoomCardWidget roomCard={item} />
    </Link>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Text style={styles.title}>Recent Rooms</Text>
      <AppCarousel data={sampleRoomCards} renderItem={renderItem}/>
      <Text style={styles.title}>Picks for you</Text>
      <AppCarousel data={sampleRoomCards} renderItem={renderItem}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingTop: StatusBar.currentHeight || 0,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 30
  },
  link: {
    marginBottom: 10,
  }
});

export default Home;
