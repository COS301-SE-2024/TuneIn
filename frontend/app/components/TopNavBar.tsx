import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import axios from "axios";
import auth from "../services/AuthManagement";
import * as utils from "./../services/Utils";
import { colors } from "../styles/colors";
import { useLive } from "../LiveContext";

// Default profile icon for fallback
const defaultProfileIcon = require("../../assets/profile-icon.png");

const TopNavBar: React.FC = () => {
	const router = useRouter();
	const { currentUser } = useLive();
	const [profileImage, setProfileImage] = useState<string>(defaultProfileIcon);
	const [imageLoaded, setImageLoaded] = useState<boolean>(false);

	useEffect(() => {
		if (!currentUser) {
			setProfileImage(defaultProfileIcon);
		} else if (
			currentUser.profile_picture_url ===
			"https://example.com/default-profile-picture.png"
		) {
			setProfileImage(defaultProfileIcon);
		} else {
			setProfileImage(currentUser.profile_picture_url);
		}
	}, [currentUser]);

	const navigateToProfile = () => {
		router.push({
			pathname: "/screens/profile/ProfilePage",
		});
	};

	const navigateToDMs = () => {
		router.push({
			pathname: "/screens/messaging/ChatListScreen",
		});
	};

	const appName = "TuneIn"; // Change this to your app's name

	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={navigateToProfile}>
				{profileImage === defaultProfileIcon ? (
					<Image source={defaultProfileIcon} style={styles.profileImage} />
				) : (
					<Image
						source={{ uri: profileImage }}
						style={[styles.profileImage, !imageLoaded && { display: "none" }]}
						onLoad={() => setImageLoaded(true)}
					/>
				)}
			</TouchableOpacity>
			<View style={styles.appNameContainer}>
				<Text style={styles.appName}>{appName}</Text>
			</View>
			<TouchableOpacity onPress={navigateToDMs}>
				<Entypo name="direction" size={24} color="black" />
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginTop: 0,
		flexDirection: "row",
		height: 56,
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		backgroundColor: colors.backgroundColor,
	},
	appName: {
		color: "black",
		fontSize: 20,
		fontWeight: "bold",
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "grey",
	},
	appNameContainer: {
		flex: 1,
		alignItems: "center",
	},
});

export default TopNavBar;
