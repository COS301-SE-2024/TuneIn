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
import * as Spotify from "@spotify/web-api-ts-sdk";
import { useSpotifyTracks } from "../../hooks/useSpotifyTracks";
import { RoomSongDto } from "../../../api";
import {
	SongPair,
	constructArtistString,
	getAlbumArtUrl,
	getTitle,
	convertQueue,
	getExplicit,
	getID,
} from "../../models/SongPair";

const EditPlaylist: React.FC = () => {
	const { roomControls, currentUser, currentRoom, roomQueue, spotifyAuth } =
		useLive();
	const router = useRouter();
	const { fetchSongInfo, addSongsToCache } = useSpotifyTracks(spotifyAuth);
	const { Room_id, mine } = useLocalSearchParams();
	console.log("passed in Room id:", Room_id);
	const { searchResults, handleSearch } = useSpotifySearch();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [addedSongs, setAddedSongs] = useState<Spotify.Track[]>([]);
	const [removedSongs, setRemovedSongs] = useState<Spotify.Track[]>([]);
	const [newQueue, setNewQueue] = useState<SongPair[]>([]);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

	// useEffect(() => {
	// 	roomControls.requestRoomQueue();
	// }, []);

	useEffect(() => {
		if (searchQuery.length > 2) {
			handleSearch(searchQuery);
		}
	}, [searchQuery]);

	useEffect(() => {
		if (!unsavedChanges) {
			fetchSongInfo(roomQueue.map((song) => song.spotifyID)).then(
				(tracks: Spotify.Track[]) => {
					setNewQueue(convertQueue(roomQueue, tracks));
				},
			);
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
						index: tempQueue.length,
						insertTime: Date.now().valueOf(),
						score: 0,
						playlistIndex: -1,
					};
					tempQueue.push(newSong);
				}
			}
			fetchSongInfo(tempQueue.map((song) => song.spotifyID)).then(
				(tracks: Spotify.Track[]) => {
					setNewQueue(convertQueue(tempQueue, tracks));
				},
			);
		}
	}, [addedSongs, currentUser, removedSongs, roomQueue, unsavedChanges]);

	const addToPlaylist = (track: Spotify.Track) => {
		if (!currentUser) {
			console.error("Current user not found.");
			return;
		}
		// if (!isMine && addedSongs.length >= 3) {
		// 	alert("You can only add up to 3 songs.");
		// 	return;
		// }

		// if track is a Spotify track
		const song: RoomSongDto = {
			spotifyID: track.id,
			userID: currentUser.userID,
			index: newQueue.length,
			insertTime: Date.now().valueOf(),
			score: 0,
			playlistIndex: -1,
		};
		setNewQueue((prevQueue) => [...prevQueue, { song: song, track: track }]);
		setAddedSongs((prevAddedSongs) => [...prevAddedSongs, track]);
		setUnsavedChanges(true);
		addSongsToCache([track]);
	};

	const removeFromPlaylist = (trackId: string) => {
		if (!currentUser) {
			console.error("Current user not found.");
			return;
		}
		const s: SongPair | undefined = newQueue.find(
			(song) => song.song.spotifyID === trackId || song.track.id === trackId,
		);
		if (!s) {
			console.error("Song not found in queue.");
			return;
		}
		if (
			s &&
			s.song.userID !== currentUser.userID &&
			!roomControls.canControlRoom()
		) {
			alert("You can only remove songs that you added.");
			return;
		}

		fetchSongInfo([trackId]).then(([track]: Spotify.Track[]) => {
			setRemovedSongs((prevRemovedSongs) => [
				...prevRemovedSongs,
				track as Spotify.Track,
			]);
		});
		setNewQueue((prevQueue) =>
			prevQueue.filter(
				(song) => song.song.spotifyID !== trackId && song.track.id !== trackId,
			),
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
					const song = newQueue.find(
						(s) => s.song.spotifyID === track.id || s.track.id === track.id,
					);
					if (song) {
						enqueue.push(song.song);
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
						index: -1,
						insertTime: 0,
						score: 0,
						playlistIndex: -1,
					} as RoomSongDto);
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
			<View style={styles.headerContainer}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
					testID="back"
				>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<View style={styles.searchContainer}>
					<TextInput
						style={styles.input}
						placeholder="Search for songs..."
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
					<Ionicons
						name="search"
						size={24}
						color={colors.primary}
						style={styles.searchIcon}
					/>
				</View>
			</View>
			<ScrollView style={styles.selectedContainer}>
				<Text style={styles.sectionTitle}>Selected Tracks</Text>
				{newQueue.map((song) => (
					<View key={getID(song)} style={styles.trackContainer}>
						<Image
							source={{ uri: getAlbumArtUrl(song) }}
							style={styles.albumArt}
						/>
						<View style={styles.trackInfo}>
							<Text style={styles.trackName}>{getTitle(song)}</Text>
							<Text style={styles.artistNames}>
								{constructArtistString(song)}
							</Text>
							{getExplicit(song) && (
								<Text style={styles.explicitTag}>Explicit</Text>
							)}
						</View>
						{currentRoom?.creator.userID === currentUser?.userID ||
						song.song.userID === currentUser?.userID ? (
							<TouchableOpacity
								style={styles.removeButton}
								onPress={() => removeFromPlaylist(getID(song))}
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

			{/* Button Row for Clear and Save */}
			<View style={styles.buttonRow}>
				{currentRoom?.creator.userID === currentUser?.userID && (
					<TouchableOpacity style={styles.clearButton} onPress={clearQueue}>
						<Text style={styles.buttonText}>Clear Queue</Text>
					</TouchableOpacity>
				)}

				<TouchableOpacity
					style={[styles.saveButton, !unsavedChanges && styles.disabledButton]}
					onPress={savePlaylist}
					disabled={!unsavedChanges}
				>
					<Text style={styles.buttonText}>Save Playlist</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#fff",
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		// marginBottom: 20,
	},
	backButton: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		height: 40,
	},
	selectedContainer: {
		maxHeight: "40%",
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
	searchContainer: {
		flex: 1,
		marginTop: 20,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 56,
		paddingHorizontal: 15,
	},
	searchIcon: {
		marginLeft: 10,
	},
	buttonRow: {
		flexDirection: "row", // Align buttons in a row
		justifyContent: "space-between", // Evenly space the buttons
		marginTop: 10,
	},
	clearButton: {
		backgroundColor: colors.secondary,
		borderRadius: 30,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		elevation: 5,
		paddingHorizontal: 20, // Added padding for better spacing
		flex: 1, // Take up equal space as save button
		marginRight: 10,
	},
	saveButton: {
		backgroundColor: colors.primary,
		borderRadius: 30,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		elevation: 5,
		paddingHorizontal: 20, // Added padding for better spacing
		flex: 1, // Take up equal space
	},
	disabledButton: {
		backgroundColor: "#cccccc", // Lighter background for disabled state
	},
	removeButton: {
		backgroundColor: "black",
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
