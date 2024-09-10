import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
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
	const [isFollowing, setIsFollowing] = useState<boolean>(false);

	const playerContext = useContext(Player);
	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}

	const { userData } = playerContext;

	useEffect(() => {
		console.log("effect called: " + JSON.stringify(user.followers));
		// if (userData !== null) {
		const checkFollow = user.followers.some(
			(item: any) => item.username === userData.username,
		);
		console.log("Following: " + checkFollow);
		setIsFollowing(checkFollow);
		// }
	}, [userData, user.followers]);

	const followHandler = async () => {
		const storedToken = await auth.getToken();

		if (storedToken) {
			if (isFollowing) {
				const response = await axios.post(
					`${utils.API_BASE_URL}/users/${user.id}/unfollow`,
					{},
					{
						headers: {
							Authorization: `Bearer ${storedToken}`,
						},
					},
				);

				if (response) {
					console.log("Called Unfollow");
					setIsFollowing(false);
				} else {
					console.error("Issue unfollowing user");
				}
			} else {
				const response = await axios.post(
					`${utils.API_BASE_URL}/users/${user.id}/follow`,
					{},
					{
						headers: {
							Authorization: `Bearer ${storedToken}`,
						},
					},
				);

				if (response) {
					console.log("Called Follow");
					setIsFollowing(true);
				} else {
					console.error("Issue unfollowing user");
				}
			}
		}
	};

	// const handleFollowToggle = () => {
	// 	setIsFollowing((prevState) => !prevState);
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
				style={{ flexDirection: "row", alignItems: "center", paddingRight: 40 }}
			>
				<Image
					source={{ uri: user.profile_picture_url }}
					style={styles.profileImage}
				/>
				<View>
					<Text style={styles.profileName}>{user.profile_name}</Text>
					<Text style={styles.username}>{user.username}</Text>
				</View>
			</TouchableOpacity>
			<TouchableOpacity
				style={[styles.followButton, isFollowing && styles.unfollowButton]}
				onPress={followHandler}
			>
				<Text style={styles.followButtonText}>
					{isFollowing ? "Unfollow" : "Follow"}
				</Text>
			</TouchableOpacity>
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
		paddingHorizontal: 20,
	},
	profileImage: {
		width: 70,
		height: 70,
		borderRadius: 40,
		marginRight: 20,
		marginTop: 20,
	},
	profileName: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginTop: 20,
	},
	username: {
		fontSize: 16,
		color: colors.secondary,
		fontWeight: "500",
	},
	followButton: {
		marginTop: 20,
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 15,
		backgroundColor: colors.primary,
		alignItems: "center",
		width: "30%",
	},
	unfollowButton: {
		backgroundColor: colors.secondary,
	},
	followButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
});

export default UserItem;
