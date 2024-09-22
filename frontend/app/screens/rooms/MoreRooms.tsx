import React from "react";
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import MiniRoomCard from "../../components/rooms/MiniRoomCard";
import { Ionicons } from "@expo/vector-icons";
import { Room, formatRoomData } from "../../models/Room"; // Import the Room interface and formatRoomData function

const MoreRoomsPage = () => {
	const { name, rooms } = useLocalSearchParams();
	const navigation = useNavigation();

	// Parse the rooms parameter (JSON string) into an array and format each room using formatRoomData
	const parsedRooms: Room[] = rooms
		? JSON.parse(rooms as string).map((room: any) => formatRoomData(room))
		: [];

	return (
		<View style={styles.container}>
			{/* Header with Back Chevron */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.backButton}
				>
					<Ionicons name="chevron-back" size={24} color="#000" />
				</TouchableOpacity>
				<Text style={styles.title}>{name || "Rooms"}</Text>
			</View>

			{/* Scrollable Room List */}
			<FlatList
				data={parsedRooms}
				keyExtractor={(item) => item.roomID || item.name}
				renderItem={({ item }) => <MiniRoomCard roomCard={item} />} // Use roomCard here
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f9f9f9",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 15,
		paddingHorizontal: 20,
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	backButton: {
		position: "absolute",
		left: 10,
	},
	title: {
		flex: 1,
		textAlign: "center",
		fontSize: 24,
		fontWeight: "bold",
		color: "#000",
	},
	listContent: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
});

export default MoreRoomsPage;
