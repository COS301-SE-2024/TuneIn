import React from 'react';
import { View, Text } from 'react-native';
import { Link } from "expo-router";
import RoomCardWidget from './components/RoomCardWidget';
import { Room } from './components/models/Room';
import AppCarousel from './components/AppCarousel';

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
    },
    // Add more sampleRoomCards...
  ];

  const renderItem = ({ item }: { item: Room }) => (
    <Link
      href={{
        pathname: '/screens/RoomPage',
        params: { room: JSON.stringify(item) },
      }}
    >
      <RoomCardWidget roomCard={item} />
    </Link>
  );

  return (
    <View className="flex-1 justify-center pt-4">
      <Text className="text-2xl font-bold text-gray-800 mt-2 mb-2 ml-8">Recent Rooms</Text>
      <AppCarousel data={sampleRoomCards} renderItem={renderItem} />
      <Text className="text-2xl font-bold text-gray-800 mb-2 ml-8">Picks for you</Text>
      <AppCarousel data={sampleRoomCards} renderItem={renderItem} />
    </View>
  );
};

export default Home;
