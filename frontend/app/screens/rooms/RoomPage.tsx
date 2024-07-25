import React, { useEffect, useState, useRef, useCallback, memo } from "react";
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
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import Icon from "react-native-vector-icons/MaterialIcons";
import PlaybackManager from "../PlaybackManager";
import Bookmarker from "./functions/Bookmarker";
import { Track } from "../../models/Track";
import DevicePicker from "../../components/DevicePicker";
import { live, Message } from "../../services/Live";
import { playback } from "../../services/SimpleSpotifyPlayback";

const MemoizedCommentWidget = memo(CommentWidget);

const RoomPage = () => {
	live.initialiseSocket();
	const { room } = useLocalSearchParams();
	console.log("here");
	let roomData: any;
	if (Array.isArray(room)) {
		roomData = JSON.parse(room[0]);
	} else if (room) {
		roomData = JSON.parse(room);
	}
	const roomID = roomData.id;
	console.log("Room ID:", roomID);

	const router = useRouter();
	const [readyToJoinRoom, setReadyToJoinRoom] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [joined, setJoined] = useState(false);
	const [queue, setQueue] = useState<Track[]>([]);
	const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [secondsPlayed, setSecondsPlayed] = useState(0); // Track the number of seconds played
	const [isChatExpanded, setChatExpanded] = useState(false);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [joinedsongIndex, setJoinedSongIndex] = useState<number | null>(null);
	const [ioinedSecondsPlayed, setJoinedSecondsPlayed] = useState<number | null>(
		null,
	);
	const [isSending, setIsSending] = useState(false);

	const playbackManager = useRef(new PlaybackManager()).current;
	const bookmarker = useRef(new Bookmarker()).current;

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
				console.error("Failed to fetch queue:", error);
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
		[],
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

	const handleJoinLeave = () => {
		console.log("joined", joined);
		setJoined((prevJoined) => !prevJoined);
		if (!joined) {
			// joinRoom();
			live.joinRoom(roomID, setJoined, setMessages, setMessage);
			//setJoined(true);
			setJoinedSongIndex(currentTrackIndex);
			setJoinedSecondsPlayed(secondsPlayed);
			console.log(
				`Joined: Song Index - ${currentTrackIndex}, Seconds Played - ${secondsPlayed}`,
			);
		} else {
			//leaveRoom();
			live.leaveRoom();
			//setJoined(false);
			setJoinedSongIndex(null);
			setJoinedSecondsPlayed(null);
			//playbackManager.pause();
			playback.handlePlayback("pause");
			setIsPlaying(false);
		}
	};

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
		live.sendMessage(message, setIsSending);
	};

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
						{roomData.tags.map((tag: string, index: number) => (
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
				<View style={styles.sideBySideClose}>
					<TouchableOpacity
						onPress={handleBookmark}
						style={styles.bookmarkButton}
					>
						<Icon
							name={isBookmarked ? "bookmark" : "bookmark-border"}
							size={34}
							color={isBookmarked ? "gold" : "black"}
						/>
					</TouchableOpacity>
					<DevicePicker />
				</View>
				<View style={styles.trackDetails}>
					<Image
						source={{ uri: queue[currentTrackIndex]?.albumArtUrl }}
						style={styles.nowPlayingAlbumArt}
					/>
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
								<MemoizedCommentWidget
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
		width: 30,
		height: 30,
		borderRadius: 25,
		marginRight: 10,
		borderWidth: 2,
		borderColor: "blue",
	},
	username: {
		fontSize: 18,
		color: "white",
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
