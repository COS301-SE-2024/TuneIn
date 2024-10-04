import React, { useContext, useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
import SongList from "../../components/SongList"; // Import the SongList component
import { useLive } from "../../LiveContext";
import CreateButton from "../../components/CreateButton";
import { Player } from "../../PlayerContext";
import { SongPair, convertQueue } from "../../models/SongPair";
import { useSpotifyTracks } from "../../hooks/useSpotifyTracks";

const Playlist = () => {
	const { roomQueue, spotifyAuth } = useLive();
	const { fetchSongInfo } = useSpotifyTracks(spotifyAuth);
	const router = useRouter();
	const playerContext = useContext(Player);
	const [localQueue, setLocalQueue] = useState<SongPair[]>([]);

	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}
	const { currentRoom } = playerContext;
	const isMine = currentRoom?.mine ? "true" : "false";

	console.log("curr room_id:", isMine);
	const navigateToAddSong = () => {
		console.log("curr room_id:", isMine);
		router.navigate({
			pathname: "/screens/rooms/EditPlaylist",
			params: {
				Room_id: currentRoom?.roomID,
				isMine: isMine,
			},
		});
	};

	useEffect(() => {
		console.log(`Playlist page room queue`);
		if (localQueue.length !== roomQueue.length) {
			console.log(`Local queue length is wrong. Updating...`);
			fetchSongInfo(roomQueue.map((s) => s.spotifyID)).then((tracks) => {
				setLocalQueue(convertQueue(roomQueue, tracks));
			});
		}
		if (localQueue.length === roomQueue.length) {
			let differenceFound = false;
			for (let i = 0; i < localQueue.length; i++) {
				if (localQueue[i].song.spotifyID !== roomQueue[i].spotifyID) {
					differenceFound = true;
					break;
				}
			}
			if (differenceFound) {
				console.log(`Local queue is different. Updating...`);
				fetchSongInfo(roomQueue.map((s) => s.spotifyID)).then((tracks) => {
					setLocalQueue(convertQueue(roomQueue, tracks));
				});
			}
		}
	}, [fetchSongInfo, roomQueue]);

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
				{localQueue.length > 0 ? (
					<ScrollView>
						{localQueue.map((s, index) => (
							<SongList key={s.song.index} song={s} showVoting={true} />
						))}
					</ScrollView>
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
	containerButton: {
		flex: 1,
		justifyContent: "flex-end", // Aligns the button at the bottom
		paddingBottom: 20,
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
