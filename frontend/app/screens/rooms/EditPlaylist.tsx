import React, { useEffect, useState } from "react";
import {
	View,
	TextInput,
	ScrollView,
	StyleSheet,
	Text,
	Image,
	TouchableOpacity,
	ToastAndroid,
} from "react-native";
import SongCard from "../../components/Spotify/SongCard";
import { useSpotifySearch } from "../../hooks/useSpotifySearch";
import { useLocalSearchParams, useRouter } from "expo-router"; // Assuming useLocalSearchParams is correctly implemented
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import { useLive } from "../../LiveContext";
import { colors } from "../../styles/colors";
import { Ionicons } from "@expo/vector-icons";

import { RoomSongDto } from "../../models/RoomSongDto";
import * as rs from "../../models/RoomSongDto";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { RoomDto } from "../../../api";
import { set } from "react-datepicker/dist/date_utils";

/*
interface Track {
	id: string;
	name: string;
	artists: { name: string }[];
	album: { images: { url: string }[] };
	explicit: boolean;
	preview_url: string;
	uri: string;
	duration_ms: number;
}

interface SimplifiedTrack {
	id: string;
	name: string;
	artistNames: string;
	albumArtUrl: string;
	explicit: boolean;
	preview_url: string;
	uri: string;
	duration_ms: number;
}
*/
// Type guard for Spotify.Track
function isSpotifyTrack(track: any): track is Spotify.Track {
	return (
		(track as Spotify.Track).id !== undefined &&
		(track as Spotify.Track).track === undefined
	);
}

