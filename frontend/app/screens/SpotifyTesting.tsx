import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	ScrollView,
	StyleSheet,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import SongCard from "../components/Spotify/SongCard";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import { useSpotifySearch } from "../hooks/useSpotifySearch";
import { useSpotifyPlayback } from "../hooks/useSpotifyPlayback";

const SpotifyTestingPage: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const router = useRouter();

	const {
		accessToken,
		refreshToken,
		error: authError,
		handleTokenChange,
		handleRefreshTokenChange,
		getRefreshToken,
	} = useSpotifyAuth();

	const {
		searchResults,
		handleSearch,
		error: searchError,
	} = useSpotifySearch();

	const {
		handlePlayback,
		selectedTrackUri,
		error: playbackError,
	} = useSpotifyPlayback();

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Spotify Testing Page</Text>
			<TextInput
				style={styles.input}
				placeholder="Enter access token..."
				value={accessToken}
				onChangeText={handleTokenChange}
			/>
			<TextInput
				style={styles.input}
				placeholder="Enter refresh token..."
				value={refreshToken}
				onChangeText={handleRefreshTokenChange}
			/>
			<TextInput
				style={styles.input}
				placeholder="Enter search query..."
				value={searchQuery}
				onChangeText={setSearchQuery}
			/>
			<Button title="Search" onPress={() => handleSearch(searchQuery)} />
			<Button title="Test Refresh Token" onPress={getRefreshToken} />
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
			{authError && <Text style={styles.error}>Auth Error: {authError}</Text>}
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
