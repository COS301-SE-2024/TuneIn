import React, { useEffect } from "react";
import { View, Text, Pressable, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entypo } from "@expo/vector-icons";
import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { VITE_SPOTIFY_CLIENT_ID, VITE_REDIRECT_TARGET } from '@env';

const clientId = VITE_SPOTIFY_CLIENT_ID;
const redirectTarget = VITE_REDIRECT_TARGET;

const LoginScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const checkTokenValidity = async () => {
      const accessToken = await AsyncStorage.getItem("Spotify token");
      const expirationDate = await AsyncStorage.getItem("expirationDate");

      if (accessToken && expirationDate) {
        const currentTime = Date.now();
        if (currentTime < parseInt(expirationDate)) {
          // Token is still valid
          router.navigate("/screens/Home");
        } else {
          // Token is expired
          await AsyncStorage.removeItem("Spotify token");
          await AsyncStorage.removeItem("expirationDate");
        }
      }
    };

    checkTokenValidity();
  }, []);

  const authenticate = async () => {
    const scopes = [
      "user-read-email",
      "user-library-read",
      "user-read-recently-played",
      "user-top-read",
      "playlist-read-private",
      "playlist-read-collaborative",
      "playlist-modify-public" // or "playlist-modify-private"
    ].join(" ");

    const authUrl = `https://accounts.spotify.com/authorize`+
      `?client_id=${clientId}`
      +`&response_type=token`
      +`&redirect_uri=${encodeURIComponent(redirectTarget)}`
      +`&show_dialog=true`+
      `&scope=${scopes}`;
  
    // Open Spotify authorization page in a web browser
    Linking.openURL(authUrl);

    router.navigate("/screens/SpotifyTesting");
  };

  const navigateToSpotifyTesting = () => {
    router.navigate("/screens/SpotifyTesting");
  };

  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <SafeAreaView>
        <View style={{ height: 80 }} />
        <Entypo
          style={{ textAlign: "center" }}
          name="spotify"
          size={80}
          color="white"
        />
        <Text
          style={{
            color: "white",
            fontSize: 40,
            fontWeight: "bold",
            textAlign: "center",
            marginTop: 40,
          }}
        >
          Millions of Songs Free on Spotify!
        </Text>
        <View style={{ height: 80 }} />
        <Pressable
          onPress={authenticate}
          style={{
            backgroundColor: "#1DB954",
            padding: 10,
            marginLeft: "auto",
            marginRight: "auto",
            width: 300,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 10
          }}
        >
          <Text>Sign In with Spotify</Text>
        </Pressable>

        <Pressable
          onPress={navigateToSpotifyTesting}
          style={{
            backgroundColor: "#1DB954",
            padding: 10,
            marginLeft: "auto",
            marginRight: "auto",
            width: 300,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 10
          }}
        >
          <Text>Go to Spotify Testing</Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;
