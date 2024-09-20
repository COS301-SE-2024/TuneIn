import React, { useState } from "react";
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
import { colors } from "../../styles/colors";
import { Ionicons } from "@expo/vector-icons";

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

const EditPlaylist: React.FC = () => {
	const router = useRouter();
	const { Room_id, queue, isMine } = useLocalSearchParams();
	const { searchResults, handleSearch } = useSpotifySearch();
	console.log("is Mine: " + isMine);

	const parseInitialPlaylist = (data: string | string[]): SimplifiedTrack[] => {
		if (typeof data === "string") {
			try {
				const parsed = JSON.parse(data);
				if (
					Array.isArray(parsed) &&
					parsed.every((item) => typeof item === "object")
				) {
					return parsed as SimplifiedTrack[];
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
					try {
						const parsedItem = JSON.parse(item);
						if (typeof parsedItem === "object") {
							return parsedItem as SimplifiedTrack;
						} else {
							console.error("Parsed item is not an object");
							return {} as SimplifiedTrack;
						}
					} catch (error) {
						console.error("Failed to parse playlist item:", error);
						return {} as SimplifiedTrack;
					}
				} else if (typeof item === "object") {
					return item as SimplifiedTrack;
				} else {
					console.error("Item is not a string or object");
					return {} as SimplifiedTrack;
				}
			});
		}
		return [];
	};

	const [searchQuery, setSearchQuery] = useState<string>("");
	const [playlist, setPlaylist] = useState<SimplifiedTrack[]>(() =>
		parseInitialPlaylist(queue),
	);
	const [addedSongs, setAddedSongs] = useState<SimplifiedTrack[]>([]);

	const addToPlaylist = (track: Track) => {
		if (!isMine && addedSongs.length >= 3) {
			alert("You can only add up to 3 songs.");
			return;
		}

		const simplifiedTrack: SimplifiedTrack = {
			id: track.id,
			name: track.name,
			artistNames: track.artists.map((artist) => artist.name).join(", "),
			albumArtUrl: track.album.images[0].url,
			explicit: track.explicit,
			preview_url: track.preview_url,
			uri: track.uri,
			duration_ms: track.duration_ms,
		};

		setPlaylist((prevPlaylist) => [...prevPlaylist, simplifiedTrack]);
		if (!isMine) {
			setAddedSongs((prevAddedSongs) => [...prevAddedSongs, simplifiedTrack]);
		}
	};

	const removeFromPlaylist = (trackId: string) => {
		if (!isMine && !addedSongs.some((track) => track.id === trackId)) {
			alert("You can only remove songs that you added.");
			return;
		}

		setPlaylist((prevPlaylist) =>
			prevPlaylist.filter((track) => track.id !== trackId),
		);

		if (!isMine) {
			setAddedSongs((prevAddedSongs) =>
				prevAddedSongs.filter((track) => track.id !== trackId),
			);
		}
	};

	const savePlaylist = async () => {
		console.log("Playlist saved:", playlist);
		console.log("in room :", Room_id);

		try {
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
		} catch (error) {
			console.log("Error saving playlist:", error);
			ToastAndroid.show("Failed to save playlist", ToastAndroid.SHORT);
		}
		router.navigate("/screens/Home");
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
				{playlist.map((track) => (
					<View key={track.id} style={styles.trackContainer}>
						<Image
							source={{ uri: track.albumArtUrl }}
							style={styles.albumArt}
						/>
						<View style={styles.trackInfo}>
							<Text style={styles.trackName}>{track.name}</Text>
							<Text style={styles.artistNames}>{track.artistNames}</Text>
							{track.explicit && (
								<Text style={styles.explicitTag}>Explicit</Text>
							)}
						</View>
						{isMine ||
						addedSongs.some((addedTrack) => addedTrack.id === track.id) ? (
							<TouchableOpacity
								style={styles.removeButton}
								onPress={() => removeFromPlaylist(track.id)}
							>
								<Text style={styles.buttonText}>Remove</Text>
							</TouchableOpacity>
						) : null}
					</View>
				))}
			</ScrollView>

			{/* Search Results Section */}
			<ScrollView style={styles.resultsContainer}>
				{searchResults.map((track) => (
					<SongCard
						key={track.id}
						track={track}
						onPlay={() => playPreview(track.preview_url)}
						onAdd={() => addToPlaylist(track)}
						isAdded={playlist.some(
							(selectedTrack) => selectedTrack.id === track.id,
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
