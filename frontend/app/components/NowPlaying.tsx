import React from "react";
import { Image, View, Text, StyleSheet } from "react-native";

const NowPlaying = ({ name, creator, art }) => {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Current Room</Text>
			<View style={styles.playingContainer}>
				<Image source={{ uri: art }} style={styles.roomArt} />
				<View style={styles.detailsContainer}>
					<Text style={styles.roomName}>{name}</Text>
					<Text style={styles.creator}>{creator}</Text>
				</View>
				{/* <Text style={styles.duration}>{duration}</Text> */}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 20,
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
	},
	playingContainer: {
		width: "95%",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		marginTop: 10, // Adjusted marginTop for space
		borderRadius: 12,
		backgroundColor: "rgba(247, 250, 252, 1)",
		borderWidth: 1,
		borderColor: "rgba(209, 214, 232, 1)",
		paddingVertical: 10, // Added paddingVertical for space
	},
	roomArt: {
		width: 57,
		height: 57,
		borderRadius: 12,
		marginRight: 16,
	},
	detailsContainer: {
		flex: 1,
	},
	roomName: {
		fontSize: 16,
		fontWeight: "600",
	},
	creator: {
		fontSize: 12,
		fontWeight: "400",
		marginTop: 5,
	},
	duration: {
		textAlign: "right",
	},
});

export default NowPlaying;
