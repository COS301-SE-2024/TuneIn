import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';

const AllFriends: React.FC = () => {
  const navigation = useNavigation();

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 justify-center pt-4 px-4">
      <Text className="text-2xl font-bold text-gray-800 mt-2 mb-2">Welcome to the Friends Page</Text>
      <TouchableOpacity onPress={goBack}>
        <Text>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AllFriends;
