import React, { useCallback, useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Queue from "./Playlist";
import RoomPage from "./RoomPage";
import RoomChat from "./ChatRoom";
import { colors } from "../../styles/colors";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ToastAndroid,
	Platform,
	Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import ContextMenu from "../../components/ContextMenu";
import { useLive } from "../../LiveContext";
import { useAPI } from "../../APIContext";
import { RoomDto, RoomSongDto } from "../../../api";

const Tab = createMaterialTopTabNavigator();

function MyRoomTabs() {
	const navigation = useNavigation();
	const router = useRouter();
	const { currentUser, currentRoom, socketHandshakes } = useLive();
	const { rooms } = useAPI();
	const [userInRoom, setUserInRoom] = useState(false);
	const [secondsPlayed, setSecondsPlayed] = useState(0);
	const [isMenuVisible, setMenuVisible] = useState(false);

	const { room } = useLocalSearchParams();
	let roomData: any;
	if (Array.isArray(room)) {
		roomData = JSON.parse(room[0]);
	} else if (room) {
		roomData = JSON.parse(room);
	}

	roomData.mine = currentUser ? roomData.userID === currentUser.userID : false;

	let roomID: string;
	if (roomData.id !== undefined) {
		roomID = roomData.id;
	} else if (roomData.roomID !== undefined) {
		roomID = roomData.roomID;
	} else {
		roomID = currentRoom?.roomID ?? "";
	}

	// const navigateBasedOnOwnership = () => {
	// 	console.log("Room is mine? ", roomData.mine);
	// 	if (roomData.mine) {
	// 		router.navigate({
	// 			pathname: "/screens/rooms/AdvancedSettings",
	// 			params: { room: room },
	// 		});
	// 	} else {
	// 		router.navigate({
	// 			pathname: "/screens/rooms/RoomInfo",
	// 			params: { room: room },
	// 		});
	// 	}
	// };

	const navigateBasedOnOwnership = () => {
		setMenuVisible(true);
	};

	const handleAdvancedSettings = () => {
		setMenuVisible(false);
		router.navigate({
			pathname: "/screens/rooms/AdvancedSettings",
			params: { room: room },
		});
	};

	const handleRoomInfo = () => {
		setMenuVisible(false);
		router.navigate({
			pathname: "/screens/rooms/RoomInfo",
			params: { room: room },
		});
	};

	const handleShareRoom = () => {
		setMenuVisible(false);
		throw new Error(
			"This is not implemented and this error is to notify our devs.",
		);
		// const userIDs: string[];
		// rooms.shareRoom(roomID, userIDs)
		// 	.then((response) => {
		// 		if (Platform.OS === "android" && ToastAndroid) {
		// 			ToastAndroid.show("Room shared successfully", ToastAndroid.SHORT);
		// 		} else {
		// 			Alert.alert("Success", "Room shared successfully.");
		// 		}
		// 	})
		// 	.catch((error) => {
		// 		console.log("Error sharing room: ", error);
		// 		if (Platform.OS === "android" && ToastAndroid) {
		// 			ToastAndroid.show("Failed to share room", ToastAndroid.SHORT);
		// 		} else {
		// 			Alert.alert("Error", "Failed to share room.");
		// 		}
		// 	});
	};

	const handleSavePlaylist = () => {
		setMenuVisible(false);
		// Implement room sharing logic here
	};

	const handleNavigateToChildRooms = async () => {
		setMenuVisible(false);
		// Implement room sharing logic here
		const childRooms = roomData.childrenRoomIDs;
		try {
			if (!childRooms) {
				if (Platform.OS === "android" && ToastAndroid) {
					ToastAndroid.show("No child rooms found", ToastAndroid.SHORT);
				} else {
					Alert.alert("Error", "No child rooms found.");
				}
			} else {
				const childRoomData: RoomDto[] = await Promise.all(
					childRooms.map((childRoomID: string) => getRoom(childRoomID)),
				);
				const childRoomQueueData: RoomSongDto[] = await Promise.all(
					childRooms.map((childRoomID: string) => getRoomQueue(childRoomID)),
				);
				router.navigate({
					pathname: "/screens/rooms/SplittingRoom",
					params: {
						rooms: JSON.stringify(childRoomData),
						queues: JSON.stringify(childRoomQueueData),
					},
				});
			}
		} catch (error) {
			console.log("Error getting child rooms: ", error);
			if (Platform.OS === "android" && ToastAndroid) {
				ToastAndroid.show("Failed to get child rooms", ToastAndroid.SHORT);
			} else {
				Alert.alert("Error", "Failed to get child rooms.");
			}
		}
	};

	const updateRoomStatus = useCallback(async () => {
		if (currentRoom && currentRoom.roomID === roomID) {
			setUserInRoom(true);
		} else {
			setUserInRoom(false);
		}
	}, [roomID, currentRoom]);

	useEffect(() => {
		updateRoomStatus();
	}, [roomID, currentRoom]);

	// on component mount
	useEffect(() => {
		updateRoomStatus();
	}, []);

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

				<Text style={styles.headerTitle}>{roomData.name}</Text>

				{/* Menu Button */}
				<TouchableOpacity
					style={styles.menuButton}
					onPress={navigateBasedOnOwnership}
					testID="menu-button"
				>
					<Entypo name="dots-three-vertical" size={20} color="black" />
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.menuButton}
					onPress={navigateBasedOnOwnership}
					testID="menu-button"
				>
					<Entypo name="dots-three-vertical" size={20} color="black" />
				</TouchableOpacity>

				{/* ContextMenu */}
				<ContextMenu
					isVisible={isMenuVisible}
					onClose={() => setMenuVisible(false)}
					onAdvancedSettings={handleAdvancedSettings}
					onRoomInfo={handleRoomInfo}
					onShareRoom={handleShareRoom}
					onSavePlaylist={handleSavePlaylist}
					isHost={roomData.mine} // Pass whether the user is the host
					onSeeChildRooms={
						roomData.childrenRoomIDs?.length > 0
							? handleNavigateToChildRooms
							: undefined
					}
				/>
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
					component={() => <RoomPage />}
					options={{ tabBarLabel: "Room" }}
				/>
				{socketHandshakes.roomJoined && userInRoom && (
					<>
						<Tab.Screen
							name="Chat"
							component={RoomChat}
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
