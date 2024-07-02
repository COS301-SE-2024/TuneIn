// TopNavBar.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StorageService from "./../services/StorageService"; // Import StorageService
import axios from "axios";

const TopNavBar: React.FC = () => {
  const router = useRouter();
  const baseURL = "http://192.168.0.158:3000";
  const [profileImage, setProfileImage] = useState<string>("https://cdn-.jk.-png.freepik.com/512/3135/3135715.png");

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const token = await StorageService.getItem("token"); // Use StorageService to get the token
        if (token) {
          const response = await axios.get(`${baseURL}/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response);
          setProfileImage(response.data.profile_picture_url);
        }
      } catch (error) {
        console.error("Error fetching profile info:", error);
      }
    };

    fetchProfilePicture();
  }, []);

  const navigateToProfile = () => {
    router.push({
      pathname: "/screens/ProfilePage",
    });
  };

  const appName = "TuneIn"; // Change this to your app's name

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
