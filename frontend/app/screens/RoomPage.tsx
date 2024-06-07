import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router'; // Import useNavigation hook
import { Room } from '../models/Room';

const RoomPage: React.FC = () => {
  const { room } = useLocalSearchParams();
  const roomData: Room = JSON.parse(room as string);
  const navigation = useNavigation(); // Get navigation object

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back when back button is pressed
  };

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <TouchableOpacity onPress={handleGoBack} className="mb-4">
        <Text className="text-blue-500 text-lg">&lt; Back</Text>
      </TouchableOpacity>
      <Image source={{ uri: roomData.backgroundImage }} className="w-full h-40 rounded-lg mb-4" />
      <Text className="text-2xl font-bold mb-2">{roomData.name}</Text>
      <Text className="text-lg">{roomData.songName}</Text>
      <Text className="text-lg">{roomData.artistName}</Text>
      <Text className="text-base mt-4">{roomData.description}</Text>
      <Image source={{ uri: roomData.userProfile }} className="w-12 h-12 rounded-full mt-4" />
      <Text className="text-lg">{roomData.username}</Text>
      <View className="flex flex-wrap mt-4">
        {roomData.tags.map((tag, index) => (
          <Text key={index} className="bg-gray-300 px-2 py-1 rounded-full mr-2 mb-2">{tag}</Text>
        ))}
      </View>
    </View>
  );
};

export default RoomPage;
