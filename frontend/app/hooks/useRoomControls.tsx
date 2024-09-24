import React, {
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useState,
} from "react";
import { Socket } from "socket.io-client";
import {
	LiveChatMessageDto,
	RoomDto,
	SpotifyTokenPair,
	UserDto,
} from "../../api";
import { EmojiReactionDto } from "../models/EmojiReactionDto";
import { RoomSongDto } from "../models/RoomSongDto";
import { QueueEventDto } from "../models/QueueEventDto";
import { Alert } from "react-native";
import { ChatEventDto } from "../models/ChatEventDto";
import { PlaybackEventDto } from "../models/PlaybackEventDto";
import {
	SpotifyApi,
	Devices,
	Device,
	PlaybackState,
} from "@spotify/web-api-ts-sdk";
import { SPOTIFY_CLIENT_ID } from "react-native-dotenv";
import { SOCKET_EVENTS } from "../../constants";
import { actionTypes, useLiveState } from "../hooks/useSocketState";
import { SpotifyAuth } from "../LiveContext";

const clientId = SPOTIFY_CLIENT_ID;
if (!clientId) {
	throw new Error(
		"No Spotify client ID (SPOTIFY_CLIENT_ID) provided in environment variables",
	);
}

export type LiveMessage = {
	message: LiveChatMessageDto;
	me: boolean;
};

const validTrackUri = (uri: string): boolean => {
	if (uri.startsWith("spotify:album:")) {
		throw new Error("Album URIs are not supported");
	}

	if (uri.startsWith("spotify:artist:")) {
		throw new Error("Artist URIs are not supported");
	}

	//validate with regex
	const uriRegex = /spotify:track:[a-zA-Z0-9]{22}/;
	if (!uriRegex.test(uri)) {
		throw new Error("Invalid URI");
	}
	return true;
};

export interface QueueControls {
	clearQueue: () => void;
	enqueueSongs: (songs: RoomSongDto[]) => void;
	dequeueSongs: (songs: RoomSongDto[]) => void;
	upvoteSong: (song: RoomSongDto) => void;
	downvoteSong: (song: RoomSongDto) => void;
	swapSongVote: (song: RoomSongDto) => void;
	undoSongVote: (song: RoomSongDto) => void;
}

export interface RoomControls {
	sendLiveChatMessage: (message: string) => void;
	sendReaction: (emoji: string) => void;
	requestLiveChatHistory: () => void;
	canControlRoom: () => boolean;
	requestRoomQueue: () => void;
	playbackHandler: Playback;
	queue: QueueControls;
}

export interface Playback {
	spotifyDevices: Devices;
	deviceError: string | null;
	handlePlayback: (action: string, song?: RoomSongDto) => Promise<void>;
	getDevices: () => Promise<Device[]>;
	getDeviceIDs: () => Promise<string[]>;
	activeDevice: Device | undefined;
	setActiveDevice: React.Dispatch<{
		deviceID: string | null;
		userSelected: boolean;
	}>;
	userListeningToRoom: () => Promise<boolean>;
	startPlayback: () => void;
	pausePlayback: () => void;
	// stopPlayback: () => void;
	nextTrack: () => void;
	prevTrack: () => void;
}

interface RoomControlProps {
	currentUser: UserDto | undefined;
	keepUserSynced: boolean;
	currentRoom: RoomDto | undefined;
	socket: Socket | null;
	currentSong: RoomSongDto | undefined;
	roomQueue: RoomSongDto[];
	setRoomQueue: React.Dispatch<React.SetStateAction<RoomSongDto[]>>;
	spotifyTokens: SpotifyTokenPair | undefined;
	spotifyAuth: SpotifyAuth;
	roomPlaying: boolean;
	pollLatency: () => void;
}

