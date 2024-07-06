import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { SongRoomWidgetProps } from "../models/song";

const SongRoomWidget: React.FC<SongRoomWidgetProps> = ({
	songName,
	artist,
	albumCoverUrl,
	progress,
	time1,
	time2,
}) => {
	return (
		<View style={styles.container}>
			<View style={styles.imageContainer}>
				<Image source={{ uri: albumCoverUrl }} style={styles.image} />
			</View>
			<View style={styles.textContainer}>
				<Text style={styles.songName}>{songName}</Text>
				<Text style={styles.artist}>{artist}</Text>
			</View>
			<Slider
				style={styles.slider}
				value={progress}
				minimumValue={0}
				maximumValue={1}
				minimumTrackTintColor="#000"
				maximumTrackTintColor="rgba(0, 0, 0, 0.5)"
				thumbTintColor="#000"
				onValueChange={(value) => {
					// Update the song progress
				}}
			/>
			<View style={styles.timeContainer}>
				<Text style={styles.time}>{time1}</Text>
				<View style={{ flex: 1 }} />
				<Text style={styles.time}>{time2}</Text>
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
		marginBottom: 40,
		marginTop: 8,
	},
	image: {
		width: 200,
		height: 200,
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
	},
	artist: {
		fontSize: 16,
		color: "grey",
		marginBottom: 8,
		marginTop: 8,
	},
	slider: {
		width: "100%",
		marginBottom: 8,
		marginTop: 8,
	},
	timeContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "90%",
	},
	time: {
		fontSize: 12,
		color: "#878787",
		fontWeight: "bold",
		marginBottom: 20,
	},
});

export default SongRoomWidget;
