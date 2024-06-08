import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Friend } from "../models/friend";

const TopNavBar: React.FC = () => {
  const router = useRouter();

  const profileData: Friend = {
    profilePicture: "https://cdn-icons-png.freepik.com/512/3135/3135715.png",
    name: "User123"
  };

  const navigateToProfile = () => {
    router.navigate({
      pathname: "/screens/EditProfile",
      params: { friend: JSON.stringify(profileData) },
    });
  };

  const appName = "TuneIn"; // Change this to your app's name
  const profileImage = profileData.profilePicture; // Use profile data image

  return (
    <View className="flex-row h-14 items-center justify-between">
      <View className="w-10"></View>
      <Text className="text-black text-2xl font-bold">{appName}</Text>
      <TouchableOpacity onPress={navigateToProfile}>
        <Image 
          source={{ uri: profileImage }}
          className="w-10 h-10 rounded-full mr-5"
        />
      </TouchableOpacity>
    </View>
  );
};

export default TopNavBar;
