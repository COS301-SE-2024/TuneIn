import React, {
	useEffect,
	useState,
	useRef,
	useCallback,
	memo,
	useContext,
} from "react";
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
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import CommentWidget from "../../components/CommentWidget";
import CurrentRoom from "./functions/CurrentRoom";
import { live, LiveMessage } from "../../services/Live";
import { Player } from "../../PlayerContext";
import { formatRoomData } from "../../models/Room";
import { FlyingView, ObjectConfig } from "react-native-flying-objects";
import EmojiPicker, {
	EmojiPickerRef,
} from "../../components/rooms/emojiPicker";
import { colors } from "../../styles/colors";

const MemoizedCommentWidget = memo(CommentWidget);

const ChatRoom = () => {
	live.initialiseSocket();
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
	} else {
		roomID = roomData.roomID;
	}

	const playerContext = useContext(Player);
	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}

	const { currentRoom, setCurrentRoom } = playerContext;
	const [joined, setJoined] = useState(false);

	useEffect(() => {
		console.log("Room ID: " + currentRoom?.roomID);
		if (currentRoom && currentRoom?.roomID === roomID) {
			setJoined(true);
			live.joinRoom(roomID, setJoined, setMessages);
		}
	}, [currentRoom, roomID]);

	const [readyToJoinRoom, setReadyToJoinRoom] = useState(false);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<LiveMessage[]>([]);
	const [isSending, setIsSending] = useState(false);
	const scrollViewRef = useRef<FlatList>(null);

	// Emoji picker
	const [object, setObject] = useState<ObjectConfig[]>([]);
	const emojiPickerRef = useRef<EmojiPickerRef>(null);

	const handleSelectEmoji = (emoji: string) => {
		setObject((prev) => [
			...prev,
			{ object: <Text style={{ fontSize: 30 }}>{emoji}</Text> },
		]);
	};

	const passEmojiToTextField = (emoji: string) => {
		emojiPickerRef.current?.passEmojiToTextField(emoji);
	};

	const joinRoom = useCallback(() => {
		const formattedRoom = formatRoomData(roomData);
		setJoined(true);
		setCurrentRoom(formattedRoom);
	}, [roomData, setCurrentRoom]);

	const screenHeight = Dimensions.get("window").height;

	if (!readyToJoinRoom) {
		setReadyToJoinRoom(true);
		console.log("Ready to join room...");
	}

	useEffect(() => {
		if (readyToJoinRoom && !joined) {
			console.log("Joining room...");
			console.log(readyToJoinRoom, joined);
			// live.joinRoom(roomID, setJoined, setMessages, setMessage);
		}
	}, [readyToJoinRoom, joined, roomID]);

	const sendMessage = () => {
		if (isSending) return;
		setIsSending(true);
		live.sendLiveChatMessage(message, setIsSending);
		setMessage("");
	};

	// Track keyboard events
	useEffect(() => {
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
						data={messages}
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
						object={object}
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
