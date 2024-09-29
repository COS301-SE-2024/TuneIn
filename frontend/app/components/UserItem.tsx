import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { User } from "../models/user";
import { colors } from "../styles/colors";
import { router } from "expo-router";

interface UserItemProps {
	user: User;
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
	const navigateToProfile = () => {
		router.navigate(
			`/screens/profile/ProfilePage?friend=${JSON.stringify({
				profile_picture_url: user.profile_picture_url,
				username: user.username,
			})}`,
		);
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={navigateToProfile}
				style={{ flexDirection: "row", alignItems: "center", paddingRight: 20 }}
			>
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
