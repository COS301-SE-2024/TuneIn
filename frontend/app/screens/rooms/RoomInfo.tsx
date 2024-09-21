import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RoomDetails from "../../components/rooms/RoomDetailsComponent";
import { useLocalSearchParams, useRouter } from "expo-router";
import { formatRoomData } from "../../models/Room";

const RoomInfoScreen = () => {
	const router = useRouter();
	const { room } = useLocalSearchParams();

	// Parse the room data if it's a JSON string
	let roomData;
	try {
		roomData = typeof room === "string" ? JSON.parse(room) : room;
	} catch (error) {
		console.error("Invalid room data:", error);
		roomData = null;
	}

	return (
		<ScrollView contentContainerStyle={styles.container} testID="room-details">
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.closeButton}
				>
					<Ionicons name="close" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.roomName}>{roomData?.name || "Room"}</Text>
			</View>
			{roomData && <RoomDetails room={formatRoomData(roomData)} />}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: "white",
	},
	header: {
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
	},
	closeButton: {
		marginRight: 8,
	},
	roomName: {
		flex: 1,
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
	},
});

export default RoomInfoScreen;
