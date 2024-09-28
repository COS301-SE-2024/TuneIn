import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
import SongList from "../../components/SongList"; // Import the SongList component
import { Track } from "../../models/Track";
import { RoomSongDto } from "../../models/RoomSongDto";
import { useLive } from "../../LiveContext";
import { VoteDto } from "../../models/VoteDto";
import CreateButton from "../../components/CreateButton";

const Playlist = () => {
	const { roomQueue } = useLive();
	const router = useRouter();
	const { Room_id, mine } = useLocalSearchParams();
	const isMine = mine === "true";

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
			{/* RoomTab component */}
			{/* <RoomTab activeTab="Queue" setActiveTab={() => {}} />{" "} */}
			{/* Set activeTab to "Queue" */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
					testID="back-button"
				>
					{/* <Ionicons name="chevron-back" size={24} color="black" /> */}
				</TouchableOpacity>
				{/* <Text style={styles.pageName}>Queue</Text> */}
			</View>
			<View style={styles.songListContainer}>
				{roomQueue.length > 0 ? (
					roomQueue.map((track, index) => (
						<SongList key={track.index} track={track} showVoting={true} />
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
			{/* <TouchableOpacity style={styles.addButton} onPress={navigateToAddSong}>
				{isMine ? (
					<Text style={styles.addButtonText}>Manage queue</Text>
				) : (
					<Text style={styles.addButtonText}>Add Song</Text>
				)}
			</TouchableOpacity> */}
			<CreateButton
				title={isMine ? "Manage queue" : "Add Song"}
				onPress={navigateToAddSong}
			/>
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
