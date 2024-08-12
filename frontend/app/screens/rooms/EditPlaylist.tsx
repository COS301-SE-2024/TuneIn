import React, { useState } from "react";
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

import { RoomSongDto } from "../../models/RoomSongDto";
import * as rs from "../../models/RoomSongDto";
import * as Spotify from "@spotify/web-api-ts-sdk";

/*
interface Track {
	id: string;
	name: string;
	artists: { name: string }[];
	album: { images: { url: string }[] };
	explicit: boolean;
	preview_url: string; // URL for previewing the song
	uri: string; // URI used to play the song
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
	const { Room_id } = useLocalSearchParams(); // Assuming useLocalSearchParams returns roomId and playlists
	console.log("passed in Room id:", Room_id);
	const { searchResults, handleSearch } = useSpotifySearch();
	/*
	const parseInitialPlaylist = (data: string | string[]): RoomSongDto[] => {
		if (typeof data === "string") {
			try {
				const parsed = JSON.parse(data);
				if (
					Array.isArray(parsed) &&
					parsed.every((item) => typeof item === "object")
				) {
					return parsed as RoomSongDto[];
				} else {
					console.error("Parsed data is not an array of objects");
					return [];
				}
			} catch (error) {
				console.error("Failed to parse initial playlist:", error);
				return [];
			}
		} else if (Array.isArray(data)) {
			return data.map((item) => {
				if (typeof item === "string") {
					// Assuming item is a JSON string that represents a RoomSongDto object
					try {
						const parsedItem = JSON.parse(item);
						if (typeof parsedItem === "object") {
							return parsedItem as RoomSongDto;
						} else {
							console.error("Parsed item is not an object");
							return {} as RoomSongDto;
						}
					} catch (error) {
						console.error("Failed to parse playlist item:", error);
						return {} as RoomSongDto;
					}
				} else if (typeof item === "object") {
					return item as RoomSongDto;
				} else {
					console.error("Item is not a string or object");
					return {} as RoomSongDto;
				}
			});
		}
		return [];
	};
	*/

	const [searchQuery, setSearchQuery] = useState<string>("");
	const [playlist, setPlaylist] = useState<RoomSongDto[]>(
		live.getLastRoomQueue(),
	);

	const addToPlaylist = (track: RoomSongDto | Spotify.Track) => {
		if (isSpotifyTrack(track)) {
			// if track is a Spotify track
			const song: RoomSongDto = {
				spotifyID: track.id,
				userID: "user-id", // Replace with actual user ID
				track: track,
			};
			setPlaylist((prevPlaylist) => [...prevPlaylist, song]);
		} else {
			setPlaylist((prevPlaylist) => [...prevPlaylist, track]);
		}
	};

	const removeFromPlaylist = (trackId: string) => {
		setPlaylist((prevPlaylist) =>
			prevPlaylist.filter((track) => track.track && track.track.id !== trackId),
		);
	};

	const savePlaylist = async () => {
		console.log("Playlist saved:", playlist);
		console.log("in room :", Room_id);

		// Add logic to save the playlist to the backend if necessary
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
			for (let i = 0; i < playlist.length; i++) {
				const song = playlist[i];
				const track = song.track;
				if (track) {
					live.enqueueSong(song);
				}
			}
		} catch (error) {
			console.error("Error saving playlist:", error);
		}
		router.back();
	};

	const playPreview = (previewUrl: string) => {
		const audio = new Audio(previewUrl);
		audio.play();
		console.log("Playing preview:", previewUrl);
	};

	return (
		<View style={styles.container}>
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
						<TouchableOpacity
							style={styles.removeButton}
							onPress={() => removeFromPlaylist(rs.getID(song))}
						>
							<Text style={styles.buttonText}>Remove</Text>
						</TouchableOpacity>
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
						onRemove={() => removeFromPlaylist(track.id)}
						isAdded={playlist.some(
							(selectedTrack) => selectedTrack.spotifyID === track.id,
						)}
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
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 15,
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
		backgroundColor: "#8b8fa8",
		borderRadius: 30,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		elevation: 5,
		marginTop: 20,
	},
	removeButton: {
		backgroundColor: "red",
		borderRadius: 30,
		height: 30,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 10,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default EditPlaylist;
