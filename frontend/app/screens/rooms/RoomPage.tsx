import React, {
	useEffect,
	useState,
	useRef,
	useCallback,
	useContext,
	useReducer,
} from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	Animated,
	Dimensions,
	Alert,
	ToastAndroid,
	Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import auth from "../../services/AuthManagement";
import Icon from "react-native-vector-icons/MaterialIcons";
import DevicePicker from "../../components/DevicePicker";
import { useLive } from "../../LiveContext";
import * as rs from "../../models/SongPair";
import { colors } from "../../styles/colors";
import bookmarks from "../../services/BookmarkService";
import { useAPI } from "../../APIContext";
import SongRoomWidget from "../../components/SongRoomWidget";
import { RoomDto } from "../../../api";
import * as utils from "../../services/Utils";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { useSpotifyTracks } from "../../hooks/useSpotifyTracks";

// const MemoizedCommentWidget = memo(CommentWidget);
const { width, height } = Dimensions.get("window");
const isSmallScreen = height < 800;
const OPTIMISTIC_PLAYBACK_STATE_TIMEOUT = 5000;

const RoomPage: React.FC = () => {
	const { rooms } = useAPI();
	const {
		roomControls,
		roomPlaying,
		joinRoom,
		leaveRoom,
		currentSong,
		currentRoom,
		roomQueue,
		userBookmarks,
		spotifyAuth,
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
	const [secondsPlayed, setSecondsPlayed] = useState(0); // Track the number of seconds played
	const truncateUsername = (username: string) => {
		if (username) {
			return username.length > 10 ? username.slice(0, 8) + "..." : username;
		}
	};
	const [thisRoom, setThisRoom] = useState<RoomDto>();
	const [userInRoom, setUserInRoom] = useState(false);
	const trackPositionIntervalRef = useRef<number | null>(null);
	const queueHeight = useRef(new Animated.Value(0)).current;
	const [participantCount, setParticipantCount] = useState(0);
	const [participants, setParticipants] = useState<any[]>([]);
	const { fetchSongInfo, addSongsToCache } = useSpotifyTracks(spotifyAuth);
	const [localCurrentSong, setLocalCurrentSong] = useState<rs.SongPair>();
	const [localQueue, setLocalQueue] = useState<rs.SongPair[]>([]);
	const [localRoomPlaying, setLocalRoomPlaying] = useState(roomPlaying);
	const [devicePickerVisible, setDevicePickerVisible] = useState(false);
	const [optimisticPlaybackState, setOptimisticPlaybackState] = useState(false);
	const optimisticPlaybackStatIntervaleRef = useRef<NodeJS.Timeout>();
	const [ownerPlaying, setOwnerPlaying] = useState(roomPlaying);

	const getAndSetRoomInfo = useCallback(async () => {
		console.log(`!thisRoom: ${!thisRoom}`);
		console.log(`thisRoom.roomID !== roomID: ${thisRoom?.roomID !== roomID}`);
		if (!thisRoom || thisRoom.roomID !== roomID) {
			await rooms.getRoomInfo(roomID).then(async (roomResponse) => {
				const r = roomResponse.data;
				console.log(`1: Setting thisRoom to: ${r}`);
				setThisRoom(r);
				if (currentRoom) {
					setUserInRoom(currentRoom.roomID === roomID);
					if (
						(!localRoomPlaying || !ownerPlaying) &&
						!optimisticPlaybackState &&
						(ownerPlaying || localRoomPlaying)
					) {
						setOwnerPlaying(roomPlaying); // Set ownerPlaying to the socket state
					}
				} else {
					if (!userInRoom) {
						setUserInRoom(false);
					}
					if (!optimisticPlaybackState) {
						if (!ownerPlaying) {
							setLocalRoomPlaying(false);
						}
					}
				}
				if (r.current_song) {
					const s = r.current_song;
					await fetchSongInfo([s.spotifyID]).then(
						([track]: Spotify.Track[]) => {
							const result: rs.SongPair = {
								song: s,
								track: track,
							};
							setLocalCurrentSong(result);
						},
					);
				}
			});
		}
	}, [
		thisRoom,
		roomID,
		rooms,
		currentRoom,
		localRoomPlaying,
		optimisticPlaybackState,
		ownerPlaying,
		roomPlaying,
		fetchSongInfo,
	]);

	const checkBookmarked = useCallback(async () => {
		for (let i = 0; i < userBookmarks.length; i++) {
			if (userBookmarks[i].roomID === roomID) {
				setIsBookmarked(true);
				break;
			}
		}
	}, [roomID, userBookmarks]);

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

	const playPauseTrack = useCallback(
		async (offset: number = 0) => {
			if (userInRoom) {
				console.log("playPauseTrack playPauseTrack playPauseTrack");
				if (roomControls.canControlRoom()) {
					if (!ownerPlaying) {
						console.log("starting playback");
						setOwnerPlaying(true); //set owner's request to play
						setLocalRoomPlaying(true);
						roomControls.playbackHandler.startPlayback();
					} else {
						console.log("stopping playback");
						setOwnerPlaying(false); //set owner's request to pause
						setLocalRoomPlaying(false);
						roomControls.playbackHandler.pausePlayback();
					}
					setOptimisticPlaybackState(true);
					optimisticPlaybackStatIntervaleRef.current = setTimeout(() => {
						setOptimisticPlaybackState(false);
						setLocalRoomPlaying(ownerPlaying);
						optimisticPlaybackStatIntervaleRef.current = undefined;
					}, OPTIMISTIC_PLAYBACK_STATE_TIMEOUT);
				} else {
					alert(
						`You're not the owner of this room. Playback controls should not be visible for you`,
					);
				}
			} else {
				alert(
					`You're gonna have to join this room first before trying to play music`,
				);
			}
		},
		[ownerPlaying, roomControls, userInRoom],
	);

	const playNextTrack = useCallback(() => {
		if (userInRoom) {
			console.log("playNextTrack playNextTrack playNextTrack");
			if (roomControls.canControlRoom()) {
				roomControls.playbackHandler.nextTrack();
			}
		}
	}, [roomControls, userInRoom]);

	// const playPreviousTrack = () => {
	// 	if (userInRoom) {
	// 		if (roomControls.canControlRoom()) {
	// 			roomControls.playbackHandler.prevTrack();
	// 		}
	// 	}
	// };

	const handleViewParticipants = () => {
		router.navigate({
			pathname: "/screens/rooms/ParticipantsPage",
			params: { roomID: roomID },
		});
	};

	const handleJoinLeave = async () => {
		// only join if not in room or if in another room
		if (!currentRoom || !userInRoom) {
			await rooms.joinRoom(roomID);
			joinRoom(roomID);
			setUserInRoom(true);
			// only leave if you're in the room
		} else if (currentRoom && userInRoom) {
			await rooms.leaveRoom(roomID);
			leaveRoom();
			if (
				await roomControls.playbackHandler.userListeningToRoom(ownerPlaying)
			) {
				await roomControls.playbackHandler.handlePlayback("pause");
			}
			setUserInRoom(false);
		}
	};

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
					setParticipantCount(data.length);
				} else {
					console.error("Unexpected response data format:", data);
				}
			} catch (error) {
				console.error("Failed to fetch participants:", error);
			}
		};
		fetchParticipants();
	}, [userInRoom]);

	useEffect(() => {
		return () => {
			if (trackPositionIntervalRef.current) {
				clearInterval(trackPositionIntervalRef.current);
			}
		};
	}, [roomPlaying]);

	useEffect(() => {
		if (ownerPlaying) {
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
	}, [currentSong, ownerPlaying]);

	// update local state only if different from socket state
	useEffect(() => {
		console.log(`!!!`);
		console.log(`thisRoom: ${thisRoom}`);
		console.log(`currentRoom: ${currentRoom}`);
		console.log(`!!!`);
		if (thisRoom === undefined && currentRoom !== undefined) {
			if (currentRoom.roomID === roomID) {
				console.log(`2: Setting thisRoom to: ${currentRoom}`);
				setThisRoom(currentRoom);
			}
		} else if (thisRoom !== undefined && currentRoom === undefined) {
			// ignore, because room page can show information about a room that the user is not in
		} else if (thisRoom !== undefined && currentRoom !== undefined) {
			// only update local state if socket state is for this room
			if (roomID === currentRoom.roomID) {
				if (thisRoom.roomID !== currentRoom.roomID) {
					console.log(`3: Setting thisRoom to: ${currentRoom}`);
					setThisRoom(currentRoom);
				}
				// if (currentRoom.current_song) {
				// 	const s = currentRoom.current_song;
				// 	fetchSongInfo([s.spotifyID]).then(([track]: Spotify.Track[]) => {
				// 		const result: rs.SongPair = {
				// 			song: s,
				// 			track: track,
				// 		};
				// 		setLocalCurrentSong(result);
				// 	});
				// }
				if (currentSong) {
					fetchSongInfo([currentSong.spotifyID]).then(
						([track]: Spotify.Track[]) => {
							setLocalCurrentSong({
								song: currentSong,
								track: track,
							} as rs.SongPair);
						},
					);
				}
				if (ownerPlaying && !localRoomPlaying && !optimisticPlaybackState) {
					setLocalRoomPlaying(true);
				}
				let differenceFound = false;
				if (roomQueue.length !== localQueue.length) {
					differenceFound = true;
				}
				if (!differenceFound) {
					for (let i = 0, n = roomQueue.length; i < n; i++) {
						const s1 = roomQueue[i];
						const s2 = localQueue[i];
						if (s1.spotifyID !== s2.song.spotifyID) {
							differenceFound = true;
							break;
						}
					}
				}
				if (differenceFound) {
					fetchSongInfo(roomQueue.map((s) => s.spotifyID)).then((tracks) => {
						setLocalQueue(rs.convertQueue(roomQueue, tracks));
					});
				}
			}
		}
	}, [currentSong, roomQueue, currentRoom, roomPlaying]);

	// on component mount
	useEffect(() => {
		if (thisRoom === undefined) {
			getAndSetRoomInfo();
			checkBookmarked();
		}
	}, []);

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
							<Text>{participantCount + " Participants"}</Text>
						</TouchableOpacity>
					</View>
					{/* Right side */}
					<View style={styles.joinLeaveButtonContainer}>
						<TouchableOpacity
							style={styles.joinLeaveButton}
							onPress={handleJoinLeave}
						>
							<Text style={styles.joinLeaveButtonText}>
								{userInRoom ? "Leave" : "Join"}
							</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.joinLeaveButtonContainer}></View>
				</View>
				<View style={styles.trackDetails}>
					<Image
						source={{
							uri:
								userInRoom && localCurrentSong
									? rs.getAlbumArtUrl(localCurrentSong)
									: rs.getAlbumArtUrl(undefined),
						}}
						style={styles.nowPlayingAlbumArt}
					/>
				</View>
				<View style={styles.songRoomWidget}>
					<SongRoomWidget song={userInRoom ? localCurrentSong : undefined} />
				</View>
				{/* <View style={styles.trackInfo}>
					<Text style={styles.nowPlayingTrackName}>
						{rs.getTitle(currentSong)}
					</Text>
					<Text>{rs.constructArtistString(currentSong)}</Text>
				</View> */}

				{roomControls.canControlRoom() ? (
					<View style={isSmallScreen ? styles.smallControls : styles.controls}>
						{/* <TouchableOpacity
							style={styles.controlButton}
							onPress={playPreviousTrack}
						>
							<FontAwesome5 name="step-backward" size={30} color="black" />
						</TouchableOpacity> */}
						<TouchableOpacity
							style={styles.controlButton}
							onPress={() => playPauseTrack()}
						>
							<FontAwesome5
								name={userInRoom && ownerPlaying ? "pause" : "play"}
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
			{/* <Animated.ScrollView
				style={[styles.queueContainer, { maxHeight: queueHeight }]}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				{userInRoom &&
					localQueue.map((song, index) => (
						<TouchableOpacity
							key={rs.getID(song)}
							style={[
								styles.track,
								index === localCurrentSong?.song.index
									? styles.currentTrack
									: styles.queueTrack,
							]}
							onPress={() => playPauseTrack(0)}
						>
							<Image
								source={{ uri: rs.getAlbumArtUrl(song) }}
								style={styles.queueAlbumArt}
							/>
							<View style={styles.trackInfo}>
								<Text style={styles.queueTrackName}>{rs.getTitle(song)}</Text>
								<Text style={styles.queueTrackArtist}>
									{rs.constructArtistString(song)}
								</Text>
							</View>
						</TouchableOpacity>
					))}
			</Animated.ScrollView> */}

			<View style={styles.sideBySideTwo}>
				{/* Left side */}
				<TouchableOpacity
					onPress={handleUserPress}
					style={styles.userInfoContainer}
				>
					<Image
						source={
							roomData.userProfile
								? { uri: roomData.userProfile }
								: require("../../assets/profile-icon.png")
						}
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
						<DevicePicker
							isVisible={devicePickerVisible}
							setIsVisible={setDevicePickerVisible}
						/>
					</View>
				</View>
			</View>
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
		marginTop: -90,
	},
});

export default RoomPage;
