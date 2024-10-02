import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Room } from "../../models/Room";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

interface MiniRoomCardProps {
	roomCard: Room;
}

const MiniRoomCard: React.FC<MiniRoomCardProps> = ({ roomCard }) => {
	const router = useRouter();
	const room = JSON.parse(JSON.stringify(roomCard));

	const navigateToRoomPage = () => {
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

	const currentDate = new Date();
	const startDate = new Date(roomCard.start_date);
	const endDate = new Date(roomCard.end_date);

	const isBeforeStartDate = currentDate < startDate;
	const isAfterEndDate = currentDate > endDate;

	return (
		<TouchableOpacity
			onPress={navigateToRoomPage}
			style={styles.cardContainer}
			testID="minicard"
			// disabled={!roomCard.mine || isBeforeStartDate || isAfterEndDate}
		>
			<View style={styles.imageContainer}>
				<Image
					source={{ uri: roomCard.backgroundImage }}
					style={styles.roomImage}
				/>
				{/* {(isBeforeStartDate || isAfterEndDate) && (
					<View style={styles.greyOverlay} />
				)} */}
			</View>

			<View style={styles.textContainer}>
				<Text style={styles.roomName}>{roomCard.name}</Text>

				{/* Display opening or closing date */}
				{/* {isBeforeStartDate ? (
					<Text style={styles.roomStatus}>
						This room will open on{" "}
						{startDate.toLocaleDateString("en-GB", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						})}{" "}
						at{" "}
						{startDate.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Text>
				) : isAfterEndDate ? (
					<Text style={styles.roomStatus}>
						This room closed on{" "}
						{endDate.toLocaleDateString("en-GB", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						})}{" "}
						at{" "}
						{endDate.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Text>
				) : (
					
				)} */}
				<Text style={styles.roomDescription}>
					{truncateText(roomCard.description, 50)}
				</Text>
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

			{/* Conditionally render explicit icon */}
			<View style={styles.iconContainer}>
				{roomCard.isExplicit && (
					<MaterialIcons
						name="explicit"
						size={28}
						color="black"
						style={styles.explicitIcon}
					/>
				)}
				{roomCard.isNsfw && (
					<MaterialIcons
						name="18-up-rating"
						size={28}
						color="black"
						style={styles.explicitIcon}
					/>
				)}
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
		alignItems: "center",
		justifyContent: "space-between",
	},
	imageContainer: {
		position: "relative",
	},
	roomImage: {
		width: 95,
		height: 90,
		borderRadius: 10,
		marginRight: 10,
	},
	greyOverlay: {
		position: "absolute",
		top: 0,
		bottom: 0,
		width: 95,
		left: 0,
		right: 0,
		backgroundColor: "rgba(128, 128, 128, 0.7)", // Grey overlay
		borderRadius: 10,
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
	roomStatus: {
		fontSize: 12,
		color: "#666",
		marginTop: 5,
		fontStyle: "italic",
	},
	userInfo: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
	},
	userProfile: {
		width: 30,
		height: 30,
		borderRadius: 15,
		marginRight: 8,
	},
	username: {
		fontSize: 12,
		color: "#333",
		flexShrink: 1,
	},
	explicitIcon: {
		width: 24,
		height: 24,
		marginLeft: 4,
	},
	iconContainer: {
		flexDirection: "row", // Places the icons next to each other
		alignItems: "center", // Aligns the icons vertically
		position: "absolute", // Absolute positioning to place it at the desired location
		bottom: 10,
		right: 10,
	},
});

export default MiniRoomCard;
