// TopNavBar.tsx
import React, { useEffect, useState, Suspense } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import auth from "./../services/AuthManagement"; // Import AuthManagement
import * as utils from "./../services/Utils"; // Import Utils
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
		});
	};

	const appName = "TuneIn"; // Change this to your app's name

	return (
		<View style={styles.container}>
			<View style={styles.emptyView}></View>
			<Text style={styles.appName}>{appName}</Text>
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
	emptyView: {
		width: 40, // Adjust as needed
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
		marginRight: 16,
		borderWidth: 1, // Add a border
		borderColor: "grey", // Set the border color to grey
	},
});

export default TopNavBar;
