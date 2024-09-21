import React from "react";
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
	// Check if the profile picture is null, undefined, or the default URL
	const profileImageSource =
		!profilePicture ||
		profilePicture === "https://example.com/default-profile-picture.png"
			? defaultProfileIcon
			: { uri: profilePicture };

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
				style={styles.acceptButton}
				onPress={() => handleRequest(friend, true)}
				testID="accept-button"
			>
				<Text style={styles.acceptText}>Accept</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.rejectButton}
				onPress={() => handleRequest(friend, false)}
				testID="reject-button"
			>
				<Text style={styles.rejectText}>Reject</Text>
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
	acceptButton: {
		backgroundColor: colors.primary,
		padding: 5,
		borderRadius: 5,
		marginRight: 5,
	},
	acceptText: {
		color: "white",
		fontWeight: "bold",
	},
	rejectButton: {
		backgroundColor: "black",
		padding: 5,
		borderRadius: 5,
	},
	rejectText: {
		color: "white",
		fontWeight: "bold",
	},
});

export default FriendRequestCard;
