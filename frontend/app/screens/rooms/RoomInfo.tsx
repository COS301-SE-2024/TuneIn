import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RoomDetails, {
	RoomDetailsProps,
} from "../../components/rooms/RoomDetailsComponent";
import { useLocalSearchParams, useRouter } from "expo-router";
// import { colors } from "../../styles/colors";

const roomDetails: RoomDetailsProps = {
	image:
		"https://as2.ftcdn.net/v2/jpg/05/72/82/85/1000_F_572828530_ofzCYowQVnlOwkcoBJnZqT36klbJzWdn.jpg",
	name: "Chill Vibes",
	description: "A place to relax and unwind with great music.",
	genre: "Jazz",
	language: "English",
	roomSize: "Medium",
	isExplicit: false,
	isNsfw: true,
};

const RoomInfoScreen = () => {
	const router = useRouter();
	const { roomData } = useLocalSearchParams();
	let _room: any;
	if (Array.isArray(roomData)) {
		_room = JSON.parse(roomData[0]);
	} else {
		_room = JSON.parse(roomData);
	}
	const room: RoomDetailsProps = {
		image: _room.backgroundImage,
		name: _room.name,
		description: _room.description,
		genre: _room.genre,
		language: _room.language,
		roomSize: _room.roomSize,
		isExplicit: _room.isExplicit,
		isNsfw: _room.isNsfw,
		// tags: _room.tags,
	};
	console.log("Room data: ", _room);

	return (
		<ScrollView contentContainerStyle={styles.container} testID="room-details">
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.closeButton}
				>
					<Ionicons name="close" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.roomName}>{room.name}</Text>
			</View>
			<RoomDetails {...room} />
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: "white",
	},
	header: {
		// backgroundColor: colors.primary,
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
