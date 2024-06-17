import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Pressable, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entypo, MaterialIcons, AntDesign } from "@expo/vector-icons";
import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";


const LoginScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const checkTokenValidity = async () => {
      const accessToken = await AsyncStorage.getItem("Spotify token");
      const expirationDate = await AsyncStorage.getItem("expirationDate");
      console.log("access token", accessToken);
      console.log("expiration date", expirationDate);

      if (accessToken && expirationDate) {
        const currentTime = Date.now();
        if (currentTime < parseInt(expirationDate)) {
          // here the token is still valid
          router.navigate("/screens/Home");
        } else {
          // token would be expired so we need to remove it from the async storage
          await AsyncStorage.removeItem("Spotify token");
          await AsyncStorage.removeItem("expirationDate");
        }
      }
    }

    checkTokenValidity();
  }, [])

  async function authenticate() {
    const clientId = "4902747b9d7c4f4195b991f29f8a680a";
    const redirectUri = "http://localhost:8081/screens/SpotifyRedirect";
    const scopes = [
      "user-read-email",
      "user-library-read",
      "user-read-recently-played",
      "user-top-read",
      "playlist-read-private",
      "playlist-read-collaborative",
      "playlist-modify-public" // or "playlist-modify-private"
    ].join(" ");
  
    const authUrl =
      `https://accounts.spotify.com/authorize`+
      `?client_id=${clientId}`
      +`&response_type=token`
      +`&redirect_uri=${encodeURIComponent(redirectUri)}`
      +`&show_dialog=true`+
      `&scope=${scopes}`;
  
    // Open Spotify authorization page in a web browser
    console.log("authUrl: " + authUrl);
    Linking.openURL(authUrl);
  }
  
  

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
          Millions of Songs Free on spotify!
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
          style={{
            backgroundColor: "#131624",
            padding: 10,
            marginLeft: "auto",
            marginRight: "auto",
            width: 300,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginVertical: 10,
            borderColor: "#C0C0C0",
            borderWidth: 0.8
          }}
        >
          <MaterialIcons name="phone-android" size={24} color="white" />
          <Text style={{ fontWeight: "500", color: "white", textAlign: "center", flex: 1 }}>Continue with phone number</Text>
        </Pressable>

        <Pressable
          style={{
            backgroundColor: "#131624",
            padding: 10,
            marginLeft: "auto",
            marginRight: "auto",
            width: 300,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginVertical: 10,
            borderColor: "#C0C0C0",
            borderWidth: 0.8
          }}
        >
          <AntDesign name="google" size={24} color="red" />
          <Text style={{ fontWeight: "500", color: "white", textAlign: "center", flex: 1 }}>Continue with Google</Text>
        </Pressable>

        <Pressable
          style={{
            backgroundColor: "#131624",
            padding: 10,
            marginLeft: "auto",
            marginRight: "auto",
            width: 300,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",

            marginVertical: 10,
            borderColor: "#C0C0C0",
            borderWidth: 0.8
          }}
        >
          <Entypo name="facebook" size={24} color="blue" />
          <Text style={{ fontWeight: "500", color: "white", textAlign: "center", flex: 1 }}>Sign In with Facebook</Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;
