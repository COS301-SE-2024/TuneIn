/* eslint-disable import/no-unresolved */
import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import {
	SPOTIFY_CLIENT_ID,
	SPOTIFY_REDIRECT_TARGET,
} from "react-native-dotenv";

const clientId = SPOTIFY_CLIENT_ID;
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

const RegisterOtherScreen: React.FC = () => {
	const router = useRouter();

	useEffect(() => {
		const handleRedirect = (event: any) => {
			let { queryParams } = Linking.parse(event.url);
			console.log("Redirect Data:", queryParams);
			WebBrowser.dismissBrowser();
			// Handle the redirect data (e.g., exchange code for access token)
		};

		const getInitialURL = async () => {
			const initialUrl = await Linking.getInitialURL();
			if (initialUrl) {
				handleRedirect({ url: initialUrl });
			}
		};

		getInitialURL();

		const subscription = Linking.addEventListener("url", handleRedirect);

		return () => {
			subscription.remove();
		};
	}, []);

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

		const rt = redirectTarget;
		const authUrl =
			`https://accounts.spotify.com/authorize` +
			`?client_id=${clientId}` +
			`&response_type=code` + // Change response_type to 'code'
			`&redirect_uri=${encodeURIComponent(rt)}` +
			`&show_dialog=true` +
			`&scope=${scopes}`;

		console.log("rt: " + rt);

		// Open Spotify authorization page in a web browser
		const result = await WebBrowser.openAuthSessionAsync(authUrl, rt);
		console.log("After Auth Session Result: \n", result);
		console.log("Type: \n", typeof result);

		if (result.type === "success") {
			// The user has successfully authenticated, handle the result.url to extract the authorization code
			console.log({ url: result.url });
		}
	};

	// Function to handle messages from the dummy page
	window.addEventListener("message", (event) => {
		if (event.origin === window.location.origin) {
			console.log("Received message:", event.data);
		} else {
			console.log("Message from unknown origin");
		}
	});

	let [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_500Medium,
		Poppins_700Bold,
	});

	if (!fontsLoaded) {
		return null;
	}

	const navigateToLogin = () => {
		router.navigate("screens/Auth/LoginStreaming");
	};

	const navigateToRegister = () => {
		router.navigate("screens/Auth/RegisterScreen");
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
			</View>

			<Text style={styles.welcomeText}>Authenticate With</Text>

			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={[styles.button, styles.otherButton]}
					onPress={authenticate}
				>
					<FontAwesome
						name="spotify"
						size={24}
						color="#000"
						style={styles.icon}
					/>
					<Text style={styles.buttonText}>spotify</Text>
				</TouchableOpacity>

				<View style={styles.dividerContainer}>
					<View style={styles.divider} />
					<Text style={styles.dividerText}>Or Login with TuneIn Details</Text>
					<View style={styles.divider} />
				</View>

				<TouchableOpacity
					style={[styles.button, styles.otherButton]}
					onPress={navigateToRegister}
				>
					<Text style={styles.buttonText}>Account</Text>
				</TouchableOpacity>
			</View>

			<TouchableOpacity
				style={styles.registerContainer}
				onPress={navigateToLogin}
			>
				<Text style={styles.registerText}>
					Don’t have an account?{" "}
					<Text style={styles.registerBoldText}>Register Now</Text>
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 20,
		paddingHorizontal: 16,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
	},
	backButton: {
		marginRight: "auto",
	},
	backText: {
		fontSize: 24,
		fontWeight: "bold",
	},
	welcomeText: {
		fontSize: 32,
		fontWeight: "bold",
		fontFamily: "Poppins_700Bold",
		textAlign: "center",
		marginTop: 30,
		marginBottom: 50,
		paddingHorizontal: 20,
	},
	buttonContainer: {
		alignItems: "center",
	},
	button: {
		width: "75%",
		height: 60,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
		borderRadius: 30,
		flexDirection: "row",
		paddingHorizontal: 10,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3.84,
	},
	otherButton: {
		backgroundColor: "#FFFFFF",
		borderColor: "#808080",
		borderWidth: 1,
	},
	icon: {
		marginRight: 10,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#000",
		fontFamily: "Poppins_700Bold",
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 20,
		width: "80%",
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: "#808080",
	},
	dividerText: {
		marginHorizontal: 10,
		fontSize: 14,
		color: "#000",
		fontFamily: "Poppins_500Medium",
	},
	registerContainer: {
		position: "absolute",
		bottom: 16,
		left: 0,
		right: 0,
		padding: 16,
		alignItems: "center",
	},
	registerText: {
		fontSize: 16,
		color: "#000",
		fontFamily: "Poppins_500Medium",
	},
	registerBoldText: {
		fontWeight: "bold",
		fontFamily: "Poppins_700Bold",
	},
});

export default RegisterOtherScreen;
