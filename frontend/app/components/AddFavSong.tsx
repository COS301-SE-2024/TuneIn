import React, { useEffect, useState } from "react";
import {
	View,
	TextInput,
	ScrollView,
	StyleSheet,
	Text,
	Image,
	TouchableOpacity,
	Modal,
} from "react-native";
import SongCard from "./Spotify/SongCard";
import { useSpotifySearch } from "../hooks/useSpotifySearch";
import { colors } from "../styles/colors";

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

interface FavSongProps {
	visible: boolean;
	handleSave: (songInfo: any) => void;
}

const AddFavSong: React.FC<FavSongProps> = ({ visible, handleSave }) => {
	const { searchResults, handleSearch } = useSpotifySearch();

	const [searchQuery, setSearchQuery] = useState<string>("");
	const [playlist, setPlaylist] = useState<SimplifiedTrack[]>([]);
	const [sResults, setSResults] = useState<SimplifiedTrack[]>(searchResults);

	useEffect(() => {
		setSResults(searchResults);
	}, [searchResults]);

	const addToPlaylist = (track: Track) => {
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
		console.log(playlist);
	};

	const removeFromPlaylist = (trackId: string) => {
		setPlaylist((prevPlaylist) =>
			prevPlaylist.filter((track) => track.id !== trackId),
		);
	};

	const savePlaylist = async () => {
		const currentPlaylist = [...playlist];
		const songInfo = currentPlaylist.map((song) => ({
			spotify_id: song.id,
			title: song.name,
			artists: song.artistNames,
			cover: song.albumArtUrl,
			duration_ms: song.duration_ms,
			startTime: "",
		}));
		handleSave(songInfo);
		setPlaylist([]);
		setSResults([]);
		setSearchQuery("");
	};

	const playPreview = (previewUrl: string) => {
		const audio = new Audio(previewUrl);
		audio.play();
		console.log("Playing preview:", previewUrl);
	};

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="slide"
			onRequestClose={() => {}}
			testID="song-dialog"
		>
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
							<TouchableOpacity
								style={styles.removeButton}
								onPress={() => removeFromPlaylist(track.id)}
							>
								<Text style={styles.buttonText}>Remove</Text>
							</TouchableOpacity>
						</View>
					))}
				</ScrollView>

				{/* Search Results Section */}
				<ScrollView style={styles.resultsContainer}>
					{sResults.map((track) => (
						<SongCard
							key={track.id}
							track={track}
							onPlay={() => playPreview(track.preview_url)}
							onAdd={() => addToPlaylist(track)}
							onRemove={() => removeFromPlaylist(track.id)}
							isAdded={playlist.some(
								(selectedTrack) => selectedTrack.id === track.id,
							)}
						/>
					))}
				</ScrollView>

				{/* Save Button */}
				<TouchableOpacity
					style={styles.saveButton}
					onPress={savePlaylist} // Pass the playlist as an argument to handleSave
					disabled={playlist.length === 0}
				>
					<Text style={styles.buttonText}>Add Songs</Text>
				</TouchableOpacity>
			</View>
		</Modal>
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
		backgroundColor: "#4c50bf",
		borderRadius: 30,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		elevation: 5,
		marginTop: 5,
		marginBottom: 10,
	},
	saveButton: {
		backgroundColor: colors.primary,
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

export default AddFavSong;
