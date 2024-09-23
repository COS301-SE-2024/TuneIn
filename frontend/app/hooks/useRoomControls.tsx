import React, { useCallback, useEffect, useMemo } from "react";
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
	enqueueSong: (song: RoomSongDto) => void;
	dequeueSong: (song: RoomSongDto) => void;
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
	getFirstDevice: () => Promise<string | null>;
	getDevices: () => Promise<Device[]>;
	getDeviceIDs: () => Promise<string[]>;
	setActiveDevice: (deviceID: string | null) => void;
	userListeningToRoom: (currentTrackUri: string) => Promise<boolean>;
	startPlayback: () => void;
	pausePlayback: () => void;
	stopPlayback: () => void;
	nextTrack: () => void;
}

interface RoomControlProps {
	currentUser: UserDto | undefined;
	currentRoom: RoomDto | undefined;
	socket: Socket | null;
	currentSong: RoomSongDto | undefined;
	spotifyTokens: SpotifyTokenPair | undefined;
	roomPlaying: boolean;
	pollLatency: () => void;
}

export function useRoomControls({
	currentUser,
	currentRoom,
	socket,
	currentSong,
	spotifyTokens,
	roomPlaying,
	setRoomPlaying,
	pollLatency,
}: RoomControlProps): RoomControls {
	console.log("useRoomControls()");
	console.log("currentUser:", currentUser);
	console.log("currentRoom:", currentRoom);
	const { socketState, updateState } = useLiveState();
	const [spotifyDevices, setSpotifyDevices] = useState<Devices>({
		devices: [],
	});

	const getDevices = useCallback(
		async function (): Promise<Device[]> {
			if (!spotifyTokens) {
				throw new Error("Spotify tokens not found");
			}
			try {
				const api = SpotifyApi.withAccessToken(clientId, spotifyTokens.tokens);
				const devices: Devices = await api.player.getAvailableDevices();
				setSpotifyDevices(devices);
				setDeviceError(null);
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
		},
		[spotifyTokens, setSpotifyDevices],
	);

	useEffect(() => {
		console.log("getDevices function has been recreated");
	}, [getDevices]);

	const handlePlayback = useCallback(
		async function (action: string): Promise<void> {
			try {
				if (!spotifyTokens) {
					throw new Error("Spotify tokens not found");
				}

				if (!spotify) {
					throw new Error(
						"User either does not have a Spotify account or is not logged in",
					);
				}

				if (!currentSong) {
					throw new Error("No song is currently playing");
				}

				const uri: string = `spotify:track:${currentSong.spotifyID}`;
				if (!validTrackUri(uri)) {
					throw new Error("Invalid track URI");
				}

				const activeDevice = await getFirstDevice();
				if (!activeDevice) {
					Alert.alert("Please connect a device to Spotify");
					return;
				}

				if (activeDevice.id === null) {
					console.error("Active Device ID is null for an unknown reason.");
					setDeviceError("Active Device ID is null for an unknown reason.");
					return;
				}
				console.log("active device:", activeDevice);
				let offsetMs = 0;
				if (currentSong.startTime) {
					const startTime = currentSong.startTime;
					const currentTime = new Date();
					offsetMs = currentTime.getTime() - startTime.getTime();
				}

				try {
					switch (action) {
						case "play":
							await spotify.player.startResumePlayback(
								activeDevice.id,
								uri,
								[uri],
								undefined,
								offsetMs,
							);
							break;
						case "pause":
							await spotify.player.pausePlayback(activeDevice.id);
							break;
						case "next":
							await spotify.player.skipToNext(activeDevice.id);
							break;
						case "previous":
							await spotify.player.skipToPrevious(activeDevice.id);
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
		[spotifyTokens, spotify, currentSong, activeDevice],
	);

	useEffect(() => {
		console.log("handlePlayback function has been recreated");
	}, [handlePlayback]);

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

	useEffect(() => {
		console.log("getDeviceIDs function has been recreated");
	}, [getDeviceIDs]);

	const setActiveDevice = useCallback(
		async function (deviceID: string | null): Promise<void> {
			if (!spotifyTokens) {
				throw new Error("Spotify tokens not found");
			}
			if (!deviceID) {
				throw new Error("Cannot set active device to null");
			}
			try {
				const api = SpotifyApi.withAccessToken(clientId, spotifyTokens.tokens);

				//fetch devices again to get the latest list
				const devices = await api.player.getAvailableDevices();
				for (const device of devices.devices) {
					if (device.id === deviceID) {
						await api.player.transferPlayback([deviceID]);
						console.log("Playback transferred to device:", deviceID);
						return;
					}
				}
				throw new Error("Device not found");
			} catch (err) {
				console.error("An error occurred while transferring playback", err);
				throw err;
			}
		},
		[spotifyTokens],
	);

	useEffect(() => {
		console.log("setActiveDevice function has been recreated");
	}, [setActiveDevice]);

	const userListeningToRoom = useCallback(
		async function (currentTrackUri: string): Promise<boolean> {
			if (!spotifyTokens) {
				throw new Error("Spotify tokens not found");
			}
			if (!validTrackUri(currentTrackUri)) {
				throw new Error("Invalid track URI");
			}
			if (roomPlaying) {
				const api = SpotifyApi.withAccessToken(clientId, spotifyTokens.tokens);
				const playbackState: PlaybackState =
					await api.player.getPlaybackState();
				if (!playbackState) {
					return false;
				}
				if (playbackState.item.uri === currentTrackUri) {
					return true;
				}
			}
			return false;
		},
		[spotifyTokens, roomPlaying],
	);

	useEffect(() => {
		console.log("userListeningToRoom function has been recreated");
	}, [userListeningToRoom]);

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

	useEffect(() => {
		console.log("startPlayback function has been recreated");
	}, [startPlayback]);

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

	useEffect(() => {
		console.log("pausePlayback function has been recreated");
	}, [pausePlayback]);

	const stopPlayback = useCallback(
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
			socket.emit(SOCKET_EVENTS.INIT_STOP, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket, pollLatency],
	);

	useEffect(() => {
		console.log("stopPlayback function has been recreated");
	}, [stopPlayback]);

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

	useEffect(() => {
		console.log("nextTrack function has been recreated");
	}, [nextTrack]);

	const playbackHandler: Playback = useMemo(() => {
		return {
			spotifyDevices: spotifyDevices,
			handlePlayback: handlePlayback,
			getDevices: getDevices,
			getDeviceIDs: getDeviceIDs,
			setActiveDevice: setActiveDevice,
			userListeningToRoom: userListeningToRoom,
			startPlayback: startPlayback,
			pausePlayback: pausePlayback,
			stopPlayback: stopPlayback,
			nextTrack: nextTrack,
		};
	}, [
		getDeviceIDs,
		getDevices,
		handlePlayback,
		nextTrack,
		pausePlayback,
		setActiveDevice,
		spotifyDevices,
		startPlayback,
		stopPlayback,
		userListeningToRoom,
	]);

	useEffect(() => {
		console.log("playbackHandler object has been recreated");
	}, [playbackHandler]);

	const enqueueSong = useCallback(
		function (song: RoomSongDto): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			console.log("Enqueueing song", song);
			if (!currentRoom) {
				return;
			}
			if (!currentUser) {
				return;
			}
			const input: QueueEventDto = {
				song: song,
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.ENQUEUE_SONG, JSON.stringify(input));
			console.log("emitted: enqueueSong");
			socket.emit(SOCKET_EVENTS.REQUEST_QUEUE, JSON.stringify(input));
			console.log("emitted: requestQueue");
		},
		[currentRoom, currentUser, socket],
	);

	useEffect(() => {
		console.log("enqueueSong function has been recreated");
	}, [enqueueSong]);

	const dequeueSong = useCallback(
		function (song: RoomSongDto): void {
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			console.log("Dequeueing song", song);
			if (!currentRoom) {
				return;
			}
			if (!currentUser) {
				return;
			}
			const input: QueueEventDto = {
				song: song,
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.DEQUEUE_SONG, JSON.stringify(input));
			console.log("emitted: dequeueSong");
			socket.emit(SOCKET_EVENTS.REQUEST_QUEUE, JSON.stringify(input));
			console.log("emitted: requestQueue");
		},
		[currentRoom, currentUser, socket],
	);

	useEffect(() => {
		console.log("dequeueSong function has been recreated");
	}, [dequeueSong]);

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
				song: song,
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.UPVOTE_SONG, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket],
	);

	useEffect(() => {
		console.log("upvoteSong function has been recreated");
	}, [upvoteSong]);

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
				song: song,
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.DOWNVOTE_SONG, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket],
	);

	useEffect(() => {
		console.log("downvoteSong function has been recreated");
	}, [downvoteSong]);

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
				song: song,
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.SWAP_SONG_VOTE, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket],
	);

	useEffect(() => {
		console.log("swapSongVote function has been recreated");
	}, [swapSongVote]);

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
				song: song,
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.UNDO_SONG_VOTE, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket],
	);

	useEffect(() => {
		console.log("undoSongVote function has been recreated");
	}, [undoSongVote]);

	const queueControls: QueueControls = useMemo(() => {
		return {
			enqueueSong: enqueueSong,
			dequeueSong: dequeueSong,
			upvoteSong: upvoteSong,
			downvoteSong: downvoteSong,
			swapSongVote: swapSongVote,
			undoSongVote: undoSongVote,
		};
	}, [
		enqueueSong,
		dequeueSong,
		upvoteSong,
		downvoteSong,
		swapSongVote,
		undoSongVote,
	]);

	useEffect(() => {
		console.log("queueControls object has been recreated");
	}, [queueControls]);

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

	useEffect(() => {
		console.log("sendLiveChatMessage function has been recreated");
	}, [sendLiveChatMessage]);

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

	useEffect(() => {
		console.log("sendReaction function has been recreated");
	}, [sendReaction]);

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

	useEffect(() => {
		console.log("requestLiveChatHistory function has been recreated");
	}, [requestLiveChatHistory]);

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

	useEffect(() => {
		console.log("canControlRoom function has been recreated");
		console.log("currentRoom here:", currentRoom);
	}, [canControlRoom, currentRoom]);

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
			const input: QueueEventDto = {
				song: {
					spotifyID: "123",
					userID: currentUser.userID,
					index: -1,
				},
				roomID: currentRoom.roomID,
				createdAt: new Date(),
			};
			socket.emit(SOCKET_EVENTS.REQUEST_QUEUE, JSON.stringify(input));
		},
		[currentRoom, currentUser, socket],
	);

	useEffect(() => {
		console.log("requestRoomQueue function has been recreated");
	}, [requestRoomQueue]);

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
