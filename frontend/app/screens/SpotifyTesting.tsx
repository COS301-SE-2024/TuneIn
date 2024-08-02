import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	ScrollView,
	StyleSheet,
} from "react-native";
import SongCard from "../components/Spotify/SongCard";
import { useSpotifySearch } from "../hooks/useSpotifySearch";
import { useSpotifyPlayback } from "../hooks/useSpotifyPlayback";
import * as spotifyAuth from "../services/SpotifyAuth";

const SpotifyTestingPage: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [accessToken, setAccessToken] = useState<string>("");
	const [refreshToken, setRefreshToken] = useState<string>("");

	// Fetch tokens on component mount
	useEffect(() => {
		const fetchTokens = async () => {
			const allTokens = await spotifyAuth.getTokens();
			setAccessToken(allTokens.access_token);
			setRefreshToken(allTokens.refresh_token);
		};

		fetchTokens();
	}, []); // Empty dependency array means this effect runs once on mount

	const {
		searchResults,
		handleSearch,
		error: searchError,
	} = useSpotifySearch();

	const { handlePlayback, error: playbackError } = useSpotifyPlayback();

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Spotify Testing Page</Text>
			<TextInput
				style={styles.input}
				placeholder="Enter access token..."
				value={accessToken}
			/>
			<TextInput
				style={styles.input}
				placeholder="Enter refresh token..."
				value={refreshToken}
			/>
			<TextInput
				style={styles.input}
				placeholder="Enter search query..."
				value={searchQuery}
				onChangeText={setSearchQuery}
			/>
			<Button title="Search" onPress={() => handleSearch(searchQuery)} />
			<ScrollView style={styles.resultsContainer}>
				{searchResults.map((track, index) => (
					<SongCard
						key={index}
						track={track}
						onPlay={() => handlePlayback("play", track.uri)}
					/>
				))}
			</ScrollView>

			<View style={styles.controls}>
				<Button title="Pause" onPress={() => handlePlayback("pause")} />
				<Button title="Next" onPress={() => handlePlayback("next")} />
				<Button title="Previous" onPress={() => handlePlayback("previous")} />
			</View>
			{searchError && (
				<Text style={styles.error}>Search Error: {searchError}</Text>
			)}
			{playbackError && (
				<Text style={styles.error}>Playback Error: {playbackError}</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		padding: 10,
		marginBottom: 10,
	},
	resultsContainer: {
		flex: 1,
		marginTop: 10,
	},
	webViewContainer: {
		marginTop: 20,
		marginBottom: 20,
		height: 300,
	},
	controls: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 20,
	},
	error: {
		color: "red",
		marginTop: 10,
	},
});

export default SpotifyTestingPage;
