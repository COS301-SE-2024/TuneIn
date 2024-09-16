// import * as React from "react";
import React, { useCallback, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import AllFriends from "./AllFriends";
import Followers from "./Followers";
import Following from "./Following";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../styles/colors";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as utils from "../../services/Utils";
import auth from "../../services/AuthManagement";

// Create a tab navigator
const Tab = createMaterialTopTabNavigator();

// Define the top tab navigator
function MyTabs({ username }: { username: string }) {
	const navigation = useNavigation(); // To handle navigation actions

	// const [primaryProfileData, setPrimProfileData] = useState<any>(null);
	// const fetchProfileInfo = async (token: string) => {
	// 	try {
	// 		if (token) {
	// 			const response = await axios.get(`${utils.API_BASE_URL}/users`, {
	// 				headers: {
	// 					Authorization: `Bearer ${token}`,
	// 				},
	// 			});

	// 			return response.data;
	// 		}
	// 	} catch (error) {
	// 		console.error("Error fetching profile info:", error);
	// 	}
	// };

	// const refreshData = useCallback(async () => {
	// 	// setLoading(true);
	// 	const storedToken = await auth.getToken();
	// 	console.log("Stored token:", storedToken);

	// 	if (storedToken) {
	// 		if (!userData) {
	// 			const userInfo = await fetchProfileInfo(storedToken);
	// 			setUserData(userInfo);
	// 		}

	// }, }[]);

	return (
		<>
			{/* Custom Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
					testID="back-button"
				>
					<Ionicons name="chevron-back" size={24} color="#000" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{username}</Text>
				{/* <Text style={{ fontWeight: "400", textAlign: "center" }}>
					@{primaryProfileData.username}
				</Text> */}
			</View>

			{/* Tab Navigator */}
			<Tab.Navigator
				initialRouteName="Following"
				screenOptions={{
					tabBarLabelStyle: styles.tabBarLabel,
					tabBarIndicatorStyle: styles.tabBarIndicator,
					tabBarActiveTintColor: "#000", // Active tab color
					tabBarInactiveTintColor: "#888", // Inactive tab color
					tabBarStyle: styles.tabBarStyle, // Tab bar background color
					tabBarItemStyle: styles.tabBarItemStyle, // Tab item style (for height)
				}}
			>
				<Tab.Screen
					name="Following"
					component={Following}
					options={{ tabBarLabel: "Following" }}
				/>
				<Tab.Screen
					name="Friends"
					component={AllFriends}
					options={{ tabBarLabel: "Friends" }}
				/>
				<Tab.Screen
					name="Followers"
					component={Followers}
					options={{ tabBarLabel: "Followers" }}
				/>
			</Tab.Navigator>
		</>
	);
}

// Export the main component with navigation container
export default function TopBarNavigator() {
	const username = "User's Name"; // Replace with dynamic username if needed

	return <MyTabs username={username} />;
}

// Styles
const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		height: 50,
		backgroundColor: colors.backgroundColor,
	},
	backButton: {
		position: "absolute",
		left: 10,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000",
	},
	tabBarLabel: {
		fontSize: 12,
		fontWeight: "bold",
		textTransform: "none",
	},
	tabBarIndicator: {
		backgroundColor: colors.primary,
		height: 4,
	},
	tabBarStyle: {
		// backgroundColor: colors.backgroundColor,
		height: 45,
	},
	tabBarItemStyle: {
		height: 45,
	},
});
