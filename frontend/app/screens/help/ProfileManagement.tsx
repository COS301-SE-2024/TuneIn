// app/help/ProfileManagement.js
import React from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import {
	FontAwesome,
	MaterialCommunityIcons,
	Ionicons,
} from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProfileManagement({}) {
	const router = useRouter();
	const navigateToProfile = () => {
		router.navigate("../");
	};

	return (
		<ScrollView style={styles.container}>
			<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
				<Ionicons name="chevron-back" size={24} color="black" />
			</TouchableOpacity>
			<Text style={styles.header}>Profile Management</Text>

			<View style={styles.card}>
				<View style={styles.cardContent}>
					<FontAwesome
						name="edit"
						size={24}
						color="#08bdbd"
						style={styles.icon}
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>
							Creating and Updating Your Profile
						</Text>
						<Text style={styles.cardText}>
							Showcase your musical preferences, recently visited rooms,
							bookmarked rooms and unique taste profile by creating or updating
							your profile for other users to see your music taste.
						</Text>
					</View>
				</View>
			</View>

			<View style={styles.card}>
				<View style={styles.cardContent}>
					<FontAwesome
						name="music"
						size={24}
						color="#08bdbd"
						style={styles.icon}
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
						size={24}
						color="#08bdbd"
						style={styles.icon}
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
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ecf0f1",
		paddingVertical: 20,
		paddingHorizontal: 15,
	},
	header: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 20,
		color: "#2c3e50",
		textAlign: "center",
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
	backButton: {
		position: "absolute",
		top: 10,
		left: 10,
		zIndex: 1,
	},
});
