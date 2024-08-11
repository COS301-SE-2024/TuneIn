import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

interface MostDownvotedCardProps {
	albumImage: string;
	songName: string;
	artistName: string;
}

const MostDownvotedCard: React.FC<MostDownvotedCardProps> = ({
	albumImage,
	songName,
	artistName,
}) => {
	return (
		<View style={styles.cardContainer}>
			<Text style={styles.headerSong}>Most Downvoted Song</Text>
			<View style={styles.contentContainer}>
				<Image
					source={{ uri: albumImage }}
					style={styles.albumImage}
					testID="album-image"
				/>
				<View style={styles.textContainer}>
					<Text style={styles.songName}>{songName}</Text>
					<Text style={styles.artistName}>{artistName}</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	cardContainer: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 20,
		margin: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	contentContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	albumImage: {
		width: 60,
		height: 60,
		borderRadius: 30,
		marginRight: 15,
	},
	textContainer: {
		flex: 1,
	},
	songName: {
		fontSize: 16,
		fontWeight: "600",
	},
	artistName: {
		fontSize: 14,
		color: "#666",
		marginTop: 5,
	},
	headerSong: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 20,
	},
});

export default MostDownvotedCard;
