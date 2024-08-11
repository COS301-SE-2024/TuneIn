import * as React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import AllFriends from "./AllFriends";
import Followers from "./Followers";
import Following from "./Following";
import { StyleSheet } from "react-native";
import { colors } from "../../styles/colors";

// Create a tab navigator
const Tab = createMaterialTopTabNavigator();

// Define the top tab navigator
function MyTabs() {
	return (
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
	);
}

// Export the main component with navigation container
export default function TopBarNavigator() {
	return <MyTabs />;
}

// Styles
const styles = StyleSheet.create({
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
		backgroundColor: colors.backgroundColor,
		height: 45,
	},
	tabBarItemStyle: {
		height: 45,
	},
});
