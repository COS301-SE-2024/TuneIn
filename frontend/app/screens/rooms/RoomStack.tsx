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
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { formatRoomData } from "../../models/Room";
import { live, LiveMessage } from "../../services/Live";
import { useLocalSearchParams, useRouter } from "expo-router";
import auth from "../../services/AuthManagement";
import CurrentRoom from "./functions/CurrentRoom";
import { SimpleSpotifyPlayback } from "../../services/SimpleSpotifyPlayback";

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

	const playerContext = useContext(Player);
	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}

	const { currentRoom, setCurrentRoom } = playerContext;

	const { room } = useLocalSearchParams();
	const roomCurrent = new CurrentRoom();
	let roomData: any;
	if (Array.isArray(room)) {
		roomData = JSON.parse(room[0]);
	} else if (room) {
		roomData = JSON.parse(room);
	}

	let roomID: string;
	if (roomData.id !== undefined) {
		roomID = roomData.id;
	} else if (roomData.roomID !== undefined) {
		roomID = roomData.roomID;
	} else {
		roomID = currentRoom?.roomID ?? "";
	}

	useEffect(() => {
		console.log("Room data: ", roomData);
		console.log("Room ID: " + currentRoom?.roomID);
		if (currentRoom && currentRoom?.roomID === roomID) {
			setJoined(true);
		}
	}, [currentRoom, roomID]);

	const joinRoom = useCallback(() => {
		console.log("Joining room for some reason i can't even understand");
		const formattedRoom = formatRoomData(roomData);
		setJoined(true);
		setCurrentRoom(formattedRoom);
	}, [roomData, setCurrentRoom]);

	const leaveRoom = () => {
		setCurrentRoom(null);
		setJoined(false);
	};

	const handleJoinLeave = async () => {
		console.log("joined", joined);
		const token = await auth.getToken();
		if (!token) {
			throw new Error("No token found");
		}
		if (!joined) {
			const joinedRoom: boolean = await roomCurrent.leaveJoinRoom(
				token,
				roomID,
				false,
			);
			if (!joinedRoom) {
				console.log("Error joining room");
				return;
			}
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
				console.log("Error leaving room");
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

	const navigateBasedOnOwnership = () => {
		if (roomData.mine) {
			router.navigate("/screens/rooms/AdvancedSettings");
		} else {
			router.navigate({
				pathname: "/screens/rooms/RoomInfo",
				params: {
					roomData: JSON.stringify(roomData),
				},
			});
		}
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

				<Text style={styles.headerTitle}>{roomData.name}</Text>

				{/* Menu Button */}
				<TouchableOpacity
					style={styles.menuButton}
					onPress={navigateBasedOnOwnership}
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
