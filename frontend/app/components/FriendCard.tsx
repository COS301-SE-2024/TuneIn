import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Friend } from "../models/friend"; // Adjust path accordingly
import { colors } from "../styles/colors";
import { color } from "react-native-elements/dist/helpers";

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
						<Text style={styles.rejectText}>Unfollow</Text>
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
						<Text style={styles.acceptText}>Follow</Text>
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
						style={styles.unfriendButton}
						onPress={(event) => {
							event.stopPropagation();
							handle(friend);
						}}
						testID="reject-button"
					>
						<Text style={styles.rejectText}>Cancel</Text>
					</TouchableOpacity>
				)) ||
				(cardType === "friend-follow" && ( // whomever is redesigning this, please make that a user cannot unfollow a friend so there ideally shouldn't be a button here
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
		borderRadius: 8,
	},
	unfriendButton: {
		backgroundColor: colors.backgroundColor,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "red",
		color: "red",
	},
	rejectText: {
		color: "red",
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
		borderRadius: 25, // Rounded profile image
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
