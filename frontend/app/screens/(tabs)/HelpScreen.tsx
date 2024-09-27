import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	TextInput,
	Modal,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";

const menuItems = [
	{
		title: "Getting Started",
		icon: "🚀",
		subcategories: [
			{ title: "Introduction", screen: "screens/help/GettingStarted" },
			{ title: "About", screen: "screens/help/GettingStarted" },
			{ title: "Creating an Account", screen: "screens/help/GettingStarted" },
			{ title: "Logging In", screen: "screens/help/GettingStarted" },
		],
		route: "screens/help/GettingStarted",
	},
	{
		title: "Profile Management",
		icon: "👤",
		subcategories: [
			{
				title: "Creating and Updating Your Profile",
				screen: "screens/help/ProfileManagement",
			},
			{ title: "Music Preferences", screen: "screens/help/ProfileManagement" },
			{
				title: "Personalized Recommendations",
				screen: "screens/help/ProfileManagement",
			},
			{ title: "Analytics", screen: "screens/help/ProfileManagement" },
		],
		route: "screens/help/ProfileManagement",
	},
	{
		title: "Interactive Sessions/Rooms",
		icon: "🎤",
		subcategories: [
			{ title: "Creating Rooms", screen: "screens/help/RoomInteraction" },
			{ title: "Room Settings", screen: "screens/help/RoomInteraction" },
			{ title: "Managing Rooms", screen: "screens/help/RoomInteraction" },
			{ title: "Joining Rooms", screen: "screens/help/RoomInteraction" },
			{ title: "Bookmarking Rooms", screen: "screens/help/RoomInteraction" },
		],
		route: "screens/help/RoomInteraction",
	},
	{
		title: "Room Collaboration",
		icon: "🤝",
		subcategories: [
			{ title: "Chat", screen: "screens/help/RoomCollaboration" },
			{ title: "Reactions", screen: "screens/help/RoomCollaboration" },
			{
				title: "Add To The Playlist",
				screen: "screens/help/RoomCollaboration",
			},
			{ title: "Voting", screen: "screens/help/RoomCollaboration" },
		],
		route: "screens/help/RoomCollaboration",
	},
	{
		title: "Friends and Following",
		icon: "👥",
		subcategories: [
			{ title: "Following", screen: "screens/help/FriendsFollowing" },
			{ title: "Friends", screen: "screens/help/FriendsFollowing" },
		],
		route: "screens/help/FriendsFollowing",
	},
	// ... (Add more sections here)
];

export default function HelpMenu() {
	const router = useRouter();

	const [message, setMessage] = useState("");
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [modalMessage, setModalMessage] = useState("");

	const navigateToScreen = (screen: string) => {
		router.navigate(`/${screen}`);
	};

	const handleSendMessage = async () => {
		if (message.trim() === "") {
			// Show modal with error message if no message is typed
			setModalMessage("Please enter a message before sending.");
		} else {
			// Show modal with success message if message is typed
			const token = await auth.getToken();
			// Send message to backend
			try {
				const response = await fetch(`${utils.API_BASE_URL}/users/feedback`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ feedback: message }),
				});
				if (!response.ok) {
					const error = await response.json();
					setModalMessage(error.message);
				} else {
					setModalMessage(
						"Thank you for your feedback! We will get back to you soon.",
					);
					setMessage(""); // Clear the input field after sending
				}
			} catch (error) {
				console.log("Failed to send feedback:", error);
				setModalMessage("Failed to send feedback. Please try again later.");
			}
		}
		setIsModalVisible(true); // Trigger modal to show
	};

	const closeModal = () => {
		setIsModalVisible(false);
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView contentContainerStyle={styles.container}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
					testID="backButton"
				>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.title} testID="title">
					Help Center
				</Text>
				{menuItems.map((item, index) => (
					<View key={index} style={styles.section} testID={`section-${index}`}>
						<TouchableOpacity
							style={styles.header}
							onPress={() => navigateToScreen(item.route)}
							testID={`menuItem-${index}`}
						>
							<Text style={styles.headerText}>
								{item.icon} {item.title}
							</Text>
						</TouchableOpacity>
						{item.subcategories.map((subcategory, subIndex) => (
							<TouchableOpacity
								key={subIndex}
								style={styles.subcategory}
								onPress={() => navigateToScreen(subcategory.screen)}
							>
								<Text style={styles.subcategoryText}>{subcategory.title}</Text>
							</TouchableOpacity>
						))}
					</View>
				))}

				{/* Contact / Feedback Section */}
				<View style={styles.feedbackSection}>
					<Text style={styles.feedbackTitle}>Contact Us / Feedback</Text>
					<TextInput
						style={styles.feedbackInput}
						placeholder="Describe your issue or feedback..."
						value={message}
						onChangeText={setMessage}
						multiline={true}
						numberOfLines={4}
						placeholderTextColor="#999"
					/>
					<TouchableOpacity
						style={styles.sendButton}
						onPress={handleSendMessage}
						testID="sendMessageButton"
					>
						<Text style={styles.sendButtonText}>Send Feedback</Text>
					</TouchableOpacity>
				</View>

				{/* Modal for Confirmation */}
				<Modal
					visible={isModalVisible}
					transparent={true}
					animationType="slide"
					onRequestClose={closeModal}
				>
					<View style={styles.modalContainer}>
						<View style={styles.modalContent}>
							<Text style={styles.modalText}>{modalMessage}</Text>
							<TouchableOpacity style={styles.modalButton} onPress={closeModal}>
								<Text style={styles.modalButtonText}>OK</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 20,
		paddingTop: 15,
		backgroundColor: colors.backgroundColor,
	},
	backButton: {
		position: "absolute",
		top: 30,
		left: 20,
		zIndex: 1,
	},
	title: {
		fontSize: 23,
		fontWeight: "bold",
		color: colors.primaryText,
		marginBottom: 20,
		textAlign: "center",
	},
	section: {
		backgroundColor: "#fff",
		padding: 15,
		borderRadius: 8,
		marginBottom: 15,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 3,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	headerText: {
		fontSize: 18,
		fontWeight: "bold",
	},
	subcategory: {
		paddingVertical: 5,
	},
	subcategoryText: {
		fontSize: 16,
		color: colors.primary,
	},
	feedbackSection: {
		backgroundColor: "#fff",
		padding: 20,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowRadius: 15,
		elevation: 4,
		marginBottom: 30,
	},
	feedbackTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 15,
		textAlign: "center",
	},
	feedbackInput: {
		borderWidth: 1,
		borderColor: colors.primary,
		padding: 15,
		borderRadius: 10,
		backgroundColor: "#fafafa",
		fontSize: 16,
		color: "#333",
		height: 100,
		textAlignVertical: "top",
		marginBottom: 15,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowRadius: 10,
		elevation: 3,
	},
	sendButton: {
		backgroundColor: colors.primary,
		paddingVertical: 15,
		borderRadius: 25,
		alignItems: "center",
	},
	sendButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 18,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		backgroundColor: "#fff",
		padding: 20,
		borderRadius: 10,
		width: "80%",
		alignItems: "center",
	},
	modalText: {
		fontSize: 18,
		textAlign: "center",
		marginBottom: 15,
	},
	modalButton: {
		backgroundColor: colors.primary,
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
	},
	modalButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});
