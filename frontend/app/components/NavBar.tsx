// NavBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const NavBar: React.FC = () => {
    const router = useRouter();

    const navigateToHome = () => {
        router.navigate("/");
    };

    const navigateToSpotifyAuth = () => {
        router.navigate("/screens/SpotifyAuth");
    };

    const navigateToProfile = () => {
        router.navigate("/screens/EditProfile");
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={navigateToHome}>
                <Text style={styles.text}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={navigateToSpotifyAuth}>
                <Text style={styles.text}>SpotifyAuth</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={navigateToProfile}>
                <Text style={styles.text}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#333",
        padding: 16,
    },
    text: {
        color: "white",
        fontSize: 18,
    },
});

export default NavBar;
