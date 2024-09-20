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
import * as utils from "../../services/Utils";
import Icon from "react-native-vector-icons/MaterialIcons";
import Bookmarker from "./functions/Bookmarker";
import CurrentRoom from "./functions/CurrentRoom";
import { Track } from "../../models/Track";
import DevicePicker from "../../components/DevicePicker";
import { live, LiveMessage } from "../../services/Live";
import { Player } from "../../PlayerContext";
import { SimpleSpotifyPlayback } from "../../services/SimpleSpotifyPlayback";
import { formatRoomData } from "../../models/Room";
import { ObjectConfig } from "react-native-flying-objects";
import EmojiPicker, {
	EmojiPickerRef,
} from "../../components/rooms/emojiPicker";
import { colors } from "../../styles/colors";
import SongRoomWidget from "../../components/SongRoomWidget";

interface RoomPageProps {
	joined: boolean;
	handleJoinLeave: () => Promise<void>;
}

// const RoomPage = () => {
const RoomPage: React.FC<RoomPageProps> = ({ joined, handleJoinLeave }) => {
	live.initialiseSocket();
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

	const playerContext = useContext(Player);
	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}

	const { currentRoom, setCurrentRoom } = playerContext;
	const [joineds, setJoined] = useState(false);

	useEffect(() => {
		console.log("Room ID: " + currentRoom?.roomID);
		if (currentRoom && currentRoom?.roomID === roomID) {
			setJoined(true);
		}
	}, [currentRoom, roomID]);

	const router = useRouter();
	const [readyToJoinRoom, setReadyToJoinRoom] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [queue, setQueue] = useState<Track[]>([]);
	const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [secondsPlayed, setSecondsPlayed] = useState(0); // Track the number of seconds played
	const [isChatExpanded, setChatExpanded] = useState(false);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<LiveMessage[]>([]);
	const [joinedsongIndex, setJoinedSongIndex] = useState<number | null>(null);
	const [ioinedSecondsPlayed, setJoinedSecondsPlayed] = useState<number | null>(
		null,
	);
	const [isSending, setIsSending] = useState(false);
	const playback = useRef(new SimpleSpotifyPlayback()).current;

	const bookmarker = useRef(new Bookmarker()).current;
	const truncateUsername = (username: string) => {
		if (username) {
			return username.length > 10 ? username.slice(0, 8) + "..." : username;
		}
	};

	//Emoji picker
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

	const checkBookmark = useCallback(async () => {
		try {
			const token = await auth.getToken();
			const isBookmarked = await bookmarker.checkBookmark(
				token as string,
				String(roomID),
			);
			setIsBookmarked(isBookmarked ?? false); // Use false as the default value if isBookmarked is undefined
		} catch (error) {
			console.error("Error checking bookmark:", error);
		}
	}, [roomID, bookmarker]);

	checkBookmark();

	const handleBookmark = async () => {
		live.startPlayback(roomID);

		// make a request to the backend to check if the room is bookmarked
		// if it is bookmarked, set isBookmarked to true
		setIsBookmarked(!isBookmarked);
		const token = await auth.getToken();

		try {
			const handleBookmark = await bookmarker.handleBookmark(
				token as string,
				String(roomID),
				isBookmarked,
			);
			if (handleBookmark) {
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

	const joinRoom = useCallback(() => {
		const formattedRoom = formatRoomData(roomData);
		setJoined(true);
		setCurrentRoom(formattedRoom);
		// if (userRef.current && socket.current) {
		// 	const u: UserDto = userRef.current;
		// 	const input: ChatEventDto = {
		// 		userID: u.userID,
		// 		body: {
		// 			messageBody: "",
		// 			sender: u,
		// 			roomID: roomID,
		// 			dateCreated: new Date(),
		// 		},
		// 	};
		// 	socket.current.emit("joinRoom", JSON.stringify(input));
		//
		// }
	}, [roomData, setCurrentRoom]);

	const leaveRoom = () => {
		// if (userRef.current && socket.current) {
		// 	const u: UserDto = userRef.current;
		// 	const input: ChatEventDto = {
		// 		userID: u.userID,
		// 		body: {
		// 			messageBody: "",
		// 			sender: u,
		// 			roomID: roomID,
		// 			dateCreated: new Date(),
		// 		},
		// 	};
		// 	console.log("Socket emit: leaveRoom", input);
		// 	socket.current.emit("leaveRoom", JSON.stringify(input));
		// 	setJoined(false);

		// }
		setCurrentRoom(null);
	};
	//init & connect to socket
	// useEffect(() => {
	// 	const getTokenAndSelf = async () => {
	// 		const storedToken = await auth.getToken();
	// 		console.log("token:", token);
	// 		token.current = storedToken;
	// 		console.log("Stored token:", token.current);
	// 		try {
	// 			const response = await axios.get(`${utils.API_BASE_URL}/users`, {
	// 				headers: {
	// 					Authorization: `Bearer ${storedToken}`,
	// 				},
	// 			});
	// 			userRef.current = response.data as UserDto;
	// 		} catch (error) {
	// 			console.error("Error fetching user's own info:", error);
	// 		}

	// 		try {
	// 			const roomDto = await axios.get(
	// 				`${utils.API_BASE_URL}/rooms/${roomID}`,
	// 				{
	// 					headers: {
	// 						Authorization: `Bearer ${storedToken}`,
	// 					},
	// 				},
	// 			);
	// 			roomObjRef.current = roomDto.data;
	// 		} catch (error) {
	// 			console.error("Error fetching room:", error);
	// 		}
	// 	};

	// 	const setupSocketEventHandlers = () => {
	// 		console.log("Setting up socket event handlers...");
	// 		if (socket.current) {
	// 			socket.current.on("userJoinedRoom", (response: ChatEventDto) => {
	// 				const u = userRef.current;
	// 				if (u) {
	// 					console.log("User joined room:", response);
	// 					const input: ChatEventDto = {
	// 						userID: u.userID,
	// 						body: {
	// 							messageBody: "",
	// 							sender: u,
	// 							roomID: roomID,
	// 							dateCreated: new Date(),
	// 						},
	// 					};

	// 					console.log("Socket emit: getChatHistory", input);
	// 					if (socket.current)
	// 						socket.current.emit("getChatHistory", JSON.stringify(input));
	// 				}
	// 			});

	// 			socket.current.on("chatHistory", (history: LiveChatMessageDto[]) => {
	// 				const u = userRef.current;
	// 				if (u) {
	// 					const chatHistory = history.map((msg) => ({
	// 						message: msg,
	// 						me: msg.sender.userID === u.userID,
	// 					}));
	// 					setMessages(chatHistory);
	// 				}
	// 			});

	// 			socket.current.on("liveMessage", (newMessage: ChatEventDto) => {
	// 				console.log("Received live message:", newMessage);
	// 				const message = newMessage.body;
	// 				const u = userRef.current;
	// 				if (message && u) {
	// 					const me: boolean = message.sender.userID === u.userID;
	// 					if (me) {
	// 						setMessage("");
	// 					}
	// 					setMessages((prevMessages) => [
	// 						...prevMessages,
	// 						{ message, me: message.sender.userID === u.userID },
	// 					]);
	// 				}
	// 			});

	// 			socket.current.on("userLeftRoom", (response: ChatEventDto) => {
	// 				console.log("User left room:", response);
	// 			});

	// 			socket.current.on("error", (response: ChatEventDto) => {
	// 				console.error("Error:", response.errorMessage);
	// 			});
	// 		}

	// 		if (socket.current) {
	// 			socket.current.on("connect", () => {
	// 				if (userRef.current) {
	// 					const input: ChatEventDto = {
	// 						userID: userRef.current.userID,
	// 					};
	// 					if (socket.current)
	// 						socket.current.emit("connectUser", JSON.stringify(input));
	// 				}
	// 			});

	// 			socket.current.on("connected", (response: ChatEventDto) => {
	// 				if (!joined && readyToJoinRoom) {
	// 					// joinRoom();
	// 				}
	// 			});
	// 		}
	// 	};

	// 	getTokenAndSelf();
	// 	checkBookmark();

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
		if (isPlaying) {
			trackPositionIntervalRef.current = window.setInterval(() => {
				setSecondsPlayed((prevSeconds) => prevSeconds + 1);
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
	}, [isPlaying]);

	// const handleJoinLeave = async () => {
	// 	console.log("Joining/Leaving room...", joined);
	// 	setJoined((prevJoined) => !prevJoined);
	// 	if (!joined) {
	// 		// joinRoom();
	// 		const token = await auth.getToken();
	// 		currentRoom.leaveJoinRoom(token as string, roomID, false);
	// 		setJoined(true);
	// 		live.joinRoom(roomID, setJoined, setMessages, setMessage);
	// 		//setJoined(true);
	// 		setJoinedSongIndex(currentTrackIndex);
	// 		setJoinedSecondsPlayed(secondsPlayed);
	// 		console.log(
	// 			`Joined: Song Index - ${currentTrackIndex}, Seconds Played - ${secondsPlayed}`,
	// 		);
	// 	} else {
	// 		const token = await auth.getToken();
	// 		currentRoom.leaveJoinRoom(token as string, roomID, true);
	// 		// leaveRoom();
	// 		setJoined(false);
	// 		playbackManager.pause();
	// 		//leaveRoom();
	// 		live.leaveRoom();
	// 		//setJoined(false);
	// 		setJoinedSongIndex(null);
	// 		setJoinedSecondsPlayed(null);
	// 		//playbackManager.pause();
	// 		const deviceID = await playback.getFirstDevice();
	// 		if (deviceID && deviceID !== null) {
	// 			playback.handlePlayback(deviceID, "pause");
	// 		}
	// 		setIsPlaying(false);
	// 	}
	// };

	const playPauseTrack = useCallback(
		async (index: number, offset: number) => {
			/*
			playbackManager.playPauseTrack(queue[index], index, offset);
			setCurrentTrackIndex(index);
			setIsPlaying(playbackManager.getIsPlaying());
			setSecondsPlayed(playbackManager.getSecondsPlayed());
			*/
			if (live.canControlRoom()) {
				if (playback.isPlaying()) {
					live.startPlayback(roomID);
				} else {
					live.stopPlayback(roomID);
				}
				setCurrentTrackIndex(index);
				setIsPlaying(playback.isPlaying());
				//setSecondsPlayed(playbackManager.getSecondsPlayed());
			}
		},
		//[queue, playbackManager],
		[playback, roomID],
	);

	const playNextTrack = () => {
		/*
		playbackManager.playPreviousTrack();
		setCurrentTrackIndex(playbackManager.getCurrentTrackIndex());
		*/
		if (live.canControlRoom()) {
		}
	};

	const playPreviousTrack = () => {
		/*
		playbackManager.playPreviousTrack();
		setCurrentTrackIndex(playbackManager.getCurrentTrackIndex());
		*/
		if (live.canControlRoom()) {
		}
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
			pathname: "/screens/rooms/Playlist",
			params: {
				queue: JSON.stringify(queue),
				currentTrackIndex,
				Room_id: roomID,
				mine: roomData.mine,
			},
		});
	};

	const handleViewParticipants = () => {
		router.navigate("screens/rooms/ParticipantsPage"); // Change this to the correct page for participants
	};

	// const handleJoinLeave = async () => {
	// 	console.log("joined", joined);
	// 	setJoined(!joined);
	// 	const token = await auth.getToken();
	// 	console.log("Token fr fr:", token);
	// 	if (!joined) {
	// 		if (!token) {
	// 			throw new Error("No token found");
	// 		}
	// 		console.log("Joining room........", roomID, token);
	// 		roomCurrent.leaveJoinRoom(token, roomID, false);
	// 		joinRoom();
	// 		live.joinRoom(roomID, setJoined, setMessages);
	// 		setJoined(true);
	// 		setJoinedSongIndex(currentTrackIndex);
	// 		setJoinedSecondsPlayed(secondsPlayed);
	// 		console.log(
	// 			`Joined: Song Index - ${currentTrackIndex}, Seconds Played - ${secondsPlayed}`,
	// 		);
	// 	} else {
	// 		leaveRoom();
	// 		setJoined(false);
	// 		roomCurrent.leaveJoinRoom(token as string, roomID, true);
	// 		live.leaveRoom();
	// 		setJoinedSongIndex(null);
	// 		setJoinedSecondsPlayed(null);
	// 		//playbackManager.pause();
	// 		const deviceID = await playback.getFirstDevice();
	// 		if (deviceID && deviceID !== null) {
	// 			playback.handlePlayback("pause", deviceID);
	// 		}
	// 		setIsPlaying(false);
	// 	}
	// };

	if (!readyToJoinRoom) {
		setReadyToJoinRoom(true);
		console.log("Ready to join room...");
	}

	useEffect(() => {
		if (readyToJoinRoom && !joined) {
			console.log("Joining room...");
			console.log(readyToJoinRoom, joined);
			//live.joinRoom(roomID, setJoined, setMessages, setMessage);
		}
	}, [readyToJoinRoom, joined, roomID]);

	const sendMessage = () => {
		if (isSending) return;
		setIsSending(true);
		live.sendLiveChatMessage(message, setIsSending);
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
			{/* <Image
				source={{ uri: roomData.backgroundImage }}
				style={styles.backgroundImage}
			/> */}
			{/* <LinearGradient
				colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.5)", "rgba(255,255,255,1)"]}
				style={styles.gradientOverlay}
			/> */}

			<View style={styles.contentContainer}>
				{/* <View style={styles.roomDetails}>
					<Text style={styles.roomName}>{roomData.name}</Text>
					<Text style={styles.description}>{roomData.description}</Text>
					<View style={styles.tagsContainer}>
						{roomData.tags.map((tag: string, index: number) => (
							<Text key={index} style={styles.tag}>
								{tag}
							</Text>
						))}
					</View>
				</View> */}
				<View style={styles.sideBySide}>
					{/* Left side */}
					<View style={styles.userInfoContainer}>
						{/* <Ionicons name="people" size={30} color="black" />
						<Text>134 Particpants</Text> */}
						<TouchableOpacity
							style={styles.userInfoContainer}
							onPress={handleViewParticipants}
						>
							<Ionicons name="people" size={30} color="black" />
							<Text>134 Participants</Text>
						</TouchableOpacity>
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
				<View style={styles.trackDetails}>
					<Image
						source={{ uri: queue[currentTrackIndex]?.albumArtUrl }}
						style={styles.nowPlayingAlbumArt}
					/>
				</View>
				<View style={styles.songRoomWidget}>
					<SongRoomWidget track={exampleTrack} />
				</View>
				<View style={styles.trackInfo}>
					<Text style={styles.nowPlayingTrackName}>
						{queue[currentTrackIndex]?.name}
					</Text>
					<Text>
						{queue[currentTrackIndex]?.artists.map((artist, index) => (
							<Text key={index}>
								{artist.name}
								{index < queue[currentTrackIndex].artists.length - 1 && ", "}
							</Text>
						))}
					</Text>
				</View>
				{/* <SongRoomWidget
					songName="Eternal Sunshine"
					artist="Ariana Grande"
					albumCoverUrl="https://t2.genius.com/unsafe/300x300/https%3A%2F%2Fimages.genius.com%2F08e2633706582e13bc20f44637441996.1000x1000x1.png"
					progress={0.5}
					time1="1:30"
					time2="3:00"
				/> */}

				{roomData.mine ? (
					<View style={styles.controls}>
						<TouchableOpacity
							style={styles.controlButton}
							onPress={playPreviousTrack}
						>
							<FontAwesome5 name="step-backward" size={30} color="black" />
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.controlButton}
							onPress={() => playPreviousTrack}
						>
							<FontAwesome5
								name={isPlaying ? "pause" : "play"}
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

				{/* <TouchableOpacity
					style={styles.queueButton}
					onPress={navigateToPlaylist}
				>
					<MaterialIcons name="queue-music" size={55} color="Black" />
					<Text style={styles.queueButtonText}> Queue</Text>
				</TouchableOpacity> */}
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
							<Text style={styles.queueTrackArtist}>
								{queue[currentTrackIndex]?.artists.map((artist, index) => (
									<Text key={index}>
										{artist.name}
										{index < queue[currentTrackIndex].artists.length - 1 &&
											", "}
									</Text>
								))}
							</Text>
						</View>
					</TouchableOpacity>
				))}
			</Animated.ScrollView>

			<View style={styles.sideBySideTwo}>
				{/* Left side */}
				<View style={styles.userInfoContainer}>
					<Image
						source={{ uri: roomData.userProfile }}
						style={styles.userImage}
					/>
					<Text style={styles.username}>
						{truncateUsername(roomData.username)}
					</Text>
				</View>
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
								{messages.map((msg, index) => (
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
								object={object}
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
	songRoomWidget: {
		marginTop: -50,
	},
});

export default RoomPage;
