// AllFriends.tsx (or CreateRoom.tsx)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import MyToggleWidget from '../components/ToggleWidget'; // Adjust the import path as needed

const CreateRoom: React.FC = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState(true);

  const goBack = () => {
    navigation.goBack();
  };

  const handleToggleChange = (isFirstOptionSelected: boolean) => {
    setSelectedOption(isFirstOptionSelected);
  };

  return (
    <View className="flex-1 justify-center pt-4 px-4">
      <Text className="text-2xl font-bold text-gray-800 mt-2 mb-2">Welcome to the CreateRoom Page</Text>
      <TouchableOpacity onPress={goBack}>
        <Text>Go Back</Text>
      </TouchableOpacity>
      <MyToggleWidget
        firstOption="Option 1"
        secondOption="Option 2"
        onChanged={handleToggleChange}
      />
      <Text className="mt-4 text-lg text-gray-800">
        Selected Option: {selectedOption ? "Option 1" : "Option 2"}
      </Text>
    </View>
  );
};

export default CreateRoom;
