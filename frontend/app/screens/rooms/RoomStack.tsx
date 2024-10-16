import React, { useCallback, useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Queue from "./Playlist";
import RoomPage from "./RoomPage";
import RoomChat from "./ChatRoom";
import { colors } from "../../styles/colors";
import {
	View,
	Text,
	Modal,
	TouchableOpacity,
	StyleSheet,
	Pressable,
	ToastAndroid,
	Platform,
	Alert,
	Button,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import ContextMenu from "../../components/ContextMenu";
import { useLive } from "../../LiveContext";
import { useAPI } from "../../APIContext";
import { RoomDto, RoomSongDto } from "../../../api";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import RoomModal from "../../components/RoomModal";
import BannedModal from "../../components/BannedModal";
import NsfwModal from "../../components/NsfwModal";

const Tab = createMaterialTopTabNavigator();

function MyRoomTabs() {
	const navigation = useNavigation();
	const router = useRouter();
	const { currentUser, currentRoom, socketHandshakes } = useLive();
	const { rooms } = useAPI();
	const [userInRoom, setUserInRoom] = useState(false);
	const [secondsPlayed, setSecondsPlayed] = useState(0);
	const [isMenuVisible, setMenuVisible] = useState(false);

	const [isNsfwModalVisible, setNsfwModalVisible] = useState(false);
	const [hasSeenNsfwModal, setHasSeenNsfwModal] = useState(false);
	const [hasChildRooms, setHasChildRooms] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isBannedModalVisible, setBannedModalVisible] = useState(false);
	const [isUserBanned, setIsUserBanned] = useState(false); // State to check if user is banned

	const handleShowBannedModal = () => {
		setBannedModalVisible(true);
	};

	const handleCloseBannedModal = () => {
		setBannedModalVisible(false);
	};

	// Simulate checking ban condition (replace with actual condition)
	useEffect(() => {
		// Replace this with your actual condition
		const checkIfUserIsBanned = () => {
			const banned = false; // Replace this with your actual check
			setIsUserBanned(banned);
			if (banned) {
				handleShowBannedModal();
			}
		};

		checkIfUserIsBanned();
	}, []); // Only run on mount

	const { room } = useLocalSearchParams();
	let roomData: any;
	if (Array.isArray(room)) {
		roomData = JSON.parse(room[0]);
	} else if (room) {
		roomData = JSON.parse(room);
	}

	roomData.mine = currentUser ? roomData.userID === currentUser.userID : false;
	console.log("this is the room name length:", roomData.name.length);
	let roomID: string;
	if (roomData.id !== undefined) {
		roomID = roomData.id;
	} else if (roomData.roomID !== undefined) {
		roomID = roomData.roomID;
	} else {
		roomID = currentRoom?.roomID ?? "";
	}
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

	const handleBanUserList = () => {
		setMenuVisible(false);
		router.navigate({
			pathname: "/screens/rooms/BannedUsers",
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
		rooms
			.saveRoom(roomID)
			.then((response) => {
				if (Platform.OS === "android" && ToastAndroid) {
					ToastAndroid.show("Playlist saved successfully", ToastAndroid.SHORT);
				} else {
					Alert.alert("Success", "Playlist saved successfully.");
				}
			})
			.catch((error) => {
				console.log("Error saving playlist: ", error);
				if (Platform.OS === "android" && ToastAndroid) {
					ToastAndroid.show("Failed to save playlist", ToastAndroid.SHORT);
				} else {
					Alert.alert("Error", "Failed to save playlist.");
				}
			});
	};

	const getRoom = async (roomID: string) => {
		const token = await auth.getToken();
		try {
			const response = await fetch(`${utils.API_BASE_URL}/rooms/${roomID}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				if (Platform.OS === "android" && ToastAndroid) {
					ToastAndroid.show(await response.text(), ToastAndroid.SHORT);
				} else {
					Alert.alert("Error", await response.text());
				}
				return null;
			}
			const data = await response.json();
			return {
				roomID: roomID,
				id: roomID,
				name: data.room_name,
				description: data.description,
				userID: data.creator.userID,
				username: data.creator.username,
				tags: data.tags,
				genre: data.room_name.split(" - ")[1],
				backgroundImage: data.room_image,
				isExplicit: data.has_explicit_content,
				isNsfw: data.has_nsfw_content,
				language: data.language,
				roomSize: "50",
				userProfile: data.creator.profile_picture_url,
				mine: data.creator.userID === currentUser?.userID,
				songName: data.current_song ? data.current_song.title : null,
			};
		} catch (error) {
			console.log("Error getting room: ", error);
			if (Platform.OS === "android" && ToastAndroid) {
				ToastAndroid.show("Failed to get room", ToastAndroid.SHORT);
			} else {
				Alert.alert("Error", "Failed to get room.");
			}
		}
	};

	const getRoomQueue = async (roomID: string) => {
		const token = await auth.getToken();
		try {
			const response = await fetch(
				`${utils.API_BASE_URL}/rooms/${roomID}/songs`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (!response.ok) {
				if (Platform.OS === "android" && ToastAndroid) {
					ToastAndroid.show(await response.text(), ToastAndroid.SHORT);
				} else {
					Alert.alert("Error", await response.text());
				}
				return null;
			}
			const data = await response.json();
			const queue = data.map((song: any) => {
				const cover = song.cover;
				return {
					id: song.id,
					name: song.title,
					artists: song.artists.map((artist: string) => ({ name: artist })), // Convert artist string to object
					album: { images: [{ url: cover }] },
					explicit: false,
					preview_url: "",
					uri: `spotify:track:${song.spotify_id}`,
					duration_ms: song.duration * 1000,
				};
			});
			console.log("Room queue data: ", queue);
			return queue;
		} catch (error) {
			console.log("Error getting room queue: ", error);
			if (Platform.OS === "android" && ToastAndroid) {
				ToastAndroid.show("Failed to get room queue", ToastAndroid.SHORT);
			} else {
				Alert.alert("Error", "Failed to get room queue.");
			}
		}
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
				const childRoomData = await Promise.all(
					childRooms.map((childRoomID: string) => getRoom(childRoomID)),
				);
				const childRoomQueueData = await Promise.all(
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

	const handleCheckForChildRooms = async () => {
		// Logic to check if there are child rooms
		const childRoomsExist =
			Array.isArray(roomData.childrenRoomIDs) &&
			roomData.childrenRoomIDs.length > 0;

		console.log("Child rooms exist: ", childRoomsExist);

		if (childRoomsExist) {
			setHasChildRooms(true);
			setShowModal(true);
		}
	};

	useEffect(() => {
		// Automatically check for child rooms when entering the page
		handleCheckForChildRooms();
	}, []); // Empty dependency array ensures this runs once when the component mounts

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

	const closeModal = () => {
		setShowModal(false);
	};

	useEffect(() => {
		// Assuming roomData is set somewhere in your code
		if (roomData.isNsfw && !hasSeenNsfwModal) {
			// Show modal only if it hasn't been seen
			setNsfwModalVisible(true);
		}
	}, [roomData, hasSeenNsfwModal]);

	const handleProceed = () => {
		setNsfwModalVisible(false);
		setHasSeenNsfwModal(true); // Set modal as seen when proceeding
	};

	const handleExit = () => {
		navigation.goBack();
	};

	return (
		<>
			{/* NSFW Modal */}
			{roomData.isNsfw && (
				<>
					<NsfwModal
						visible={isNsfwModalVisible}
						onProceed={handleProceed}
						onExit={handleExit}
					/>
				</>
			)}

			{/* RoomModal component */}
			<RoomModal
				visible={showModal}
				onClose={closeModal}
				onViewChildRooms={handleNavigateToChildRooms}
			/>

			{/* BannedModal component */}
			<BannedModal
				visible={isBannedModalVisible}
				onClose={handleCloseBannedModal}
			/>
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

				<Text style={styles.headerTitle}>
					{roomData.name.length > 20
						? `${roomData.name.substring(0, 20)}...`
						: roomData.name}
				</Text>

				{/* Menu Button */}
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
					onBanUserList={handleBanUserList}
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
					options={{ tabBarLabel: "Room" }}
					component={RoomPage}
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
	modalContent: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		alignItems: "center",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	button: {
		backgroundColor: "#007AFF",
		padding: 10,
		borderRadius: 5,
		margin: 5,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "flex-end",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
	},
	modalView: {
		width: "100%",
		height: "26%",
		backgroundColor: "white",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		paddingBottom: 40,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalText: {
		marginTop: 10,
		fontSize: 16,
		textAlign: "center",
		fontWeight: "bold",
	},
	modalButtonContainer: {
		marginTop: 30,
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	buttonModal: {
		borderRadius: 5,
		padding: 10,
		elevation: 2,
		width: "45%",
		alignItems: "center",
	},
	buttonYes: {
		backgroundColor: colors.primary,
		borderRadius: 25,
	},
	buttonNo: {
		backgroundColor: colors.secondary,
		borderRadius: 25,
	},
	textStyle: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
});
