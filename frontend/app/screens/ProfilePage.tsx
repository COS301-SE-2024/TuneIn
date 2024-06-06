// ProfilePage.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router'; // Import useNavigation hook
import { Friend } from '../models/friend';

const ProfilePage: React.FC = () => {
  const { friend } = useLocalSearchParams();
  const friendData: Friend = JSON.parse(friend as string);
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 justify-center items-center pt-4 px-4">
      <TouchableOpacity onPress={handleGoBack} className="mb-4">
        <Text className="text-blue-500 text-lg">&lt; Back</Text>
      </TouchableOpacity>
      <Image source={{ uri: friendData.profilePicture }} style={{ width: 100, height: 100, borderRadius: 50 }} className="mb-2" />
      <Text className="text-lg font-bold">{friendData.name}</Text>
      {/* Display other details of the friend */}
    </View>
  );
};

export default ProfilePage;
