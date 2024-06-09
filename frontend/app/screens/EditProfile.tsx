import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router'; // Import useNavigation hook
import { Friend } from '../models/friend';

const EditProfile: React.FC = () => {
  const { friend } = useLocalSearchParams();
  const navigation = useNavigation();

  let friendData: Friend | null = null;

  try {
    friendData = JSON.parse(friend as string);
  } catch (error) {
    console.error('Error parsing friend data:', error);
  }

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (!friendData) {
    return (
      <View className="flex-1 justify-center items-center pt-4 px-4">
        <TouchableOpacity onPress={handleGoBack} className="mb-4">
          <Text className="text-blue-500 text-lg">&lt; Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-red-500">Error: Invalid friend data</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center pt-4 px-4">
      <TouchableOpacity onPress={handleGoBack} className="mb-4">
        <Text className="text-blue-500 text-lg">&lt; Back</Text>
      </TouchableOpacity>
      <Image
        testID="friend-profile-image"
        source={{ uri: friendData.profilePicture }}
        style={{ width: 100, height: 100, borderRadius: 50 }}
        className="mb-2"
      />
      <Text className="text-lg font-bold">{friendData.name}</Text>
      {/* Display other details of the friend */}
    </View>
  );
};

export default EditProfile;
