// import * as React from "react";
import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import AllFriends from "./AllFriends";
import Followers from "./Followers";
import Following from "./Following";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../styles/colors";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

// Create a tab navigator
const Tab = createMaterialTopTabNavigator();

function MyTabs({ username }: { username: string | string[] }) {
	const navigation = useNavigation();

	const truncateText = (text: string, maxLength: number) => {
		if (text.length > maxLength) {
			return text.substring(0, maxLength - 3) + "...";
		}
		return text;
	};

	const displayUsername = Array.isArray(username)
		? username.join(", ")
		: username;
	return (
		<>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
					testID="back-button"
				>
					<Ionicons name="chevron-back" size={24} color="#000" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>
					{truncateText(displayUsername, 20)}
				</Text>
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
				<Tab.Screen name="Following" component={Following} />
				<Tab.Screen name="Friends" component={AllFriends} />
				<Tab.Screen name="Followers" component={Followers} />
			</Tab.Navigator>
		</>
	);
}

// Export the main component with navigation container
export default function TopBarNavigator() {
	const user = useLocalSearchParams();
	const username = user.username; // Replace with dynamic username if needed

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
		fontSize: 19,
		fontWeight: "bold",
		color: "#000",
	},
	tabBarLabel: {
		fontSize: 16,
		fontWeight: "bold",
		textTransform: "none",
	},
	tabBarIndicator: {
		backgroundColor: colors.primary,
		height: 4,
	},
	tabBarStyle: {
		height: 55,
		backgroundColor: colors.backgroundColor,
	},
	tabBarItemStyle: {
		height: 55,
	},
});
