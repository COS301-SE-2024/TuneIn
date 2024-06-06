// TopNavBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

const TopNavBar: React.FC = () => {
    const router = useRouter();

    const navigateToProfile = () => {
        router.navigate("/screens/Profile");
    };

    const appName = "MyApp"; // Change this to your app's name
    const profileImage = "https://cdn-icons-png.freepik.com/512/3135/3135715.png"; // Change this to the actual profile image URL

    return (
        <View className="flex-row items-center justify-between p-4 bg-gray-800">
            <TouchableOpacity onPress={navigateToProfile}>
                <Image
                    source={{ uri: profileImage }}
                    className="w-10 h-10 rounded-full"
                />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">{appName}</Text>
            <View className="w-10 h-10"></View> {/* Empty view to balance the layout */}
        </View>
    );
};

export default TopNavBar;
