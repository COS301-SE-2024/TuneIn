import React, { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	ActivityIndicator,
	TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import RoomCardWidget from "../../components/rooms/RoomCardWidget";
import { Room } from "../../models/Room";
import { colors } from "../../styles/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Utility function to group rooms by the month they were created
const groupRoomsByMonth = (rooms: Room[]) => {
	return rooms.reduce(
		(groups, room) => {
			const createdAt = room.date_created ? new Date(room.date_created) : null;

			if (!createdAt || isNaN(createdAt.getTime())) {
				console.warn("Invalid date_created for room:", room.roomID);
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
	const { myRooms } = useLocalSearchParams();
	const router = useRouter(); // Initialize router
	const [groupedRooms, setGroupedRooms] = useState<Record<string, Room[]>>({});
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState<"date_created" | "name">("date_created");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [sortLoading, setSortLoading] = useState(false);
	console.log(" myRooms", JSON.parse(myRooms as string));

	// Sorting function for rooms
	const sortRooms = useCallback(
		(rooms: Room[]) => {
			if (sortBy === "date_created") {
				return rooms.sort((a, b) => {
					if (sortDirection === "asc") {
						return (
							new Date(a.date_created).getTime() -
							new Date(b.date_created).getTime()
						);
					} else {
						return (
							new Date(b.date_created).getTime() -
							new Date(a.date_created).getTime()
						);
					}
				});
			} else {
				return rooms.sort((a, b) => {
					if (sortDirection === "asc") {
						return a.name.localeCompare(b.name);
					} else {
						return b.name.localeCompare(a.name);
					}
				});
			}
		},
		[sortBy, sortDirection],
	);

	useEffect(() => {
		console.log("MyRooms.tsx: myRooms", myRooms);
		if (myRooms) {
			try {
				const parsedRooms: Room[] = JSON.parse(myRooms as string).map(
					(room: Room) => ({
						...room,
						start_date: room.start_date ? room.start_date : null,
						end_date: room.end_date ? room.end_date : null,
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
	}, [myRooms, sortRooms]);

	// Effect to handle sorting when sortBy or sortDirection changes
	useEffect(() => {
		console.log("The rooms i am in", myRooms);
		if (!myRooms) return;
		setSortLoading(true);
		try {
			const parsedRooms: Room[] = JSON.parse(myRooms as string).map(
				(room: Room) => ({
					...room,
					start_date: room.start_date ? new Date(room.start_date) : null,
					end_date: room.end_date ? new Date(room.end_date) : null,
				}),
			);

			const sortedRooms = sortRooms(parsedRooms);
			const formattedRooms = groupRoomsByMonth(sortedRooms);
			setGroupedRooms(formattedRooms);
		} catch (error) {
			console.error("Failed to sort rooms:", error);
		}
		setSortLoading(false);
	}, [sortBy, sortDirection, myRooms, sortRooms]);

	return (
		<View style={styles.container}>
			<View style={styles.titleContainer}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
					testID="back-button"
				>
					<Ionicons name="chevron-back" size={24} color="#000" />
				</TouchableOpacity>
				<Text style={styles.pageTitle}>My Rooms</Text>
				<TouchableOpacity
					onPress={() => router.push("screens/rooms/CreateRoom")} // Navigate to another page
					style={styles.addButton}
				>
					<MaterialCommunityIcons
						name="plus"
						size={30}
						color={colors.primaryText}
					/>
				</TouchableOpacity>
			</View>

			<View style={styles.sortContainer}>
				<Picker
					testID="dropdown"
					selectedValue={sortBy}
					style={styles.dropdown}
					onValueChange={(itemValue) =>
						setSortBy(itemValue as "date_created" | "name")
					}
				>
					<Picker.Item label="Sort by Creation Date" value="date_created" />
					<Picker.Item label="Sort by Name" value="name" />
				</Picker>

				<TouchableOpacity
					style={styles.sortButton}
					onPress={() =>
						setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
					}
					testID="sort-arrow"
				>
					<MaterialCommunityIcons
						name={sortDirection === "asc" ? "arrow-up" : "arrow-down"}
						size={24}
						color={colors.primaryText}
					/>
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={styles.scrollViewContent}>
				{false ? (
					<ActivityIndicator
						testID="loading-indicator"
						size={60}
						color={colors.backgroundColor}
						style={{ marginTop: 260 }}
					/>
				) : (
					Object.entries(groupedRooms).map(([month, rooms]) => (
						<View key={month} style={styles.monthContainer}>
							<Text style={styles.monthHeader}>{month}</Text>
							{rooms.map((room) => (
								<View key={room.roomID} style={styles.roomCardContainer}>
									<RoomCardWidget roomCard={room} />
								</View>
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
	backButton: {
		position: "absolute",
		left: 10,
	},
	roomCardContainer: {
		marginBottom: 25, // Add spacing between RoomCardWidgets
	},
	titleContainer: {
		flexDirection: "row",
		justifyContent: "center", // Center the title
		alignItems: "center",
		marginTop: 20,
		paddingHorizontal: 10,
		position: "relative", // Allows absolute positioning of the button
		paddingBottom: 20,
	},
	addButton: {
		position: "absolute",
		right: 10, // Position the button on the right side
		padding: 10,
	},

	pageTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: colors.primaryText,
	},
	sortContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
		marginBottom: 2,
		paddingHorizontal: 10,
	},
	dropdown: {
		flex: 1,
		padding: 10,
		backgroundColor: colors.backgroundColor,
		borderRadius: 25,
		borderColor: colors.secondary,
		borderWidth: 2,
		color: colors.primaryText,
	},
	sortButton: {
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
		backgroundColor: colors.backgroundColor,
		borderRadius: 25,
	},
	scrollViewContent: {
		paddingVertical: 20,
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
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
