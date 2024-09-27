import React, { useContext, useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	ToastAndroid,
} from "react-native";
import { User } from "../models/user";
import { colors } from "../styles/colors";
import { router } from "expo-router";
import { Player } from "../PlayerContext";
import auth from "../services/AuthManagement";
import * as utils from "../services/Utils";
import axios from "axios";

interface UserItemProps {
	user: User;
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
	// const [isFollowing, setIsFollowing] = useState<boolean>(false);
	// console.log("User Item: " + JSON.stringify(user));

	const playerContext = useContext(Player);
	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}

	const { userData } = playerContext;

	// useEffect(() => {
	// 	const checkFollow = user.followers.some(
	// 		(item: any) => item.username === userData?.username,
	// 	);
	// 	setIsFollowing(checkFollow);
	// }, [userData, user.followers]);

	// const followHandler = async () => {
	// 	const storedToken = await auth.getToken();

	// 	if (storedToken) {
	// 		if (isFollowing) {
	// 			try {
	// 				const response = await axios.post(
	// 					`${utils.API_BASE_URL}/users/${user.username}/unfollow`,
	// 					{},
	// 					{
	// 						headers: {
	// 							Authorization: `Bearer ${storedToken}`,
	// 						},
	// 					},
	// 				);

	// 				if (response) {
	// 					setIsFollowing(false);
	// 				}
	// 			} catch (error) {
	// 				console.log("Issue unfollowing user");
	// 				ToastAndroid.show("Failed to unfollow user", ToastAndroid.SHORT);
	// 			}
	// 		} else {
	// 			try {
	// 				const response = await axios.post(
	// 					`${utils.API_BASE_URL}/users/${user.username}/follow`,
	// 					{},
	// 					{
	// 						headers: {
	// 							Authorization: `Bearer ${storedToken}`,
	// 						},
	// 					},
	// 				);

	// 				if (response) {
	// 					console.log("Called Follow");
	// 					setIsFollowing(true);
	// 				}
	// 			} catch (error) {
	// 				console.log("Issue following user");
	// 				ToastAndroid.show("Failed to follow user", ToastAndroid.SHORT);
	// 			}
	// 		}
	// 	}
	// };

	const navigateToHelp = () => {
		router.navigate(
			`/screens/profile/ProfilePage?friend=${JSON.stringify({
				profile_picture_url: user.profile_picture_url,
				username: user.username,
			})}&user=${user}`,
		);
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={navigateToHelp}
				style={{ flexDirection: "row", alignItems: "center", paddingRight: 20 }}
			>
				<Image
					source={{ uri: user.profile_picture_url }}
					style={styles.profileImage}
					testID="profile-pic"
				/>
				<View style={styles.textContainer}>
					<Text style={styles.profileName} numberOfLines={1}>
						{user.profile_name}
					</Text>
					<Text style={styles.username} numberOfLines={1}>
						{user.username}
					</Text>
				</View>
			</TouchableOpacity>
			{/* <TouchableOpacity
				style={[styles.followButton, isFollowing && styles.unfollowButton]}
				onPress={followHandler}
				testID="follow-button"
			>
				<Text
					style={[
						styles.followButtonText,
						{ color: isFollowing ? "red" : colors.primary },
					]}
				>
					{isFollowing ? "Unfollow" : "Follow"}
				</Text>
			</TouchableOpacity> */}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
		paddingBottom: 20,
		paddingLeft: 20,
		paddingHorizontal: 5,
		marginTop: 20,
	},
	textContainer: {
		width: 120,
	},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 40,
		marginRight: 20,
	},
	profileName: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333",
	},
	username: {
		fontSize: 14,
		color: colors.secondary,
		fontWeight: "500",
		marginTop: 5,
	},
	followButton: {
		backgroundColor: colors.backgroundColor,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	unfollowButton: {
		borderColor: "red",
	},
	followButtonText: {
		fontWeight: "bold",
	},
});

export default UserItem;
