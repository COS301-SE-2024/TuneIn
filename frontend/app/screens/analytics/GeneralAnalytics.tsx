import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LineGraphCard from "../../components/LineGraphCard"; // Import the LineGraphCard
import HorizontalBarGraphCard from "../../components/HorizontalBarGraphCard";
import TableCard from "../../components/TableCard";

const GeneralAnalytics: React.FC = () => {
	const router = useRouter();

	// Sample data for the past seven days
	const data = [50, 60, 70, 65, 80, 90, 85];

	// Sample data for the horizontal bar graph
	const datah = [
		{ label: "Room A", value: 562 },
		{ label: "Room B", value: 747 },
		{ label: "Room C", value: 191 },
		{ label: "Room D", value: 435 },
		{ label: "Room E", value: 85 },
	];

	const headers = ["Room", "Longest", "Shortest"];
	const dataTable = [
		["Room A", "3 hrs", "5 min"],
		["Room B", "2 hrs 30min", "7 min"],
		["Room C", "2hrs", "4 min"],
	];

	return (
		<ScrollView contentContainerStyle={styles.scrollView}>
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()}>
						<Ionicons name="chevron-back" size={24} color="black" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>General and Room Analytics</Text>
					<View style={styles.headerSpacer} />
				</View>
				{/* Reusable LineGraphCard component */}
				<LineGraphCard data={data} title="Weekly Participants" />
				<HorizontalBarGraphCard
					data={datah}
					title="Room Popularity by Clicks"
				/>
				<HorizontalBarGraphCard
					data={[
						{ label: "Task 1", value: 253 },
						{ label: "Task 2", value: 343 },
						{ label: "Task 2", value: 55 },
						{ label: "Task 2", value: 221 },
						{ label: "Task 2", value: 15 },
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
