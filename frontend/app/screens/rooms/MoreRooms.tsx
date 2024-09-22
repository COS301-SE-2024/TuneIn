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

const testRooms = [
	{
		name: "Room 1",
		description: "This is Room 1",
		imageUrl: "https://example.com/room1.jpg",
	},
	{
		name: "Room 2",
		description: "This is Room 2",
		imageUrl: "https://example.com/room2.jpg",
	},
	// Add more room objects here
];

const MoreRoomsPage = () => {
	const { name } = useLocalSearchParams(); // Assuming 'name' is the room's name
	const navigation = useNavigation();

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
				data={testRooms}
				keyExtractor={(item) => item.name}
				renderItem={({ item }) => <MiniRoomCard room={item} />}
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
