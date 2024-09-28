import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import axios from "axios";
import auth from "../services/AuthManagement";
import * as utils from "./../services/Utils";
import { colors } from "../styles/colors";

// Default profile icon for fallback
const defaultProfileIcon = require("../../assets/profile-icon.png");

const TopNavBar: React.FC = () => {
	const router = useRouter();
	const [profileImage, setProfileImage] = useState<string>("");
	const [imageLoaded, setImageLoaded] = useState<boolean>(false);

	useEffect(() => {
		const fetchProfilePicture = async () => {
			try {
				const token = await auth.getToken();
				if (token) {
					const response = await axios.get(`${utils.API_BASE_URL}/users`, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});
					const imageUrl = response.data.profile_picture_url;

					if (!imageUrl) {
						setProfileImage(defaultProfileIcon);
					} else {
						setProfileImage(imageUrl);
					}
				}
			} catch (error) {
				console.log("Error fetching profile info:", error);
				setProfileImage(defaultProfileIcon); // Fallback in case of error
			}
		};

		fetchProfilePicture();
	}, []);

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

	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={navigateToProfile}>
				{profileImage === defaultProfileIcon ? (
					<Image
						source={defaultProfileIcon}
						style={styles.profileImage}
						testID="profile-image"
					/>
				) : (
					<Image
						source={{ uri: profileImage }}
						style={[styles.profileImage, !imageLoaded && { display: "none" }]}
						onLoad={() => setImageLoaded(true)}
						testID="profile-image"
					/>
				)}
			</TouchableOpacity>
			<View style={styles.appNameContainer}>
				<Text style={styles.appName}>TuneIn</Text>
			</View>
			<TouchableOpacity onPress={navigateToDMs}>
				<Entypo name="direction" size={24} color="black" testID="dm-icon" />
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginTop: 2,
		flexDirection: "row",
		height: 50,
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		backgroundColor: colors.backgroundColor,
	},
	appName: {
		color: "black",
		fontSize: 23,
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
