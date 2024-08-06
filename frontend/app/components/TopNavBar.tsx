// TopNavBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
// import axios from "axios";
// import auth from "./../services/AuthManagement"; // Import AuthManagement
// import * as utils from "./../services/Utils"; // Import Utils

interface TopNavBarProps {
	profileInfo: any;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ profileInfo }) => {
	const router = useRouter();

	let profileImage = "";

	if (profileInfo) {
		profileImage = profileInfo.userData.profile_picture_url;
	} else {
		profileImage = "https://cdn-.jk.-png.freepik.com/512/3135/3135715.png";
	}

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
				<Image
					source={{ uri: profileImage }}
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
		flexDirection: "row",
		height: 56,
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		backgroundColor: "#FFF",
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5E5",
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
	},
	appNameContainer: {
		flex: 1,
		alignItems: "center",
	},
});

export default TopNavBar;
