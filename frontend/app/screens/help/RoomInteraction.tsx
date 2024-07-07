import React from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function InteractiveSessions() {
	const router = useRouter();

	const navigateToScreen = (screen) => {
		router.navigate(screen);
	};

	return (
		<ScrollView style={styles.container}>
			<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
				<Ionicons name="chevron-back" size={24} color="black" />
			</TouchableOpacity>
			<Text style={styles.header}>Interactive Sessions/Rooms</Text>

			<TouchableOpacity
				style={styles.card}
				onPress={() => navigateToScreen("../CreateRoom")}
			>
				<View style={styles.cardContent}>
					<FontAwesome5
						name="door-open"
						size={24}
						color="#08bdbd"
						style={styles.icon}
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Creating Rooms</Text>
						<Text style={styles.cardText}>
							Users can create rooms that are permanent or temporary, public or
							private, and scheduled.
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.card}
				onPress={() => navigateToScreen("")}
			>
				<View style={styles.cardContent}>
					<Ionicons
						name="settings"
						size={24}
						color="#08bdbd"
						style={styles.icon}
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Room Settings</Text>
						<Text style={styles.cardText}>
							Configure room settings including room name, description, genre,
							language, explicitness, NSFW, playlist photo, and
							visibility/privacy options.
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.card}
				onPress={() => navigateToScreen("../Home")}
			>
				<View style={styles.cardContent}>
					<Ionicons
						name="enter-outline"
						size={24}
						color="#08bdbd"
						style={styles.icon}
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Joining Rooms</Text>
						<Text style={styles.cardText}>
							Users can enter and exit rooms, participate and vote, chat or
							voice chat, and direct message other users if allowed by settings.
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.card}
				onPress={() => navigateToScreen("ManagingRooms")}
			>
				<View style={styles.cardContent}>
					<FontAwesome5
						name="tools"
						size={24}
						color="#08bdbd"
						style={styles.icon}
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Managing Rooms</Text>
						<Text style={styles.cardText}>
							Room owners can manage participants, moderate content, delete the
							room and control what other users are allowed to do in room such
							as enabling chat, voting and if they may add to queue.
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
		backgroundColor: "#ecf0f1",
		paddingVertical: 20,
		paddingHorizontal: 15,
	},
	backButton: {
		position: "absolute",
		top: 10,
		left: 10,
		zIndex: 1,
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
});
