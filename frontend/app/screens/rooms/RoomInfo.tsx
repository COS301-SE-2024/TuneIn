import React, { useState } from "react";
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
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the icon
import { colors } from "../../styles/colors";
import RoomShareSheet from "../../components/messaging/RoomShareSheet";

const RoomInfoScreen = () => {
	const router = useRouter();
	const { room } = useLocalSearchParams();
	const [isPopupVisible, setPopupVisible] = useState(false);

	// Parse the room data if it's a JSON string
	let roomData;
	try {
		roomData = typeof room === "string" ? JSON.parse(room) : room;
	} catch (error) {
		console.error("Invalid room data:", error);
		roomData = null;
	}

	const handleOpenPopup = () => {
		setPopupVisible(true);
	};

	const handleClosePopup = () => {
		setPopupVisible(false);
	};

	// Function to truncate room name if it's longer than 18 characters
	const getTruncatedRoomName = (name: string) => {
		return name.length > 18 ? name.slice(0, 15) + "..." : name;
	};

	return (
		<ScrollView contentContainerStyle={styles.container} testID="room-details">
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.closeButton}
				>
					<Ionicons name="close" size={24} color="black" />
				</TouchableOpacity>

				{/* Truncate the room name if necessary */}
				<Text style={styles.roomName}>
					{roomData?.name ? getTruncatedRoomName(roomData.name) : "Room"}
				</Text>

				<TouchableOpacity onPress={handleOpenPopup}>
					<Icon name="share" size={22} color={colors.primaryText} />
				</TouchableOpacity>
			</View>

			{roomData && <RoomDetails room={formatRoomData(roomData)} />}

			<RoomShareSheet
				room={formatRoomData(room)}
				isVisible={isPopupVisible}
				onClose={handleClosePopup}
			/>
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
