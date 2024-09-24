import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	ToastAndroid,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LineGraphCard from "../../components/LineGraphCard";
// import HorizontalBarGraphCard from "../../components/HorizontalBarGraphCard";
// import TableCard from "../../components/TableCard";
import IconProgressCard from "../../components/IconProgressCard";
import RoomDropdown from "../../components/RoomDropdown";
import AuthManagement from "../../services/AuthManagement";
import { API_BASE_URL } from "../../services/Utils";
import * as StorageService from "../../services/StorageService";

// create an interface class for user rooms
interface UserRoom {
	room_name: string;
	roomID: string;
}

// create an interface class for interaction analytics
interface InteractionAnalytics {
	messages: {
		per_hour: {
			count: number;
			hour: Date;
		}[];
		total: number;
	};
	bookmarked_count: number;
	reactions_sent: number;
}

const InteractionsAnalytics: React.FC = () => {
	const router = useRouter();

	const [selectedRoom, setSelectedRoom] = useState<UserRoom | null>(null);
	const [userRooms, setRooms] = useState<UserRoom[] | null>(null);

	const [interactionAnalytics, setInteractionAnalytics] =
		useState<InteractionAnalytics | null>(null);

	useEffect(() => {
		const fetchUserRooms = async () => {
			try {
				const accessToken: string | null = await AuthManagement.getToken();
				if (!accessToken) {
					console.error("No access token found");
					return;
				}
				const response = await fetch(`${API_BASE_URL}/users/rooms`, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					console.log("data", data);
					setRooms(data);
					setSelectedRoom(data[0]);
				} else {
					console.error("Failed to fetch user rooms");
				}
			} catch (error) {
				console.log("Failed to fetch user rooms", error);
				ToastAndroid.show("Failed to load rooms", ToastAndroid.SHORT);
			}
			// make an axios request with the API_BASE_URL and the auth token
		};

		fetchUserRooms();
		console.log("selectedRoom", selectedRoom);
	}, []);

	useEffect(() => {
		const fetchInteractionAnalytics = async () => {
			try {
				const accessToken: string | null = await AuthManagement.getToken();
				const currentRoom = await StorageService.getItem("currentRoom");
				console.log("current roooooom", currentRoom);
				if (!accessToken || !selectedRoom) {
					console.error("Cannot fetch interaction analytics without a room");
					return;
				}
				const response = await fetch(
					`${API_BASE_URL}/rooms/${selectedRoom?.roomID}/analytics/interactions`,
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					},
				);
				if (response.ok) {
					const data = await response.json();
					setInteractionAnalytics(data);
				} else {
					console.error("Failed to fetch interaction analytics");
				}
			} catch (error) {
				console.log("Failed to fetch interaction analytics", error);
				ToastAndroid.show("Failed to load interaction analytics", ToastAndroid.SHORT);
			}
		};

		fetchInteractionAnalytics();
		console.log("interaction analytics", interactionAnalytics);
	}, [selectedRoom]);

	// function that will be called when the user selects a room
	const handleRoomSelect = async (room: string) => {
		const selected: UserRoom | null =
			userRooms?.find((r: UserRoom) => r.room_name === room) ?? null;
		const accessToken: string | null = await AuthManagement.getToken();
		setSelectedRoom(selected);
		const roomID: string = selectedRoom?.roomID ?? "";
		try {
			const response = await fetch(
				`${API_BASE_URL}/rooms/${roomID}/analytics/interactions`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);
			if (response.ok) {
				const data = await response.json();
				setInteractionAnalytics(data);
			} else {
				console.error("Failed to fetch interaction analytics");
			}
		} catch (error) {
			console.error(error);
		}
	};

	const data = interactionAnalytics?.messages?.per_hour?.map((hour) => {
		return {
			label: new Date(hour.hour).getHours().toString() + ":00",
			value: hour.count,
		};
	});

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
					initialRooms={
						userRooms?.map((room) => room.room_name as string) ?? []
					}
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
