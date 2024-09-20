import React, { useCallback, useEffect, useMemo } from "react";
import { Socket } from "socket.io-client";
import {
	DirectMessageDto,
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

export type DirectMessage = {
	message: DirectMessageDto;
	me?: boolean;
	messageSent: boolean;
	isOptimistic: boolean;
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

interface QueueControls {
	enqueueSong: (song: RoomSongDto) => void;
	dequeueSong: (song: RoomSongDto) => void;
	upvoteSong: (song: RoomSongDto) => void;
	downvoteSong: (song: RoomSongDto) => void;
	swapSongVote: (song: RoomSongDto) => void;
	undoSongVote: (song: RoomSongDto) => void;
}

interface RoomControls {
	sendLiveChatMessage: (message: string) => void;
	sendReaction: (emoji: string) => void;
	requestLiveChatHistory: () => void;
	canControlRoom: () => boolean;
	requestRoomQueue: () => void;
	playbackHandler: Playback;
	queue: QueueControls;
}

interface Playback {
	spotifyDevices: Devices;
	handlePlayback: (
		action: string,
		deviceID: string,
		offset?: number,
	) => Promise<void>;
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
	spotifyDevices: Devices;
	setSpotifyDevices: React.Dispatch<React.SetStateAction<Devices>>;
	getSocket: () => Socket | null;
	currentSong: RoomSongDto | undefined;
	spotifyTokens: SpotifyTokenPair | undefined;
	roomPlaying: boolean;
	setRoomPlaying: React.Dispatch<React.SetStateAction<boolean>>;
	pollLatency: () => void;
}

export function useRoomControls({
	currentUser,
	currentRoom,
	spotifyDevices,
	setSpotifyDevices,
	getSocket,
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

	const getDevices = useCallback(
		async function (): Promise<Device[]> {
			if (!spotifyTokens) {
				throw new Error("Spotify tokens not found");
			}
			try {
				const api = SpotifyApi.withAccessToken(clientId, spotifyTokens.tokens);
				const data: Devices = await api.player.getAvailableDevices();
				setSpotifyDevices(data);
				return data.devices;
			} catch (err) {
				console.error("An error occurred while fetching devices", err);
				throw err;
			}
		},
		[spotifyTokens, setSpotifyDevices],
	);

	useEffect(() => {
		console.log("getDevices function has been recreated");
	}, [getDevices]);

	const getFirstDevice = useCallback(
		async function (): Promise<string | null> {
			if (!spotifyTokens) {
				throw new Error("Spotify tokens not found");
			}
			try {
				let d = spotifyDevices;
				if (!d.devices || d.devices.length === 0) {
					d = {
						devices: await getDevices(),
					};
				}

				if (d.devices.length > 0) {
					const first: Device = d.devices[0];
					if (!first.id) {
						throw new Error("Device ID not found");
					}
					return first.id;
				} else {
					Alert.alert("No Devices Found", "No devices are currently active.");
					throw new Error("No devices found");
				}
			} catch (err) {
				console.error("An error occurred while getting the device ID", err);
				throw err;
			}
		},
		[spotifyTokens, spotifyDevices, getDevices],
	);

	useEffect(() => {
		console.log("getFirstDevice function has been recreated");
	}, [getFirstDevice]);

	const handlePlayback = useCallback(
		async function (
			action: string,
			deviceID: string,
			offset?: number,
		): Promise<void> {
			try {
				if (!spotifyTokens) {
					throw new Error("Spotify tokens not found");
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
				console.log("active device:", activeDevice);
				console.log("(action, uri, offset):", action, uri, offset);

				let url = "";
				let method = "";
				let body: any = null;

				switch (action) {
					case "play":
						if (uri) {
							body = {
								uris: [uri],
								position_ms: offset || 0,
							};
						}
						url = `https://api.spotify.com/v1/me/player/play?device_id=${deviceID}`;
						method = "PUT";
						break;
					case "pause":
						url = `https://api.spotify.com/v1/me/player/pause?device_id=${deviceID}`;
						method = "PUT";
						break;
					case "next":
						url = `https://api.spotify.com/v1/me/player/next?device_id=${deviceID}`;
						method = "POST";
						break;
					case "previous":
						url = `https://api.spotify.com/v1/me/player/previous?device_id=${deviceID}`;
						method = "POST";
						break;
					default:
						throw new Error("Unknown action");
				}

				const response = await fetch(url, {
					method,
					headers: {
						Authorization: `Bearer ${spotifyTokens.tokens.access_token}`,
						"Content-Type": "application/json",
					},
					body: body ? JSON.stringify(body) : undefined,
				});

				console.log("Request URL:", url);
				console.log("Request Method:", method);
				if (body) {
					console.log("Request Body:", JSON.stringify(body, null, 2));
				}

				if (response.ok) {
					console.log("Playback action successful");
					// if (action === "play") {
					// 	this._isPlaying = true;
					// } else if (action === "pause") {
					// 	this._isPlaying = false;
					// }
				} else {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
			} catch (err) {
				console.error("An error occurred while controlling playback", err);
			}
		},
		[spotifyTokens, currentSong, getFirstDevice],
	);

	useEffect(() => {
		console.log("handlePlayback function has been recreated");
	}, [handlePlayback]);

	const getDeviceIDs = useCallback(
		async function (): Promise<string[]> {
			let devices: Device[];
			if (spotifyDevices.devices.length === 0) {
				devices = await getDevices();
			} else {
				devices = spotifyDevices.devices;
			}
			const result: string[] = [];
			for (const device of devices) {
				if (device.id) {
					result.push(device.id);
				}
			}
			return result;
		},
		[spotifyDevices, getDevices],
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
			const socket = getSocket();
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
		[currentRoom, currentUser, getSocket, pollLatency],
	);

	useEffect(() => {
		console.log("startPlayback function has been recreated");
	}, [startPlayback]);

	const pausePlayback = useCallback(
		function (): void {
			const socket = getSocket();
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
		[currentRoom, currentUser, getSocket, pollLatency],
	);

	useEffect(() => {
		console.log("pausePlayback function has been recreated");
	}, [pausePlayback]);

	const stopPlayback = useCallback(
		function (): void {
			const socket = getSocket();
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
		[currentRoom, currentUser, getSocket, pollLatency],
	);

	useEffect(() => {
		console.log("stopPlayback function has been recreated");
	}, [stopPlayback]);

	const nextTrack = useCallback(
		function (): void {
			const socket = getSocket();
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
		[currentRoom, currentUser, getSocket, pollLatency],
	);

	useEffect(() => {
		console.log("nextTrack function has been recreated");
	}, [nextTrack]);

	const playbackHandler: Playback = useMemo(() => {
		return {
			spotifyDevices: spotifyDevices,
			handlePlayback: handlePlayback,
			getFirstDevice: getFirstDevice,
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
		getFirstDevice,
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
			const socket = getSocket();
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
		[currentRoom, currentUser, getSocket],
	);

	useEffect(() => {
		console.log("enqueueSong function has been recreated");
	}, [enqueueSong]);

	const dequeueSong = useCallback(
		function (song: RoomSongDto): void {
			const socket = getSocket();
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
		[currentRoom, currentUser, getSocket],
	);

	useEffect(() => {
		console.log("dequeueSong function has been recreated");
	}, [dequeueSong]);

	const upvoteSong = useCallback(
		function (song: RoomSongDto): void {
			const socket = getSocket();
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
		[currentRoom, currentUser, getSocket],
	);

	useEffect(() => {
		console.log("upvoteSong function has been recreated");
	}, [upvoteSong]);

	const downvoteSong = useCallback(
		function (song: RoomSongDto): void {
			const socket = getSocket();
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
		[currentRoom, currentUser, getSocket],
	);

	useEffect(() => {
		console.log("downvoteSong function has been recreated");
	}, [downvoteSong]);

	const swapSongVote = useCallback(
		function (song: RoomSongDto): void {
			const socket = getSocket();
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
		[currentRoom, currentUser, getSocket],
	);

	useEffect(() => {
		console.log("swapSongVote function has been recreated");
	}, [swapSongVote]);

	const undoSongVote = useCallback(
		function (song: RoomSongDto): void {
			const socket = getSocket();
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
		[currentRoom, currentUser, getSocket],
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
			const socket = getSocket();
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
				const newMessage = {
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
		[currentRoom, currentUser, getSocket, pollLatency],
	);

	useEffect(() => {
		console.log("sendLiveChatMessage function has been recreated");
	}, [sendLiveChatMessage]);

	const sendReaction = useCallback(
		function (emoji: string): void {
			const socket = getSocket();
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
		[currentUser, getSocket],
	);

	useEffect(() => {
		console.log("sendReaction function has been recreated");
	}, [sendReaction]);

	const requestLiveChatHistory = useCallback(
		function (): void {
			const socket = getSocket();
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
			getSocket,
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
	}, [canControlRoom]);

	const requestRoomQueue = useCallback(
		function (): void {
			const socket = getSocket();
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
		[currentRoom, currentUser, getSocket],
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
