import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SongList from '../../components/SongList'; // Import the SongList component

interface Track {
	id: string;
	name: string;
	artistNames: string;
	albumArtUrl: string;
	voteCount: number;
	showVoting: boolean;
}

const Playlist = () => {
	const router = useRouter();
	const { queue, currentTrackIndex, Room_id, mine } = useLocalSearchParams();
	const isMine = mine === "true";
	const [playlist, setPlaylist] = useState<Track[]>([]);

	useEffect(() => {
		if (typeof queue === "string") {
			const parsedQueue = JSON.parse(queue) as Track[];
			setPlaylist(parsedQueue);
		} else if (Array.isArray(queue)) {
			setPlaylist(queue);
		}
	}, [queue]);

	useEffect(() => {
		console.log("Current Track Index:", Number(currentTrackIndex));
	}, [currentTrackIndex]);

	const navigateToAddSong = () => {
		console.log("curr room_id:", Room_id);
		router.navigate({
			pathname: "/screens/rooms/EditPlaylist",
			params: {
				queue: queue,
				currentTrackIndex: currentTrackIndex,
				Room_id: Room_id,
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
				{playlist.map((track, index) => (
					<SongList
						key={index}
						songNumber={index + 1}
						songName={track.name}
						artist={track.artistNames}
						albumCoverUrl={track.albumArtUrl}
						voteCount={track.voteCount}
						showVoting={track.showVoting}
						index={index}
						isCurrent={index === Number(currentTrackIndex)} // Check if current song
					/>
				))}
			</View>
			{isMine ? (
				<View style={styles.addButtonContainer}>
					<TouchableOpacity
						style={styles.addButton}
						onPress={navigateToAddSong}
					>
						<Text style={styles.addButtonText}>Add Song</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View></View>
			)}
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
