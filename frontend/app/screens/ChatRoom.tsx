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
	StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	FontAwesome5,
	MaterialIcons,
	MaterialCommunityIcons,
} from "@expo/vector-icons";
import SongRoomWidget from "../components/SongRoomWidget";
import CommentWidget from "../components/CommentWidget";
import io from "socket.io-client";
import { LiveChatMessageDto, RoomDto, UserProfileDto } from "../../api-client";
import axios from "axios";
import { ChatEventDto } from "../models/ChatEventDto";
import RoomDetails from "./RoomDetails";
import auth from "./../services/AuthManagement"; // Import AuthManagement
import * as utils from "./../services/Utils"; // Import Utils

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
	const [user, setUser] = useState<UserProfileDto | null>(null);
	const [message, setMessage] = useState("");
	/*
  const [messages, setMessages] = useState<Message[]>([
    { username: 'JohnDoe', message: 'This is a sample comment.', profilePictureUrl: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg' },
    { username: 'JaneSmith', message: 'Another sample comment here.', profilePictureUrl: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg' },
    { username: 'Me', message: 'This is my own message.', profilePictureUrl: 'https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg', me: true },
  ]);
  */
	const [messages, setMessages] = useState<Message[]>([]);
	const [isPlaying, setIsPlaying] = useState(false); // State to toggle play/pause
	const [isRoomCreator, setIsRoomCreator] = useState(true); // false will lead to RoomInfo, true will lead to AdvancedSettings
	const socket = useRef(null);

	//init & connect to socket
	useEffect(() => {
		const getTokenAndSelf = async () => {
			try {
				const storedToken = await auth.getToken();
				setToken(storedToken);
				const whoami = async (token: string | null, type?: string) => {
					try {
						const response = await axios.get(
							`${utils.getAPIBaseURL()}/profile`,
							{
								headers: {
									Authorization: `Bearer ${token}`,
								},
							},
						);
						console.log("User's own info:", response.data);
						return response.data as UserProfileDto;
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

		socket.current = io(utils.getAPIBaseURL() + "/live-chat", {
			transports: ["websocket"],
		});

		socket.current.on("connect", () => {
			console.log("Connected to the server!");
			const input: ChatEventDto = {
				userID: user.userID,
			};
			socket.current.emit("connectUser", input);
		});

		socket.current.on("connected", (response: ChatEventDto) => {
			//an event that should be in response to the connectUser event
			console.log("User connected:", response);
		});

		socket.current.on("userJoinedRoom", (response: ChatEventDto) => {
			//if someone joins (could be self)
			console.log("User joined room:", response);
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
	}, []);

	// Get screen height to calculate the expanded height
	const screenHeight = Dimensions.get("window").height;
	const collapsedHeight = 60;
	const expandedHeight = screenHeight - 80; // Adjust as needed for your layout
	const animatedHeight = useRef(new Animated.Value(collapsedHeight)).current;

	const sendMessage = () => {
		if (message.trim()) {
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

	const leaveRoom = () => {
		const input: ChatEventDto = {
			userID: user.userID,
			body: {
				messageBody: "",
				sender: user,
				roomID: room.roomID,
				dateCreated: new Date(),
			},
		};
		socket.current.emit("leaveRoom", input);
	};

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

	//automatically join the room on component mount
	useEffect(() => {
		console.log("Joining room...");
		console.log(user);
		joinRoom();
	}, []);

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
								justifyContent: "space-between",
								marginVertical: 10,
								paddingHorizontal: 50,
							}}
						>
							<TouchableOpacity>
								<FontAwesome5 name="step-backward" size={30} color="black" />
							</TouchableOpacity>
							<TouchableOpacity onPress={togglePlayPause}>
								<FontAwesome5
									name={isPlaying ? "pause" : "play"}
									size={30}
									color="black"
								/>
							</TouchableOpacity>
							<TouchableOpacity>
								<FontAwesome5 name="step-forward" size={30} color="black" />
							</TouchableOpacity>
						</View>
					)}
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							marginVertical: 70,
							paddingHorizontal: 50,
						}}
					>
						<TouchableOpacity
							onPress={navigateToPlaylist}
							style={{ flexDirection: "row", alignItems: "center" }}
						>
							<MaterialIcons name="playlist-play" size={37} color="black" />
							<Text style={{ marginLeft: 5, fontSize: 19 }}>Playlist</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={navigateToLyrics}
							style={{ flexDirection: "row", alignItems: "center" }}
						>
							<MaterialCommunityIcons
								name="music-clef-treble"
								size={33}
								color="black"
							/>
							<Text style={{ marginLeft: 5, fontSize: 19 }}>Lyrics</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
			<Animated.View
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
					paddingHorizontal: 20,
					paddingTop: 10,
				}}
			>
				<TouchableOpacity
					style={{
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
						paddingTop: 10,
					}}
					onPress={toggleChat}
				>
					<Text style={{ fontSize: 16, fontWeight: "bold" }}>
						Chat Messages
					</Text>
					<FontAwesome5
						name={isChatExpanded ? "chevron-down" : "chevron-up"}
						size={16}
						style={{ marginLeft: 5 }}
					/>
				</TouchableOpacity>
				{isChatExpanded && (
					<>
						<View style={{ flex: 1 }}>
							<ScrollView style={{ marginTop: 10, flex: 1 }}>
								<View style={{ marginBottom: 10 }}>
									<View
										style={{
											borderBottomWidth: 1,
											borderBottomColor: "#D1D5DB",
											paddingBottom: 10,
										}}
									></View>
									<View style={{ marginTop: 10 }}>
										{messages.map((msg, index) => (
											<CommentWidget
												key={index}
												username={msg.message.sender.username}
												message={msg.message.messageBody}
												profilePictureUrl={msg.message.sender.profilePictureUrl}
												me={msg.me}
											/>
										))}
									</View>
								</View>
							</ScrollView>
						</View>
						<KeyboardAvoidingView
							behavior={Platform.OS === "ios" ? "padding" : "height"}
							style={styles.inputContainer}
						>
							<Image
								source={{
									uri: "https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg",
								}}
								style={{ width: 40, height: 40, borderRadius: 20 }}
							/>
							<TextInput
								placeholder="Message..."
								style={styles.input}
								value={message}
								onChangeText={setMessage}
							/>
							<TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
								<Image
									source={{
										uri: "https://img.icons8.com/material-outlined/24/000000/filled-sent.png",
									}}
									style={styles.sendIcon}
								/>
							</TouchableOpacity>
						</KeyboardAvoidingView>
					</>
				)}
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 5,
		paddingHorizontal: 5,
		borderTopWidth: 1,
		borderTopColor: "#000000",
		backgroundColor: "#E8EBF2",
	},
	input: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 25,
		marginRight: 10,
		marginLeft: 20,
		marginBottom: 10,
		marginTop: 10,
	},
	sendButton: {
		padding: 10,
	},
	sendIcon: {
		width: 24,
		height: 24,
	},
});

export default ChatRoomScreen;
