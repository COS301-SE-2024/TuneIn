import React, { useEffect } from "react";
import { View, Text, Pressable, SafeAreaView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as StorageService from "./../services/StorageService"; // Import StorageService
import { Entypo } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_TARGET } from "@env";

const clientId = SPOTIFY_CLIENT_ID;
console.log("clientId", clientId);
if (!clientId) {
	throw new Error(
		"No Spotify client ID (SPOTIFY_CLIENT_ID) provided in environment variables",
	);
}

const redirectTarget = SPOTIFY_REDIRECT_TARGET;
if (!redirectTarget) {
	throw new Error(
		"No redirect target (SPOTIFY_REDIRECT_TARGET) provided in environment variables",
	);
}

const LoginScreen = () => {
	const router = useRouter();

	useEffect(() => {
		const checkTokenValidity = async () => {
			const accessToken = await StorageService.getItem("Spotify token");
			const refreshToken = await StorageService.getItem(
				"Spotify refresh token",
			);
			const expirationDate = await StorageService.getItem("expirationDate");

			if (accessToken && refreshToken && expirationDate) {
				const currentTime = Date.now();
				if (currentTime < parseInt(expirationDate)) {
					// Token is still valid
					router.navigate("/screens/Home");
				} else {
					// Token is expired, but refresh token is available
					await refreshAccessToken(refreshToken);
				}
			}
		};

		checkTokenValidity();
	}, []);

	const refreshAccessToken = async (refreshToken) => {
		try {
			const response = await fetch("https://accounts.spotify.com/api/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					grant_type: "refresh_token",
					refresh_token: refreshToken,
					client_id: clientId,
				}),
			});

			if (!response.ok) {
				throw new Error(`Failed to refresh access token: ${response.status}`);
			}

			const data = await response.json();
			const newAccessToken = data.access_token;
			const newExpiration = Date.now() + data.expires_in * 1000; // Convert seconds to milliseconds

			// Store new access token and possibly new refresh token
			await StorageService.setItem("accessToken", newAccessToken);
			await StorageService.setItem("expirationDate", newExpiration.toString());

			router.navigate("/screens/Home");
		} catch (error) {
			console.error("Error refreshing access token:", error);
			// Handle error (e.g., redirect to login screen)
		}
	};

	const authenticate = async () => {
		const scopes = [
			"user-read-email",
			"user-library-read",
			"user-read-recently-played",
			"user-top-read",
			"playlist-read-private",
			"playlist-read-collaborative",
			"playlist-modify-public", // or "playlist-modify-private"
			"user-modify-playback-state",
			"user-read-playback-state",
			"user-read-currently-playing",
		].join(" ");

		const authUrl =
			`https://accounts.spotify.com/authorize` +
			`?client_id=${clientId}` +
			`&response_type=code` + // Change response_type to 'code'
			`&redirect_uri=${encodeURIComponent(redirectTarget)}` +
			`&show_dialog=true` +
			`&scope=${scopes}`;

		// Open Spotify authorization page in a web browser
		Linking.openURL(authUrl);

		router.navigate("/screens/SpotifyTesting");
	};

	const navigateToSpotifyTesting = () => {
		router.navigate("/screens/SpotifyTesting");
	};

	return (
		<LinearGradient colors={["#040306", "#131624"]} style={styles.gradient}>
			<SafeAreaView>
				<View style={styles.spacer} />
				<Entypo style={styles.icon} name="spotify" size={80} color="white" />
				<Text style={styles.header}>
					Please connect your Spotify account to allow for music playback
				</Text>
				<View style={styles.spacer} />
				<Pressable onPress={authenticate} style={styles.button}>
					<Text style={styles.buttonText}>Sign In with Spotify</Text>
				</Pressable>
			</SafeAreaView>
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	gradient: {
		flex: 1,
	},
	spacer: {
		height: 80,
	},
	icon: {
		textAlign: "center",
	},
	header: {
		color: "white",
		fontSize: 25,
		fontWeight: "bold",
		textAlign: "center",
		marginTop: 40,
	},
	button: {
		height: 48,
		width: "86%",
		backgroundColor: "#1DB954",
		padding: 10,
		marginLeft: "auto",
		marginRight: "auto",
		borderRadius: 25,
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 10,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#FFF",
	},
});

export default LoginScreen;
