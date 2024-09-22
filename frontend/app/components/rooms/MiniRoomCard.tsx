import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface MiniRoomCardProps {
	room: {
		name: string;
		description: string;
		imageUrl: string;
	};
}

const MiniRoomCard: React.FC<MiniRoomCardProps> = ({ room }) => {
	return (
		<View style={styles.cardContainer}>
			<View style={styles.textContainer}>
				<Text style={styles.roomName}>{room.name}</Text>
				<Text style={styles.roomDescription}>{room.description}</Text>
			</View>
			<Image source={{ uri: room.imageUrl }} style={styles.roomImage} />
		</View>
	);
};

const styles = StyleSheet.create({
	cardContainer: {
		flexDirection: "row",
		padding: 10,
		marginBottom: 10,
		backgroundColor: "#fff",
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	textContainer: {
		flex: 1,
		paddingRight: 10,
	},
	roomName: {
		fontSize: 16,
		fontWeight: "bold",
	},
	roomDescription: {
		fontSize: 12,
		color: "#666",
		marginTop: 5,
	},
	roomImage: {
		width: 80,
		height: 80,
		borderRadius: 10,
	},
});

export default MiniRoomCard;
