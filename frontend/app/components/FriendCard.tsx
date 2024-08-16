import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Friend } from "../models/friend"; // Adjust path accordingly

const defaultProfileIcon = require("../../assets/profile-icon.png");

interface FriendCardProps {
	profilePicture?: string | null;
	username: string;
	friend: Friend;
	user: string | string[];
	cardType: "following" | "follower" | "friend" | "mutual" | "pending";
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
	console.log("cardType", cardType);

	return (
		<View style={styles.cardContainer} testID="friend-card-container">
			<Link
				href={`/screens/profile/ProfilePage?friend=${JSON.stringify(friend)}&user=${user}`}
				style={(styles.link, { pointerEvents: "box-none" })}
				testID="friend-card-link"
			>
				<Image
					source={profileImageSource}
					style={styles.profileImage}
					testID="friend-card-image"
				/>
			</Link>
			<Text style={styles.username} testID="friend-card-username">
				{username}
			</Text>
			{(cardType === "friend" && (
				<TouchableOpacity
					style={styles.unfriendButton}
					onPress={(event) => {
						event.stopPropagation();
						handle(friend);
					}}
					testID="unfriend-button"
				>
					<Text style={styles.rejectText}>Unfriend</Text>
				</TouchableOpacity>
			)) ||
				(cardType === "following" && (
					<TouchableOpacity
						style={styles.unfriendButton}
						onPress={(event) => {
							event.stopPropagation();
							handle(friend);
						}}
						testID="unfollow-button"
					>
						<Text style={styles.rejectText}>Unfollow User</Text>
					</TouchableOpacity>
				)) ||
				(cardType === "follower" && (
					<TouchableOpacity
						style={styles.acceptButton}
						onPress={(event) => {
							event.stopPropagation();
							handle(friend);
						}}
						testID="follow-button"
					>
						<Text style={styles.acceptText}>Follow User</Text>
					</TouchableOpacity>
				)) ||
				(cardType === "mutual" && (
					<TouchableOpacity
						style={styles.acceptButton}
						onPress={(event) => {
							event.stopPropagation();
							handle(friend);
						}}
						testID="add-friend-button"
					>
						<Text style={styles.acceptText}>Add Friend</Text>
					</TouchableOpacity>
				)) ||
				(cardType === "pending" && (
					<TouchableOpacity
						style={styles.rejectButton}
						onPress={(event) => {
							event.stopPropagation();
							handle(friend);
						}}
						testID="reject-button"
					>
						<Text style={styles.rejectText}>Cancel</Text>
					</TouchableOpacity>
				))}
		</View>
	);
};

const styles = StyleSheet.create({
	link: {
		width: "95%", // Takes up 95% of the screen width
		alignSelf: "center",
	},
	acceptButton: {
		backgroundColor: "#4caf50",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	unfriendButton: {
		backgroundColor: "#f44336",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	rejectButton: {
		backgroundColor: "#f44336",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	rejectText: {
		color: "#fff",
		fontWeight: "bold",
	},
	cardContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		backgroundColor: "#f2f2f2",
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
	acceptText: {
		color: "#fff",
		fontWeight: "bold",
	},
	username: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
});

export default FriendCard;