export function useRoomControls({
	currentUser,
	keepUserSynced,
	currentRoom,
	socket,
	currentSong,
	roomQueue,
	setRoomQueue,
	spotifyTokens,
	spotifyAuth,
	roomPlaying,
	pollLatency,
}: RoomControlProps): RoomControls {
	console.log("useRoomControls()");
	console.log("currentUser:", currentUser);
	console.log("currentRoom:", currentRoom);
	const { socketState, updateState } = useLiveState();
	const [lastSync, setLastSync] = useState<Date>(new Date(0));
	const spotify: SpotifyApi | undefined = useMemo(() => {
		if (currentUser && currentUser.hasSpotifyAccount && spotifyTokens) {
			return SpotifyApi.withAccessToken(clientId, spotifyTokens.tokens);
		}
		return undefined;
	}, [currentUser, spotifyTokens]);
	const [spotifyDevices, setSpotifyDevices] = useState<Devices>({
		devices: [],
	});
	const [playbackState, setPlaybackState] = useState<PlaybackState>();
	const [activeDevice, setActiveDevice] = useReducer(
		(
			state: Device | undefined,
			action: {
				deviceID: string | null;
				userSelected: boolean;
			},
		) => {
			let result: Device | undefined = state;
			if (action.deviceID !== null) {
				for (const device of spotifyDevices.devices) {
					if (device.id === action.deviceID) {
						result = device;
					}
				}
			}

			// if updating state to match Spotify API
			if (!action.userSelected) {
				return result;
			}

			//else update Spotify to match state
			if (!spotify) {
				throw new Error(
					"User either does not have a Spotify account or is not logged in",
				);
			}

			if (!result || result.is_active) {
				return result;
			}

			if (result.id === null) {
				console.error("Device ID is null for an unknown reason.");
				setDeviceError("Device ID is null for an unknown reason.");
				return result;
			}

			spotify.player
				.transferPlayback([result.id])
				.then(() => {
					console.log("Playback transferred to device:", action);
					setDeviceError(null);
				})
				.catch((err) => {
					console.error("An error occurred while transferring playback", err);
					setDeviceError(
						"An error occurred while transferring playback: " + err,
					);
				});
			return result;
		},
		undefined,
	);
	const [deviceError, setDeviceError] = React.useState<string | null>(null);

	const getDevices = useCallback(
		async function (): Promise<Device[]> {
			if (!spotify) {
				console.error(
					"User either does not have a Spotify account or is not logged in",
				);
				return [];
			} else {
				try {
					const devices: Devices = await spotify.player.getAvailableDevices();
					setSpotifyDevices(devices);
					setDeviceError(null);
					const state: PlaybackState = await spotify.player.getPlaybackState();
					console.log("Playback state:", state);
					if (state === null) {
						return [];
					}
					setPlaybackState(state);
					setActiveDevice({
						deviceID: state.device.id,
						userSelected: false,
					});
					return devices.devices;
				} catch (err) {
					console.error(
						"An error occurred while fetching devices. Spotify:",
						err,
					);
					setDeviceError(
						"An error occurred while fetching devices. Spotify: " + err,
					);
					throw err;
				}
			}
		},
		[spotify],
	);

	const handlePlayback = useCallback(
		async function (action: string, song?: RoomSongDto): Promise<void> {
			try {
				if (!spotifyTokens) {
					throw new Error("Spotify tokens not found");
				}

				if (!spotify) {
					throw new Error(
						"User either does not have a Spotify account or is not logged in",
					);
				}

				let uri: string;
				if (song) {
					uri = `spotify:track:${song.spotifyID}`;
				} else {
					if (!currentSong) {
						if (roomQueue.length === 0) {
							throw new Error("No song is currently playing");
						} else {
							const s = roomQueue[0];
							uri = `spotify:track:${s.spotifyID}`;
							song = s;
						}
					} else {
						uri = `spotify:track:${currentSong.spotifyID}`;
						song = currentSong;
					}
				}
				console.log(`Track URI: ${uri}`);
				if (!validTrackUri(uri)) {
					throw new Error("Invalid track URI");
				}

				let device: Device | undefined = activeDevice;
				if (!device) {
					if (spotifyDevices.devices.length === 0) {
						const devices = await getDevices();
						if (devices.length === 0) {
							Alert.alert("Please connect a device to Spotify");
							return;
						} else {
							for (const d of devices) {
								if (d.is_active) {
									setActiveDevice({
										deviceID: d.id,
										userSelected: false,
									});
									device = d;
								}
							}
						}
					}
				}
				if (!device) {
					Alert.alert("Please connect a device to Spotify");
					return;
				}

				if (device.id === null) {
					console.error("Active Device ID is null for an unknown reason.");
					setDeviceError("Active Device ID is null for an unknown reason.");
					return;
				}
				console.log("active device:", device);

				let st: Date | undefined;
				if (typeof song.startTime === "string") {
					st = new Date(song.startTime);
				} else {
					st = song.startTime;
				}
				let offsetMs = 0;
				if (st) {
					const currentTime = new Date();
					console.log(
						`Song start: ${st.getTime()}, Current time: ${currentTime.getTime()}`,
					);
					offsetMs = currentTime.getTime() - st.getTime();
					console.log(`Offset: ${offsetMs}`);
				}

				try {
					switch (action) {
						case "play":
							await spotify.player.startResumePlayback(
								device.id,
								undefined,
								[uri],
								undefined,
								offsetMs,
							);
							break;
						case "pause":
							await spotify.player.pausePlayback(device.id);
							break;
						case "next":
							await spotify.player.skipToNext(device.id);
							break;
						case "previous":
							await spotify.player.skipToPrevious(device.id);
							break;
						default:
							throw new Error("Unknown action");
					}
					console.log("Playback action successful");
				} catch (err) {
					console.error("An error occurred while controlling playback", err);
					throw err;
				}
			} catch (err) {
				console.error("An error occurred while controlling playback", err);
			}
		},
		[
			spotifyTokens,
			spotify,
			activeDevice,
			currentSong,
			roomQueue,
			spotifyDevices.devices.length,
			getDevices,
		],
	);

	const getDeviceIDs = useCallback(
		async function (): Promise<string[]> {
			let devices: Device[] = spotifyDevices.devices;
			const result: string[] = [];
			for (const device of devices) {
				if (device.id) {
					result.push(device.id);
				}
			}
			return result;
		},
		[spotifyDevices],
	);

	const userListeningToRoom = useCallback(
		async function (): Promise<boolean> {
			if (!currentSong) {
				// throw new Error("No song is currently playing");
				console.log(`userListeningToRoom false because !current`);
				return false;
			}
			if (!spotify) {
				// throw new Error(
				// 	"User either does not have a Spotify account or is not logged in",
				// );
				console.log(`userListeningToRoom false because !spotify`);
				return false;
			}
			if (roomPlaying) {
				const state: PlaybackState = await spotify.player.getPlaybackState();
				console.log("Playback state:", state);
				if (state === null) {
					console.log(`userListeningToRoom false because state is null`);
					return false;
				}
				setPlaybackState(state);
				setActiveDevice({
					deviceID: state.device.id,
					userSelected: false,
				});
				if (state.item.id === currentSong.spotifyID) {
					return true;
				}
			} else {
				console.log(`userListeningToRoom false because !roomPlaying`);
			}
			return false;
		},
		[currentSong, spotify, roomPlaying],
	);

	const startPlayback = useCallback(
		function (): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}
			if (!currentRoom) {
				console.error("User is not in a room");
				return;
			}
			const input: PlaybackEventDto = {
				userID: currentUser.userID,
				roomID: currentRoom.roomID,
				spotifyID: null,
				UTC_time: null,
			};
			socket.emit(SOCKET_EVENTS.INIT_PLAY, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket, pollLatency],
	);

	const pausePlayback = useCallback(
		function (): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}
			if (!currentRoom) {
				console.error("User is not in a room");
				return;
			}
			const input: PlaybackEventDto = {
				userID: currentUser.userID,
				roomID: currentRoom.roomID,
				spotifyID: null,
				UTC_time: null,
			};
			socket.emit(SOCKET_EVENTS.INIT_PAUSE, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket, pollLatency],
	);

	// const stopPlayback = useCallback(
	// 	function (): void {
	// 		if (!socket) {
	// 			console.error("Socket connection not initialized");
	// 			return;
	// 		}

	// 		pollLatency();
	// 		if (!currentUser) {
	// 			console.error("User is not logged in");
	// 			return;
	// 		}
	// 		if (!currentRoom) {
	// 			console.error("User is not in a room");
	// 			return;
	// 		}
	// 		const input: PlaybackEventDto = {
	// 			userID: currentUser.userID,
	// 			roomID: currentRoom.roomID,
	// 			spotifyID: null,
	// 			UTC_time: null,
	// 		};
	// 		socket.emit(SOCKET_EVENTS.INIT_STOP, JSON.stringify(input));
	// 	},
	// 	[currentRoom, currentUser, socket, pollLatency],
	// );

	// useEffect(() => {
	// 	console.log("stopPlayback function has been recreated");
	// }, [stopPlayback]);

	const nextTrack = useCallback(
		function (): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}
			if (!currentRoom) {
				console.error("User is not in a room");
				return;
			}
			const input: PlaybackEventDto = {
				userID: currentUser.userID,
				roomID: currentRoom.roomID,
				spotifyID: null,
				UTC_time: null,
			};
			socket.emit(SOCKET_EVENTS.INIT_SKIP, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket, pollLatency],
	);

	const prevTrack = useCallback(
		function (): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}
			if (!currentRoom) {
				console.error("User is not in a room");
				return;
			}
			const input: PlaybackEventDto = {
				userID: currentUser.userID,
				roomID: currentRoom.roomID,
				spotifyID: null,
				UTC_time: null,
			};
			socket.emit(SOCKET_EVENTS.INIT_PREV, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket, pollLatency],
	);

	useEffect(() => {
		console.log("useEffect for syncing user with room has been called");
		const now = Date.now();
		if (now.valueOf() - lastSync.valueOf() < 1000) return; // Step 2: Check if less than a second has passed

		spotifyAuth.getSpotifyTokens(); // will trigger a refresh (if the tokens are expired)
		if (keepUserSynced && currentRoom && currentSong && spotify) {
			const syncUserSpotify = async () => {
				try {
					let listening = await userListeningToRoom();
					let attempts = 0;
					while (!listening) {
						attempts++;
						if (attempts === 10) {
							throw new Error(
								"Attempts to sync user's spotify 10 times. User is not listening to room",
							);
						}
						console.log("User is not listening to room");
						await handlePlayback("play", currentSong);
						console.log("Playback should've started");
						const state = await spotify.player.getPlaybackState();
						listening = state.item.id === currentSong.spotifyID;
						if (!listening) {
							await new Promise((resolve) => setTimeout(resolve, 1000));
						}
					}
				} catch (err) {
					console.error(
						"An error occurred while checking if user is listening to room",
						err,
					);
				}
			};
			syncUserSpotify();
		}
		setLastSync(new Date());
	}, [
		lastSync,
		spotifyAuth,
		keepUserSynced,
		currentRoom,
		currentSong,
		spotify,
		userListeningToRoom,
		handlePlayback,
	]);

	const playbackHandler: Playback = useMemo(() => {
		return {
			spotifyDevices: spotifyDevices,
			handlePlayback: handlePlayback,
			getDevices: getDevices,
			getDeviceIDs: getDeviceIDs,
			activeDevice: activeDevice,
			setActiveDevice: setActiveDevice,
			userListeningToRoom: userListeningToRoom,
			startPlayback: startPlayback,
			pausePlayback: pausePlayback,
			// stopPlayback: stopPlayback,
			nextTrack: nextTrack,
			prevTrack: prevTrack,
			deviceError: deviceError,
		};
	}, [
		activeDevice,
		deviceError,
		getDeviceIDs,
		getDevices,
		handlePlayback,
		nextTrack,
		pausePlayback,
		prevTrack,
		spotifyDevices,
		startPlayback,
		// stopPlayback,
		userListeningToRoom,
	]);

	const clearQueue = useCallback(
		function (): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			if (!currentRoom) {
				return;
			}
			if (!currentUser) {
				return;
			}
			const input = {
				roomID: currentRoom.roomID,
			};
			socket.emit(SOCKET_EVENTS.CLEAR_QUEUE, JSON.stringify(input));
			console.log(`emitted: ${SOCKET_EVENTS.CLEAR_QUEUE}`);
			socket.emit(SOCKET_EVENTS.REQUEST_QUEUE, JSON.stringify(input));
			console.log(`emitted: ${SOCKET_EVENTS.REQUEST_QUEUE}`);
		},
		[currentRoom, currentUser, socket],
	);

	const enqueueSongs = useCallback(
		function (songs: RoomSongDto[]): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			console.log("Enqueueing songs");
			console.log(songs);
			if (!currentRoom) {
				return;
			}
			if (!currentUser) {
				return;
			}
			roomQueue.push(...songs);
			const input: QueueEventDto = {
				songs: songs,
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.ENQUEUE_SONG, JSON.stringify(input));
			console.log("emitted: enqueueSongs");
			socket.emit(SOCKET_EVENTS.REQUEST_QUEUE, JSON.stringify(input));
			console.log("emitted: requestQueue");
		},
		[currentRoom, currentUser, roomQueue, socket],
	);

	const dequeueSongs = useCallback(
		function (songs: RoomSongDto[]): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			console.log("Dequeueing song");
			console.log(songs);
			if (!currentRoom) {
				return;
			}
			if (!currentUser) {
				return;
			}
			setRoomQueue(roomQueue.filter((s) => !songs.includes(s)));
			const input: QueueEventDto = {
				songs: songs,
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.DEQUEUE_SONG, JSON.stringify(input));
			console.log("emitted: dequeueSongs");
			socket.emit(SOCKET_EVENTS.REQUEST_QUEUE, JSON.stringify(input));
			console.log("emitted: requestQueue");
		},
		[currentRoom, currentUser, roomQueue, setRoomQueue, socket],
	);

	const upvoteSong = useCallback(
		function (song: RoomSongDto): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			if (!currentRoom) {
				return;
			}
			if (!currentUser) {
				return;
			}
			const input: QueueEventDto = {
				songs: [song],
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.UPVOTE_SONG, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket],
	);

	const downvoteSong = useCallback(
		function (song: RoomSongDto): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			if (!currentRoom) {
				return;
			}
			if (!currentUser) {
				return;
			}
			const input: QueueEventDto = {
				songs: [song],
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.DOWNVOTE_SONG, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket],
	);

	const swapSongVote = useCallback(
		function (song: RoomSongDto): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			if (!currentRoom) {
				return;
			}
			if (!currentUser) {
				return;
			}
			const input: QueueEventDto = {
				songs: [song],
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.SWAP_SONG_VOTE, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket],
	);

	const undoSongVote = useCallback(
		function (song: RoomSongDto): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			if (!currentRoom) {
				return;
			}
			if (!currentUser) {
				return;
			}
			const input: QueueEventDto = {
				songs: [song],
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.UNDO_SONG_VOTE, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket],
	);

	const queueControls: QueueControls = useMemo(() => {
		return {
			clearQueue: clearQueue,
			enqueueSongs: enqueueSongs,
			dequeueSongs: dequeueSongs,
			upvoteSong: upvoteSong,
			downvoteSong: downvoteSong,
			swapSongVote: swapSongVote,
			undoSongVote: undoSongVote,
		};
	}, [
		clearQueue,
		enqueueSongs,
		dequeueSongs,
		upvoteSong,
		downvoteSong,
		swapSongVote,
		undoSongVote,
	]);

	const sendLiveChatMessage = useCallback(
		function (message: string): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}

			if (!currentRoom) {
				console.error("User is not in a room");
				return;
			}

			if (message.trim()) {
				const newMessage: LiveChatMessageDto = {
					messageID: "",
					messageBody: message,
					sender: currentUser,
					roomID: currentRoom.roomID,
					dateCreated: new Date().toISOString(),
				};
				const input: ChatEventDto = {
					userID: currentUser.userID,
					body: newMessage,
				};
				socket.emit(SOCKET_EVENTS.LIVE_MESSAGE, JSON.stringify(input));
			}
		},
		[currentRoom, currentUser, socket, pollLatency],
	);

	const sendReaction = useCallback(
		function (emoji: string): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			if (!currentUser) {
				return;
			}

			const newReaction: EmojiReactionDto = {
				date_created: new Date(),
				body: emoji,
				userID: currentUser.userID,
			};
			//make it volatile so that it doesn't get queued up
			//nothing will be lost if it doesn't get sent
			socket.volatile.emit(
				SOCKET_EVENTS.EMOJI_REACTION,
				JSON.stringify(newReaction),
			);
		},
		[currentUser, socket],
	);

	const requestLiveChatHistory = useCallback(
		function (): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			if (socketState.roomChatRequested) {
				console.log("Already requested live chat history");
				return;
			}
			if (!currentRoom) {
				console.error("User is not in a room");
				return;
			}

			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}
			const input: ChatEventDto = {
				userID: currentUser.userID,
				body: {
					messageID: "",
					messageBody: "",
					sender: currentUser,
					roomID: currentRoom.roomID,
					dateCreated: new Date().toISOString(),
				},
			};
			socket.emit(SOCKET_EVENTS.GET_LIVE_CHAT_HISTORY, JSON.stringify(input));
			updateState({ type: actionTypes.ROOM_CHAT_REQUESTED });
		},
		[
			currentRoom,
			currentUser,
			socket,
			socketState.roomChatRequested,
			updateState,
		],
	);

	const canControlRoom = useCallback(
		function (): boolean {
			console.log("canControlRoom currentUser:", currentUser);
			console.log("canControlRoom room:", currentRoom);
			console.log(
				`(!currentRoom): ${!currentRoom}, (!currentUser): ${!currentUser}, (!currentRoom.creator): ${!currentRoom?.creator}, (currentRoom.creator.userID === currentUser.userID): ${currentRoom?.creator?.userID === currentUser?.userID}`,
			);
			if (!currentRoom) {
				return false;
			}
			if (!currentUser) {
				return false;
			}
			if (!currentRoom.creator) {
				return false;
			}
			if (currentRoom.creator.userID === currentUser.userID) {
				return true;
			}
			return false;
		},
		[currentRoom, currentUser],
	);

	const requestRoomQueue = useCallback(
		function (): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			console.log("Requesting room queue");
			if (!currentRoom) {
				return;
			}
			if (!currentUser) {
				return;
			}
			const input = {
				roomID: currentRoom.roomID,
			};
			socket.emit(SOCKET_EVENTS.REQUEST_QUEUE, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket],
	);

	const roomControls: RoomControls = useMemo(() => {
		return {
			sendLiveChatMessage: sendLiveChatMessage,
			sendReaction: sendReaction,
			requestLiveChatHistory: requestLiveChatHistory,
			canControlRoom: canControlRoom,
			requestRoomQueue: requestRoomQueue,
			playbackHandler: playbackHandler,
			queue: queueControls,
		};
	}, [
		canControlRoom,
		playbackHandler,
		queueControls,
		requestLiveChatHistory,
		requestRoomQueue,
		sendLiveChatMessage,
		sendReaction,
	]);
	return roomControls;
}
