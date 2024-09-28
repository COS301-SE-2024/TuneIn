import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	Animated,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	Dimensions,
} from "react-native";
import { useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import CommentWidget from "../../components/CommentWidget";
import { FlyingView, ObjectConfig } from "react-native-flying-objects";
import EmojiPicker, {
	EmojiPickerRef,
} from "../../components/rooms/emojiPicker";
import { colors } from "../../styles/colors";
import { useLive } from "../../LiveContext";
import { useAPI } from "../../APIContext";

const MemoizedCommentWidget = memo(CommentWidget);

const ChatRoom = () => {
	const { room } = useGlobalSearchParams();
	const {
		currentRoom,
		socketHandshakes,
		roomMessages,
		joinRoom,
		leaveRoom,
		roomControls,
		roomEmojiObjects,
	} = useLive();
	const { rooms } = useAPI();
	const [userInRoom, setUserInRoom] = useState(false);

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

	const [message, setMessage] = useState("");
	const [isSending, setIsSending] = useState(false);

	//Emoji picker
	const [localObjects, setLocalObjects] =
		useState<ObjectConfig[]>(roomEmojiObjects);
	const emojiPickerRef = useRef<EmojiPickerRef>(null);

	const handleSelectEmoji = (emoji: string) => {
		if (userInRoom) {
			setLocalObjects((prev) => [
				...prev,
				{ object: <Text style={{ fontSize: 30 }}>{emoji}</Text> },
			]);
			roomControls.sendReaction(emoji);
		}
	};

	const passEmojiToTextField = (emoji: string) => {
		emojiPickerRef.current?.passEmojiToTextField(emoji);
	};

	const screenHeight = Dimensions.get("window").height;

	const handleJoinLeave = async () => {
		// only join if not in room or if in another room
		if (!currentRoom || !userInRoom) {
			await rooms.joinRoom(roomID);
			joinRoom(roomID);
			roomControls.requestRoomQueue();

			// only leave if you're in the room
		} else if (currentRoom && userInRoom) {
			await rooms.leaveRoom(roomID);
			leaveRoom();
			if (await roomControls.playbackHandler.userListeningToRoom()) {
				await roomControls.playbackHandler.handlePlayback("pause");
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

	const sendMessage = () => {
		if (userInRoom) {
			if (isSending) return;
			setIsSending(true);
			roomControls.sendLiveChatMessage(message);
			setMessage("");
		}
	};

	useEffect(() => {
		if (userInRoom) {
			setLocalObjects(roomEmojiObjects);
		}
	}, [roomEmojiObjects, userInRoom]);

	useEffect(() => {
		updateRoomStatus();
	}, [roomID, currentRoom]);

	// on component mount
	useEffect(() => {
		updateRoomStatus();
	}, []);

	return (
		<View style={styles.container}>
			<View style={styles.contentContainer}>
				<View style={styles.sideBySide}>
					<View style={styles.joinLeaveButtonContainer}>
						<TouchableOpacity
							style={styles.joinLeaveButton}
							onPress={handleJoinLeave}
						>
							<Text style={styles.joinLeaveButtonText}>
								{socketHandshakes.roomJoined && userInRoom ? "Leave" : "Join"}
							</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.joinLeaveButtonContainer}></View>
				</View>
			</View>

			<Animated.View
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					height: screenHeight - 150,
					// height: screenHeight - 250,
					backgroundColor: "#E8EBF2",
					borderTopLeftRadius: 20,
					borderTopRightRadius: 20,
					elevation: 5,
					paddingHorizontal: 10,
					paddingTop: 10,
				}}
			>
				<>
					<View style={styles.container}>
						<ScrollView style={{ flex: 1, marginTop: 10 }}>
							{userInRoom &&
								roomMessages.map((msg, index) => (
									<MemoizedCommentWidget
										key={index}
										username={msg.message.sender.username}
										message={msg.message.messageBody}
										profilePictureUrl={msg.message.sender.profile_picture_url}
										me={msg.me}
									/>
								))}
						</ScrollView>
						<FlyingView
							object={localObjects}
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
								marginBottom: 20,
							}}
						>
							<TextInput
								style={{
									flex: 1,
									borderWidth: 1,
									borderColor: "#ccc",
									borderRadius: 20,
									paddingHorizontal: 10,
									paddingVertical: 10,
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
								<MaterialIcons name="send" size={24} color={colors.primary} />
							</TouchableOpacity>
						</View>
					</KeyboardAvoidingView>
				</>
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: "relative",
		// marginHorizontal: 10,
		backgroundColor: "#E8EBF2",
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
		paddingTop: 40,
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
		marginTop: 650,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
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
		marginTop: 10,
	},
	controlButton: {
		marginHorizontal: 40,
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
});

export default ChatRoom;
