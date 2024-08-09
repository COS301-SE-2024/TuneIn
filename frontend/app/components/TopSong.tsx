import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface TopSongProps {
	albumImage: string; // URL or local path to the album image
	songName: string; // Name of the song
	plays: number; // Number of plays
	songNumber: number; // Song number (1, 2, 3, ...)
}

const TopSong: React.FC<TopSongProps> = ({
	albumImage,
	songName,
	plays,
	songNumber,
}) => {
	return (
		<View style={styles.container}>
			<View style={styles.textsContainer}>
				<Text style={styles.songNumber}>{songNumber}. </Text>
				<Image source={{ uri: albumImage }} style={styles.albumImage} />
				<View style={styles.textContainer}>
					<Text style={styles.songName}>{songName}</Text>
					<Text style={styles.plays}>{plays} plays</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		paddingLeft: 30,
		marginBottom: 10,
		backgroundColor: "#fff",
	},
	albumImage: {
		width: 50,
		height: 50,
		borderRadius: 30,
		marginRight: 15,
	},
	textsContainer: {
		flex: 1,
		flexDirection: "row", // Align text horizontally
		alignItems: "center", // Align text vertically
	},
	songNumber: {
		fontSize: 16,
		fontWeight: "500",
		marginRight: 5, // Space between number and song name
	},
	textContainer: {
		flex: 1,
	},
	songName: {
		fontSize: 16,
		fontWeight: "500",
	},
	plays: {
		fontSize: 14,
		color: "#666",
		marginTop: 5,
	},
});

export default TopSong;
