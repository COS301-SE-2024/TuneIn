import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Track } from "../models/Track";

interface SongRoomWidgetProps {
	track: Track;
}

const SongRoomWidget: React.FC<SongRoomWidgetProps> = ({ track }) => {
	const { name: songName, artists, album } = track;
	const artistName = artists.map((artist) => artist.name).join(", ");
	const albumCoverUrl = album.images[0]?.url;

	return (
		<View style={styles.container}>
			<View style={styles.imageContainer}>
				<Image
					source={{ uri: albumCoverUrl }}
					style={styles.image}
					testID="album-cover-image"
				/>
			</View>
			<View style={styles.textContainer}>
				<Text style={styles.songName}>{songName}</Text>
				<Text style={styles.artist}>{artistName}</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		backgroundColor: "white",
		alignItems: "center",
		// paddingVertical: 16,
	},
	imageContainer: {
		borderRadius: 12,
		overflow: "hidden",
		marginBottom: 8,
		marginTop: 8,
	},
	image: {
		width: 270,
		height: 270,
		borderRadius: 12,
	},
	textContainer: {
		alignItems: "center",
	},
	songName: {
		fontSize: 22,
		fontWeight: "bold",
		color: "black",
		marginBottom: 8,
		marginTop: 8,
	},
	artist: {
		fontSize: 16,
		color: "grey",
	},
});

export default SongRoomWidget;
