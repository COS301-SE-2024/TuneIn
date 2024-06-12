// NavBar.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const NavBar: React.FC = () => {
    const router = useRouter();

    const navigateToHome = () => {
        router.navigate("/");
    };

    const navigateToSearch = () => {
        router.navigate("/screens/Search");
    };

    const navigateToProfile = () => {
        router.navigate("/screens/EditProfile");
    };

    return (
        <View className="flex-row justify-around bg-gray-100 p-4">
            <TouchableOpacity onPress={navigateToHome}>
                <Text className="text-black text-lg">Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={navigateToSearch}>
                <Text className="text-black text-lg">Search</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={navigateToProfile}>
                <Text className="text-black text-lg">Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

export default NavBar;
