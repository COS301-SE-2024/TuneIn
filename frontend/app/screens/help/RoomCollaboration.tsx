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
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function RoomCollaboration() {
	const router = useRouter();

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} testID="back-button">
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Room Collaboration</Text>
				<View style={styles.headerSpacer} />
			</View>

			<TouchableOpacity style={styles.card}>
				<View style={styles.cardContent}>
					<Entypo
						name="chat"
						size={30}
						color="#08bdbd"
						style={styles.icon}
						testID="chat-icon"
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Chat</Text>
						<Text style={styles.cardText}>
							As a user, you can interact and collaborate with others in the
							same room by sending messages in the chat section. Simply click
							the 'Show Chat' or 'Up Arrow' to reveal the chat section. To hide
							the chat after opening it, click the 'Hide Chat' or 'Down Arrow'.
							This interaction is only available if the host has enabled chat
							functionality in the room.
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.card}>
				<View style={styles.cardContent}>
					<MaterialIcons
						name="emoji-emotions"
						size={30}
						color="#08bdbd"
						style={styles.icon}
						testID="reactions-icon"
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Reactions</Text>
						<Text style={styles.cardText}>
							When in a room, you can react to the currently playing songs by
							clicking on the emoji icon between the text box and the send
							button. This will display the available reactions, and you can
							choose one to send. This interaction is only available if the host
							has enabled chat functionality in the room.
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.card}>
				<View style={styles.cardContent}>
					<MaterialIcons
						name="playlist-add"
						size={34}
						color="#08bdbd"
						style={styles.icon}
						testID="playlist-icon"
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Add To The Playlist</Text>
						<Text style={styles.cardText}>
							As a user, you can add your own songs to the playlist by clicking
							on the queue button. This will open the queue, where you can add
							songs by clicking the 'Add Song' button and searching for tracks
							to include. This interaction is only available if the host has
							enabled users to add tracks in the room.
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.card}>
				<View style={styles.cardContent}>
					<MaterialIcons
						name="how-to-vote"
						size={34}
						color="#08bdbd"
						style={styles.icon}
						testID="voting-icon"
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Voting</Text>
						<Text style={styles.cardText}>
							As a user, you can vote on the order of the songs in the playlist
							by clicking on the queue button. This will open the queue, where
							you can upvote or downvote any song currently in the
							queue/playlist. The more upvotes a song receives, the higher it
							will move in the queue, and vice versa for downvotes. This
							interaction is only available if the host has enabled voting in
							the room.
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
