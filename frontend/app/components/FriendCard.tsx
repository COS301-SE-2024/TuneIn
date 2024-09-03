import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Friend } from "../models/friend"; // Adjust path accordingly
import { colors } from "../styles/colors";

const defaultProfileIcon = require("../../assets/profile-icon.png");

interface FriendCardProps {
	profilePicture?: string | null;
	username: string;
	friend: Friend;
	user: string | string[];
}

const FriendCard: React.FC<FriendCardProps> = ({
	profilePicture,
	username,
	friend,
	user,
}) => {
	// Check if the profile picture is null, undefined, or the default URL
	const profileImageSource =
		!profilePicture ||
		profilePicture === "https://example.com/default-profile-picture.png"
			? defaultProfileIcon
			: { uri: profilePicture };

	return (
		<Link
			href={`/screens/profile/ProfilePage?friend=${JSON.stringify(friend)}&user=${user}`}
			style={styles.link}
			testID="friend-card-link"
		>
			<View style={styles.cardContainer} testID="friend-card-container">
				<Image
					source={profileImageSource}
					style={styles.profileImage}
					testID="friend-card-image"
				/>
				<View style={styles.textContainer}>
					<Text style={styles.username} testID="friend-card-username">
						{username}
					</Text>
					<TouchableOpacity
						style={styles.messageButton}
						onPress={() => {
							// Define the action to send a message
							console.log(`Send message to ${username}`);
						}}
						testID="friend-card-message-button"
					>
						<Text style={styles.messageButtonText}>Message</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Link>
	);
};

const styles = StyleSheet.create({
	link: {
		width: "95%", // Takes up 95% of the screen width
		alignSelf: "center",
	},
	cardContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors.secondary,
		backgroundColor: "white", // White background
		borderRadius: 15, // Rounded borders
		overflow: "hidden", // Ensures the image and content respect the rounded corners
		width: "100%", // Full width of the link container
	},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25, // Rounded profile image
		marginRight: 16,
	},
	textContainer: {
		flex: 1, // Takes up remaining space
		flexDirection: "row", // Align username and button in a row
		justifyContent: "space-between", // Space out username and button
		alignItems: "center",
	},
	username: {
		fontSize: 18,
		fontWeight: "bold",
		color: "black",
	},
	messageButton: {
		backgroundColor: colors.primary,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
	},
	messageButtonText: {
		color: "white",
		fontSize: 14,
		fontWeight: "bold",
	},
});

export default FriendCard;
