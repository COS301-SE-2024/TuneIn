import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LineGraphCard from "../../components/LineGraphCard";
import HorizontalBarGraphCard from "../../components/HorizontalBarGraphCard";
import TableCard from "../../components/TableCard";
import IconProgressCard from "../../components/IconProgressCard";
import RoomDropdown from "../../components/RoomDropdown";
import AuthManagement from "../../services/AuthManagement";
import { API_BASE_URL } from "../../services/Utils";
import * as StorageService from "../../services/StorageService";

const InteractionsAnalytics: React.FC = () => {
	const router = useRouter();

	const [selectedRoom, setSelectedRoom] = useState<{
		room_name: string;
		roomID: string;
	} | null>(null);
	const [userRooms, setRooms] = useState<any[]>();

	const [interactionAnalytics, setInteractionAnalytics] = useState<{
		messages: {
			per_hour: {
				count: number;
				hour: Date;
			}[];
			total: number;
		};
		bookmarked_count: number;
		reactions_sent: number;
	} | null>(null);

	useEffect(() => {
		const fetchUserRooms = async () => {
			// make an axios request with the API_BASE_URL and the auth token
			const accessToken: string | null = await AuthManagement.getToken();
			console.log("access token fr", accessToken);
			const response = await fetch(`${API_BASE_URL}/users/rooms`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			const data = await response.json();
			console.log(data);
			setRooms(data);

			console.log("user rooms", userRooms);
			const currentRoom = await StorageService.getItem("currentRoom");
			console.log("current room", currentRoom);
			const room = userRooms?.find((room) => room.room_name === currentRoom);
			if (room !== undefined) setSelectedRoom(room);
			console.log("selected room", selectedRoom);
		};

		if (selectedRoom === null) fetchUserRooms();
		console.log("selectedRoom", selectedRoom);
	}, [selectedRoom]);

	useEffect(() => {
		const fetchInteractionAnalytics = async () => {
			const accessToken: string | null = await AuthManagement.getToken();
			const currentRoom = await StorageService.getItem("currentRoom");
			console.log("current roooooom", currentRoom);
			const response = await fetch(
				`${API_BASE_URL}/rooms/${selectedRoom?.roomID}/analytics/interactions`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);
			const data = await response.json();
			if (interactionAnalytics === null) setInteractionAnalytics(data);
		};

		fetchInteractionAnalytics();
		console.log("interaction analytics", interactionAnalytics);
	}, [interactionAnalytics]);

	const rooms = userRooms?.map((room) => room.room_name as string);
	console.log("rooms", rooms);
	console.log("current room", selectedRoom);
	// function that will be called when the user selects a room
	const handleRoomSelect = async (room: string) => {
		// find the room object that matches the selected room
		const selected = userRooms?.find((r) => r.room_name === room);
		const accessToken: string | null = await AuthManagement.getToken();
		// set the selected room to the room object
		setSelectedRoom(selected);
		console.log("selected room", selectedRoom?.roomID);
		const roomID: string = selectedRoom?.roomID ?? "";
		const response = await fetch(
			`${API_BASE_URL}/rooms/${roomID}/analytics/interactions`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);
		const data = await response.json();
		// if (data.statusCode !== 200) {
		// 	console.log("error fetching interaction analytics");
		// 	return;
		// }
		if (interactionAnalytics?.bookmarked_count === undefined)
			setInteractionAnalytics(data);
		console.log("interaction analytics", interactionAnalytics);
		// close the dropdown
	};

	// Sample data for the past seven days
	console.log("interaction stuffs", interactionAnalytics);

	const data = interactionAnalytics?.messages?.per_hour?.map((hour) => {
		return {
			label: new Date(hour.hour).getHours().toString() + ":00",
			value: hour.count,
		};
	});
	console.log("data", data);

	const datah = [
		{ label: "Room A", value: 57 },
		{ label: "Room B", value: 75 },
		{ label: "Room C", value: 18 },
		{ label: "Room D", value: 48 },
		{ label: "Room E", value: 6 },
	];

	const headers = ["User", "Songs", "Upvotes"];
	const dataTable = [
		["User A", "50", "200"],
		["User B", "35", "165"],
		["User C", "23", "155"],
	];

	const datah2 = [
		{ label: "Room A", value: 12 },
		{ label: "Room B", value: 57 },
		{ label: "Room C", value: 38 },
		{ label: "Room D", value: 48 },
		// { label: "Room E", value: 75 },
	];

	return (
		<ScrollView contentContainerStyle={styles.scrollView}>
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()} testID="back-button">
						<Ionicons name="chevron-back" size={24} color="black" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>User Interactions in Room</Text>
					<View style={styles.headerSpacer} />
				</View>
				<RoomDropdown
					initialRooms={rooms ?? []}
					onRoomPick={handleRoomSelect}
				/>
				<LineGraphCard data={data ?? []} title="Daily Messages" />
				<IconProgressCard
					icon="message"
					header="Messages"
					number={interactionAnalytics?.messages?.total?.toString() ?? "0"}
					progress={interactionAnalytics?.messages?.total ?? 0} // Progress from 0 to 1
				/>
				<IconProgressCard
					icon="emoji-happy"
					header="Reactions"
					number={interactionAnalytics?.reactions_sent?.toString() ?? "0"}
					progress={interactionAnalytics?.reactions_sent ?? 0} // Progress from 0 to 1
				/>
				{/* <HorizontalBarGraphCard data={datah} title="Playlist Contributions" />
				<TableCard
					title="Top Playlist Contributors"
					headers={headers}
					data={dataTable}
				/>
				<HorizontalBarGraphCard data={datah2} title="Room Bookmarks" /> */}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between", // To space out the items evenly
		marginBottom: 20,
	},
	backButton: {
		flex: 1,
	},
	headerText: {
		flex: 2,
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
	},
	placeholder: {
		flex: 1, // Placeholder with the same flex value as backButton to balance the layout
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 40,
	},
	container: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 10,
	},
	closeButton: {
		fontSize: 20,
		fontWeight: "bold",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
	},
	headerSpacer: {
		width: 20,
	},
	scrollView: {
		flexGrow: 1,
	},
});

export default InteractionsAnalytics;
