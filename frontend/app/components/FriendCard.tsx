import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Friend } from "../models/friend"; // Adjust path accordingly
import { colors } from "../styles/colors";

const defaultProfileIcon = require("../../assets/profile-icon.png");

interface FriendCardProps {
	profilePicture?: string | null;
	username: string;
	friend: Friend;
	user: string | string[];
	cardType:
		| "following"
		| "follower"
		| "friend"
		| "mutual"
		| "pending"
		| "friend-follow";
	handle: (friend: Friend) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({
	profilePicture,
	username,
	friend,
	user,
	cardType,
	handle,
}) => {
	// Check if the profile picture is null, undefined, or the default URL
	const profileImageSource =
		!profilePicture ||
		profilePicture === "https://example.com/default-profile-picture.png"
			? defaultProfileIcon
			: { uri: profilePicture };

	return (
		<View style={styles.cardContainer} testID="friend-card-container">
			<TouchableOpacity
				onPress={() =>
					router.push(
						`/screens/profile/ProfilePage?friend=${JSON.stringify(friend)}&user=${user}`,
					)
				}
				testID="friend-card-link"
			>
				<Image
					source={profileImageSource}
					style={styles.profileImage} // Styles should now be applied correctly
					testID="friend-card-image"
				/>
			</TouchableOpacity>

			<Text
				style={styles.username}
				numberOfLines={1}
				ellipsizeMode="tail"
				testID="friend-card-username"
			>
				{username}
			</Text>
			{(cardType === "friend" && (
				<TouchableOpacity
					style={styles.unfriendButton}
					onPress={() => {
						handle(friend); // Removed event.stopPropagation()
					}}
					testID="unfriend-button"
				>
					<Text style={styles.rejectText}>Unfriend</Text>
				</TouchableOpacity>
			)) ||
				(cardType === "following" && (
					<TouchableOpacity
						style={styles.unfriendButton}
						onPress={() => {
							handle(friend); // Remove stopPropagation if not needed
						}}
						testID="unfollow-button"
					>
						<Text style={styles.rejectText}>Unfollow</Text>
					</TouchableOpacity>
				)) ||
				(cardType === "follower" && (
					<TouchableOpacity
						style={styles.acceptButton}
						onPress={() => {
							handle(friend); // Remove stopPropagation if not needed
						}}
						testID="follow-button"
					>
						<Text style={styles.acceptText}>Follow</Text>
					</TouchableOpacity>
				)) ||
				(cardType === "mutual" && (
					<TouchableOpacity
						style={styles.acceptButton}
						onPress={() => {
							handle(friend); // Remove stopPropagation if not needed
						}}
						testID="add-friend-button"
					>
						<Text style={styles.acceptText}>Add Friend</Text>
					</TouchableOpacity>
				)) ||
				(cardType === "pending" && (
					<TouchableOpacity
						style={styles.unfriendButton}
						onPress={() => {
							handle(friend); // Remove stopPropagation if not needed
						}}
						testID="reject-button"
					>
						<Text style={styles.rejectText}>Cancel</Text>
					</TouchableOpacity>
				)) ||
				(cardType === "friend-follow" && (
					<Text style={styles.pendingText} testID="friend-card-username">
						Pending...
					</Text>
				)) ||
				null}
		</View>
	);
};

const styles = StyleSheet.create({
	link: {
		width: "95%", // Takes up 95% of the screen width
		alignSelf: "center",
	},
	acceptButton: {
		backgroundColor: colors.primary,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 15,
	},
	unfriendButton: {
		backgroundColor: "white",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "black",
		color: "black",
	},
	rejectText: {
		color: "black",
		fontWeight: "bold",
	},
	cardContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		justifyContent: "space-between",
		borderBottomWidth: 1,
		borderBottomColor: "lightgray",
		backgroundColor: "white", // White background
		borderRadius: 15, // Rounded borders
		overflow: "hidden", // Ensures the image and content respect the rounded corners
		width: "100%", // Full width of the link container
	},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 16,
	},
	acceptText: {
		color: colors.primaryText,
		fontWeight: "bold",
	},
	pendingText: {
		color: "purple",
		fontWeight: "bold",
		fontSize: 16,
	},
	username: {
		fontSize: 18,
		fontWeight: "bold",
		color: "black",
		flex: 1,
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
