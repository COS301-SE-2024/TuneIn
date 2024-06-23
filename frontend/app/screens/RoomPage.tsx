import React, { useEffect, useState, useRef, useCallback } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	Animated,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	Dimensions,
	Easing,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Room } from "../models/Room";
import { useSpotifyPlayback } from "../hooks/useSpotifyPlayback";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import CommentWidget from "../components/CommentWidget";
import { LinearGradient } from "expo-linear-gradient";
import * as io from "socket.io-client";
import { LiveChatMessageDto, RoomDto, UserProfileDto } from "../../api-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StorageService from "./../services/StorageService"; // Import StorageService
import axios from "axios";
import { ChatEventDto } from "../models/ChatEventDto";
import RoomDetails from "./RoomDetails";
import RoomOptions from "./RoomOptions";

const BASE_URL = "http://localhost:3000";

type Message = {
	message: LiveChatMessageDto;
	me?: boolean;
};

interface ChatRoomScreenProps {
	roomObj: string;
}

const getQueue = () => {
	return [
		{
			albumArtUrl:
				"https://i.scdn.co/image/ab67616d0000b2731ea0c62b2339cbf493a999ad",
			artistNames: "Kendrick Lamar",
			explicit: true,
			id: "6AI3ezQ4o3HUoP6Dhudph3",
			name: "Not Like Us",
			preview_url: null,
			uri: "spotify:track:6AI3ezQ4o3HUoP6Dhudph3",
			duration_ms: 319958,
		},
		{
			albumArtUrl:
				"https://i.scdn.co/image/ab67616d0000b2736a6387ab37f64034cdc7b367",
			artistNames: "Outkast",
			explicit: false,
			id: "2PpruBYCo4H7WOBJ7Q2EwM",
			name: "Hey Ya!",
			preview_url:
				"https://p.scdn.co/mp3-preview/d24b3c4135ced9157b0ea3015a6bcc048e0c2e3a?cid=4902747b9d7c4f4195b991f29f8a680a",
			uri: "spotify:track:2PpruBYCo4H7WOBJ7Q2EwM",
			duration_ms: 373805,
		},
	];
};

