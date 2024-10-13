import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

interface Track {
	id: string;
	name: string;
	artists: { name: string }[];
	album: { images: { url: string }[] };
	explicit: boolean;
	preview_url: string;
}

interface SongCardProps {
	track: Track;
	onAdd: () => void;
	onRemove: () => void;
	isAdded: boolean;
}

const SongCard: React.FC<SongCardProps> = ({
	track,
	onAdd,
	onRemove,
	isAdded,
}) => {
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		// Clean up when component unmounts
		return () => {
			if (sound) {
				sound.unloadAsync();
			}
		};
	}, [sound]);

	const playAudio = async () => {
		try {
			// Unload any existing sound before playing new one
			if (sound) {
				await sound.unloadAsync();
			}

			const { sound: newSound } = await Audio.Sound.createAsync(
				{ uri: track.preview_url },
				{ shouldPlay: true },
			);
			setSound(newSound);
			setIsPlaying(true);

			// Pause other playing audio (if any)
			await Audio.setAudioModeAsync({ staysActiveInBackground: true }); // Keep audio playing when app is in background
			await Audio.setIsEnabledAsync(true); // Ensure audio is enabled

			// Monitor audio playback status
			newSound.setOnPlaybackStatusUpdate((status) => {
				if (!status.isLoaded) {
					if (status.error) {
						console.log(
							`Encountered a fatal error during playback: ${status.error}`,
						);
					}
				} else {
					if (status.didJustFinish) {
						setIsPlaying(false);
					}
				}
			});
		} catch (error) {
			console.error("Failed to load sound", error);
		}
	};

	const pauseAudio = async () => {
		if (sound) {
			await sound.pauseAsync();
			setIsPlaying(false);
		}
	};

	return (
		<View style={styles.card}>
			<Image
				source={{ uri: track.album.images[0].url }}
				style={styles.albumArt}
			/>
			<View style={styles.infoContainer}>
				<Text style={styles.title}>{track.name}</Text>
				<Text style={styles.artist}>
					{track.artists.map((artist) => artist.name).join(", ")}
				</Text>
				{track.explicit && <Text style={styles.explicit}>Explicit</Text>}
			</View>
			<View style={styles.buttonContainer}>
				<TouchableOpacity
					testID="play-pause-button"
					style={styles.iconButton}
					onPress={isPlaying ? pauseAudio : playAudio}
				>
					<Ionicons
						name={isPlaying ? "pause" : "play"}
						size={24}
						color="black"
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.iconButton}
					onPress={isAdded ? onRemove : onAdd}
				>
					<Text style={[styles.iconText, { color: isAdded ? "red" : "green" }]}>
						{isAdded ? "-" : "+"}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		margin: 10,
		backgroundColor: "#f9f9f9",
		borderRadius: 5,
		borderColor: "#ddd",
		borderWidth: 1,
	},
	albumArt: {
		width: 50,
		height: 50,
		borderRadius: 5,
	},
	infoContainer: {
		flex: 1,
		marginLeft: 10,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
	},
	artist: {
		fontSize: 14,
		color: "#666",
	},
	explicit: {
		fontSize: 12,
		color: "red",
	},
	buttonContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	iconButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#ddd",
		marginHorizontal: 5,
	},
	iconText: {
		fontSize: 33,
		fontWeight: "bold",
		marginBottom: 5,
	},
});

export default SongCard;
