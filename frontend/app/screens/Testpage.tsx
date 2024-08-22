import React from "react";
import { colors } from "../styles/colors";
import SplittingRoomCard from "../components/rooms/SplittingRoomCard";
import { View, StyleSheet } from "react-native";
import { Track } from "../models/Track";

const TestPage: React.FC = () => {
	const sampleQueue: Track[] = [
		{
			id: "1",
			name: "Song One",
			artists: [{ name: "Artist A" }],
			album: { images: [{ url: "https://example.com/album1.jpg" }] },
			explicit: false,
			preview_url: "https://example.com/preview1.mp3",
			uri: "spotify:track:1",
			duration_ms: 210000, // Duration in milliseconds
		},
		{
			id: "2",
			name: "Song Two",
			artists: [{ name: "Artist B" }],
			album: { images: [{ url: "https://example.com/album2.jpg" }] },
			explicit: true,
			preview_url: "https://example.com/preview2.mp3",
			uri: "spotify:track:2",
			duration_ms: 180000, // Duration in milliseconds
		},
		// more tracks
	];

	return (
		<View style={styles.container}>
			<SplittingRoomCard
				queueData={sampleQueue}
				currentTrackIndex={0}
				rootParentName="Jazz Vibes"
				topGenre="Smooth Jazz"
				numberOfParticipants={25}
				backgroundImageSource={require("../assets/jazzBackground.png")}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center", // Centers vertically
		alignItems: "center", // Centers horizontally
		backgroundColor: "#353535",
		padding: 20,
	},
});

export default TestPage;
