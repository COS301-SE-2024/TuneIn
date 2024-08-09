import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import MetricsCard from "../../components/MetricsCard";
import PieChartCard from "../../components/PieChartCard";

const AnalyticsPage: React.FC = () => {
	const router = useRouter();
	const [activeButton, setActiveButton] = useState("Day");
	const [drawerOpen, setDrawerOpen] = useState(false);

	const handleButtonPress = (button: string) => {
		setActiveButton(button);
	};

	const toggleDrawer = () => {
		setDrawerOpen(!drawerOpen);
	};

	return (
		<View style={{ flex: 1 }}>
			{drawerOpen && (
				<View style={styles.drawer}>
					<TouchableOpacity onPress={toggleDrawer}>
						<Ionicons
							name="close"
							size={30}
							color="black"
							style={styles.drawerCloseIcon}
						/>
					</TouchableOpacity>
					<View style={styles.drawerContent}>
						<TouchableOpacity
							onPress={() => router.push("/screens/analytics/GeneralAnalytics")}
						>
							<Text style={styles.drawerItem}>General Analytics</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() =>
								router.push("/screens/analytics/InteractionsAnalytics")
							}
						>
							<Text style={styles.drawerItem}>Interactions Analytics</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() =>
								router.push("/screens/analytics/PlaylistAnalytics")
							}
						>
							<Text style={styles.drawerItem}>Playlist Analytics</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
			<ScrollView contentContainerStyle={styles.scrollView}>
				<View style={styles.container}>
					<View style={styles.header}>
						<TouchableOpacity
							onPress={() => router.back()}
							testID="back-button"
						>
							<Ionicons name="chevron-back" size={24} color="black" />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Key Metrics Summary</Text>
						<TouchableOpacity onPress={toggleDrawer} testID="menu-button">
							<Ionicons name="menu" size={24} color="black" />
						</TouchableOpacity>
					</View>
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={[
								styles.timeButton,
								activeButton === "Day" && styles.activeButton,
							]}
							onPress={() => handleButtonPress("Day")}
						>
							<Text
								style={[
									styles.timeButtonText,
									activeButton === "Day" && styles.activeButtonText,
								]}
							>
								Day
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.timeButton,
								activeButton === "Week" && styles.activeButton,
							]}
							onPress={() => handleButtonPress("Week")}
						>
							<Text
								style={[
									styles.timeButtonText,
									activeButton === "Week" && styles.activeButtonText,
								]}
							>
								Week
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.timeButton,
								activeButton === "Month" && styles.activeButton,
							]}
							onPress={() => handleButtonPress("Month")}
						>
							<Text
								style={[
									styles.timeButtonText,
									activeButton === "Month" && styles.activeButtonText,
								]}
							>
								Month
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.cardsContainer}>
						<MetricsCard
							title="Unique Visitors"
							number="1,234"
							percentage="+12%"
						/>
						<MetricsCard
							title="Returning Visitors"
							number="567"
							percentage="-8%"
						/>
					</View>
					<View style={styles.cardsContainer}>
						<MetricsCard
							title="Average Session Duration"
							number="1 hour 30 min"
							percentage="+12%"
						/>
					</View>
					<View style={styles.cardsContainer}>
						<PieChartCard returningVisitors={80} newVisitors={20} />
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 20,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 10,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
	},
	scrollView: {
		flexGrow: 1,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
	},
	timeButton: {
		flex: 1,
		paddingVertical: 10,
		marginHorizontal: 5,
		backgroundColor: "white",
		borderRadius: 5,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	timeButtonText: {
		fontSize: 16,
		color: "black",
		fontWeight: "bold",
	},
	activeButton: {
		backgroundColor: colors.primary,
	},
	activeButtonText: {
		color: "white",
	},
	cardsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
	},
	card: {
		flex: 1,
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		alignItems: "center",
		marginHorizontal: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	cardTitle: {
		fontSize: 18,
		color: "black",
		fontWeight: "bold",
	},
	cardNumber: {
		fontSize: 30,
		color: "black",
		fontWeight: "bold",
		marginTop: 10,
	},
	cardPercentage: {
		fontSize: 16,
		marginTop: 10,
		fontWeight: "bold",
	},
	positive: {
		color: "green",
	},
	negative: {
		color: "red",
	},
	drawer: {
		position: "absolute",
		top: 0,
		right: 0,
		width: 250,
		height: "100%",
		backgroundColor: "white",
		shadowColor: "#000",
		shadowOffset: { width: -5, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 5,
		padding: 20,
		zIndex: 10, // Ensure drawer is above other content
	},
	drawerContent: {
		marginTop: 30, // Space for the close icon
	},
	drawerItem: {
		fontSize: 20,
		marginVertical: 10,
		color: colors.primary,
	},
	drawerCloseIcon: {
		position: "absolute",
		top: 0,
		right: 0,
	},
});

export default AnalyticsPage;
