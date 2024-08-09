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
import LineGraphCard from "../../components/LineGraphCard";
import HorizontalBarGraphCard from "../../components/HorizontalBarGraphCard";
import TableCard from "../../components/TableCard";
import IconProgressCard from "../../components/IconProgressCard";

const InteractionsAnalytics: React.FC = () => {
	const router = useRouter();

	// Sample data for the past seven days
	const data = [47, 75, 57, 65, 80, 47, 85];

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
				<LineGraphCard data={data} title="Daily Messages" />
				<IconProgressCard
					icon="message"
					header="Messages"
					number="15%"
					progress={0.15} // Progress from 0 to 1
				/>
				<IconProgressCard
					icon="emoji-happy"
					header="Reactions"
					number="85%"
					progress={0.85} // Progress from 0 to 1
				/>
				<HorizontalBarGraphCard data={datah} title="Playlist Contributions" />
				<TableCard
					title="Top Playlist Contributors"
					headers={headers}
					data={dataTable}
				/>
				<HorizontalBarGraphCard data={datah2} title="Room Bookmarks" />
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
