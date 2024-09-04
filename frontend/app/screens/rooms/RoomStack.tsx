import * as React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Playlist from "./Playlist";
import RoomPage from "./RoomPage";
import ChatRoom from "./ChatRoom";
import { StyleSheet } from "react-native";
import { colors } from "../../styles/colors";

// Create a tab navigator
const Tab = createMaterialTopTabNavigator();

// Define the top tab navigator
function MyRoomTabs() {
	return (
		<Tab.Navigator
			initialRouteName="RoomPage"
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
				name="ChatRoom"
				component={ChatRoom}
				options={{ tabBarLabel: "ChatRoom" }}
			/>
			<Tab.Screen
				name="RoomPage"
				component={RoomPage}
				options={{ tabBarLabel: "RoomPage" }}
			/>
			<Tab.Screen
				name="Playlist"
				component={Playlist}
				options={{ tabBarLabel: "Playlist" }}
			/>
		</Tab.Navigator>
	);
}

// Export the main component with navigation container
export default function TopBarNavigator() {
	return <MyRoomTabs />;
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
		// backgroundColor: colors.backgroundColor,
		height: 45,
	},
	tabBarItemStyle: {
		height: 45,
	},
});