const RoomPage = () => {
	const { room } = useLocalSearchParams();
	console.log("Room data:", room);
	const roomData: Room = JSON.parse(room);
	const roomID = roomData.roomID ? roomData.roomID : roomData.id;
	console.log("Room ID:", roomID);
	const [roomObj, setRoomObj] = useState<RoomDto | null>(null);
	const router = useRouter();
	const { handlePlayback } = useSpotifyPlayback();

	const token = useRef<string | null>(null);
	const userRef = useRef<UserProfileDto | null>(null);
	const roomObjRef = useRef<RoomDto | null>(null);
	const [readyToJoinRoom, setReadyToJoinRoom] = useState(false);

	const [joined, setJoined] = useState(false);
	const [queue, setQueue] = useState([]);
	const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isQueueExpanded, setIsQueueExpanded] = useState(false);
	const [isChatExpanded, setChatExpanded] = useState(false);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);

	const socket = useRef<io.Socket | null>(null);

	//init & connect to socket
	useEffect(() => {
		const getTokenAndSelf = async () => {
			const storedToken = await StorageService.getItem("token");
			token.current = storedToken;
			console.log("Stored token:", token.current);
			try {
				const whoami = async (givenToken: string) => {
					try {
						const response = await axios.get(`${BASE_URL}/profile`, {
							headers: {
								Authorization: `Bearer ${givenToken}`,
							},
						});
						console.log("User's own info:", response.data);
						return response.data as UserProfileDto;
					} catch (error) {
						console.error("Error fetching user's own info:", error);
						//user is not authenticated
					}
				};
				if (!userRef.current){
					userRef.current = await whoami(storedToken);
				}
			} catch (error) {
				console.error("Error fetching token:", error);
				//user is not authenticated
			}

			try {

				if (roomObjRef.current === null){
					const roomDto: RoomDto = (await axios.get(
						`${BASE_URL}/rooms/${roomID}`,
						{
							headers: {
								Authorization: `Bearer ${storedToken}`,
							},
						},
					)) as RoomDto;
					console.log("Room object:", roomDto);
					roomObjRef.current = roomDto;
					setRoomObj(roomDto);
				}
			} catch (error) {
				console.error("Error fetching room:", error);
			}
		};
		getTokenAndSelf();

		socket.current = io.io(BASE_URL + "/live-chat", {
			transports: ["websocket"],
		});

		if (userRef.current){
			socket.current.on("connect", () => {
				console.log("Connected to the server!");
				const input: ChatEventDto = {
					userID: userRef.current.userID,
				};
				console.log("Socket emit: connectUser", input);
				socket.current.emit("connectUser", JSON.stringify(input));
			});
	
			socket.current.on("connected", (response: ChatEventDto) => {
				//an event that should be in response to the connectUser event
				console.log("User connected:", response);
			});
		}

		const setupSocketEventHandlers = () => {
			console.log("Setting up socket event handlers...");	
			socket.current.on("userJoinedRoom", (response: ChatEventDto) => {
				//if someone joins (could be self)
				const u = userRef.current;
				console.log("User joined room:", response);
				const input: ChatEventDto = {
					userID: u.userID,
					body: {
						messageBody: "",
						sender: u,
						roomID: roomID,
						dateCreated: new Date(),
					},
				};
				console.log("Socket emit: getChatHistory", input);
				socket.current.emit("getChatHistory", JSON.stringify(input));
			});
	
			socket.current.on("chatHistory", (history: LiveChatMessageDto[]) => {
				//an event that should be in response to the getChatHistory event
				const u = userRef.current;
				const chatHistory = history.map((msg) => ({
					message: msg,
					me: msg.sender.userID === u.userID,
				}));
				setMessages(chatHistory);
			});
	
			socket.current.on("liveMessage", (newMessage: ChatEventDto) => {
				const message = newMessage.body;
				const u = userRef.current;
				const me: boolean = message.sender.userID === u.userID;
				if (me) {
					//clear message only after it has been sent & confirmed as received
					setMessage("");
				}
				setMessages((prevMessages) => [
					...prevMessages,
					{ message, me: message.sender.userID === u.userID },
				]);
			});
	
			socket.current.on("userLeftRoom", (response: ChatEventDto) => {
				//an event that should be in response to the leaveRoom event (could be self or other people)
				console.log("User left room:", response);
			});
	
			socket.current.on("error", (response: ChatEventDto) => {
				console.error("Error:", response.errorMessage);
			});
		};

		if (socket.current && userRef.current && roomObjRef.current) {
			setReadyToJoinRoom(true);
			setupSocketEventHandlers();
		}

		return () => {
			if (socket.current){
				console.log("Disconnecting socket...");
				socket.current.disconnect();
			}
		};
	}, []);

	const sendMessage = () => {
		if (message.trim()) {
			const u: UserProfileDto = userRef.current;
			const newMessage: LiveChatMessageDto = {
				messageBody: message,
				sender: u,
				roomID: roomID,
				dateCreated: new Date(),
			};
			const input: ChatEventDto = {
				userID: u.userID,
				body: newMessage,
			};
			console.log("Sending message:", input);
			socket.current.emit("sendMessage", JSON.stringify(input));
			// do not add the message to the state here, wait for the server to send it back
			//setMessages([...messages, { message: newMessage, me: true }]);
		}
	};

	useEffect(() => {
		//do this to ensure the useStates are updated
		console.log("Room data:", roomData);
		console.log("Room object:", roomObj);
		console.log("User:", userRef.current);
		console.log("Token:", token);
	}, [roomData, roomObj, userRef.current, token]);

	const joinRoom = useCallback(() => {
		if (!userRef.current || !roomObjRef.current) {
			console.error("User or room object not found!");
			return;
		}
		const u: UserProfileDto = userRef.current;
		const input: ChatEventDto = {
			userID: u.userID,
			body: {
				messageBody: "",
				sender: u,
				roomID: roomID,
				dateCreated: new Date(),
			},
		};
		console.log("Socket emit: joinRoom", input);
		socket.current.emit("joinRoom", JSON.stringify(input));
	}, []);

	const leaveRoom = () => {
		const u: UserProfileDto = userRef.current;
		const input: ChatEventDto = {
			userID: u.userID,
			body: {
				messageBody: "",
				sender: u,
				roomID: roomID,
				dateCreated: new Date(),
			},
		};
		console.log("Socket emit: leaveRoom", input);
		socket.current.emit("leaveRoom", JSON.stringify(input));
	};

	const trackPositionIntervalRef = useRef(null);
	const queueHeight = useRef(new Animated.Value(0)).current;
	const collapsedHeight = 60;
	const screenHeight = Dimensions.get("window").height;
	const expandedHeight = screenHeight - 80;
	const animatedHeight = useRef(new Animated.Value(collapsedHeight)).current;

	useEffect(() => {
		const fetchQueue = async () => {
			const data = getQueue();
			setQueue(data);
		};

		fetchQueue();
	}, [roomData.roomID]);

	useEffect(() => {
		return () => {
			if (trackPositionIntervalRef.current) {
				clearInterval(trackPositionIntervalRef.current);
			}
		};
	}, [isPlaying, handlePlayback]);

	// const handleGoBack = () => {
	// 	// router.goBack();
	// };

	const handleJoinLeave = () => {
		// Simulate toggling join/leave
		setJoined((prevJoined) => !prevJoined);
	};

	const playPauseTrack = (track, index) => {
		if (!track) {
			console.error("Invalid track:", track);
			return;
		}

		if (index === currentTrackIndex && isPlaying) {
			handlePlayback("pause");
			setIsPlaying(false);
		} else {
			handlePlayback("play", track.uri).then(() => {
				setCurrentTrackIndex(index);
				setIsPlaying(true);
			});
		}
	};

	const playNextTrack = () => {
		const nextIndex = currentTrackIndex + 1;
		if (nextIndex < queue.length) {
			const nextTrack = queue[nextIndex];
			playPauseTrack(nextTrack, nextIndex);
		}
	};

	const playPreviousTrack = () => {
		const previousIndex = currentTrackIndex - 1;
		if (previousIndex >= 0) {
			const previousTrack = queue[previousIndex];
			playPauseTrack(previousTrack, previousIndex);
		}
	};

	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
	};

	const toggleQueue = () => {
		Animated.timing(queueHeight, {
			toValue: isQueueExpanded ? 0 : 200,
			duration: 300,
			useNativeDriver: false,
		}).start();
		setIsQueueExpanded((prev) => !prev);
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
		router.navigate({
			pathname: "/screens/Playlist",
			params: {
				queue: JSON.stringify(queue),
				currentTrackIndex,
				Room_id: roomData.roomID,
				mine: roomData.mine,
			},
		});
	};

	//automatically join the room on component mount
	useEffect(() => {
		// Check if userRef and roomObjRef are not null
		if (userRef.current && roomObjRef.current) {
			console.log("Joining room...");
			console.log(userRef.current, roomObjRef.current);
			joinRoom();
		}
	}, [joinRoom, userRef.current, roomObjRef.current]);

	return (
		<View style={styles.container}>
			{/* <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
				<Text style={styles.backButtonText}>← Back</Text>
			</TouchableOpacity> */}

			<Image
				source={{ uri: roomData.backgroundImage }}
				style={styles.backgroundImage}
			/>
			<LinearGradient
				colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.5)", "rgba(255,255,255,1)"]}
				style={styles.gradientOverlay}
			/>

			<View style={styles.contentContainer}>
				<View style={styles.roomDetails}>
					<Text style={styles.roomName}>{roomData.name}</Text>
					<Text style={styles.description}>{roomData.description}</Text>
					<View style={styles.tagsContainer}>
						{roomData.tags.map((tag, index) => (
							<Text key={index} style={styles.tag}>
								{tag}
							</Text>
						))}
					</View>
				</View>
				<View style={styles.sideBySide}>
					{/* Left side */}
					<View style={styles.userInfoContainer}>
						<Image
							source={{ uri: roomData.userProfile }}
							style={styles.userImage}
						/>
						<Text style={styles.username}>{roomData.username}</Text>
					</View>

					{/* Right side */}
					<View style={styles.joinLeaveButtonContainer}>
						<TouchableOpacity
							style={styles.joinLeaveButton}
							onPress={handleJoinLeave}
						>
							<Text style={styles.joinLeaveButtonText}>
								{joined ? "Leave" : "Join"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.trackDetails}>
					<Image
						source={{ uri: queue[currentTrackIndex]?.albumArtUrl }}
						style={styles.nowPlayingAlbumArt}
					/>
					<View style={styles.trackInfo}>
						<Text style={styles.nowPlayingTrackName}>
							{queue[currentTrackIndex]?.name}
						</Text>
						<Text style={styles.nowPlayingTrackArtist}>
							{queue[currentTrackIndex]?.artistNames}
						</Text>
					</View>
				</View>

				{roomData.mine ? (
					<View style={styles.controls}>
						<TouchableOpacity
							style={styles.controlButton}
							onPress={playPreviousTrack}
						>
							<FontAwesome5 name="step-backward" size={24} color="black" />
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.controlButton}
							onPress={() =>
								playPauseTrack(queue[currentTrackIndex], currentTrackIndex)
							}
						>
							<FontAwesome5
								name={isPlaying ? "pause" : "play"}
								size={24}
								color="black"
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.controlButton}
							onPress={playNextTrack}
						>
							<FontAwesome5 name="step-forward" size={24} color="black" />
						</TouchableOpacity>
					</View>
				) : (
					<View></View>
				)}
				<TouchableOpacity
					style={styles.queueButton}
					onPress={navigateToPlaylist}
				>
					<MaterialIcons name="queue-music" size={55} color="Black" />
					<Text style={styles.queueButtonText}> Queue</Text>
				</TouchableOpacity>
			</View>
			<Animated.ScrollView
				style={[styles.queueContainer, { maxHeight: queueHeight }]}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				{queue.map((track, index) => (
					<TouchableOpacity
						key={track.id}
						style={[
							styles.track,
							index === currentTrackIndex
								? styles.currentTrack
								: styles.queueTrack,
						]}
						onPress={() => playPauseTrack(track, index)}
					>
						<Image
							source={{ uri: track.albumArtUrl }}
							style={styles.queueAlbumArt}
						/>
						<View style={styles.trackInfo}>
							<Text style={styles.queueTrackName}>{track.name}</Text>
							<Text style={styles.queueTrackArtist}>{track.artistNames}</Text>
						</View>
					</TouchableOpacity>
				))}
			</Animated.ScrollView>

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
					<Text style={{ fontWeight: "bold", fontSize: 16 }}>
						{isChatExpanded ? "Hide Chat" : "Show Chat"}
					</Text>
					<MaterialIcons
						name={isChatExpanded ? "keyboard-arrow-down" : "keyboard-arrow-up"}
						size={20}
						style={{ marginLeft: 10 }}
					/>
				</TouchableOpacity>
				{isChatExpanded && (
					<>
						<ScrollView style={{ flex: 1, marginTop: 10 }}>
							{messages.map((msg, index) => (
								<CommentWidget
									key={index}
									username={msg.message.sender.username}
									message={msg.message.messageBody}
									profilePictureUrl={msg.message.sender.profilePictureUrl}
									me={msg.me}
								/>
							))}
						</ScrollView>
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
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		position: "relative",
	},
	backButton: {
		position: "absolute",
		top: 40,
		left: 20,
		zIndex: 1,
	},
	backButtonText: {
		fontSize: 18,
		fontWeight: "bold",
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
		width: 36,
		height: 36,
		borderRadius: 25,
		marginRight: 10,
		borderWidth: 2,
		borderColor: "blue",
	},
	username: {
		fontSize: 18,
		fontWeight: "bold",
		color: "white",
	},
	roomDetails: {
		alignItems: "center",
		marginTop: 60,
	},
	roomName: {
		fontSize: 24,
		fontWeight: "bold",
		color: "white",
	},
	description: {
		fontSize: 16,
		color: "white",
		textAlign: "center",
		marginHorizontal: 20,
		marginTop: 10,
	},
	tagsContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 10,
	},
	tag: {
		fontSize: 14,
		color: "white",
		backgroundColor: "gray",
		borderRadius: 10,
		padding: 5,
		marginHorizontal: 5,
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
		fontWeight: "bold",
	},
	nowPlayingTrackArtist: {
		fontSize: 18,
		color: "black",
		fontWeight: 400,
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
		marginHorizontal: 20,
	},
	queueButton: {
		marginTop: 20,
		alignItems: "center",
	},
	queueButtonText: {
		fontSize: 16,
		fontWeight: "bold",
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
		fontWeight: "bold",
		fontSize: 16,
	},
	joinLeaveButton: {
		marginRight: 10,
		marginVertical: 10,
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: "#007AFF",
		borderRadius: 20,
	},
	joinLeaveButtonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
});

export default RoomPage;
