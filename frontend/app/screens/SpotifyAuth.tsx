import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
//import { EXPO_SPOTIFY_CLIENT_ID } from "@env";
import * as AppAuth from "expo-app-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EXPO_SPOTIFY_CLIENT_ID, EXPO_SPOTIFY_CLIENT_SECRET } from "@env";
import { useNavigation } from "@react-navigation/native";
import * as AuthSession from 'expo-auth-session';

import { encode as btoa } from 'base-64';

console.log(AuthSession.getRedirectUrl());

const SpotifyAuth: React.FC = () => {
  const navigation = useNavigation();

  const getSpotifyCredentials = async () => {
    const clientId = EXPO_SPOTIFY_CLIENT_ID;
    const clientSecret = EXPO_SPOTIFY_CLIENT_SECRET;
    const redirectUri = "http://localhost:3023/--/spotify-auth-callback";
    const spotifyCredentials = { clientId, clientSecret, redirectUri };
    return spotifyCredentials;
  };

  const scopesArr = [
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-library-modify",
    "user-library-read",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private",
    "user-read-recently-played",
    "user-top-read",
  ];
  const scopes = scopesArr.join(" ");

  const getAuthorizationCode = async () => {
    try {
      const credentials = await getSpotifyCredentials(); //we wrote this function above
      const redirectUrl = AuthSession.getRedirectUrl(); //this will be something like https://auth.expo.io/@your-username/your-app-slug
      const result = await AuthSession.({
        authUrl:
          "https://accounts.spotify.com/authorize" +
          "?response_type=code" +
          "&client_id=" +
          credentials.clientId +
          (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
          "&redirect_uri=" +
          encodeURIComponent(redirectUrl),
      });
      return result.params.code;
    } catch (err) {
      console.error(err);
    }
  };

  const getTokens = async () => {
    try {
      const authorizationCode = await getAuthorizationCode() //we wrote this function above
      const credentials = await getSpotifyCredentials() //we wrote this function above (could also run this outside of the functions and store the credentials in local scope)
      const credsB64 = btoa(`${credentials.clientId}:${credentials.clientSecret}`);
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credsB64}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=authorization_code&code=${authorizationCode}&redirect_uri=${
          credentials.redirectUri
        }`,
      });
      const responseJson = await response.json();
      // destructure the response and rename the properties to be in camelCase to satisfy my linter ;)
      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
      } = responseJson;

      const expirationTime = new Date().getTime() + expiresIn * 1000;
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('expirationTime', expirationTime.toString());
    } catch (err) {
      console.error(err);
    }
  }

  const refreshTokens = async () => {
    try {
      const credentials = await getSpotifyCredentials() //we wrote this function above
      const credsB64 = btoa(`${credentials.clientId}:${credentials.clientSecret}`);
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credsB64}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        await getTokens();
      } else {
        const {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires_in: expiresIn,
        } = responseJson;

        const expirationTime = new Date().getTime() + expiresIn * 1000;
        await AsyncStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        }
        await AsyncStorage.setItem('expirationTime', expirationTime.toString());
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleLogin() {
    const config = {
      issuer: "https://accounts.spotify.com",
      clientId: "4902747b9d7c4f4195b991f29f8a680a", //comment out before committing
      scopes: [
        "user-read-email",
        "user-library-read",
        "user-read-recently-played",
        "user-top-read",
        "playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-public", // or "playlist-modify-private"
      ],
      redirectUrl: "http://localhost:3023/--/spotify-auth-callback",
    };

    //  const result = await AppAuth.authAsync(config);
    //  console.log(result);
    //  if(result.accessToken){
    // const expirationDate = new Date(result.accessTokenExpirationDate).getTime();
    // AsyncStorage.setItem("spotify Token", result.accessToken);
    // AsyncStorage.setItem("expirationDate", expirationDate.toString());
    navigation.navigate("/screens/Home");
    //  }
  }

  return (
    <LinearGradient
      colors={["#000000", "#000000"]}
      style={{ flex: 1 }}
      className="flex-1 items-center justify-center"
    >
      <View className="w-30 h-30 rounded-full bg-white/20 items-center justify-center">
        <Image
          source={require("../assets/spotify.png")}
          className="w-20 h-20"
        />
      </View>
      <TouchableOpacity
        className="w-11/12 h-12 justify-center items-center bg-green-500 border border-black rounded-full mb-5 mt-5 shadow-lg"
        onPress={handleLogin}
      >
        <Text className="text-white text-lg font-semibold">
          Login with Spotify
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default SpotifyAuth;
