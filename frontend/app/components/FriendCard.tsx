import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Friend } from "../models/friend"; // Assume you have a Friend model

interface FriendCardProps {
	profilePicture: string;
	username: string;
	friend: Friend;
	user: string;
}

const FriendCard: React.FC<FriendCardProps> = ({
	profilePicture,
	username,
	friend,
	user,
}) => {
	console.log("Friendcard: " + JSON.stringify(friend) + "user: " + user);
	return (
		<Link
			href={`/screens/profile/ProfilePage?friend=${JSON.stringify(friend)}&user=${user}`}
			style={styles.link}
		>
			<View style={styles.cardContainer}>
				<Image source={{ uri: profilePicture }} style={styles.profileImage} />
				<Text style={styles.username}>{username}</Text>
			</View>
		</Link>
	);
};

const styles = StyleSheet.create({
	link: {
		textDecorationLine: "none",
	},
	cardContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		backgroundColor: "#f9f9f9",
	},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 16,
	},
	username: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
});

export default FriendCard;
