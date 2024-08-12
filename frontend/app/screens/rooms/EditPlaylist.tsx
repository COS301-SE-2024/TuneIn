import React, { useEffect, useState } from "react";
import {
	View,
	TextInput,
	ScrollView,
	StyleSheet,
	Text,
	Image,
	TouchableOpacity,
} from "react-native";
import SongCard from "../../components/Spotify/SongCard";
import { useSpotifySearch } from "../../hooks/useSpotifySearch";
import { useLocalSearchParams, useRouter } from "expo-router"; // Assuming useLocalSearchParams is correctly implemented
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import { live } from "../../services/Live";
import { colors } from "../../styles/colors";
import { Ionicons } from "@expo/vector-icons";

import { RoomSongDto } from "../../models/RoomSongDto";
import * as rs from "../../models/RoomSongDto";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { RoomDto } from "../../../api-client";

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
	const router = useRouter();
	const { currentTrackIndex, Room_id, mine } = useLocalSearchParams();
	console.log("passed in Room id:", Room_id);
	const [isMine, setIsMine] = useState<boolean>(false);
	const { searchResults, handleSearch } = useSpotifySearch();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [playlist, setPlaylist] = useState<RoomSongDto[]>(
		live.getLastRoomQueue(),
	);
	const [allSongs, setAllSongs] = useState<RoomSongDto[]>(playlist);
	const [addedSongs, setAddedSongs] = useState<Spotify.Track[]>([]);
	const [removedSongs, setRemovedSongs] = useState<Spotify.Track[]>([]);

	useEffect(() => {
		live.fetchRoomQueue(setPlaylist);
		setPlaylist(live.getLastRoomQueue());
		const room: RoomDto | null = live.getCurrentRoom();
		if (room) {
			setIsMine(live.roomIsMine());
		}
	}, []);

	const addToPlaylist = (track: RoomSongDto | Spotify.Track) => {
		if (!isMine && addedSongs.length >= 3) {
			alert("You can only add up to 3 songs.");
			return;
		}

		if (isSpotifyTrack(track)) {
			// if track is a Spotify track
			const song: RoomSongDto = {
				spotifyID: track.id,
				userID: "1", // TODO: get user ID
				track: track,
			};
			setPlaylist((prevPlaylist) => [...prevPlaylist, song]);
			setAllSongs((prevAllSongs) => [...prevAllSongs, song]);
			setAddedSongs((prevAddedSongs) => [...prevAddedSongs, track]);
		} else {
			setPlaylist((prevPlaylist) => [...prevPlaylist, track]);
			setAllSongs((prevAllSongs) => [...prevAllSongs, track]);
			const t: Spotify.Track | undefined = track.track;
			if (t) {
				setAddedSongs((prevAddedSongs) => [...prevAddedSongs, t]);
			}
		}
	};

	const removeFromPlaylist = (trackId: string) => {
		if (!isMine && !addedSongs.some((track) => track.id === trackId)) {
			alert("You can only remove songs that you added.");
			return;
		}

		const song: RoomSongDto | undefined = playlist.find(
			(song) => song.spotifyID === trackId,
		);
		if (song) {
			setRemovedSongs((prevRemovedSongs) => [
				...prevRemovedSongs,
				song.track as Spotify.Track,
			]);
		}

		setPlaylist((prevPlaylist) =>
			prevPlaylist.filter((track) => track.track && track.track.id !== trackId),
		);
		setAddedSongs((prevAddedSongs) =>
			prevAddedSongs.filter((track) => track.id !== trackId),
		);
	};

	const savePlaylist = async () => {
		console.log("Playlist saved:", playlist);
		console.log("in room :", Room_id);

		console.log("added songs:", addedSongs);
		console.log("removed songs:", removedSongs);

		try {
			/*
			const storedToken = await auth.getToken();
			const response = await fetch(
				`${utils.API_BASE_URL}/rooms/${Room_id}/songs`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${storedToken}`,
					},
					body: JSON.stringify(playlist),
				},
			);
			const data = await response.json();
			console.log("Playlist saved to backend:", data);
			*/
			for (let i = 0; i < removedSongs.length; i++) {
				const track = removedSongs[i];
				const song = allSongs.find((s) => s.spotifyID === track.id);
				if (song) {
					live.dequeueSong(song);
				}
			}
			for (let i = 0; i < addedSongs.length; i++) {
				const track = addedSongs[i];
				const song = allSongs.find((s) => s.spotifyID === track.id);
				if (song) {
					live.enqueueSong(song);
				}
			}
		} catch (error) {
			console.error("Error saving playlist:", error);
		}
		router.navigate({
			pathname: "/screens/rooms/Playlist",
			params: {
				currentTrackIndex,
				Room_id: Room_id,
				mine: mine,
			},
		});
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
				{playlist.map((song) => (
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
						{isMine ||
						addedSongs.some(
							(addedTrack) => addedTrack.id === rs.getID(song),
						) ? (
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
						isAdded={playlist.some(
							(selectedTrack) => selectedTrack.spotifyID === track.id,
						)}
						onRemove={() => removeFromPlaylist(track.id)}
					/>
				))}
			</ScrollView>

			{/* Save Button */}
			<TouchableOpacity
				style={styles.saveButton}
				onPress={savePlaylist}
				disabled={playlist.length === 0}
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
