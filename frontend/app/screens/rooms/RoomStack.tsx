// import * as React from "react";
// import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
// import Queue from "./Playlist";
// import RoomPage from "./RoomPage";
// import Chat from "./ChatRoom";
// import { colors } from "../../styles/colors";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { Ionicons, Entypo } from "@expo/vector-icons";
// import { useRouter } from "expo-router";

// const Tab = createMaterialTopTabNavigator();

// function MyRoomTabs() {
// 	const navigation = useNavigation();
// 	const router = useRouter();

// 	const navigateToAdavancedSettings = () => {
// 		router.navigate("/screens/rooms/AdvancedSettings");
// 	};

// 	return (
// 		<>
// 			<View style={styles.header}>
// 				{/* Back Button */}
// 				<TouchableOpacity
// 					style={styles.backButton}
// 					onPress={() => navigation.goBack()}
// 					testID="back-button"
// 				>
// 					<Ionicons name="chevron-back" size={24} color="#000" />
// 				</TouchableOpacity>

// 				{/* Header Title */}
// 				<Text style={styles.headerTitle}>Room Name</Text>

// 				{/* Menu Button */}
// 				<TouchableOpacity
// 					style={styles.menuButton}
// 					// onPress={openMenu}
// 					onPress={navigateToAdavancedSettings}
// 					testID="menu-button"
// 				>
// 					<Entypo name="dots-three-vertical" size={20} color="black" />
// 				</TouchableOpacity>
// 			</View>

// 			<Tab.Navigator
// 				initialRouteName="RoomPage"
// 				screenOptions={{
// 					tabBarLabelStyle: styles.tabBarLabel,
// 					tabBarIndicatorStyle: styles.tabBarIndicator,
// 					tabBarActiveTintColor: "#000", // Active tab color
// 					tabBarInactiveTintColor: "#888", // Inactive tab color
// 					tabBarStyle: styles.tabBarStyle, // Tab bar background color
// 					tabBarItemStyle: styles.tabBarItemStyle, // Tab item style (for height)
// 				}}
// 			>
// 				<Tab.Screen
// 					name="Chat"
// 					component={Chat}
// 					options={{ tabBarLabel: "Chat" }}
// 				/>
// 				<Tab.Screen
// 					name="RoomPage"
// 					component={RoomPage}
// 					options={{ tabBarLabel: "RoomPage" }}
// 				/>
// 				<Tab.Screen
// 					name="Queue"
// 					component={Queue}
// 					options={{ tabBarLabel: "Queue" }}
// 				/>
// 			</Tab.Navigator>
// 		</>
// 	);
// }

// export default function TopBarNavigator() {
// 	return <MyRoomTabs />;
// }

// // Styles
// const styles = StyleSheet.create({
// 	header: {
// 		flexDirection: "row",
// 		alignItems: "center",
// 		justifyContent: "center",
// 		height: 50,
// 		backgroundColor: "white",
// 	},
// 	backButton: {
// 		position: "absolute",
// 		left: 10,
// 	},
// 	menuButton: {
// 		position: "absolute",
// 		right: 10,
// 	},
// 	headerTitle: {
// 		fontSize: 18,
// 		fontWeight: "bold",
// 		color: "#000",
// 	},
// 	tabBarLabel: {
// 		fontSize: 12,
// 		fontWeight: "bold",
// 		textTransform: "none",
// 	},
// 	tabBarIndicator: {
// 		backgroundColor: colors.primary,
// 		height: 4,
// 	},
// 	tabBarStyle: {
// 		height: 45,
// 	},
// 	tabBarItemStyle: {
// 		height: 45,
// 	},
// });

import React, { useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Queue from "./Playlist";
import RoomPage from "./RoomPage";
import Chat from "./ChatRoom";
import { colors } from "../../styles/colors";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as utils from "../../services/Utils";
import auth from "../../services/AuthManagement";
import { UserDto } from "../../models/UserDto";
import { ChatEventDto } from "../../models/ChatEventDto";
import { RoomDto } from "../../models/RoomDto";
import { LiveChatMessageDto } from "../../models/LiveChatMessageDto";

const Tab = createMaterialTopTabNavigator();

function MyRoomTabs() {
	const navigation = useNavigation();
	const router = useRouter();
	const [joined, setJoined] = useState(false); // Track if the user has joined the room

	const handleJoinLeave = async () => {
		console.log("joined", joined);
		setJoined(!joined);
		const token = await auth.getToken();
		console.log("Token fr fr:", token);
		// if (!joined) {
		// 	if (!token) {
		// 		throw new Error("No token found");
		// 	}
		// 	console.log("Joining room........", roomID, token);
		// 	roomCurrent.leaveJoinRoom(token, roomID, false);
		// 	joinRoom();
		// 	live.joinRoom(roomID, setJoined, setMessages);
		// 	setJoined(true);
		// 	setJoinedSongIndex(currentTrackIndex);
		// 	setJoinedSecondsPlayed(secondsPlayed);
		// 	console.log(
		// 		`Joined: Song Index - ${currentTrackIndex}, Seconds Played - ${secondsPlayed}`,
		// 	);
		// } else {
		// 	leaveRoom();
		// 	setJoined(false);
		// 	roomCurrent.leaveJoinRoom(token as string, roomID, true);
		// 	live.leaveRoom();
		// 	setJoinedSongIndex(null);
		// 	setJoinedSecondsPlayed(null);
		// 	//playbackManager.pause();
		// 	const deviceID = await playback.getFirstDevice();
		// 	if (deviceID && deviceID !== null) {
		// 		playback.handlePlayback("pause", deviceID);
		// 	}
		// 	setIsPlaying(false);
		// }
	};

	const navigateToAdvancedSettings = () => {
		router.navigate("/screens/rooms/AdvancedSettings");
	};

	return (
		<>
			<View style={styles.header}>
				{/* Back Button */}
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
					testID="back-button"
				>
					<Ionicons name="chevron-back" size={24} color="#000" />
				</TouchableOpacity>

				{/* Header Title */}
				<Text style={styles.headerTitle}>Room Name</Text>

				{/* Menu Button */}
				<TouchableOpacity
					style={styles.menuButton}
					onPress={navigateToAdvancedSettings}
					testID="menu-button"
				>
					<Entypo name="dots-three-vertical" size={20} color="black" />
				</TouchableOpacity>
			</View>

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
					name="RoomPage"
					component={() => (
						<RoomPage joined={joined} handleJoinLeave={handleJoinLeave} />
					)}
					options={{ tabBarLabel: "Room" }}
				/>
				{joined && (
					<>
						<Tab.Screen
							name="Chat"
							component={Chat}
							options={{ tabBarLabel: "Chat" }}
						/>
						<Tab.Screen
							name="Queue"
							component={Queue}
							options={{ tabBarLabel: "Queue" }}
						/>
					</>
				)}
			</Tab.Navigator>
		</>
	);
}

export default function TopBarNavigator() {
	return <MyRoomTabs />;
}

// Styles
const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		height: 50,
		backgroundColor: "white",
	},
	backButton: {
		position: "absolute",
		left: 10,
	},
	menuButton: {
		position: "absolute",
		right: 10,
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
		height: 45,
	},
	tabBarItemStyle: {
		height: 45,
	},
});
