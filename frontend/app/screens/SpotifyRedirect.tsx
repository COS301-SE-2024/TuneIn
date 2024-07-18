/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ActivityIndicator,
	StyleSheet,
	ScrollView,
} from "react-native";
import * as Linking from "expo-linking";

import {
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_REDIRECT_TARGET,
} from "react-native-dotenv";

const clientId = SPOTIFY_CLIENT_ID;
if (!clientId) {
	throw new Error(
		"No Spotify client ID (SPOTIFY_CLIENT_ID) provided in environment variables 2",
	);
}

const clientSecret = SPOTIFY_CLIENT_SECRET;
if (!clientSecret) {
	throw new Error(
		"No Spotify client secret (SPOTIFY_CLIENT_SECRET) provided in environment variables",
	);
}

const redirectTarget = SPOTIFY_REDIRECT_TARGET;
if (!redirectTarget) {
	throw new Error(
		"No redirect target (SPOTIFY_REDIRECT_TARGET) provided in environment variables",
	);
}
console.log(clientId);

const SpotifyRedirect = () => {
	const [tokenDetails, setTokenDetails] = useState(null);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		const extractToken = async () => {
			try {
				const url = await Linking.getInitialURL();
				if (url) {
					console.log("Redirect URL:", url);
					const code = getCodeFromUrl(url);
					if (code) {
						await exchangeCodeForToken(code);
					} else {
						setError("Authorization code not found");
						console.error("Authorization code not found");
					}
				} else {
					setError("URL not found");
					console.error("URL not found");
				}
			} catch (err) {
				setError("An error occurred while extracting the token");
				console.error("An error occurred while extracting the token", err);
			}
		};

		extractToken();
	}, []);

	const getCodeFromUrl = (url) => {
		const query = url.split("?")[1];
		if (!query) return null;
		const params = new URLSearchParams(query);
		return params.get("code");
	};

	const exchangeCodeForToken = async (code) => {
		try {
			const credentials = `${clientId}:${clientSecret}`;
			const base64Credentials = btoa(credentials); // Encode credentials for Basic Auth

			const response = await fetch("https://accounts.spotify.com/api/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `Basic ${base64Credentials}`, // Use encoded credentials
				},
				body: new URLSearchParams({
					grant_type: "authorization_code",
					code: code,
					redirect_uri: redirectTarget,
				}),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to exchange code for tokens: ${response.status}`,
				);
			}

			const data = await response.json();
			const accessToken = data.access_token;
			const refreshToken = data.refresh_token;
			const expiresIn = data.expires_in;

			await StorageService.setItem("accessToken", accessToken);
			await StorageService.setItem("refreshToken", refreshToken);
			await StorageService.setItem("expiresIn", expiresIn.toString());

			setTokenDetails({
				accessToken,
				refreshToken,
				expiresIn,
			});

			setSuccess(true);
		} catch (error) {
			setError(`Failed to exchange code for tokens: ${error.message}`);
			console.error("Failed to exchange code for tokens:", error);
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{tokenDetails ? (
				<View style={styles.tokenContainer}>
					<Text style={styles.label}>Access Token:</Text>
					<Text style={styles.token}>{tokenDetails.accessToken}</Text>
					<Text style={styles.label}>Refresh Token:</Text>
					<Text style={styles.token}>{tokenDetails.refreshToken}</Text>
					<Text style={styles.label}>Expires In:</Text>
					<Text style={styles.token}>{tokenDetails.expiresIn}</Text>
					{success && (
						<Text style={styles.success}>
							Tokens stored successfully in local storage!
						</Text>
					)}
				</View>
			) : error ? (
				<Text style={styles.error}>Error: {error}</Text>
			) : (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#0000ff" />
					<Text style={styles.loadingText}>Authenticating...</Text>
				</View>
			)}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	tokenContainer: {
		alignItems: "flex-start",
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: "bold",
		marginTop: 10,
	},
	token: {
		fontSize: 14,
		marginTop: 5,
		marginBottom: 10,
	},
	success: {
		marginTop: 20,
		color: "green",
		fontWeight: "bold",
	},
	error: {
		fontSize: 16,
		color: "red",
	},
	loadingContainer: {
		alignItems: "center",
		marginTop: 50,
	},
	loadingText: {
		marginTop: 10,
	},
});

export default SpotifyRedirect;
