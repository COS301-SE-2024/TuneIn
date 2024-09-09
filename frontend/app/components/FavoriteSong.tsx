import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const FavoriteSongs = ({
	songTitle,
	artist,
	duration,
	albumArt = "",
	toEdit = false,
	onPress,
}) => {
	return (
		<View style={styles.container}>
			<View style={styles.playingContainer}>
				<Image source={{ uri: albumArt }} style={styles.albumArt} />
				<View style={styles.detailsContainer}>
					<Text style={styles.songTitle}>{songTitle}</Text>
					<Text style={styles.artist}>{artist}</Text>
				</View>
				{duration && <Text style={styles.duration}>{duration}</Text>}
				{toEdit && (
					<TouchableOpacity
						onPress={onPress}
						style={styles.icon}
						testID={`${songTitle}-song-close`}
					>
						<MaterialIcons name={"close"} size={24} color="black" />
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		// marginBottom: 10,
	},
	title: {
		fontSize: 16,
		fontWeight: "700",
		paddingBottom: 10,
	},
	playingContainer: {
		width: 330,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 0,
		marginTop: 10, // Adjusted marginTop for space
		paddingBottom: 10, // Added paddingVertical for space
	},
	albumArt: {
		width: 57,
		height: 57,
		borderRadius: 12,
		backgroundColor: "rgba(158, 171, 184, 1)",
		marginRight: 16,
	},
	detailsContainer: {
		flex: 1,
	},
	songTitle: {
		fontSize: 16,
		fontWeight: "600",
	},
	artist: {
		fontSize: 12,
		fontWeight: "400",
		marginTop: 5,
	},
	duration: {
		marginLeft: 10,
	},
	icon: {
		marginLeft: 30,
	},
});

export default FavoriteSongs;
