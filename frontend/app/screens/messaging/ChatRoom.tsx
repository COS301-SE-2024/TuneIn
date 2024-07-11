import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	ScrollView,
	Image,
	KeyboardAvoidingView,
	Platform,
	Animated,
	Easing,
	Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	FontAwesome5,
	MaterialIcons,
	MaterialCommunityIcons,
} from "@expo/vector-icons";
import SongRoomWidget from "../../components/SongRoomWidget";
import io from "socket.io-client";
import {
	LiveChatMessageDto,
	RoomDto,
	UserProfileDto,
} from "../../../api-client";
import axios from "axios";
import { ChatEventDto } from "../../models/ChatEventDto";

type Message = {
	message: LiveChatMessageDto;
	me?: boolean;
};

interface ChatRoomScreenProps {
	roomObj: string;
}

const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ roomObj }) => {
	const router = useRouter();
	const _roomDetails = useLocalSearchParams(); // room details from previous screen
	console.log(_roomDetails);
	const [isChatExpanded, setChatExpanded] = useState(false);

	const room: RoomDto = JSON.parse(roomObj) as RoomDto;
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<UserDto | null>(null);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [isPlaying, setIsPlaying] = useState(false); // State to toggle play/pause
	const [isRoomCreator] = useState(true); // false will lead to RoomInfo, true will lead to AdvancedSettings
	const socket = useRef(null);

	//init & connect to socket
	useEffect(() => {
		const getTokenAndSelf = async () => {
			try {
				const storedToken = await auth.getToken();
				setToken(storedToken);
				const whoami = async (token: string | null, type?: string) => {
					try {
						const response = await axios.get(`${utils.API_BASE_URL}/users`, {
							headers: {
								Authorization: `Bearer ${token}`,
							},
						});
						console.log("User's own info:", response.data);
						return response.data as UserDto;
					} catch (error) {
						console.error("Error fetching user's own info:", error);
						//user is not authenticated
					}
				};
				setUser(await whoami(token));
			} catch (error) {
				console.error("Error fetching token:", error);
				//user is not authenticated
			}
		};
		getTokenAndSelf();

		socket.current = io(utils.API_BASE_URL + "/live-chat", {
			transports: ["websocket"],
		});

		socket.current.on("connect", () => {
			console.log("Connected to the server!");
			if (user) {
				const input: ChatEventDto = {
					userID: user.userID,
				};
				socket.current.emit("connectUser", input);
			}
		});

		socket.current.on("connected", (response: ChatEventDto) => {
			//an event that should be in response to the connectUser event
			console.log("User connected:", response);
		});

		socket.current.on("userJoinedRoom", (response: ChatEventDto) => {
			//if someone joins (could be self)
			console.log("User joined room:", response);
			if (user) {
				const input: ChatEventDto = {
					userID: user.userID,
					body: {
						messageBody: "",
						sender: user,
						roomID: room.roomID,
						dateCreated: new Date(),
					},
				};
				socket.current.emit("getChatHistory", input);
			}
		});

		socket.current.on("chatHistory", (history: LiveChatMessageDto[]) => {
			//an event that should be in response to the getChatHistory event
			const chatHistory = history.map((msg) => ({
				message: msg,
				me: msg.sender.userID === user.userID,
			}));
			setMessages(chatHistory);
		});

		socket.current.on("liveMessage", (newMessage: ChatEventDto) => {
			const message = newMessage.body;
			const me: boolean = message.sender.userID === user.userID;
			if (me) {
				//clear message only after it has been sent & confirmed as received
				setMessage("");
			}
			setMessages((prevMessages) => [
				...prevMessages,
				{ message, me: message.sender.userID === user.userID },
			]);
		});

		socket.current.on("userLeftRoom", (response: ChatEventDto) => {
			//an event that should be in response to the leaveRoom event (could be self or other people)
			console.log("User left room:", response);
		});

		socket.current.on("error", (response: ChatEventDto) => {
			console.error("Error:", response.errorMessage);
		});

		return () => {
			socket.current.disconnect();
		};
	}, [room.roomID, token, user]);

	// Get screen height to calculate the expanded height
	const screenHeight = Dimensions.get("window").height;
	const collapsedHeight = 60;
	const expandedHeight = screenHeight - 80; // Adjust as needed for your layout
	const animatedHeight = useRef(new Animated.Value(collapsedHeight)).current;

	const sendMessage = () => {
		if (message.trim() && user) {
			const newMessage: LiveChatMessageDto = {
				messageBody: message,
				sender: user,
				roomID: room.roomID,
				dateCreated: new Date(),
			};
			const input: ChatEventDto = {
				userID: user.userID,
				body: newMessage,
			};
			socket.current.emit("sendMessage", input);
			// do not add the message to the state here, wait for the server to send it back
			//setMessages([...messages, { message: newMessage, me: true }]);
		}
	};

	useEffect(() => {
		if (user) {
			const joinRoom = () => {
				const input: ChatEventDto = {
					userID: user.userID,
					body: {
						messageBody: "",
						sender: user,
						roomID: room.roomID,
						dateCreated: new Date(),
					},
				};
				socket.current.emit("joinRoom", input);
			};

			joinRoom();
		}
	}, [user, room.roomID]);

	const navigateToAdvancedSettings = () => {
		router.navigate({
			pathname: "/screens/AdvancedSettings",
			params: _roomDetails,
		});
	};

	const navigateToPlaylist = () => {
		router.navigate("/screens/Playlist");
	};

	const navigateToLyrics = () => {
		router.navigate("/screens/Lyrics");
	};

	const togglePlayPause = () => {
		setIsPlaying(!isPlaying);
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

	const navigateToRoomOptions = () => {
		router.navigate("/screens/RoomOptions");
	};

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: "white",
				paddingHorizontal: 20,
				paddingTop: 20,
			}}
		>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					padding: 10,
				}}
			>
				<TouchableOpacity onPress={() => router.back()}>
					<Text style={{ fontSize: 20, fontWeight: "bold" }}>×</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={
						isRoomCreator ? navigateToAdvancedSettings : navigateToRoomOptions
					}
				>
					<FontAwesome5 name="ellipsis-h" size={15} color="black" />
				</TouchableOpacity>
			</View>
			{!isChatExpanded && (
				<View style={{ paddingHorizontal: 10, paddingBottom: 40, flex: 1 }}>
					<SongRoomWidget
						songName="Eternal Sunshine"
						artist="Ariana Grande"
						albumCoverUrl="https://t2.genius.com/unsafe/300x300/https%3A%2F%2Fimages.genius.com%2F08e2633706582e13bc20f44637441996.1000x1000x1.png"
						progress={0.5}
						time1="1:30"
						time2="3:00"
					/>
					{isRoomCreator && (
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
								paddingVertical: 20,
							}}
						>
							<TouchableOpacity onPress={togglePlayPause}>
								<FontAwesome5
									name={isPlaying ? "pause-circle" : "play-circle"}
									size={30}
									color="black"
								/>
							</TouchableOpacity>
							<View style={{ flexDirection: "row" }}>
								<TouchableOpacity onPress={navigateToPlaylist}>
									<MaterialIcons
										name="queue-music"
										size={30}
										color="black"
										style={{ marginRight: 20 }}
									/>
								</TouchableOpacity>
								<TouchableOpacity onPress={navigateToLyrics}>
									<MaterialCommunityIcons
										name="file-music-outline"
										size={30}
										color="black"
									/>
								</TouchableOpacity>
							</View>
						</View>
					)}
				</View>
			)}
			<Animated.View
				style={{
					height: animatedHeight,
					backgroundColor: "#f3f3f3",
					borderTopLeftRadius: 20,
					borderTopRightRadius: 20,
					paddingHorizontal: 20,
					paddingTop: 10,
				}}
			>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Text style={{ fontSize: 18, fontWeight: "bold" }}>Chat Room</Text>
					<TouchableOpacity onPress={toggleChat}>
						<Text style={{ fontSize: 16, color: "#007BFF" }}>
							{isChatExpanded ? "Collapse" : "Expand"}
						</Text>
					</TouchableOpacity>
				</View>
				<ScrollView style={{ flex: 1, marginVertical: 10 }}>
					{messages.map((msg, index) => (
						<View
							key={index}
							style={{
								flexDirection: msg.me ? "row-reverse" : "row",
								alignItems: "center",
								marginVertical: 5,
							}}
						>
							<Image
								source={{ uri: msg.message.sender.profilePictureUrl }}
								style={{
									width: 40,
									height: 40,
									borderRadius: 20,
									marginHorizontal: 10,
								}}
							/>
							<View
								style={{
									backgroundColor: msg.me ? "#DCF8C6" : "#EAEAEA",
									padding: 10,
									borderRadius: 10,
									maxWidth: "70%",
								}}
							>
								<Text style={{ fontSize: 14, fontWeight: "bold" }}>
									{msg.message.sender.name}
								</Text>
								<Text>{msg.message.messageBody}</Text>
								<Text
									style={{ fontSize: 10, color: "gray", textAlign: "right" }}
								>
									{new Date(msg.message.dateCreated).toLocaleTimeString()}
								</Text>
							</View>
						</View>
					))}
				</ScrollView>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							borderTopWidth: 1,
							borderTopColor: "#EAEAEA",
							paddingVertical: 10,
						}}
					>
						<TextInput
							style={{
								flex: 1,
								height: 40,
								borderColor: "#EAEAEA",
								borderWidth: 1,
								borderRadius: 20,
								paddingHorizontal: 15,
							}}
							placeholder="Type a message"
							value={message}
							onChangeText={setMessage}
						/>
						<TouchableOpacity onPress={sendMessage}>
							<MaterialIcons name="send" size={30} color="black" />
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			</Animated.View>
		</View>
	);
};

export default ChatRoomScreen;
