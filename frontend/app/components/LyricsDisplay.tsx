import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import useGeniusLyrics from "../hooks/useGeniusLyrics";

interface LyricsDisplayProps {
	apiKey: string;
	title: string;
	artist: string;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
	apiKey,
	title,
	artist,
}) => {
	const { lyrics, loading, error } = useGeniusLyrics({ apiKey, title, artist });

	if (loading) {
		return <ActivityIndicator size="large" color="#08BDBD" />;
	}

	if (error) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.lyricsText}>{lyrics}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 16,
		backgroundColor: "white",
	},
	lyricsText: {
		fontSize: 16,
		color: "black",
	},
	errorText: {
		fontSize: 16,
		color: "red",
	},
});

export default LyricsDisplay;
