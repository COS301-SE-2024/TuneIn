import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import RoomTab from "../../components/RoomTab";
import SongList from "../../components/SongList"; // Import the SongList component
import { Track } from "../../models/Track";
import CreateButton from "../../components/CreateButton";

const Playlist = () => {
	const router = useRouter();
	const { queue, currentTrackIndex, Room_id, mine } = useLocalSearchParams();
	const isMine = mine === "true";
	const [playlist, setPlaylist] = useState<Track[]>([]);
	const [votes, setVotes] = useState<number[]>([]); // Track votes for each song

	useEffect(() => {
		try {
			if (typeof queue === "string") {
				const parsedQueue = JSON.parse(queue) as Track[];
				setPlaylist(parsedQueue);
				setVotes(new Array(parsedQueue.length).fill(0)); // Initialize votes array
			} else if (Array.isArray(queue)) {
				const parsedQueue = queue.map((item) => JSON.parse(item) as Track);
				setPlaylist(parsedQueue);
				setVotes(new Array(parsedQueue.length).fill(0)); // Initialize votes array
			}
		} catch (error) {
			console.error("Failed to parse queue:", error);
		}
	}, [queue]);

	// Function to handle voting
	const handleVoteChange = (index: number, newVoteCount: number) => {
		const updatedVotes = [...votes];
		updatedVotes[index] = newVoteCount;

		const sortedPlaylist = [...playlist]
			.map((track, i) => ({ track, vote: updatedVotes[i], index: i }))
			.sort((a, b) => {
				if (a.vote === b.vote) return a.index - b.index; // Keep original order for same votes
				return b.vote - a.vote; // Sort descending by votes
			})
			.map((item) => item.track);

		// Ensure songs don't move above the current track index
		const finalPlaylist = [
			...sortedPlaylist.slice(0, Number(currentTrackIndex) + 1),
			...sortedPlaylist.slice(Number(currentTrackIndex) + 1),
		];

		setVotes(updatedVotes);
		setPlaylist(finalPlaylist);
	};

	const navigateToAddSong = () => {
		console.log("curr room_id:", Room_id);
		router.navigate({
			pathname: "/screens/rooms/EditPlaylist",
			params: {
				queue: queue,
				currentTrackIndex: currentTrackIndex,
				Room_id: Room_id,
				isMine: mine,
			},
		});
	};

	return (
		<View style={styles.container}>
			{/* RoomTab component */}
			<RoomTab activeTab="Queue" setActiveTab={() => {}} />{" "}
			{/* Set activeTab to "Queue" */}
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
				{playlist.length > 0 ? (
					playlist.map((track, index) => (
						<SongList
							key={index}
							songNumber={index + 1}
							track={track}
							voteCount={votes[index]}
							showVoting={true}
							index={index}
							isCurrent={index === Number(currentTrackIndex)}
							swapSongs={() => {}} // Not needed here
							setVoteCount={(newVoteCount) =>
								handleVoteChange(index, newVoteCount)
							}
						/>
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
		backgroundColor: "white",
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