const EditPlaylist: React.FC = () => {
	const { roomControls, currentUser, currentRoom, roomQueue } = useLive();
	const router = useRouter();
	const { Room_id, mine } = useLocalSearchParams();
	console.log("passed in Room id:", Room_id);
	const { searchResults, handleSearch } = useSpotifySearch();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [addedSongs, setAddedSongs] = useState<Spotify.Track[]>([]);
	const [removedSongs, setRemovedSongs] = useState<Spotify.Track[]>([]);
	const [newQueue, setNewQueue] = useState<RoomSongDto[]>([]);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

	// useEffect(() => {
	// 	roomControls.requestRoomQueue();
	// }, []);

	useEffect(() => {
		if (!unsavedChanges) {
			setNewQueue(roomQueue);
		} else {
			if (!currentUser) {
				console.error("Current user not found.");
				return;
			}
			const tempQueue = roomQueue;
			for (let i = 0; i < removedSongs.length; i++) {
				const track = removedSongs[i];
				const song = tempQueue.find((s) => s.spotifyID === track.id);
				if (song) {
					const index = tempQueue.indexOf(song);
					tempQueue.splice(index, 1);
				}
			}
			for (let i = 0; i < addedSongs.length; i++) {
				const track = addedSongs[i];
				const song = tempQueue.find((s) => s.spotifyID === track.id);
				if (!song) {
					const newSong: RoomSongDto = {
						spotifyID: track.id,
						userID: currentUser.userID,
						track: track,
						index: tempQueue.length,
					};
					tempQueue.push(newSong);
				}
			}
			setNewQueue(tempQueue);
		}
	}, [addedSongs, currentUser, removedSongs, roomQueue, unsavedChanges]);

	const addToPlaylist = (track: RoomSongDto | Spotify.Track) => {
		if (!currentUser) {
			console.error("Current user not found.");
			return;
		}
		// if (!isMine && addedSongs.length >= 3) {
		// 	alert("You can only add up to 3 songs.");
		// 	return;
		// }

		if (isSpotifyTrack(track)) {
			// if track is a Spotify track
			const song: RoomSongDto = {
				spotifyID: track.id,
				userID: currentUser.userID,
				track: track,
				index: newQueue.length,
			};
			setNewQueue((prevQueue) => [...prevQueue, song]);
			setAddedSongs((prevAddedSongs) => [...prevAddedSongs, track]);
		} else {
			setNewQueue((prevQueue) => [...prevQueue, track]);
			const t: Spotify.Track | undefined = track.track;
			if (t) {
				setAddedSongs((prevAddedSongs) => [...prevAddedSongs, t]);
			}
		}
		setUnsavedChanges(true);
	};

	const removeFromPlaylist = (trackId: string) => {
		if (!currentUser) {
			console.error("Current user not found.");
			return;
		}
		const s: RoomSongDto | undefined = newQueue.find(
			(song) => song.spotifyID === trackId,
		);
		if (!s) {
			console.error("Song not found in queue.");
			return;
		}
		if (
			s &&
			s.userID !== currentUser.userID &&
			!roomControls.canControlRoom()
		) {
			alert("You can only remove songs that you added.");
			return;
		}

		setRemovedSongs((prevRemovedSongs) => [
			...prevRemovedSongs,
			s.track as Spotify.Track,
		]);
		setNewQueue((prevQueue) =>
			prevQueue.filter((song) => song.spotifyID !== trackId),
		);
		setAddedSongs((prevAddedSongs) =>
			prevAddedSongs.filter((track) => track.id !== trackId),
		);
		setUnsavedChanges(true);
	};

	const savePlaylist = async () => {
		console.log("room queue:", roomQueue);
		console.log("New queue:", newQueue);
		console.log("in room :", Room_id);

		console.log("added songs:", addedSongs);
		console.log("removed songs:", removedSongs);

		if (unsavedChanges) {
			try {
				const enqueue: RoomSongDto[] = [];
				for (let i = 0; i < addedSongs.length; i++) {
					const track = addedSongs[i];
					const song = newQueue.find((s) => s.spotifyID === track.id);
					if (song) {
						enqueue.push(song);
					}
				}
				console.log("enqueue:", enqueue);
				if (enqueue.length > 0) roomControls.queue.enqueueSongs(enqueue);

				const dequeue: RoomSongDto[] = [];
				for (let i = 0; i < removedSongs.length; i++) {
					const track = removedSongs[i];
					dequeue.push({
						spotifyID: track.id,
						userID: currentUser?.userID || "",
						track: track,
						index: -1,
					});
				}
				console.log("dequeue:", dequeue);
				if (dequeue.length > 0) roomControls.queue.dequeueSongs(dequeue);

				setUnsavedChanges(false);
			} catch (error) {
				console.error("Error saving playlist:", error);
			}
		}
		router.navigate("/screens/(tabs)/Home");
	};

	const clearQueue = () => {
		roomControls.queue.dequeueSongs(roomQueue);
	};

	const playPreview = (previewUrl: string) => {
		const audio = new Audio(previewUrl);
		audio.play();
		console.log("Playing preview:", previewUrl);
	};

	return (
		<View style={styles.container}>
			<View>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
					testID="back"
				>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
			</View>
			<TextInput
				style={styles.input}
				placeholder="Search for songs..."
				value={searchQuery}
				onChangeText={setSearchQuery}
			/>
			<TouchableOpacity
				style={styles.searchButton}
				onPress={() => handleSearch(searchQuery)}
			>
				<Text style={styles.buttonText}>Search</Text>
			</TouchableOpacity>

			{/* Selected Playlist Section */}
			<ScrollView style={styles.selectedContainer}>
				<Text style={styles.sectionTitle}>Selected Tracks</Text>
				{newQueue.map((song) => (
					<View key={rs.getID(song)} style={styles.trackContainer}>
						<Image
							source={{ uri: rs.getAlbumArtUrl(song) }}
							style={styles.albumArt}
						/>
						<View style={styles.trackInfo}>
							<Text style={styles.trackName}>{rs.getTitle(song)}</Text>
							<Text style={styles.artistNames}>
								{rs.constructArtistString(song)}
							</Text>
							{rs.getExplicit(song) && (
								<Text style={styles.explicitTag}>Explicit</Text>
							)}
						</View>
						{currentRoom?.creator.userID === currentUser?.userID ||
						song.userID === currentUser?.userID ? (
							<TouchableOpacity
								style={styles.removeButton}
								onPress={() => removeFromPlaylist(rs.getID(song))}
							>
								<Text style={styles.buttonText}>Remove</Text>
							</TouchableOpacity>
						) : null}
					</View>
				))}
			</ScrollView>

			{/* Search Results Section */}
			<ScrollView style={styles.resultsContainer}>
				{searchResults.map((track: Spotify.Track) => (
					<SongCard
						key={track.id}
						track={track}
						onPlay={() => playPreview(track.preview_url || "")}
						onAdd={() => addToPlaylist(track)}
						isAdded={addedSongs.some(
							(selectedTrack) => selectedTrack.id === track.id,
						)}
						onRemove={() => removeFromPlaylist(track.id)}
					/>
				))}
			</ScrollView>

			{/* Clear Button */}
			{currentRoom?.creator.userID === currentUser?.userID && (
				<TouchableOpacity style={styles.clearButton} onPress={clearQueue}>
					<Text style={styles.buttonText}>Clear Queue</Text>
				</TouchableOpacity>
			)}

			{/* Save Button */}
			<TouchableOpacity
				style={styles.saveButton}
				onPress={savePlaylist}
				disabled={!unsavedChanges}
			>
				<Text style={styles.buttonText}>Save Playlist</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#fff",
	},
	backButton: {
		position: "absolute",
		left: 0,
		top: -10,
	},
	input: {
		marginTop: 30,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 20,
		padding: 10,
		marginBottom: 15,
	},
	selectedContainer: {
		maxHeight: 200,
		marginBottom: 10,
		borderColor: "#ddd",
		borderWidth: 1,
		borderRadius: 15,
		padding: 10,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	trackContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	albumArt: {
		width: 50,
		height: 50,
		marginRight: 10,
		borderRadius: 5,
	},
	trackInfo: {
		flex: 1,
	},
	trackName: {
		fontSize: 16,
		fontWeight: "bold",
	},
	artistNames: {
		fontSize: 14,
		color: "#666",
	},
	explicitTag: {
		fontSize: 12,
		color: "red",
		marginTop: 5,
	},
	resultsContainer: {
		flex: 1,
	},
	searchButton: {
		backgroundColor: colors.primary,
		borderRadius: 30,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		elevation: 5,
		marginTop: 5,
		marginBottom: 10,
	},
	clearButton: {
		backgroundColor: colors.secondary,
		borderRadius: 30,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		elevation: 5,
		marginTop: 10,
	},
	saveButton: {
		backgroundColor: colors.secondary,
		borderRadius: 30,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		elevation: 5,
		marginTop: 10,
	},
	removeButton: {
		backgroundColor: "#ff5c5c",
		borderRadius: 30,
		height: 30,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 15,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
	},
});

export default EditPlaylist;
