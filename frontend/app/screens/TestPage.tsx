import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

// Example room and queue data
const testRooms = [
	{
		id: "1",
		backgroundImage:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmCy16nhIbV3pI1qLYHMJKwbH2458oiC9EmA&s",
		name: "Test Room One",
		description: "This is a description for Test Room One.",
		userID: "user1",
		username: "User One",
		tags: ["chill", "jazz"],
		genre: "Jazz",
		language: "English",
		roomSize: 10,
		isExplicit: false,
		isNsfw: false,
	},
	{
		id: "2",
		name: "Test Room Two",
		description: "This is a description for Test Room Two.",
		userID: "user2",
		username: "User Two",
		tags: ["pop", "party"],
		genre: "Pop",
		language: "English",
		roomSize: 20,
		isExplicit: true,
		isNsfw: false,
	},
];

const testQueues = [
	[
		{
			id: 1,
			name: "Track One",
			artists: [{ name: "Artist A" }],
			album: { images: [{ url: "https://example.com/album1.jpg" }] },
			explicit: false,
			preview_url: "https://example.com/preview1.mp3",
			uri: "spotify:track:1",
			duration_ms: 210000,
		},
		{
			id: 2,
			name: "Track Two",
			artists: [{ name: "Artist B" }],
			album: { images: [{ url: "https://example.com/album2.jpg" }] },
			explicit: true,
			preview_url: "https://example.com/preview2.mp3",
			uri: "spotify:track:2",
			duration_ms: 180000,
		},
	],
	[
		{
			id: 3,
			name: "Track Three",
			artists: [{ name: "Artist C" }],
			album: { images: [{ url: "https://example.com/album3.jpg" }] },
			explicit: false,
			preview_url: "https://example.com/preview3.mp3",
			uri: "spotify:track:3",
			duration_ms: 200000,
		},
		{
			id: 4,
			name: "Track Four",
			artists: [{ name: "Artist D" }],
			album: { images: [{ url: "https://example.com/album4.jpg" }] },
			explicit: true,
			preview_url: "https://example.com/preview4.mp3",
			uri: "spotify:track:4",
			duration_ms: 240000,
		},
	],
];

const TestPage: React.FC = () => {
	const router = useRouter();

	const navigateToSplittingRoom = () => {
		router.navigate({
			pathname: "/screens/rooms/SplittingRoom",
			params: {
				rooms: JSON.stringify(testRooms),
				queues: JSON.stringify(testQueues),
			},
		});
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Test Page</Text>
			<Button title="Go to SplittingRoom" onPress={navigateToSplittingRoom} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
});

export default TestPage;
