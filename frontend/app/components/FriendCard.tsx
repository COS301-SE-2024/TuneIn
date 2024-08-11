import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { Link } from "expo-router";
import { Friend } from "../models/friend"; // Adjust path accordingly

const defaultProfileIcon = require("../../assets/profile-icon.png");

interface FriendCardProps {
	profilePicture?: string | null;
	username: string;
	friend: Friend;
	user: string | string[];
}

const { width: screenWidth } = Dimensions.get("window");

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
				<Text style={styles.username} testID="friend-card-username">
					{username}
				</Text>
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
		borderBottomColor: "#ddd",
		backgroundColor: "#f9f9f9",
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
	username: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
});

export default FriendCard;
