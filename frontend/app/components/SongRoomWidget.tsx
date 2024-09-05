// import React from "react";
// import { View, Text, Image, StyleSheet } from "react-native";
// import Slider from "@react-native-community/slider";
// import { Track } from "../models/Track";

// interface SongRoomWidgetProps {
// 	track: Track;
// 	progress: number;
// 	time1: string;
// 	time2: string;
// }

// const SongRoomWidget: React.FC<SongRoomWidgetProps> = ({
// 	track,
// 	progress,
// 	time1,
// 	time2,
// }) => {
// 	const { name: songName, artists, album } = track;
// 	const artistName = artists.map((artist) => artist.name).join(", ");
// 	const albumCoverUrl = album.images[0]?.url;

// 	return (
// 		<View style={styles.container}>
// 			<View style={styles.imageContainer}>
// 				<Image
// 					source={{ uri: albumCoverUrl }}
// 					style={styles.image}
// 					testID="album-cover-image"
// 				/>
// 			</View>
// 			<View style={styles.textContainer}>
// 				<Text style={styles.songName}>{songName}</Text>
// 				<Text style={styles.artist}>{artistName}</Text>
// 			</View>
// 			<Slider
// 				testID="song-slider"
// 				style={styles.slider}
// 				value={progress}
// 				minimumValue={0}
// 				maximumValue={1}
// 				minimumTrackTintColor="#000"
// 				maximumTrackTintColor="rgba(0, 0, 0, 0.5)"
// 				thumbTintColor="#000"
// 				onValueChange={(value) => {
// 					// Update the song progress
// 				}}
// 			/>
// 			<View style={styles.timeContainer}>
// 				<Text style={styles.time}>{time1}</Text>
// 				<View style={{ flex: 1 }} />
// 				<Text style={styles.time}>{time2}</Text>
// 			</View>
// 		</View>
// 	);
// };

// const styles = StyleSheet.create({
// 	container: {
// 		width: "100%",
// 		backgroundColor: "white",
// 		alignItems: "center",
// 		paddingVertical: 16,
// 	},
// 	imageContainer: {
// 		borderRadius: 12,
// 		overflow: "hidden",
// 		marginBottom: 40,
// 		marginTop: 8,
// 	},
// 	image: {
// 		width: 200,
// 		height: 200,
// 		borderRadius: 12,
// 	},
// 	textContainer: {
// 		alignItems: "center",
// 	},
// 	songName: {
// 		fontSize: 22,
// 		fontWeight: "bold",
// 		color: "black",
// 		marginBottom: 8,
// 	},
// 	artist: {
// 		fontSize: 16,
// 		color: "grey",
// 		marginBottom: 8,
// 		marginTop: 8,
// 	},
// 	slider: {
// 		width: "100%",
// 		marginBottom: 8,
// 		marginTop: 8,
// 	},
// 	timeContainer: {
// 		flexDirection: "row",
// 		justifyContent: "space-between",
// 		width: "90%",
// 	},
// 	time: {
// 		fontSize: 12,
// 		color: "#878787",
// 		fontWeight: "bold",
// 		marginBottom: 20,
// 	},
// });

// export default SongRoomWidget;

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
		marginTop: 20,
	},
	artist: {
		fontSize: 16,
		color: "grey",
	},
});

export default SongRoomWidget;
