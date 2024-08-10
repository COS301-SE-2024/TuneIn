import React from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function GettingStarted() {
	const router = useRouter();

	return (
		<ScrollView style={styles.container}>
			<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
				<Ionicons name="chevron-back" size={24} color="black" />
			</TouchableOpacity>
			<Text style={styles.header}>Friends and Following</Text>

			<TouchableOpacity style={styles.card}>
				<View style={styles.cardContent}>
					<SimpleLineIcons
						name="user-follow"
						size={30}
						color="#08bdbd"
						style={styles.icon}
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Following</Text>
						<Text style={styles.cardText}>
							Users can follow other users and keep up with their music taste
							through the activity feed.
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.card}>
				<View style={styles.cardContent}>
					<FontAwesome5
						name="user-friends"
						size={30}
						color="#08bdbd"
						style={styles.icon}
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Friends</Text>
						<Text style={styles.cardText}>
							Users can also befriend each other by sending a friend request,
							which is only available once both users follow each other.
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
	header: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 20,
		color: "#000",
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
