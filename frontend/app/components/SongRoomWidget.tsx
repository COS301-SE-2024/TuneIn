import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { Track } from "../models/Track";

const { width, height } = Dimensions.get("window");

const isSmallScreen = width < 380 || height < 700;

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
					style={isSmallScreen ? styles.smallImage : styles.image}
					testID="album-cover-image"
				/>
			</View>
			<View style={styles.textContainer}>
				<Text style={isSmallScreen ? styles.smallSongName : styles.songName}>
					{songName}
				</Text>
				<Text style={isSmallScreen ? styles.smallArtist : styles.artist}>
					{artistName}
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		backgroundColor: "white",
		alignItems: "center",
		paddingVertical: 16,
	},
	imageContainer: {
		borderRadius: 12,
		overflow: "hidden",
		marginBottom: 8,
		// marginTop: 8,
	},
	image: {
		width: width * 0.7, // 70% of screen width
		height: width * 0.7, // Maintain a square aspect ratio
		borderRadius: 12,
	},
	smallImage: {
		width: width * 0.5, // 50% of screen width for small screens
		height: width * 0.5,
		borderRadius: 12,
	},
	textContainer: {
		alignItems: "center",
		paddingHorizontal: 16,
	},
	songName: {
		fontSize: width * 0.06, // Adjust font size based on screen width
		fontWeight: "bold",
		color: "black",
		marginBottom: 8,
		marginTop: 8,
		textAlign: "center",
	},
	smallSongName: {
		fontSize: width * 0.05, // Smaller font for small screens
		fontWeight: "bold",
		color: "black",
		marginBottom: 8,
		marginTop: 8,
		textAlign: "center",
	},
	artist: {
		fontSize: width * 0.045, // Adjust font size based on screen width
		color: "grey",
		textAlign: "center",
	},
	smallArtist: {
		fontSize: width * 0.04, // Smaller font for small screens
		color: "grey",
		textAlign: "center",
	},
});

export default SongRoomWidget;
