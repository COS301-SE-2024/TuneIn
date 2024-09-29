// app/help/ProfileManagement.js
import React from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { FontAwesome, Ionicons, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import { colors } from "../../styles/colors";

export default function ProfileManagement() {
	const router = useRouter();

	const navigateToAnaytics = () => {
		router.navigate("../analytics/AnalyticsPage");
	};

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} testID="back-button">
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Profile Management</Text>
				<View style={styles.headerSpacer} />
			</View>
			<View style={styles.card}>
				<View style={styles.cardContent}>
					<FontAwesome
						name="edit"
						size={28}
						color="#08bdbd"
						style={styles.icon}
						testID="edit-icon"
					/>
					<TouchableOpacity style={styles.textContainer}>
						<Text style={styles.cardTitle}>
							Creating and Updating Your Profile
						</Text>
						<Text style={styles.cardText}>
							Showcase your musical preferences, recently visited rooms,
							bookmarked rooms and unique taste profile by creating or updating
							your profile for other users to see your music taste.
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.card}>
				<View style={styles.cardContent}>
					<FontAwesome
						name="music"
						size={28}
						color="#08bdbd"
						style={styles.icon}
						testID="music-icon"
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Music Preferences</Text>
						<Text style={styles.cardText}>
							Import or manually specify your favorite artists, genres, and
							songs.
						</Text>
					</View>
				</View>
			</View>

			<View style={styles.card}>
				<View style={styles.cardContent}>
					<Octicons
						name="heart-fill"
						size={28}
						color="#08bdbd"
						style={styles.icon}
						testID="heart-icon"
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Personalized Recommendations</Text>
						<Text style={styles.cardText}>
							Receive personalized room recommendations to enhance discovery and
							connection through shared tastes.
						</Text>
					</View>
				</View>
			</View>
			<TouchableOpacity style={styles.card} onPress={navigateToAnaytics}>
				<View style={styles.cardContent}>
					<Entypo
						name="bar-graph"
						size={28}
						color="#08bdbd"
						style={styles.icon}
						testID="analytics-icon"
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Analytics</Text>
						<Text style={styles.cardText}>
							Users can access detailed analytics to track engagement and
							feedback from your rooms. This includes the number of
							participants, the most voted songs, and activity levels. To view
							your analytics, simply navigate to your profile page and click on
							'Settings'. From there, you can explore all available metrics.
							These insights help you tailor your content to better meet the
							preferences of your audience
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.backgroundColor,
		paddingVertical: 20,
		paddingHorizontal: 15,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 10,
		marginBottom: 20,
	},
	closeButton: {
		fontSize: 20,
		fontWeight: "bold",
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "bold",
	},
	headerSpacer: {
		width: 0,
	},
	card: {
		marginBottom: 20,
		borderRadius: 10,
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 3, // for Android
	},
	cardContent: {
		flexDirection: "row",
		alignItems: "center",
		padding: 15,
	},
	icon: {
		marginRight: 15,
	},
	textContainer: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#2c3e50",
		marginBottom: 5,
	},
	cardText: {
		fontSize: 16,
		color: "#34495e",
		lineHeight: 22,
	},
});
