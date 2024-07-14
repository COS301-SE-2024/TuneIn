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
	Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import CommentWidget from "../../components/CommentWidget";
import { LinearGradient } from "expo-linear-gradient";
import * as io from "socket.io-client";
import { LiveChatMessageDto, RoomDto, UserDto } from "../../../api-client";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import axios from "axios";
import { ChatEventDto } from "../../models/ChatEventDto";
import Icon from "react-native-vector-icons/MaterialIcons";
import PlaybackManager from "../PlaybackManager";

type Message = {
	message: LiveChatMessageDto;
	me?: boolean;
};

const RoomPage = () => {
	const { room } = useLocalSearchParams();
	console.log("Room data:", room);
	let roomData;
	if (Array.isArray(room)) {
		roomData = JSON.parse(room[0]);
	} else {
		roomData = JSON.parse(room);
	}
	const roomID = roomData.id;
	console.log("Room ID:", roomID);
	const [setRoomObj] = useState<RoomDto | null>(null);

	const router = useRouter();
	const token = useRef<string | null>(null);
	const userRef = useRef<UserDto | null>(null);
	const roomObjRef = useRef<RoomDto | null>(null);
	const [readyToJoinRoom, setReadyToJoinRoom] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [joined, setJoined] = useState(false);
	const [queue, setQueue] = useState([]);
	const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [secondsPlayed, setSecondsPlayed] = useState(0); // Track the number of seconds played
	const [isChatExpanded, setChatExpanded] = useState(false);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [setJoinedSongIndex] = useState(null);
	const [setJoinedSecondsPlayed] = useState(null);
	const socket = useRef<io.Socket | null>(null);

	const playbackManager = useRef(new PlaybackManager()).current;
	//init & connect to socket
	useEffect(() => {
		const getTokenAndSelf = async () => {
			const storedToken = await auth.getToken();
			console.log("token:", token);
			token.current = storedToken;
			console.log("Stored token:", token.current);
			try {
				const response = await axios.get(`${utils.API_BASE_URL}/users`, {
					headers: {
						Authorization: `Bearer ${storedToken}`,
					},
				});
				userRef.current = response.data as UserDto;
			} catch (error) {
				console.error("Error fetching user's own info:", error);
			}

			try {
				const roomDto = await axios.get(
					`${utils.API_BASE_URL}/rooms/${roomID}`,
					{
						headers: {
							Authorization: `Bearer ${storedToken}`,
						},
					},
				);
				roomObjRef.current = roomDto.data;
			} catch (error) {
				console.error("Error fetching room:", error);
			}
		};
		getTokenAndSelf();
		checkBookmark();

		socket.current = io.io(utils.API_BASE_URL + "/live-chat", {
			transports: ["websocket"],
		});

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
				console.log("Received live message:", newMessage);
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

		if (socket.current && userRef.current) {
			socket.current.on("connect", () => {
				const input: ChatEventDto = {
					userID: userRef.current.userID,
				};
				socket.current.emit("connectUser", JSON.stringify(input));
			});

			socket.current.on("connected", (response: ChatEventDto) => {
				if (!joined && readyToJoinRoom) {
					joinRoom();
				}
			});

			setupSocketEventHandlers();
		}

		return () => {
			if (socket.current) {
				console.log("Disconnecting socket...");
				socket.current.disconnect();
			}
		};
	});

	const sendMessage = () => {
		if (message.trim()) {
			const u: UserDto = userRef.current;
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
			socket.current.emit("liveMessage", JSON.stringify(input));
			// do not add the message to the state here, wait for the server to send it back
			//setMessages([...messages, { message: newMessage, me: true }]);
		}
	};

	const joinRoom = useCallback(() => {
		const u: UserDto = userRef.current;
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
		setJoined(true);
	}, [roomID]);

	const checkBookmark = async () => {
		const t = await auth.getToken();
		console.log("Checking bookmark");
		try {
			const response = await fetch(`${utils.API_BASE_URL}/users/bookmarks`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${t}`,
				},
			});
			const data = await response.json();
			// check whether the room is bookmarked or not
			for (let i = 0; i < data.length; i++) {
				if (data[i].roomID === roomID) {
					console.log("Room is bookmarked");
					setIsBookmarked(true);
					break;
				}
			}
			console.log(data);
		} catch (error) {
			console.error("Error:", error);
		}
	};
	const handleBookmark = async () => {
		// make a request to the backend to check if the room is bookmarked
		// if it is bookmarked, set isBookmarked to true
		setIsBookmarked(!isBookmarked);
		console.log("tokeeen", token);

		const t = await auth.getToken();

		try {
			console.log(roomID);
			const response = await fetch(
				`${utils.API_BASE_URL}/rooms/${roomID}/${isBookmarked ? "unbookmark" : "bookmark"}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${t}`,
					},
				},
			);
			console.log(response);
			if (response.status === 201) {
				Alert.alert(
					"Success",
					`Room has been ${isBookmarked ? "unbookmarked" : "bookmarked"}`,
					[
						{
							text: "OK",
							onPress: () => console.log("OK Pressed"),
						},
					],
				);
			}
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const leaveRoom = () => {
		const u: UserDto = userRef.current;
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
		setJoined(false);
	};

	// const getQueueState = () => {
	// 	// Simulated queue state with UTC start times
	// 	const queue = [
	// 		{
	// 			song: "Song A",
	// 			startTime: new Date(Date.UTC(2024, 6, 6, 12, 0, 0)),
	// 			index: 0,
	// 		}, // July 6th, 2024, 12:00:00 UTC
	// 		{
	// 			song: "Song B",
	// 			startTime: new Date(Date.UTC(2024, 6, 6, 12, 10, 0)),
	// 			index: 1,
	// 		}, // July 6th, 2024, 12:10:00 UTC
	// 		{
	// 			song: "Song C",
	// 			startTime: new Date(Date.UTC(2024, 6, 6, 12, 20, 0)),
	// 			index: 2,
	// 		}, // July 6th, 2024, 12:20:00 UTC
	// 	];

	// 	// Function to return the UTC start time and index of a song in the queue
	// 	const getSongState = (index) => {
	// 		const song = queue.find((item) => item.index === index);
	// 		if (song) {
	// 			return {
	// 				startTimeUTC: song.startTime.toISOString(), // Convert to ISO string for universal representation
	// 				index: song.index,
	// 			};
	// 		} else {
	// 			return null; // Handle case when song index is not found
	// 		}
	// 	};

	// 	return {
	// 		getSongState,
	// 	};
	// };

	const trackPositionIntervalRef = useRef(null);
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
				console.log("URL: ", `${utils.API_BASE_URL}/rooms/${roomID}/songs`);
				console.log("response: ", response);
				if (!response.ok) {
					const errorText = await response.text();
					console.error(
						`Failed to fetch queue: ${response.status} ${response.statusText}`,
						errorText,
					);
					return;
				}

				const data = await response.json();
				console.log("Fetched queue data:", data);

				if (Array.isArray(data) && data.length > 0) {
					setQueue(data[0]);
				} else {
					console.error("Unexpected response data format:", data);
				}
			} catch (error) {
				console.error("Failed to fetch queue:", error);
			}
		};

		fetchQueue();
	}, [roomData.roomID, roomID]);

	// const getRoomState = () => {
	// 	return {
	// 		currentTrackIndex,
	// 		secondsPlayed,
	// 	};
	// };

	useEffect(() => {
		return () => {
			if (trackPositionIntervalRef.current) {
				clearInterval(trackPositionIntervalRef.current);
			}
		};
	}, [isPlaying]);

	useEffect(() => {
		if (isPlaying) {
			trackPositionIntervalRef.current = setInterval(() => {
				setSecondsPlayed((prevSeconds) => prevSeconds + 1);
			}, 1000);
		} else {
			clearInterval(trackPositionIntervalRef.current);
		}

		return () => {
			clearInterval(trackPositionIntervalRef.current);
		};
	}, [isPlaying]);

	const handleJoinLeave = () => {
		setJoined((prevJoined) => !prevJoined);
		if (!joined) {
			joinRoom();
			setJoined(true);
			setJoinedSongIndex(currentTrackIndex);
			setJoinedSecondsPlayed(secondsPlayed);
			console.log(
				`Joined: Song Index - ${currentTrackIndex}, Seconds Played - ${secondsPlayed}`,
			);
		} else {
			leaveRoom();
			setJoined(false);
			setJoinedSongIndex(null);
			setJoinedSecondsPlayed(null);
			playbackManager.pause();
			setIsPlaying(false);
		}
	};

	const playPauseTrack = useCallback(
		(index, offset) => {
			playbackManager.playPauseTrack(queue[index], index, offset);
			setCurrentTrackIndex(index);
			setIsPlaying(playbackManager.getIsPlaying());
			setSecondsPlayed(playbackManager.getSecondsPlayed());
		},
		[queue, playbackManager],
	);

	const playNextTrack = () => {
		playbackManager.playPreviousTrack();
		setCurrentTrackIndex(playbackManager.getCurrentTrackIndex());
	};

	const playPreviousTrack = () => {
		playbackManager.playPreviousTrack();
		setCurrentTrackIndex(playbackManager.getCurrentTrackIndex());
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
				Room_id: roomID,
				mine: roomData.mine,
			},
		});
	};

	if (userRef.current && roomObjRef.current) {
		setReadyToJoinRoom(true);
		console.log("Ready to join room...");
		console.log(userRef.current, roomObjRef.current);
	}

	useEffect(() => {
		if (readyToJoinRoom && !joined) {
			console.log("Joining room...");
			console.log(readyToJoinRoom, joined);
			joinRoom();
		}
	}, [readyToJoinRoom, joined, joinRoom]);

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
					<View style={styles.joinLeaveButtonContainer}></View>
				</View>
				<TouchableOpacity
					onPress={handleBookmark}
					style={styles.bookmarkButton}
				>
					<Icon
						name={isBookmarked ? "bookmark" : "bookmark-border"}
						size={34}
						color={isBookmarked ? "gold" : "black"}
					/>
					<Text style={styles.joinLeaveButtonText}>
						{isBookmarked ? "Unbookmark" : "Bookmark"}
					</Text>
				</TouchableOpacity>
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
							onPress={() => playPreviousTrack}
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
						onPress={() => playPauseTrack(index, 0)}
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
	bookmarkButton: {
		marginTop: 20,
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
		width: 36,
		height: 36,
		borderRadius: 25,
		marginRight: 10,
		borderWidth: 2,
		borderColor: "blue",
	},
	username: {
		fontSize: 18,
		color: "white",
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
		paddingHorizontal: 16,
		backgroundColor: "#007AFF",
		borderRadius: 20,
	},
	joinLeaveButtonText: {
		color: "white",
		fontSize: 16,
	},
});

export default RoomPage;
