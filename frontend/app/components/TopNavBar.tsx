// TopNavBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
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
      pathname: "/screens/ProfilePage",
      params: { friend: JSON.stringify(profileData) },
    });
  };

  const appName = "TuneIn"; // Change this to your app's name
  const profileImage = profileData.profilePicture; // Use profile data image

  return (
    <View style={styles.container}>
      <View style={styles.emptyView}></View>
      <Text style={styles.appName}>{appName}</Text>
      <TouchableOpacity onPress={navigateToProfile}>
        <Image 
          source={{ uri: profileImage }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 56,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  emptyView: {
    width: 40, // Adjust as needed
  },
  appName: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
});

export default TopNavBar;
