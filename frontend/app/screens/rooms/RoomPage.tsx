import React, {
	useEffect,
	useState,
	useRef,
	useCallback,
	useContext,
} from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	Animated,
	Dimensions,
	Easing,
	Alert,
	ToastAndroid,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import auth from "../../services/AuthManagement";
import Icon from "react-native-vector-icons/MaterialIcons";
import DevicePicker from "../../components/DevicePicker";
import { useLive } from "../../LiveContext";
import * as rs from "../../models/RoomSongDto";
import { FlyingView, ObjectConfig } from "react-native-flying-objects";
import EmojiPicker, {
	EmojiPickerRef,
} from "../../components/rooms/emojiPicker";
import { colors } from "../../styles/colors";
import bookmarks from "../../services/BookmarkService";
import { useAPI } from "../../APIContext";
import SongRoomWidget from "../../components/SongRoomWidget";
import * as path from "path";

const MemoizedCommentWidget = memo(CommentWidget);
const { width, height } = Dimensions.get("window");
const isSmallScreen = height < 800;

interface RoomPageProps {
	joined: boolean;
	handleJoinLeave: () => Promise<void>;
}

// const RoomPage = () => {
const RoomPage: React.FC<RoomPageProps> = ({ joined, handleJoinLeave }) => {
	const { rooms } = useAPI();
	const {
		roomControls,
		roomPlaying,
		joinRoom,
		leaveRoom,
		roomEmojiObjects,
		currentSong,
		currentRoom,
		roomQueue,
		roomMessages,
		userBookmarks,
	} = useLive();
	const { room } = useLocalSearchParams();
	let roomData: any;
	if (Array.isArray(room)) {
		roomData = JSON.parse(room[0]);
	} else if (room) {
		roomData = JSON.parse(room);
	}

	let roomID: string;
	if (roomData.id !== undefined) {
		roomID = roomData.id;
	} else {
		roomID = roomData.roomID;
	}

	const router = useRouter();
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
	const [secondsPlayed, setSecondsPlayed] = useState(0); // Track the number of seconds played
	const [isChatExpanded, setChatExpanded] = useState(false);
	const [message, setMessage] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [participants, setParticipants] = useState<any[]>([]);
	const truncateUsername = (username: string) => {
		if (username) {
			return username.length > 10 ? username.slice(0, 8) + "..." : username;
		}
	};

	//Emoji picker
	const emojiPickerRef = useRef<EmojiPickerRef>(null);
	const handleSelectEmoji = (emoji: string) => {
		roomControls.sendReaction(emoji);
	};
	const passEmojiToTextField = (emoji: string) => {
		emojiPickerRef.current?.passEmojiToTextField(emoji);
	};

	const handleBookmark = async () => {
		const previouslyBookmarked = isBookmarked;
		if (previouslyBookmarked) {
			// Unbookmark the room
			bookmarks.unbookmarkRoom(rooms, roomID).then(() => {
				Alert.alert("Success", `Room bookmark has been removed`, [
					{
						text: "OK",
						onPress: () => console.log("OK Pressed"),
					},
				]);
			});
			setIsBookmarked(false);
		} else {
			// Bookmark the room
			bookmarks.bookmarkRoom(rooms, roomID).then(() => {
				Alert.alert("Success", `Room has been bookmarked`, [
					{
						text: "OK",
						onPress: () => console.log("OK Pressed"),
					},
				]);
			});
			setIsBookmarked(true);
		}
	};

	const trackPositionIntervalRef = useRef<number | null>(null);
	const queueHeight = useRef(new Animated.Value(0)).current;
	const collapsedHeight = 60;
	const screenHeight = Dimensions.get("window").height;
	const expandedHeight = screenHeight - 350;
	const animatedHeight = useRef(new Animated.Value(collapsedHeight)).current;

	useEffect(() => {
		const fetchQueue = async () => {
			const storedToken = await auth.getToken();

			if (!storedToken) {
				console.error("No stored token found");
				return;
			}

			try {
				const response = await fetch(
					`${utils.API_BASE_URL}/rooms/${roomID}/songs`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${storedToken}`,
						},
					},
				);

				if (!response.ok) {
					const errorText = await response.text();
					console.error(
						`Failed to fetch queue: ${response.status} ${response.statusText}`,
						errorText,
					);
					return;
				}

				const data = await response.json();
				if (Array.isArray(data)) {
					const tracks: Track[] = data.map((item: any) => ({
						id: item.id,
						name: item.name,
						//artists: [item.artistNames],
						artists: [{ name: item.artistNames }],
						album: { images: [{ url: item.albumArtUrl }] },
						explicit: item.explicit,
						preview_url: item.preview_url,
						uri: item.uri,
						duration_ms: item.duration_ms,
					}));
					setQueue(tracks);
				} else {
					console.error("Unexpected response data format:", data);
				}
			} catch (error) {
				console.log("Failed to fetch queue:", error);
				ToastAndroid.show("Failed to fetch queue", ToastAndroid.SHORT);
			}
		};

		fetchQueue();
	}, [roomData.roomID, roomID]);

	useEffect(() => {
		return () => {
			if (trackPositionIntervalRef.current) {
				clearInterval(trackPositionIntervalRef.current);
			}
		};
	}, [isPlaying]);

	useEffect(() => {
		const fetchParticipants = async () => {
			const storedToken = await auth.getToken();

			if (!storedToken) {
				console.error("No stored token found");
				return;
			}

			try {
				const response = await fetch(
					`${utils.API_BASE_URL}/rooms/${roomID}/users`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${storedToken}`,
						},
					},
				);

				if (!response.ok) {
					const errorText = await response.text();
					console.error(
						`Failed to fetch participants: ${response.status} ${response.statusText}`,
						errorText,
					);
					return;
				}

				const data = await response.json();
				if (Array.isArray(data)) {
					setParticipants(data);
					console.log("Participants:", data);
				} else {
					console.error("Unexpected response data format:", data);
				}
			} catch (error) {
				console.error("Failed to fetch participants:", error);
			}
		};
		fetchParticipants();
	}, [joined]);

	useEffect(() => {
		if (roomPlaying) {
			trackPositionIntervalRef.current = window.setInterval(() => {
				const s = currentSong;
				if (s) {
					const st = s.startTime;
					if (st) {
						setSecondsPlayed(new Date().valueOf() - st.valueOf());
					}
				}
			}, 1000);
		} else {
			if (trackPositionIntervalRef.current !== null) {
				clearInterval(trackPositionIntervalRef.current);
				trackPositionIntervalRef.current = null; // Reset ref to null after clearing
			}
		}

		return () => {
			if (trackPositionIntervalRef.current !== null) {
				clearInterval(trackPositionIntervalRef.current);
			}
		};
	}, [currentSong, roomPlaying]);

	const playPauseTrack = useCallback(
		async (index: number = currentTrackIndex, offset: number = 0) => {
			console.log("playPauseTrack playPauseTrack playPauseTrack");
			if (roomControls.canControlRoom()) {
				if (!roomPlaying) {
					console.log("starting playback");
					roomControls.playbackHandler.startPlayback();
				} else {
					console.log("stopping playback");
					roomControls.playbackHandler.pausePlayback();
				}
				const i = currentSong?.index;
				if (i) setCurrentTrackIndex(i);
			}
			roomControls.requestRoomQueue();
		},
		[currentSong?.index, currentTrackIndex, roomControls, roomPlaying],
	);

	const playNextTrack = () => {
		console.log("playNextTrack playNextTrack playNextTrack");
		if (roomControls.canControlRoom()) {
			roomControls.playbackHandler.nextTrack();
		}
		roomControls.requestRoomQueue();
	};

	const playPreviousTrack = () => {
		if (roomControls.canControlRoom()) {
			roomControls.playbackHandler.prevTrack();
		}
		roomControls.requestRoomQueue();
	};

	const toggleChat = () => {
		Animated.timing(animatedHeight, {
			toValue: isChatExpanded ? collapsedHeight : expandedHeight,
			duration: 300,
			easing: Easing.ease,
			useNativeDriver: false,
		}).start();
		setChatExpanded(!isChatExpanded);
	};

	const navigateToPlaylist = () => {
		roomControls.requestRoomQueue();
		router.navigate({
			pathname: "/screens/rooms/Playlist",
			params: {
				Room_id: roomID,
				mine: roomData.mine,
			},
		});
	};

	const handleViewParticipants = () => {
		router.navigate({
			pathname: "/screens/rooms/ParticipantsPage",
			params: {
				participants: JSON.stringify(participants),
			},
		}); // Change this to the correct page for participants
	};

	const handleJoinLeave = async () => {
		const token = await auth.getToken();
		if (!token) {
			throw new Error("No token found");
		}

		// only join if not in room or if in another room
		if (!currentRoom || (currentRoom && currentRoom.roomID !== roomID)) {
			console.log("Joining room........", roomID, token);
			await rooms.joinRoom(roomID);
			joinRoom(roomID);
			if (currentSong) {
				console.log(
					`Joined: Song Index - ${currentSong.index}, Seconds Played - ${secondsPlayed}`,
				);
			}
			roomControls.requestRoomQueue();

			// only leave if you're in the room
		} else if (currentRoom && currentRoom.roomID === roomID) {
			await rooms.leaveRoom(roomID);
			leaveRoom();
			if (await roomControls.playbackHandler.userListeningToRoom()) {
				await roomControls.playbackHandler.handlePlayback("pause");
			}
		}
	};

	// on component mount
	useEffect(() => {
		for (let i = 0; i < userBookmarks.length; i++) {
			if (userBookmarks[i].roomID === roomID) {
				setIsBookmarked(true);
				break;
			}
		}
	}, [roomID, userBookmarks]);

	const sendMessage = () => {
		if (isSending) return;
		setIsSending(true);
		roomControls.sendLiveChatMessage(message);
		setMessage("");
	};

	const exampleTrack: SongRoomWidget = {
		name: "Song Title",
		artists: [{ name: "Artist Name" }],
		album: {
			images: [
				{
					url: "https://www.wagbet.com/wp-content/uploads/2019/11/music_placeholder.png",
				},
			],
		},
	};

	return (
		<View style={styles.container}>
			<View style={styles.contentContainer}>
				<View style={styles.sideBySide}>
					{/* Left side */}
					<View style={styles.userInfoContainer}>
						<TouchableOpacity
							style={styles.userInfoContainer}
							onPress={handleViewParticipants}
						>
							<Ionicons name="people" size={30} color="black" />
							<Text>{participants.length + " Participants"}</Text>
						</TouchableOpacity>
					</View>
					{/* Right side */}
					<View style={styles.joinLeaveButtonContainer}>
						<TouchableOpacity
							style={styles.joinLeaveButton}
							onPress={handleJoinLeave}
						>
							<Text style={styles.joinLeaveButtonText}>
								{currentRoom?.roomID === roomID ? "Leave" : "Join"}
							</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.joinLeaveButtonContainer}></View>
				</View>
				<View style={styles.trackDetails}>
					<Image
						source={{
							uri: rs.getAlbumArtUrl(currentSong),
						}}
						style={styles.nowPlayingAlbumArt}
					/>
				</View>
				<View style={styles.songRoomWidget}>
					<SongRoomWidget track={exampleTrack} />
				</View>
				<View style={styles.trackInfo}>
					<Text style={styles.nowPlayingTrackName}>
						{rs.getTitle(currentSong)}
					</Text>
					<Text>{rs.constructArtistString(currentSong)}</Text>
				</View>

				{roomData.mine ? (
					<View style={isSmallScreen ? styles.smallControls : styles.controls}>
						<TouchableOpacity
							style={styles.controlButton}
							onPress={playPreviousTrack}
						>
							<FontAwesome5 name="step-backward" size={30} color="black" />
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.controlButton}
							onPress={() => playPauseTrack()}
						>
							<FontAwesome5
								name={roomPlaying ? "pause" : "play"}
								size={30}
								color="black"
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.controlButton}
							onPress={playNextTrack}
						>
							<FontAwesome5 name="step-forward" size={30} color="black" />
						</TouchableOpacity>
					</View>
				) : (
					<View></View>
				)}
			</View>
			<Animated.ScrollView
				style={[styles.queueContainer, { maxHeight: queueHeight }]}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				{roomQueue.map((track, index) => (
					<TouchableOpacity
						key={rs.getID(track)}
						style={[
							styles.track,
							index === currentTrackIndex
								? styles.currentTrack
								: styles.queueTrack,
						]}
						onPress={() => playPauseTrack(index, 0)}
					>
						<Image
							source={{ uri: rs.getAlbumArtUrl(track) }}
							style={styles.queueAlbumArt}
						/>
						<View style={styles.trackInfo}>
							<Text style={styles.queueTrackName}>{rs.getTitle(track)}</Text>
							<Text style={styles.queueTrackArtist}>
								{rs.constructArtistString(track)}
							</Text>
						</View>
					</TouchableOpacity>
				))}
			</Animated.ScrollView>

			<View style={styles.sideBySideTwo}>
				{/* Left side */}
				<TouchableOpacity
					// onPress={handleUserPress}
					style={styles.userInfoContainer}
				>
					<Image
						source={{ uri: roomData.userProfile }}
						style={styles.userImage}
					/>
					<Text style={styles.username}>
						{truncateUsername(roomData.username)}
					</Text>
				</TouchableOpacity>

				{/* Right side */}
				<View style={styles.joinLeaveButtonContainer}>
					<View style={styles.sideBySideClose}>
						<TouchableOpacity
							onPress={handleBookmark}
							style={styles.bookmarkButton}
						>
							<Icon
								name={isBookmarked ? "bookmark" : "bookmark-border"}
								size={34}
								color={isBookmarked ? colors.primary : "black"}
							/>
						</TouchableOpacity>
						<DevicePicker />
					</View>
				</View>
			</View>

			{/* <Animated.View
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					height: animatedHeight,
					backgroundColor: "#E8EBF2",
					borderTopLeftRadius: 20,
					borderTopRightRadius: 20,
					elevation: 5,
					paddingHorizontal: 10,
					paddingTop: 10,
				}}
			>
				<TouchableOpacity
					onPress={toggleChat}
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						paddingBottom: 10,
					}}
				>
					<Text style={{ fontSize: 18, fontWeight: "bold" }}>
						{isChatExpanded ? "Hide Chat" : "Show Chat"}
					</Text>
					<MaterialIcons
						name={isChatExpanded ? "keyboard-arrow-down" : "keyboard-arrow-up"}
						size={34}
						style={{ marginLeft: 10 }}
					/>
				</TouchableOpacity>
				{isChatExpanded && (
					<>
						<View style={styles.container}>
							<ScrollView style={{ flex: 1, marginTop: 10 }}>
								{roomMessages.map((msg, index) => (
									<MemoizedCommentWidget
										key={msg.message.messageID}
										username={msg.message.sender.username}
										message={msg.message.messageBody}
										profilePictureUrl={msg.message.sender.profile_picture_url}
										me={msg.me}
									/>
								))}
							</ScrollView>
							<FlyingView
								object={roomEmojiObjects}
								containerProps={{
									style: styles.flyingView,
								}}
							/>
						</View>
						<KeyboardAvoidingView
							behavior={Platform.OS === "ios" ? "padding" : "height"}
							keyboardVerticalOffset={90}
						>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									marginBottom: 10,
								}}
							>
								<TextInput
									style={{
										flex: 1,
										borderWidth: 1,
										borderColor: "#ccc",
										borderRadius: 20,
										paddingHorizontal: 10,
										paddingVertical: 5,
									}}
									placeholder="Type your message..."
									value={message}
									onChangeText={setMessage}
									onSubmitEditing={sendMessage}
								/>

								<EmojiPicker
									ref={emojiPickerRef}
									onSelectEmoji={handleSelectEmoji}
								/>
								<TouchableOpacity
									onPress={sendMessage}
									style={{ marginLeft: 10 }}
								>
									<MaterialIcons name="send" size={24} color="#007AFF" />
								</TouchableOpacity>
							</View>
						</KeyboardAvoidingView>
					</>
				)}
			</Animated.View> */}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: "relative",
		// marginHorizontal: 10,
		backgroundColor: "white",
	},
	scrollView: {
		flex: 1,
		marginTop: 10,
	},
	flyingView: {
		position: "absolute",
		top: 10, // Adjust this value as needed
		right: 10, // Adjust this value as needed
		width: 150,
		height: 200,
	},
	bookmarkButton: {
		marginLeft: 10,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	backButtonText: {
		fontWeight: "bold",
		fontSize: 18,
	},
	backgroundImage: {
		width: "100%",
		height: "67%",
		resizeMode: "cover",
	},
	gradientOverlay: {
		position: "absolute",
		width: "100%",
		height: "68%",
	},
	contentContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		paddingTop: 10,
		marginHorizontal: 20,
	},
	joinLeaveButtonContainer: {
		position: "absolute",
		paddingRight: 8,
		right: 0,
		flex: 1,
		alignItems: "flex-end",
	},
	userInfoContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 10,
		marginTop: 10,
	},
	userImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 10,
		borderWidth: 2,
		borderColor: "blue",
	},
	username: {
		fontSize: 20,
		color: "black",
		fontWeight: "bold",
	},
	roomDetails: {
		alignItems: "center",
		marginTop: 60,
	},
	roomName: {
		fontSize: 27,
		color: "white",
		fontWeight: "bold", // Make the room name bold for emphasis
		textAlign: "center", // Center align the room name
		marginBottom: 10, // Add some bottom margin for spacing
	},
	description: {
		fontSize: 16,
		color: "white",
		textAlign: "center",
		marginHorizontal: 20,
		marginTop: 10,
		lineHeight: 22, // Adjust line height for better readability
	},
	tagsContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 10,
	},
	tag: {
		backgroundColor: "#4CAF50", // Green background color (example)
		borderRadius: 20, // Adjust the border radius to make the pill more rounded
		paddingHorizontal: 12, // Horizontal padding for text inside the pill
		paddingVertical: 6, // Vertical padding for text inside the pill
		marginHorizontal: 5, // Space between pills
		alignItems: "center", // Center text horizontally
		justifyContent: "center", // Center text vertically
		elevation: 2, // Android elevation for shadow
		shadowColor: "#000", // Shadow color for iOS
		shadowOffset: { width: 0, height: 1 }, // Shadow offset for iOS
		shadowOpacity: 0.8, // Shadow opacity for iOS
		shadowRadius: 1, // Shadow radius for iOS
		fontWeight: "bold", // Font weight for iOS
		fontSize: 16, // Font size for iOS
	},
	trackDetails: {
		flexDirection: "row",
		alignItems: "center",
		padding: 20,
	},
	nowPlayingAlbumArt: {
		width: 65,
		height: 65,
		borderRadius: 10,
	},
	nowPlayingTrackName: {
		fontSize: 21,
	},
	nowPlayingTrackArtist: {
		fontSize: 18,
		color: "black",
	},
	queueAlbumArt: {
		width: 60,
		height: 60,
		borderRadius: 10,
	},
	sideBySide: {
		marginTop: 15,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	sideBySideTwo: {
		position: "absolute",
		bottom: 10,
		left: 0,
		right: 0,
		marginHorizontal: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	sideBySideClose: {
		marginTop: 15,
		flexDirection: "row",
	},
	trackInfo: {
		marginLeft: 20,
	},
	queueTrackName: {
		fontSize: 16,
	},
	queueTrackArtist: {
		fontSize: 14,
		color: "black",
	},
	controls: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 50,
	},
	smallControls: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 10,
	},
	controlButton: {
		marginHorizontal: 40,
		// marginTop: -20,
	},
	queueButton: {
		marginTop: 20,
		alignItems: "center",
	},
	queueButtonText: {
		fontSize: 16,
	},
	queueContainer: {
		paddingHorizontal: 20,
	},
	track: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
	},
	currentTrack: {
		backgroundColor: "#f0f0f0",
	},
	queueTrack: {
		backgroundColor: "white",
	},
	viewQueueButton: {
		alignSelf: "center",
		marginVertical: 10,
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: "#007AFF",
		borderRadius: 20,
	},
	viewQueueButtonText: {
		color: "white",
		fontSize: 16,
	},
	joinLeaveButton: {
		marginRight: 10,
		marginVertical: 10,
		paddingVertical: 8,
		paddingHorizontal: 30,
		backgroundColor: colors.primary,
		borderRadius: 20,
	},
	joinLeaveButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	songRoomWidget: {
		marginTop: -80,
	},
});

export default RoomPage;
