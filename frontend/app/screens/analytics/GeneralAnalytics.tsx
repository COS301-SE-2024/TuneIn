import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	ToastAndroid,
} from "react-native";
import * as StorageService from "../../services/StorageService";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LineGraphCard from "../../components/LineGraphCard"; // Import the LineGraphCard
import HorizontalBarGraphCard from "../../components/HorizontalBarGraphCard";
import TableCard from "../../components/TableCard";
import RoomDropdown from "../../components/RoomDropdown";
import AuthManagement from "../../services/AuthManagement";
import { API_BASE_URL } from "../../services/Utils";
import { Line } from "react-native-svg";
import MetricsCard from "../../components/MetricsCard";

const GeneralAnalytics: React.FC = () => {
	const router = useRouter();
	const [userRooms, setRooms] = useState<any[]>([]);
	const [generalAnalytics, setGeneralAnalytics] = useState<any | null>(null);
	const [selectedRoom, setSelectedRoom] = useState<{
		room_name: string;
		roomID: string;
	} | null>(null);

	useEffect(() => {
		const fetchRooms = async () => {
			try {
				// make an axios request with the API_BASE_URL and the auth token
				const accessToken: string | null = await AuthManagement.getToken();
				console.log("access token fr", accessToken);
				const response = await fetch(`${API_BASE_URL}/users/rooms`, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
				const data = await response.json();
				// console.log(data);
				setRooms(data);
				const currentRoom = await StorageService.getItem("currentRoom");
				console.log("user rooms", userRooms, "and current room", currentRoom);
				const room = userRooms.find((room) => room.room_name === currentRoom);
				console.log("selected room", room);
				setSelectedRoom(room);
			} catch (error) {
				console.log("Error fetching rooms:", error);
				ToastAndroid.show("Failed to load rooms", ToastAndroid.SHORT);
			}
		};
		fetchRooms();
	}, []);

	useEffect(() => {
		const fetchGeneralAnalytics = async () => {
			try {
				const accessToken: string | null = await AuthManagement.getToken();
				const currentRoom = await StorageService.getItem("currentRoom");
				console.log("current roooooom", currentRoom);
				console.log(selectedRoom);
				const response = await fetch(
					`${API_BASE_URL}/rooms/${selectedRoom?.roomID}/analytics/participation`,
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					},
				);
				const data = await response.json();
				console.log("general analytics", data);
				setGeneralAnalytics(data);
			} catch (error) {
				console.log("Error fetching general analytics:", error);
				ToastAndroid.show("Failed to load analytics", ToastAndroid.SHORT);
			}
		};
		fetchGeneralAnalytics();
		console.log("general analytics", generalAnalytics);
	}, [selectedRoom]);

	// fetch data from the analytics/participation endpoint for the selected room and store it in generalAnalytics
	const rooms = userRooms.map((room) => room.room_name);
	console.log("mapped rooms", rooms);

	// Sample data for the horizontal bar graph
	console.log("rooms fr this time", userRooms);
	const datah = [
		{ label: "Room A fr", value: 562 },
		{ label: "Room B", value: 747 },
		{ label: "Room C", value: 191 },
		{ label: "Room D", value: 435 },
		{ label: "Room E", value: 85 },
		{ label: "Room F", value: 241 },
	];
	const uniqueJoinsPerDay =
		generalAnalytics?.joins?.per_day?.unique_joins?.map((join: any) => {
			return {
				label: join.day,
				value: join.count,
			};
		}) ?? [];
	const totalJoinsPerDay =
		generalAnalytics?.joins?.per_day?.total_joins?.map((join: any) => {
			return {
				label: join.day,
				value: join.count,
			};
		}) ?? [];
	const sessionDurationAverages =
		generalAnalytics?.session_data?.per_day?.map((session: any) => {
			return {
				label: session.day,
				value: session.avg_duration,
			};
		}) ?? [];

	const headers = ["Room", "Longest", "Shortest"];
	const dataTable = [
		["Room A", "3 hrs", "5 min"],
		["Room B", "2 hrs 30min", "7 min"],
		["Room C", "2hrs", "4 min"],
	];

	const onRoomPick = async (room: string) => {
		const selected = userRooms.find((r) => r.room_name === room);
		setSelectedRoom(selected);

		try {
			await StorageService.setItem("currentRoom", room);
			const accessToken: string | null = await AuthManagement.getToken();
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
			if (generalAnalytics?.room_previews === undefined)
				setGeneralAnalytics(data);
			console.log("Room picked", room);
		} catch (error) {
			console.log(error);
			ToastAndroid.show("Failed to load analytics", ToastAndroid.SHORT);
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.scrollView}>
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()} testID="back-button">
						<Ionicons name="chevron-back" size={24} color="black" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>General and Room Analytics</Text>
					<View style={styles.headerSpacer} />
				</View>
				<RoomDropdown initialRooms={rooms} onRoomPick={onRoomPick} />
				<LineGraphCard data={uniqueJoinsPerDay} title="Unique Joins" />
				<LineGraphCard data={totalJoinsPerDay} title="Total Joins" />
				<View style={styles.cardsContainer}>
					<MetricsCard
						title="Unique Joins"
						number={
							generalAnalytics?.joins?.all_time?.unique_joins.toString() ?? "0"
						}
					/>
					<MetricsCard
						title="Returning Visitors"
						number={
							generalAnalytics?.joins?.all_time?.total_joins.toString() ?? "0"
						}
					/>
				</View>
				<LineGraphCard
					data={sessionDurationAverages}
					title="Average Session Durations"
				/>
				<HorizontalBarGraphCard
					data={[
						{ label: "Task 1", value: 253 },
						{ label: "Task 2", value: 343 },
						{ label: "Task 3", value: 55 },
						{ label: "Task 4", value: 221 },
						{ label: "Task 5", value: 15 },
						{ label: "Task 6", value: 41 },
					]}
					title="Average Session Duration"
					unit="minutes" // Pass "minutes" to format the total as hours and minutes
				/>
				<TableCard
					title="Session Duration Extremes"
					headers={headers}
					data={dataTable}
				/>
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
	cardsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
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

export default GeneralAnalytics;
