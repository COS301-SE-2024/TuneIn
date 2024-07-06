import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";

const RoomCard = ({ roomName, songName, artistName, username, imageUrl }) => {
	return (
		<ImageBackground
			source={{ uri: imageUrl }}
			style={styles.background}
			imageStyle={styles.backgroundImage}
		>
			<View style={styles.overlay}>
				<Text style={styles.roomName}>{roomName}</Text>
				<Text style={styles.songName}>{songName}</Text>
				<Text style={styles.artistName}>{artistName}</Text>
				<Text style={styles.username}>{username}</Text>
			</View>
		</ImageBackground>
	);
};

const styles = StyleSheet.create({
	background: {
		width: 150,
		height: 170, // Adjust height as per your design
		marginRight: 12,
		borderRadius: 12,
		overflow: "hidden", // Ensure the contents don't overflow the rounded corners
	},
	backgroundImage: {
		flex: 1,
		resizeMode: "cover", // Cover the entire container
	},
	overlay: {
		backgroundColor: "rgba(0, 0, 0, 0.4)", // Semi-transparent black overlay
		borderRadius: 12,
		padding: 12,
		flex: 1,
		justifyContent: "flex-end", // Align text to bottom of container
	},
	roomName: {
		fontSize: 16,
		fontWeight: "600",
		color: "white", // Text color
	},
	songName: {
		fontSize: 14,
		fontWeight: "400",
		color: "white", // Text color
	},
	artistName: {
		fontSize: 14,
		fontWeight: "400",
		color: "white", // Text color
	},
	username: {
		fontSize: 12,
		fontWeight: "400",
		color: "white", // Text color
	},
});

export default RoomCard;
