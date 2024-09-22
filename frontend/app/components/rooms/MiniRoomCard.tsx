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
		<TouchableOpacity onPress={navigateToRoomPage} style={styles.cardContainer}>
			<Image
				source={{ uri: roomCard.backgroundImage }}
				style={styles.roomImage}
			/>

			<View style={styles.textContainer}>
				<Text style={styles.roomName}>{roomCard.name}</Text>
				<Text style={styles.roomDescription}>{roomCard.description}</Text>

				{/* User profile and username inline */}
				<View style={styles.userInfo}>
					<Image
						source={{ uri: roomCard.userProfile }}
						style={styles.userProfile}
					/>
					<Text style={styles.username}>
						{truncateText(roomCard.username, 12)}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	cardContainer: {
		flexDirection: "row",
		padding: 10,
		marginBottom: 10,
		marginTop: 10,
		backgroundColor: "#fff",
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
		alignItems: "center", // Ensure vertical alignment
	},
	roomImage: {
		width: 80,
		height: 80,
		borderRadius: 10,
		marginRight: 10,
	},
	textContainer: {
		flex: 1,
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
	userInfo: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
	},
	userProfile: {
		width: 30,
		height: 30,
		borderRadius: 15, // Circle shape
		marginRight: 8,
	},
	username: {
		fontSize: 12,
		color: "#333",
		flexShrink: 1, // Allows the text to shrink if necessary
	},
});

export default MiniRoomCard;
