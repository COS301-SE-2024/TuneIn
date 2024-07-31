// TopNavBar.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import auth from "./../services/AuthManagement"; // Import AuthManagement
import * as utils from "./../services/Utils"; // Import Utils

interface TopNavBarProps {
	profileInfo: any;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ profileInfo }) => {
	const router = useRouter();
	
	let profileImage = "";

	if(profileInfo){
		profileImage = profileInfo.userData.profile_picture_url;
	}
	else{
		profileImage = "https://cdn-.jk.-png.freepik.com/512/3135/3135715.png";
	}

	const navigateToProfile = () => {
		router.push({
			pathname: "/screens/profile/ProfilePage",
			// params: { profile: username },
		});
	};

	const appName = "TuneIn"; // Change this to your app's name

	return (
		<View style={styles.container}>
			<View style={styles.emptyView}></View>
			<Text style={styles.appName}>{appName}</Text>
			<TouchableOpacity onPress={navigateToProfile}>
				<Image source={{ uri: profileImage }} style={styles.profileImage} />
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
	},
});

export default TopNavBar;
