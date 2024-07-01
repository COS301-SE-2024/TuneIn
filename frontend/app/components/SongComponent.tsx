import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

const SongComponent = ({ song, onRemove }) => {
	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={() => onRemove(song.id)}
				style={styles.iconButton}
			>
				<FontAwesome6 name="circle-dot" size={16} color="black" />
			</TouchableOpacity>
			<Image source={{ uri: song.albumCoverUrl }} style={styles.albumCover} />
			<View style={styles.songDetails}>
				<Text style={styles.songName}>{song.name}</Text>
				<Text style={styles.artistName}>{song.artist}</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
	},
	iconButton: {
		marginRight: 20,
	},
	albumCover: {
		width: 60,
		height: 60,
		marginHorizontal: 8,
	},
	songDetails: {
		flex: 1,
		justifyContent: "center",
	},
	songName: {
		fontSize: 16,
		fontWeight: "bold",
	},
	artistName: {
		fontSize: 14,
		color: "gray",
	},
});

export default SongComponent;
