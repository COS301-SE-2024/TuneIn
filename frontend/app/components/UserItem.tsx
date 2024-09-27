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
	const defaultProfileIcon = require("../../assets/profile-icon.png");
	const [profileImage, setProfileImage] = useState<string>("");
	const [imageLoaded, setImageLoaded] = useState<boolean>(false);

	const navigateToHelp = () => {
		router.navigate(
			`/screens/profile/ProfilePage?friend=${JSON.stringify({
				profile_picture_url: user.profile_picture_url,
				username: user.username,
			})}&user=${user}`,
		);
	};
	useEffect(() => {
		const imageUrl = user.profile_picture_url;
		// console.log("Image URL: " + imageUrl);

		if (
			!imageUrl ||
			imageUrl === "https://example.com/default-profile-picture.png"
		) {
			setProfileImage(defaultProfileIcon);
		} else {
			setProfileImage(imageUrl);
		}
	}, []);

	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={navigateToHelp}
				style={{ flexDirection: "row", alignItems: "center", paddingRight: 20 }}
			>
				{profileImage === defaultProfileIcon ? (
					<Image source={defaultProfileIcon} style={styles.profileImage} />
				) : (
					<Image
						source={{ uri: profileImage }}
						style={[styles.profileImage, !imageLoaded && { display: "none" }]}
						onLoad={() => setImageLoaded(true)}
					/>
				)}
				<Image
					source={
						user.profile_picture_url
							? { uri: user.profile_picture_url }
							: require("../../assets/profile-icon.png")
					}
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
