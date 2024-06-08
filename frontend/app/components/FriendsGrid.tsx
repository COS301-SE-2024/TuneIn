import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Link } from "expo-router";
import { Friend } from "../models/friend"; // Assume you have a Friend model

interface FriendsGridProps {
  friends: Friend[];
  maxVisible: number;
}

const FriendsGrid: React.FC<FriendsGridProps> = ({ friends, maxVisible }) => {
  return (
    <View className="mb-5 flex items-center justify-center">
      <View className="flex flex-row flex-wrap px-4 pl-8">
        {friends.slice(0, maxVisible).map((friend, index) => (
          <Link
            key={index}
            href={`/screens/ProfilePage?friend=${JSON.stringify(friend)}`}
          >
            <View className="w-1/3 p-3">
              <View className="flex items-center border-2 border-blue-500 rounded-full p-1">
                <Image
                  source={{ uri: friend.profilePicture }}
                  className="w-12 h-12 rounded-full"
                />
              </View>
              <Text className="mt-2 text-center">{friend.name}</Text>
            </View>
          </Link>
        ))}
      </View>
    </View>
  );
};

export default FriendsGrid;
