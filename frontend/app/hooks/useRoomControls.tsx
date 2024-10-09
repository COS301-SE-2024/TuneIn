import React, { useCallback, useMemo, useReducer, useState } from "react";
import { Socket } from "socket.io-client";
import {
	LiveChatMessageDto,
	RoomDto,
	SpotifyTokenPair,
	UserDto,
	RoomSongDto,
} from "../../api";
import { EmojiReactionDto } from "../models/EmojiReactionDto";
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

	if (uri.startsWith("spotify:playlist:")) {
		throw new Error("Playlist URIs are not supported");
	}

	//validate with regex
	const uriRegex = /spotify:track:[a-zA-Z0-9]{22}/;
	if (!uriRegex.test(uri)) {
		throw new Error("Invalid URI");
	}
	return true;
};

const validPlaylistUri = (uri: string): boolean => {
	if (uri.startsWith("spotify:album:")) {
		throw new Error("Album URIs are not supported");
	}

	if (uri.startsWith("spotify:artist:")) {
		throw new Error("Artist URIs are not supported");
	}

	if (uri.startsWith("spotify:track:")) {
		throw new Error("Playlist URIs are not supported");
	}

	//validate with regex
	const uriRegex = /spotify:playlist:[a-zA-Z0-9]{22}/;
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
	state: PlaybackState | undefined;
}
export interface Playback {
	spotifyDevices: Devices;
	deviceError: string | null;
	handlePlayback: (
		action: string,
		playlistID?: string,
		song?: RoomSongDto,
	) => Promise<void>;
	getDevices: () => Promise<Device[]>;
	getDeviceIDs: () => Promise<string[]>;
	activeDevice: Device | undefined;
	setActiveDevice: React.Dispatch<{
		deviceID: string | null;
		userSelected: boolean;
	}>;
	userListeningToRoom: (roomPlaying: boolean) => Promise<boolean>;
	startPlayback: () => Promise<void>;
	pausePlayback: () => Promise<void>;
	// stopPlayback: () => void;
	nextTrack: () => Promise<void>;
	prevTrack: () => Promise<void>;
	syncUserPlayback: () => Promise<void>;
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
	pollLatency,
}: RoomControlProps): RoomControls {
	console.log("useRoomControls()");
	const { socketState, updateState } = useLiveState();
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
			if (action.deviceID === null) {
				return state;
			}

			let result: Device | undefined = state;
			for (const device of spotifyDevices.devices) {
				if (device.id === action.deviceID) {
					result = device;
				}
			}

			// if updating state to match Spotify API
			if (!action.userSelected && result !== state) {
				return result;
			}

			//else update Spotify to match state
			if (!spotify) {
				throw new Error(
					"User either does not have a Spotify account or is not logged in",
				);
			}

			if (!result || result.is_active) {
				if (result !== state) {
					return result;
				}
				return state;
			}

			if (result.id === null) {
				console.error("Device ID is null for an unknown reason.");
				setDeviceError("Device ID is null for an unknown reason.");
				return result;
			}

			if (result !== state) {
				spotify.player
					.transferPlayback([result.id])
					.then(() => {
						console.log("Playback transferred to device:", action);
						setDeviceError(null);
					})
					.catch((err) => {
						console.error("An error occurred while transferring playback", err);
						Alert.alert(
							"An error occurred while transferring playback: " + err,
						);
						setDeviceError(
							"An error occurred while transferring playback: " + err,
						);
					});
				return result;
			}
			return state;
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
					const devices: Devices = await spotify.player
						.getAvailableDevices()
						.catch((err) => {
							console.error(
								"An error occurred while fetching devices. Spotify:",
								err,
							);
							setDeviceError(
								"An error occurred while fetching devices. Spotify: " + err,
							);
							Alert.alert("An error occurred while fetching devices: " + err);
							throw err;
						});
					setSpotifyDevices(devices);
					setDeviceError(null);
					for (const device of devices.devices) {
						if (device.is_active) {
							if (!activeDevice || activeDevice.id !== device.id) {
								setActiveDevice({
									deviceID: device.id,
									userSelected: false,
								});
								break;
							}
						}
					}
					const state: PlaybackState = await spotify.player
						.getPlaybackState()
						.catch((err) => {
							console.error(
								"An error occurred while fetching playback state. Spotify:",
								err,
							);
							Alert.alert(
								"An error occurred while fetching playback state: " + err,
							);
							setDeviceError(
								"An error occurred while fetching playback state. Spotify: " +
									err,
							);
							throw err;
						});
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
		[activeDevice, spotify],
	);

	const handlePlayback = useCallback(
		async function (
			action: string,
			playlistID?: string,
			song?: RoomSongDto,
		): Promise<void> {
			try {
				if (!spotifyTokens) {
					throw new Error("Spotify tokens not found");
				}

				if (!spotify) {
					throw new Error(
						"User either does not have a Spotify account or is not logged in",
					);
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
									if (!activeDevice || activeDevice.id !== d.id) {
										setActiveDevice({
											deviceID: d.id,
											userSelected: false,
										});
										device = d;
										break;
									}
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

				if (action === "play") {
					if (!playlistID || !song) {
						throw new Error("No playlist or song provided");
					}

					const trackURI: string = `spotify:track:${song.spotifyID}`;
					const position = song.playlistIndex;
					// if (song) {
					// 	trackURI
					// 	position = ;
					// } else {
					// 	if (!currentSong) {
					// 		if (roomQueue.length === 0) {
					// 			throw new Error("No song is currently playing");
					// 		} else {
					// 			const s: RoomSongDto = roomQueue[0];
					// 			trackURI = `spotify:track:${s.spotifyID}`;
					// 			song = s;
					// 			position = s.playlistIndex;
					// 		}
					// 	} else {
					// 		trackURI = `spotify:track:${currentSong.spotifyID}`;
					// 		song = currentSong;
					// 		position = currentSong.playlistIndex;
					// 	}
					// }
					console.log(`Track URI: ${trackURI}`);
					if (!validTrackUri(trackURI)) {
						throw new Error("Invalid track URI");
					}

					const playlistURI: string = `spotify:playlist:${playlistID}`;
					if (!validPlaylistUri(playlistURI)) {
						throw new Error("Invalid playlist URI");
					}
					// if (currentRoom) {
					// 	if (roomQueue.length === 0) {
					// 		Alert.alert("No songs in queue");
					// 		return;
					// 	}
					// 	playlistURI = ;
					// 	if (!validPlaylistUri(playlistURI)) {
					// 		throw new Error("Invalid playlist URI");
					// 	}
					// }

					const st = song.startTime;
					let offsetMs = 0;
					if (st) {
						const currentTime = new Date();
						console.log(
							`Song start: ${st}, Current time: ${currentTime.getTime()}`,
						);
						offsetMs = currentTime.getTime() - st;
						console.log(`Offset: ${offsetMs}`);
					}

					// await spotify.player.startResumePlayback(
					// 	device.id,
					// 	undefined,
					// 	[uri],
					// 	undefined,
					// 	offsetMs,
					// );
					console.table({
						deviceID: device.id,
						playlistURI: playlistURI,
						position: position,
						offsetMs: offsetMs,
					});
					await spotify.player
						.startResumePlayback(
							device.id,
							playlistURI,
							undefined,
							{ position: position },
							offsetMs,
						)
						.catch((err) => {
							console.error("An error occurred while starting playback", err);
							Alert.alert("An error occurred while starting playback: " + err);
							throw err;
						});
					console.log("Playback action (PLAY) successful");
					return;
				}

				try {
					switch (action) {
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
		async function (roomPlaying: boolean): Promise<boolean> {
			if (!currentRoom) {
				// throw new Error("User is not in a room");
				console.log(`userListeningToRoom false because !currentRoom`);
				return false;
			}
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
				const state: PlaybackState = await spotify.player
					.getPlaybackState()
					.catch((err) => {
						console.error(
							"An error occurred while checking if user is listening to room",
							err,
						);
						Alert.alert(
							"An error occurred while checking if user is listening to room: " +
								err,
						);
						throw err;
					});
				console.log("Playback state:", state);
				if (state === null) {
					console.log(`userListeningToRoom false because state is null`);
					return false;
				}
				setPlaybackState(state);
				if (!activeDevice || activeDevice.id !== state.device.id) {
					setActiveDevice({
						deviceID: state.device.id,
						userSelected: false,
					});
				}
				if (state.context === null) {
					return false;
				}
				if (state.context.uri !== currentRoom.spotifyPlaylistID) {
					return false;
				}
				// if (state.item === null) {
				// 	return false;
				// }
				// if (state.item.id === currentSong.spotifyID) {
				// 	return true;
				// }
			} else {
				console.log(`userListeningToRoom false because !roomPlaying`);
			}
			return false;
		},
		[currentRoom, currentSong, spotify, activeDevice],
	);

	const startPlayback = useCallback(
		async function (startTime: number = Date.now()): Promise<void> {
			if (!currentRoom) {
				console.error("User is not in a room");
				return;
			}

			if (!(await userListeningToRoom(true))) {
				if (!currentSong) {
					return;
				}
				await handlePlayback(
					"play",
					currentRoom.spotifyPlaylistID,
					currentSong,
				);
			}
			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
				UTC_time: startTime,
			};
			socket.emit(SOCKET_EVENTS.INIT_PLAY, JSON.stringify(input));
		},
		[
			currentRoom,
			userListeningToRoom,
			socket,
			pollLatency,
			currentUser,
			currentSong,
			handlePlayback,
		],
	);

	const pausePlayback = useCallback(
		async function (): Promise<void> {
			if (await userListeningToRoom(true)) {
				await handlePlayback("pause");
			}

			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
		[
			userListeningToRoom,
			socket,
			pollLatency,
			currentUser,
			currentRoom,
			handlePlayback,
		],
	);

	// const stopPlayback = useCallback(
	// 	function (): void {
	// 		if (socket === null) {
	// 			console.error("Socket connection not initialized");
	// 			return;
	// 		}
	// 		if (!socket.connected) {
	// 			console.error("Socket connection is closed");
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
		async function (startTime: number = Date.now()): Promise<void> {
			if (await userListeningToRoom(true)) {
				await handlePlayback("next");
			}

			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
				UTC_time: startTime,
			};
			socket.emit(SOCKET_EVENTS.INIT_SKIP, JSON.stringify(input));
		},
		[
			userListeningToRoom,
			socket,
			pollLatency,
			currentUser,
			currentRoom,
			handlePlayback,
		],
	);

	const prevTrack = useCallback(
		async function (startTime: number = Date.now()): Promise<void> {
			if (await userListeningToRoom(true)) {
				await handlePlayback("previous");
			}

			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
				UTC_time: startTime,
			};
			socket.emit(SOCKET_EVENTS.INIT_PREV, JSON.stringify(input));
		},
		[
			userListeningToRoom,
			socket,
			pollLatency,
			currentUser,
			currentRoom,
			handlePlayback,
		],
	);

	const syncUserPlayback = useCallback(async () => {
		console.log(`Running sync`);
		try {
			await spotifyAuth.getSpotifyTokens(); // will trigger a refresh (if the tokens are expired)
			await getDevices();
			if (keepUserSynced && currentRoom && currentSong && spotify) {
				const syncUserSpotify = async () => {
					try {
						let listening = await userListeningToRoom(
							currentSong.startTime !== undefined,
						);
						let attempts = 0;
						while (!listening) {
							attempts++;
							if (attempts === 10) {
								throw new Error(
									"Attempts to sync user's spotify 10 times. User is not listening to room",
								);
							}
							console.log("User is not listening to room");
							await handlePlayback(
								"play",
								currentRoom.spotifyPlaylistID,
								currentSong,
							).then(async () => {
								console.log("Playback should've started");
								await new Promise((resolve) => setTimeout(resolve, 2000));
								await spotify.player
									.getPlaybackState()
									.catch((err) => {
										Alert.alert(
											"An error occurred while checking if user is listening to room: " +
												err,
										);
										throw err;
									})
									.then(async (state) => {
										listening =
											state.item !== null &&
											state.item.id === currentSong.spotifyID;
										if (!listening) {
											await new Promise((resolve) => setTimeout(resolve, 1000));
										}
									});
							});
						}
					} catch (err) {
						console.error(
							"An error occurred while checking if user is listening to room",
							err,
						);
						Alert.alert(
							"An error occurred while checking if user is listening to room: " +
								err,
						);
					}
				};

				if (!activeDevice) {
					throw new Error("Active device is not set");
				}
				await syncUserSpotify();
			}
		} catch (err) {
			console.error("An error occurred while syncing user with room", err);
			Alert.alert("An error occurred while syncing user with room: " + err);
		}
	}, [
		activeDevice,
		currentRoom,
		currentSong,
		getDevices,
		handlePlayback,
		keepUserSynced,
		spotify,
		spotifyAuth,
		userListeningToRoom,
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
			syncUserPlayback: syncUserPlayback,
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
		syncUserPlayback,
	]);

	const clearQueue = useCallback(
		function (): void {
			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
			socket.volatile.emit(SOCKET_EVENTS.REQUEST_QUEUE, JSON.stringify(input));
			console.log("emitted: requestQueue");
		},
		[currentRoom, currentUser, roomQueue, socket],
	);

	const dequeueSongs = useCallback(
		function (songs: RoomSongDto[]): void {
			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
			socket.volatile.emit(SOCKET_EVENTS.REQUEST_QUEUE, JSON.stringify(input));
			console.log("emitted: requestQueue");
		},
		[currentRoom, currentUser, roomQueue, setRoomQueue, socket],
	);

	const upvoteSong = useCallback(
		function (song: RoomSongDto): void {
			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
			if (socket === null) {
				console.error("Socket connection not initialized");
				return;
			}
			if (!socket.connected) {
				console.error("Socket connection is closed");
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
			socket.volatile.emit(SOCKET_EVENTS.REQUEST_QUEUE, JSON.stringify(input));
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
			state: playbackState,
		};
	}, [
		canControlRoom,
		playbackHandler,
		playbackState,
		queueControls,
		requestLiveChatHistory,
		requestRoomQueue,
		sendLiveChatMessage,
		sendReaction,
	]);
	return roomControls;
}
