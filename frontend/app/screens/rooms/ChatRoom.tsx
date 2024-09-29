import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Animated,
	TextInput,
	Keyboard,
	Dimensions,
	FlatList, // Import FlatList
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
	const scrollViewRef = useRef<FlatList>(null);

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

		// Track keyboard events
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			() => {
				// Logic when keyboard is shown (if needed)
			},
		);
		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => {
				// Logic when keyboard is hidden (if needed)
			},
		);

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	return (
		<View style={styles.container}>
			<Animated.View
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					height: screenHeight - 90,
					backgroundColor: "#E8EBF2",
					elevation: 5,
					paddingHorizontal: 10,
					paddingTop: 10,
				}}
			>
				<View style={styles.container}>
					<FlatList
						style={{ flex: 1, marginTop: 10 }}
						ref={scrollViewRef}
						data={roomMessages}
						renderItem={({ item }) => (
							<MemoizedCommentWidget
								username={item.message.sender.username}
								message={item.message.messageBody}
								profilePictureUrl={item.message.sender.profile_picture_url}
								me={item.me}
							/>
						)}
						keyExtractor={(item, index) => index.toString()}
						contentContainerStyle={{ paddingBottom: 20 }}
					/>

					<FlyingView
						object={localObjects}
						containerProps={{
							style: styles.flyingView,
						}}
					/>
				</View>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						marginBottom: 20,
						marginTop: 20,
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

					<EmojiPicker ref={emojiPickerRef} onSelectEmoji={handleSelectEmoji} />
					<TouchableOpacity onPress={sendMessage} style={{ marginLeft: 10 }}>
						<MaterialIcons name="send" size={24} color={colors.primary} />
					</TouchableOpacity>
				</View>
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#E8EBF2",
	},
	flyingView: {
		position: "absolute",
		top: 10,
		right: 10,
		width: 150,
		height: 200,
	},
	contentContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		paddingTop: 40,
	},
	sideBySide: {
		marginTop: 15,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	joinLeaveButtonContainer: {
		position: "absolute",
		paddingRight: 8,
		right: 0,
		flex: 1,
		alignItems: "flex-end",
	},
});

export default ChatRoom;
