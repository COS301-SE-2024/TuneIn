// TopNavBar.tsx
import React, { useEffect, useState, Suspense } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
// import axios from "axios";
// import auth from "./../services/AuthManagement"; // Import AuthManagement
// import * as utils from "./../services/Utils"; // Import Utils
import { colors } from "../styles/colors";
import profileIcon from "../../assets/profile-icon.png";

// Lazy load the Image component
const LazyImage = React.lazy(() =>
	import("react-native").then((module) => ({ default: module.Image })),
);

const TopNavBar: React.FC = () => {
	const router = useRouter();
	const [profileImage, setProfileImage] = useState<string>("");

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

					if (
						!imageUrl ||
						imageUrl === "https://example.com/default-profile-picture.png"
					) {
						setProfileImage(profileIcon);
					} else {
						setProfileImage(imageUrl);
					}
				}
			} catch (error) {
				console.error("Error fetching profile info:", error);
				setProfileImage(profileIcon); // Fallback in case of error
			}
		};

		fetchProfilePicture();
	}, []);

	const navigateToProfile = () => {
		router.push({
			pathname: "/screens/profile/ProfilePage",
			// params: { profile: username },
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
			{/* <View style={styles.emptyView}></View> */}
			<TouchableOpacity onPress={navigateToProfile}>
				<LazyImage
					source={
						typeof profileImage === "string"
							? { uri: profileImage }
							: profileImage
					}
					style={styles.profileImage}
					testID="profile-image"
				/>
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
	// emptyView: {
	// 	width: 40, // Adjust as needed
	// },
	appName: {
		color: "black",
		fontSize: 20,
		fontWeight: "bold",
		// alignItems: "center",
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		// marginRight: 16,
		borderWidth: 1, // Add a border
		borderColor: "grey", // Set the border color to grey
	},
	appNameContainer: {
		flex: 1,
		alignItems: "center",
	},
});

export default TopNavBar;
