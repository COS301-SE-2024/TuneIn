import React from "react";
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
		{
			id: "3",
			name: "Song Three",
			artists: [{ name: "Artist C" }],
			album: { images: [{ url: "https://example.com/album3.jpg" }] },
			explicit: false,
			preview_url: "https://example.com/preview3.mp3",
			uri: "spotify:track:3",
			duration_ms: 200000, // Duration in milliseconds
		},
		{
			id: "4",
			name: "Song Four",
			artists: [{ name: "Artist D" }],
			album: { images: [{ url: "https://example.com/album4.jpg" }] },
			explicit: true,
			preview_url: "https://example.com/preview4.mp3",
			uri: "spotify:track:4",
			duration_ms: 220000, // Duration in milliseconds
		},
		{
			id: "5",
			name: "Song Five",
			artists: [{ name: "Artist E" }],
			album: { images: [{ url: "https://example.com/album5.jpg" }] },
			explicit: false,
			preview_url: "https://example.com/preview5.mp3",
			uri: "spotify:track:5",
			duration_ms: 240000, // Duration in milliseconds
		},
		{
			id: "6",
			name: "Song Six",
			artists: [{ name: "Artist F" }],
			album: { images: [{ url: "https://example.com/album6.jpg" }] },
			explicit: false,
			preview_url: "https://example.com/preview6.mp3",
			uri: "spotify:track:6",
			duration_ms: 250000, // Duration in milliseconds
		},
		{
			id: "7",
			name: "Song Seven",
			artists: [{ name: "Artist G" }],
			album: { images: [{ url: "https://example.com/album7.jpg" }] },
			explicit: true,
			preview_url: "https://example.com/preview7.mp3",
			uri: "spotify:track:7",
			duration_ms: 210000, // Duration in milliseconds
		},
		{
			id: "8",
			name: "Song Eight",
			artists: [{ name: "Artist H" }],
			album: { images: [{ url: "https://example.com/album8.jpg" }] },
			explicit: false,
			preview_url: "https://example.com/preview8.mp3",
			uri: "spotify:track:8",
			duration_ms: 230000, // Duration in milliseconds
		},
	];

	return (
		<View style={styles.container}>
			<SplittingRoomCard
				queueData={sampleQueue}
				currentTrackIndex={2}
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
