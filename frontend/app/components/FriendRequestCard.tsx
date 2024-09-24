import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Friend } from "../models/friend"; // Adjust path accordingly
import { colors } from "../styles/colors";

const defaultProfileIcon = require("../../assets/profile-icon.png");

interface FriendRequestCardProps {
	profilePicture?: string | null;
	username: string;
	friend: Friend;
	handleRequest: (friend: Friend, accept: boolean) => Promise<void>;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
	profilePicture,
	username,
	friend,
	handleRequest,
}) => {
	// State to track if buttons are pressed
	const [acceptPressed, setAcceptPressed] = useState(false);
	const [rejectPressed, setRejectPressed] = useState(false);

	const profileImageSource =
		!profilePicture ||
		profilePicture === "https://example.com/default-profile-picture.png"
			? defaultProfileIcon
			: { uri: profilePicture };

	// Handle Accept button press
	const handleAcceptPress = () => {
		setAcceptPressed(true);
		setRejectPressed(false);
		handleRequest(friend, true);
	};

	// Handle Reject button press
	const handleRejectPress = () => {
		setRejectPressed(true);
		setAcceptPressed(false);
		handleRequest(friend, false);
	};

	return (
		<View style={styles.cardContainer} testID="friend-request-card-container">
			<Image
				source={profileImageSource}
				style={styles.profileImage}
				testID="friend-request-card-image"
			/>
			<Text style={styles.username} testID="friend-request-card-username">
				{username}
			</Text>
			<TouchableOpacity
				style={[
					styles.button,
					acceptPressed
						? { backgroundColor: colors.backgroundColor }
						: { backgroundColor: colors.primary },
					{ borderColor: colors.primary },
				]}
				onPress={handleAcceptPress}
				testID="accept-button"
			>
				<Text
					style={[
						styles.acceptText,
						acceptPressed
							? { color: colors.primary }
							: { color: colors.backgroundColor },
					]}
				>
					Accept
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.button,
					rejectPressed
						? { backgroundColor: "black" }
						: { backgroundColor: "black" },
					{ borderColor: "black" },
				]}
				onPress={handleRejectPress}
				testID="reject-button"
			>
				<Text
					style={[
						styles.rejectText,
						rejectPressed
							? { color: colors.backgroundColor }
							: { color: "white" },
					]}
				>
					Reject
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	cardContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
	},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 10,
	},
	username: {
		fontSize: 16,
		flex: 1,
	},
	button: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 20,
		borderWidth: 1,
		marginRight: 10, // Add some space between buttons
	},
	acceptText: {
		fontWeight: "bold",
	},
	rejectText: {
		fontWeight: "bold",
	},
});

export default FriendRequestCard;
