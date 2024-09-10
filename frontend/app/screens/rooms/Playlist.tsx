import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SongList from "../../components/SongList"; // Import the SongList component
import { Track } from "../../models/Track";
import { RoomSongDto } from "../../models/RoomSongDto";
import { useLive } from "../../LiveContext";
import { VoteDto } from "../../models/VoteDto";

// Add mock songs here for testing
const mockSongs: Track[] = [
	{
		id: "1",
		name: "Song One",
		artists: [{ name: "Artist One" }],
		album: { images: [{ url: "https://example.com/album1.jpg" }] },
		explicit: false,
		preview_url: "https://example.com/preview1.mp3",
		uri: "spotify:track:1",
		duration_ms: 210000, // 3 minutes and 30 seconds
		albumArtUrl: "https://example.com/album1.jpg",
	},
	{
		id: "2",
		name: "Song Two",
		artists: [{ name: "Artist Two" }],
		album: { images: [{ url: "https://example.com/album2.jpg" }] },
		explicit: true,
		preview_url: "https://example.com/preview2.mp3",
		uri: "spotify:track:2",
		duration_ms: 180000, // 3 minutes
		albumArtUrl: "https://example.com/album2.jpg",
	},
	{
		id: "3",
		name: "Song Three",
		artists: [{ name: "Artist Three" }],
		album: { images: [{ url: "https://example.com/album3.jpg" }] },
		explicit: false,
		preview_url: "https://example.com/preview3.mp3",
		uri: "spotify:track:3",
		duration_ms: 240000, // 4 minutes
		albumArtUrl: "https://example.com/album3.jpg",
	},
];

const Playlist = () => {
	const {
		roomControls,
		currentUser,
		enterDM,
		leaveDM,
		dmControls,
		dmsConnected,
		dmsReceived,
		dmParticipants,
		directMessages,
		roomQueue,
	} = useLive();
	const router = useRouter();
	const { Room_id, mine } = useLocalSearchParams();
	const isMine = mine === "true";

	// Function to handle voting
	// const handleVoteChange = (index: number, newVoteCount: number) => {
	// 	const songs = [...playlist];
	// 	songs[index].score = newVoteCount;

	// 	const sortedPlaylist = [...playlist]
	// 		.map((track, i) => ({ track, index: i }))
	// 		.sort((a, b) => {
	// 			const aScore: number = a.track.score || 0;
	// 			const bScore: number = b.track.score || 0;
	// 			if (aScore === bScore) return a.index - b.index; // Keep original order for same votes
	// 			return bScore - aScore; // Sort descending by votes
	// 		})
	// 		.map((item) => item.track);

	// 	// Ensure songs don't move above the current track index
	// 	const finalPlaylist = [
	// 		...sortedPlaylist.slice(0, Number(currentTrackIndex) + 1),
	// 		...sortedPlaylist.slice(Number(currentTrackIndex) + 1),
	// 	];
	// 	setPlaylist(finalPlaylist);
	// };

	const navigateToAddSong = () => {
		console.log("curr room_id:", Room_id);
		router.navigate({
			pathname: "/screens/rooms/EditPlaylist",
			params: {
				Room_id: Room_id,
				isMine: mine,
			},
		});
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
				>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.pageName}>Queue</Text>
			</View>
			<View style={styles.songListContainer}>
				{roomQueue.length > 0 ? (
					roomQueue.map((track, index) => (
						<SongList key={index} track={track} showVoting={true} />
					))
				) : (
					<View style={styles.emptyQueueContainer}>
						<Text style={styles.emptyQueueText}>
							The queue is empty.{" "}
							{isMine
								? "Add some songs to get started!"
								: "Wait for the host to add some songs."}
						</Text>
					</View>
				)}
			</View>
			<TouchableOpacity style={styles.addButton} onPress={navigateToAddSong}>
				{isMine ? (
					<Text style={styles.addButtonText}>Manage queue</Text>
				) : (
					<Text style={styles.addButtonText}>Add Song</Text>
				)}
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 16,
	},
	backButton: {
		position: "absolute",
		left: 0,
	},
	pageName: {
		fontSize: 24,
		fontWeight: "bold",
	},
	songListContainer: {
		flex: 1,
		marginTop: 16,
	},
	emptyQueueContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	emptyQueueText: {
		fontSize: 18,
		textAlign: "center",
		color: "#888",
	},
	addButtonContainer: {
		alignItems: "center",
		padding: 16,
	},
	addButton: {
		backgroundColor: "#08BDBD",
		borderRadius: 24,
		paddingVertical: 15,
		alignItems: "center",
		marginTop: 20,
		width: "95%",
		marginBottom: 15,
	},
	addButtonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "white",
	},
});

export default Playlist;
