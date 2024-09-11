import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	ActivityIndicator,
	TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import Picker for dropdown
import { useRouter, useLocalSearchParams } from "expo-router";
import RoomCardWidget from "../../components/rooms/RoomCardWidget";
import { Room } from "../../models/Room";
import { colors } from "../../styles/colors";
import TopNavBar from "../../components/TopNavBar";

// Utility function to group rooms by the month they were created
const groupRoomsByMonth = (rooms: Room[]) => {
	return rooms.reduce(
		(groups, room) => {
			// Convert the start_date string to a Date object
			const createdAt = room.start_date ? new Date(room.start_date) : null;

			if (!createdAt || isNaN(createdAt.getTime())) {
				// Skip if the date is invalid
				console.warn("Invalid start_date for room:", room.roomID);
				return groups;
			}

			const monthYear = `${createdAt.toLocaleString("default", {
				month: "long",
			})} ${createdAt.getFullYear()}`;

			if (!groups[monthYear]) {
				groups[monthYear] = [];
			}
			groups[monthYear].push(room);
			return groups;
		},
		{} as Record<string, Room[]>,
	);
};

const MyRooms: React.FC = () => {
	const router = useRouter();
	const { myRooms } = useLocalSearchParams(); // Get rooms from navigation params
	const [groupedRooms, setGroupedRooms] = useState<Record<string, Room[]>>({});
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState<"start_date" | "end_date">("start_date");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [sortLoading, setSortLoading] = useState(false);

	useEffect(() => {
		if (myRooms) {
			try {
				const parsedRooms: Room[] = JSON.parse(myRooms as string).map(
					(room: Room) => ({
						...room,
						start_date: room.start_date ? new Date(room.start_date) : null,
						end_date: room.end_date ? new Date(room.end_date) : null,
					}),
				);

				// Sort the rooms based on the initial sort settings
				const sortedRooms = sortRooms(parsedRooms);
				const formattedRooms = groupRoomsByMonth(sortedRooms);
				setGroupedRooms(formattedRooms);
			} catch (error) {
				console.error("Failed to parse rooms:", error);
			}
		}
		setLoading(false);
	}, [myRooms]);

	// Sorting function for rooms
	const sortRooms = (rooms: Room[]) => {
		console.log("sorting");
		return rooms.sort((a, b) => {
			const dateA = a[sortBy] as Date;
			const dateB = b[sortBy] as Date;

			if (sortDirection === "asc") {
				return dateA > dateB ? 1 : -1;
			} else {
				return dateA < dateB ? 1 : -1;
			}
		});
	};

	// Effect to handle sorting when sortBy or sortDirection changes
	useEffect(() => {
		if (!myRooms) return; // Exit if no rooms are available
		setSortLoading(true); // Start loader when sorting starts
		try {
			const parsedRooms: Room[] = JSON.parse(myRooms as string).map(
				(room: Room) => ({
					...room,
					start_date: room.start_date ? new Date(room.start_date) : null,
					end_date: room.end_date ? new Date(room.end_date) : null,
				}),
			);

			// Sort the rooms based on the sort settings
			const sortedRooms = sortRooms(parsedRooms);
			const formattedRooms = groupRoomsByMonth(sortedRooms);
			setGroupedRooms(formattedRooms);
		} catch (error) {
			console.error("Failed to sort rooms:", error);
		}
		setSortLoading(false); // Stop loader when sorting is done
	}, [sortBy, sortDirection]);

	return (
		<View style={styles.container}>
			{/* Page Title */}
			<Text style={styles.pageTitle}>My Rooms</Text>

			{/* Sorting Dropdown */}
			<View style={styles.sortContainer}>
				<Picker
					selectedValue={sortBy}
					style={styles.dropdown}
					onValueChange={(itemValue) =>
						setSortBy(itemValue as "start_date" | "end_date")
					}
				>
					<Picker.Item label="Sort by Start Date" value="start_date" />
					<Picker.Item label="Sort by End Date" value="end_date" />
				</Picker>

				<TouchableOpacity
					style={styles.sortButton}
					onPress={() =>
						setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
					}
				>
					<Text style={styles.sortButtonText}>
						{sortDirection === "asc" ? "⬆ Ascending" : "⬇ Descending"}
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={styles.scrollViewContent}>
				{loading || sortLoading ? ( // Show loader while sorting
					<ActivityIndicator
						size={60}
						color={colors.backgroundColor}
						style={{ marginTop: 260 }}
					/>
				) : (
					Object.entries(groupedRooms).map(([month, rooms]) => (
						<View key={month} style={styles.monthContainer}>
							<Text style={styles.monthHeader}>{month}</Text>
							{rooms.map((room) => (
								<RoomCardWidget key={room.roomID} roomCard={room} />
							))}
						</View>
					))
				)}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.backgroundColor,
	},
	pageTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: colors.primary,
		textAlign: "center",
		marginTop: 20,
	},
	sortContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 15,
		marginBottom: 15,
	},
	dropdown: {
		padding: 10,
		backgroundColor: colors.backgroundColor,
		borderRadius: 25,
		borderColor: colors.secondary,
		borderWidth: 2,
	},
	sortButton: {
		padding: 10,
		backgroundColor: colors.backgroundColor,
		borderRadius: 25,
		borderColor: colors.secondary,
		borderWidth: 2,
	},
	sortButtonText: {
		color: colors.primaryText,
		fontWeight: "bold",
	},
	scrollViewContent: {
		paddingVertical: 20,
	},
	monthContainer: {
		marginBottom: 20,
	},
	monthHeader: {
		fontSize: 20,
		fontWeight: "bold",
		color: colors.primary,
		marginBottom: 10,
		marginLeft: 15,
	},
});

export default MyRooms;
