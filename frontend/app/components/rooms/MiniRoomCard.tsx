import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Room } from "../../models/Room";
import { useRouter } from "expo-router";

interface MiniRoomCardProps {
	roomCard: Room;
}

const MiniRoomCard: React.FC<MiniRoomCardProps> = ({ roomCard }) => {
	const router = useRouter();
	const room = JSON.parse(JSON.stringify(roomCard));

	const navigateToRoomPage = () => {
		console.log("Room:", room);
		router.navigate({
			// pathname: "/screens/rooms/RoomPage",
			pathname: "/screens/rooms/RoomStack",
			params: { room: JSON.stringify(room) },
		});
	};

	const truncateText = (text: string | undefined, maxLength: number) => {
		if (text && text.length > maxLength) {
			return text.substring(0, maxLength - 3) + "...";
		}
		return text;
	};

	return (
		<View style={styles.cardContainer}>
			<TouchableOpacity onPress={navigateToRoomPage}>
				<View style={styles.textContainer}>
					<Text style={styles.roomName}>{roomCard.name}</Text>
					<Text style={styles.roomDescription}>{roomCard.description}</Text>
				</View>
				<Image
					source={{ uri: roomCard.backgroundImage }}
					style={styles.roomImage}
				/>
			</TouchableOpacity>
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
