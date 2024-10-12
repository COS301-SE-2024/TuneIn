import React, {
	useState,
	useEffect,
	useContext,
	useCallback,
	useRef,
} from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Queue from "./Playlist";
import RoomPage from "./RoomPage";
import Chat from "./ChatRoom";
import { Player } from "../../PlayerContext";
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
import { formatRoomData } from "../../models/Room";
import { live, LiveMessage } from "../../services/Live";
import { useLocalSearchParams, useRouter } from "expo-router";
import auth from "../../services/AuthManagement";
import CurrentRoom from "./functions/CurrentRoom";
import { SimpleSpotifyPlayback } from "../../services/SimpleSpotifyPlayback";
import ContextMenu from "../../components/ContextMenu";
import * as utils from "../../services/Utils";
import RoomModal from "../../components/RoomModal";
import BannedModal from "../../components/BannedModal";
import NsfwModal from "../../components/NsfwModal";

const Tab = createMaterialTopTabNavigator();

function MyRoomTabs() {
	const navigation = useNavigation();
	const router = useRouter();
	const [joined, setJoined] = useState(false); // Track if the user has joined the room
	const [messages, setMessages] = useState<LiveMessage[]>([]);
	const [joinedsongIndex, setJoinedSongIndex] = useState<number | null>(null);
	const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
	const [ioinedSecondsPlayed, setJoinedSecondsPlayed] = useState<number | null>(
		null,
	);
	const [secondsPlayed, setSecondsPlayed] = useState(0);
	const playback = useRef(new SimpleSpotifyPlayback()).current;
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMenuVisible, setMenuVisible] = useState(false);
	// const roomData = { mine: true }; // Assuming this comes from your state or props

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

	const playerContext = useContext(Player);
	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}

	const { currentRoom, setCurrentRoom, userData } = playerContext;

	const { room } = useLocalSearchParams();
	const roomCurrent = new CurrentRoom();
	let roomData: any;
	if (Array.isArray(room)) {
		roomData = JSON.parse(room[0]);
	} else if (room) {
		roomData = JSON.parse(room);
	}

	roomData.mine = roomData.userID === userData?.userID;

	let roomID: string;
	if (roomData.id !== undefined) {
		roomID = roomData.id;
	} else if (roomData.roomID !== undefined) {
		roomID = roomData.roomID;
	} else {
		roomID = currentRoom?.roomID ?? "";
	}

	useEffect(() => {
		if (currentRoom && currentRoom?.roomID === roomID) {
			setJoined(true);
		}
	}, [currentRoom, roomID]);

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

	const joinRoom = useCallback(() => {
		const formattedRoom = formatRoomData(roomData);
		setJoined(true);
		setCurrentRoom(formattedRoom);
	}, [roomData, setCurrentRoom]);

	const leaveRoom = () => {
		setCurrentRoom(null);
		setJoined(false);
	};

	const handleJoinLeave = async () => {
		const token = await auth.getToken();
		if (!token) {
			throw new Error("No token found");
		}
		if (!joined) {
			await roomCurrent.leaveJoinRoom(token, roomID, false);

			joinRoom();
			live.joinRoom(roomID, setJoined, setMessages);
			setJoined(true);
			setJoinedSongIndex(currentTrackIndex);
			setJoinedSecondsPlayed(secondsPlayed);
			console.log(
				`Joined: Song Index - ${currentTrackIndex}, Seconds Played - ${secondsPlayed}`,
			);
		} else {
			const leftRoom: boolean = await roomCurrent.leaveJoinRoom(
				token as string,
				roomID,
				true,
			);
			if (!leftRoom) {
				ToastAndroid.show(
					"Error leaving room. Please try again.",
					ToastAndroid.SHORT,
				);
				return;
			}
			leaveRoom();
			setJoined(false);
			live.leaveRoom();
			setJoinedSongIndex(null);
			setJoinedSecondsPlayed(null);
			// 	//playbackManager.pause();
			const deviceID = await playback.getFirstDevice();
			if (deviceID && deviceID !== null) {
				playback.handlePlayback("pause", deviceID);
			}
			setIsPlaying(false);
		}
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
				mine: data.creator.userID === userData?.userID,
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
		// Implement room sharing logic here
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

	const closeModal = () => {
		setShowModal(false);
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

					{/* The rest of your component */}
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

				<Text style={styles.headerTitle}>{roomData.name}</Text>

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
