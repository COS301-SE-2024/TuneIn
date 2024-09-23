import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useRef,
	useMemo,
	useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import auth from "./services/AuthManagement";
import * as utils from "./services/Utils";
import bookmarks from "./services/BookmarkService";
import {
	DirectMessageDto,
	LiveChatMessageDto,
	RoomDto,
	SpotifyCallbackResponse,
	SpotifyTokenPair,
	UserDto,
} from "../api";
import { EmojiReactionDto } from "./models/EmojiReactionDto";
import { Emoji } from "rn-emoji-picker/dist/interfaces";
import { RoomSongDto } from "./models/RoomSongDto";
import { VoteDto } from "./models/VoteDto";
import { QueueEventDto } from "./models/QueueEventDto";
import { ObjectConfig } from "react-native-flying-objects";
import { Text, Alert } from "react-native";
import { ChatEventDto } from "./models/ChatEventDto";
import { PlaybackEventDto } from "./models/PlaybackEventDto";
import { set } from "react-datepicker/dist/date_utils";
import {
	SpotifyApi,
	Devices,
	Device,
	PlaybackState,
} from "@spotify/web-api-ts-sdk";
import { SPOTIFY_CLIENT_ID } from "react-native-dotenv";
import { useAPI } from "./APIContext";
import { AxiosResponse } from "axios";
import { RequiredError } from "../api/base";
import { SOCKET_EVENTS } from "../../common/constants";
import { useLiveState, actionTypes } from "./hooks/useSocketState";

const clientId = SPOTIFY_CLIENT_ID;
if (!clientId) {
	throw new Error(
		"No Spotify client ID (SPOTIFY_CLIENT_ID) provided in environment variables",
	);
}

const TIMEOUT = 300000;
interface SpotifyAuth {
	exchangeCodeWithBackend: (
		code: string,
		state: string,
		redirectURI: string,
	) => Promise<SpotifyCallbackResponse>;
	getSpotifyTokens: () => Promise<SpotifyTokenPair | null>;
	userlessAPI: SpotifyApi;
}

interface LiveContextType {
	socketHandshakes: {
		socketConnected: boolean;
		socketInitialized: boolean;
		sentIdentity: boolean;
		identityConfirmed: boolean;
		sentRoomJoin: boolean;
		roomJoined: boolean;
		roomChatRequested: boolean;
		roomChatReceived: boolean;
		roomQueueRequested: boolean;
		roomQueueReceived: boolean;
		sentDMJoin: boolean;
		dmJoined: boolean;
		dmsRequested: boolean;
		dmsReceived: boolean;
	};

	currentUser: UserDto | undefined;
	refreshUser: boolean;
	setRefreshUser: React.Dispatch<React.SetStateAction<boolean>>;
	userBookmarks: RoomDto[];

	sendPing: (timeout?: number) => Promise<void>;
	getTimeOffset: () => void;
	pollLatency: () => void;

	currentRoom: RoomDto | undefined;
	currentSong: RoomSongDto | undefined;
	joinRoom: (roomId: string) => void;
	leaveRoom: () => void;
	roomMessages: LiveMessage[];
	roomQueue: RoomSongDto[];
	roomPlaying: boolean;
	roomEmojiObjects: ObjectConfig[];
	roomControls: RoomControls;

	dmControls: DirectMessageControls;
	directMessages: DirectMessage[];
	enterDM: (usernames: string[]) => void;
	leaveDM: () => void;
	dmParticipants: UserDto[];
	currentRoomVotes: VoteDto[];

	spotifyAuth: SpotifyAuth;
}

export type SpotifyTokenRefreshResponse = {
	access_token: string;
	token_type: string;
	scope: string;
	expires_in: number;
};

const LiveContext = createContext<LiveContextType | undefined>(undefined);

export const LiveProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const {
		users,
		rooms,
		authenticated,
		auth: authAPI,
		tokenState,
		getUser,
	} = useAPI();
	const [currentUser, setCurrentUser] = useState<UserDto>();
	const [userBookmarks, setUserBookmarks] = useState<RoomDto[]>([]);
	const [currentRoom, setCurrentRoom] = useState<RoomDto>();
	const [currentSong, setCurrentSong] = useState<RoomSongDto>();
	const [roomQueue, setRoomQueue] = useState<RoomSongDto[]>([]);
	const [currentRoomVotes, setCurrentRoomVotes] = useState<VoteDto[]>([]);
	const [roomMessages, setRoomMessages] = useState<LiveMessage[]>([]);
	const [dmParticipants, setDmParticipants] = useState<UserDto[]>([]);
	const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
	const [mounted, setMounted] = useState<boolean>(false);
	const [roomEmojiObjects, setRoomEmojiObjects] = useState<ObjectConfig[]>([]);
	const [timeOffset, setTimeOffset] = useState<number>(0);
	const [backendLatency, setBackendLatency] = useState<number>(0);
	const [pingSent, setPingSent] = useState<boolean>(false);
	const [spotifyTokens, setSpotifyTokens] = useState<SpotifyTokenPair>();
	const [spotifyDevices, setSpotifyDevices] = useState<Devices>({
		devices: [],
	});
	const [roomPlaying, setRoomPlaying] = useState<boolean>(false);
	const { socketState, updateState } = useLiveState();

	const sendIdentity = useCallback((socket: Socket) => {
		if (
			currentUser &&
			!socketState.sentIdentity &&
			!socketState.identityConfirmed
		) {
			const input: ChatEventDto = {
				userID: currentUser.userID,
			};
			socket.emit(SOCKET_EVENTS.CONNECT, JSON.stringify(input));
			updateState({ type: actionTypes.SENT_IDENTITY });
		}
	}, []);

	const createSocketConnection = useCallback((): Socket | null => {
		if (socketState.socketConnected) {
			if (socketState.socketInitialized) {
				console.error(
					"Cannot create new socket connection: Socket already initialized",
				);
			} else {
				console.error(
					"Cannot create new socket connection: Socket connection already established",
				);
			}
			return null;
		}
		if (!currentUser) {
			console.error("Cannot create new socket connection: User not logged in");
			return null;
		}
		updateState({ type: actionTypes.SOCKET_INITIALIZED });
		console.log("==================== CREATING SOCKET ====================");
		if (socketRef.current === null && currentUser) {
			const s = io(utils.API_BASE_URL + "/live", {
				transports: ["websocket"],
				timeout: TIMEOUT,
			});
			s.on("connect", () => {
				console.log("Connected to the server!");
				updateState({ type: actionTypes.SOCKET_CONNECTED });
				console.log(s.connected);
				if (!socketState.sentIdentity) {
					sendIdentity(s);
	const [refreshUser, setRefreshUser] = useState<boolean>(false);
				}
				s.on(SOCKET_EVENTS.CONNECTED, (response) => {
					console.log("Identity confirmed by server");
					updateState({ type: actionTypes.IDENTITY_CONFIRMED });
				});
			});
			s.on("disconnect", () => {
				console.log("Disconnected from the server");
				updateState({ type: actionTypes.RESET });
			});
			s.connect();
			return s;
		}
		return null;
	}, [currentUser, socketState]);
	const socketRef = useRef<Socket | null>(null);
	const initializeSocket = useCallback(() => {
		console.log("Initializing socket");
		if (!currentUser) {
			return;
		}
		if (socketRef.current === null) {
			// createSocket();
		}

		if (socketRef.current !== null) {
			console.log("socketInitialized:", socketState.socketInitialized);
			console.log("mounted:", mounted);
			console.log("currentUser:", currentUser);
			if (
				!socketState.socketInitialized &&
				mounted &&
				currentUser !== undefined
			) {
				socketRef.current.on(
					SOCKET_EVENTS.USER_JOINED_ROOM,
					(response: ChatEventDto) => {
						console.log(
							`SOCKET EVENT: ${SOCKET_EVENTS.USER_JOINED_ROOM}`,
							response,
						);
						const u: UserDto = currentUser;
						if (
							response.body &&
							response.body.sender.userID === currentUser.userID
						) {
							updateState({ type: actionTypes.ROOM_JOIN_CONFIRMED });
						}
						roomControls.requestLiveChatHistory();
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.LIVE_CHAT_HISTORY,
					(history: LiveChatMessageDto[]) => {
						console.log(
							`SOCKET EVENT: ${SOCKET_EVENTS.LIVE_CHAT_HISTORY}`,
							history,
						);
						const chatHistory = history.map((msg) => ({
							message: msg,
							me: msg.sender.userID === currentUser.userID,
						}));
						setRoomMessages(chatHistory);
						updateState({ type: actionTypes.ROOM_CHAT_RECEIVED });
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.LIVE_MESSAGE,
					(newMessage: ChatEventDto) => {
						console.log(
							`SOCKET EVENT: ${SOCKET_EVENTS.LIVE_MESSAGE}`,
							newMessage,
						);
						if (
							!socketState.roomChatRequested ||
							!socketState.roomChatReceived
						) {
							dmControls.requestDirectMessageHistory();
						}

						if (!newMessage.body) {
							return;
						}
						const message = newMessage.body;
						const me = message.sender.userID === currentUser.userID;
						if (setRoomMessages) {
							const messages: LiveMessage[] = [
								...roomMessages,
								{ message, me } as LiveMessage,
							];
							setRoomMessages(messages);
						}
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.USER_LEFT_ROOM,
					(response: ChatEventDto) => {
						console.log(
							`SOCKET EVENT: ${SOCKET_EVENTS.USER_LEFT_ROOM}`,
							response,
						);
						console.log("User left room:", response);
					},
				);

				socketRef.current.on(SOCKET_EVENTS.ERROR, (response: ChatEventDto) => {
					console.log(`SOCKET EVENT: ${SOCKET_EVENTS.ERROR}`, response);
					console.error("Error:", response.errorMessage);
				});

				socketRef.current.on("connect", () => {
					console.log(`SOCKET EVENT: connect`);
					if (socketRef.current === null) {
						console.error("Socket connection not initialized");
						return Promise.reject(
							new Error("Socket connection not initialized"),
						);
					}

					updateState({ type: actionTypes.SOCKET_CONNECTED });
					sendIdentity(socketRef.current);
				});

				socketRef.current.on(
					SOCKET_EVENTS.CONNECTED,
					(response: ChatEventDto) => {
						console.log(`SOCKET EVENT: ${SOCKET_EVENTS.CONNECTED}`, response);
						updateState({ type: actionTypes.IDENTITY_CONFIRMED });
						if (currentRoom) {
							joinRoom(currentRoom.roomID);
						}
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.PLAY_MEDIA,
					async (response: PlaybackEventDto) => {
						console.log(`SOCKET EVENT: ${SOCKET_EVENTS.PLAY_MEDIA}`, response);
						if (!response.UTC_time) {
							console.log("UTC time not found");
							return;
						}

						if (!response.spotifyID) {
							throw new Error("Server did not return song ID");
						}
						const deviceID =
							await roomControls.playbackHandler.getFirstDevice();
						if (deviceID && deviceID !== null) {
							await roomControls.playbackHandler.handlePlayback(
								"play",
								deviceID,
								await calculateSeekTime(response.UTC_time, 0),
							);
						}
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.PAUSE_MEDIA,
					async (response: PlaybackEventDto) => {
						console.log(`SOCKET EVENT: ${SOCKET_EVENTS.PAUSE_MEDIA}`, response);
						const deviceID =
							await roomControls.playbackHandler.getFirstDevice();
						if (deviceID && deviceID !== null) {
							roomControls.playbackHandler.handlePlayback("pause", deviceID);
						}
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.STOP_MEDIA,
					async (response: PlaybackEventDto) => {
						console.log(`SOCKET EVENT: ${SOCKET_EVENTS.STOP_MEDIA}`, response);
						const deviceID =
							await roomControls.playbackHandler.getFirstDevice();
						if (deviceID && deviceID !== null) {
							roomControls.playbackHandler.handlePlayback("pause", deviceID);
						}
					},
				);

				socketRef.current.on("time_sync_response", (data) => {
					console.log(`SOCKET EVENT: time_sync_response`, data);
					const t2 = Date.now();
					const t1 = data.t1;
					const offset = (t1 - data.t0 + (data.t2 - t2)) / 2;
					setTimeOffset(offset);
					console.log(`Time offset: ${offset} ms`);
				});

				socketRef.current.on(
					SOCKET_EVENTS.DIRECT_MESSAGE,
					(data: DirectMessageDto) => {
						console.log(`SOCKET EVENT: ${SOCKET_EVENTS.DIRECT_MESSAGE}`, data);
						const me = data.sender.userID === currentUser.userID;
						const dm = {
							message: data,
							me: data.sender.userID === currentUser.userID,
							messageSent: true,
						} as DirectMessage;
						if (me) {
							//if (setDMTextBox) setDMTextBox("");
						}
						setDirectMessages((prevMessages) => {
							const newMessages = [...prevMessages, dm];
							newMessages.sort((a, b) => a.message.index - b.message.index);
							return newMessages;
						});
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.USER_ONLINE,
					(data: { userID: string }) => {
						console.log(`SOCKET EVENT: ${SOCKET_EVENTS.USER_ONLINE}`, data);
						if (data.userID === currentUser.userID) {
							updateState({ type: actionTypes.DM_JOIN_CONFIRMED });
						}
						//we can use this to update the user's status
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.USER_OFFLINE,
					(data: { userID: string }) => {
						console.log(`SOCKET EVENT: ${SOCKET_EVENTS.USER_OFFLINE}`, data);
						if (data.userID === currentUser.userID) {
							updateState({ type: actionTypes.DM_LEAVE_CONFIRMED });
						}
						//we can use this to update the user's status
					},
				);

				// (unused) for edits and deletes of direct messages
				socketRef.current.on(SOCKET_EVENTS.CHAT_MODIFIED, (data) => {});

				socketRef.current.on(
					SOCKET_EVENTS.DM_HISTORY,
					(data: DirectMessageDto[]) => {
						console.log(`SOCKET EVENT: ${SOCKET_EVENTS.DM_HISTORY}`, data);
						console.log("b");
						console.log("c");
						console.log("Setting DMs");
						const dmHistory = data.map(
							(msg: DirectMessageDto) =>
								({
									message: msg,
									me: msg.sender.userID === currentUser.userID,
									messageSent: true,
								}) as DirectMessage,
						);
						dmHistory.sort((a, b) => a.message.index - b.message.index);
						setDirectMessages(dmHistory);
						updateState({ type: actionTypes.DMS_RECEIVED });
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.EMOJI_REACTION,
					(reaction: EmojiReactionDto) => {
						console.log(
							`SOCKET EVENT: ${SOCKET_EVENTS.EMOJI_REACTION}`,
							reaction,
						);
						//add the new reaction to components
						if (reaction.userID === currentUser.userID) {
							return;
						}
						setRoomEmojiObjects((prev) => [
							...prev,
							{ object: <Text style={{ fontSize: 30 }}>{reaction.body}</Text> },
							{ object: <Text style={{ fontSize: 30 }}>{reaction.body}</Text> },
							{ object: <Text style={{ fontSize: 30 }}>{reaction.body}</Text> },
						]);
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.QUEUE_STATE,
					(response: {
						room: RoomDto;
						songs: RoomSongDto[];
						votes: VoteDto[];
					}) => {
						console.log(`SOCKET EVENT: ${SOCKET_EVENTS.QUEUE_STATE}`, response);
						setCurrentRoom(response.room);
						updateRoomQueue(response.songs);
						setCurrentRoomVotes(response.votes);
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.SONG_ADDED,
					(newSong: QueueEventDto) => {
						console.log(`SOCKET EVENT: ${SOCKET_EVENTS.SONG_ADDED}`, newSong);
						const newQueue = [...roomQueue, newSong.song];
						updateRoomQueue(newQueue);
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.SONG_REMOVED,
					(removedSong: QueueEventDto) => {
						console.log(
							`SOCKET EVENT: ${SOCKET_EVENTS.SONG_REMOVED}`,
							removedSong,
						);
						let newQueue = [...roomQueue];
						newQueue = newQueue.filter(
							(song) => song.spotifyID !== removedSong.song.spotifyID,
						);
						updateRoomQueue(newQueue);
					},
				);

				socketRef.current.on(
					SOCKET_EVENTS.VOTE_UPDATED,
					(updatedSong: QueueEventDto) => {
						console.log(
							`SOCKET EVENT: ${SOCKET_EVENTS.VOTE_UPDATED}`,
							updatedSong,
						);
						const i = roomQueue.findIndex(
							(song) => song.spotifyID === updatedSong.song.spotifyID,
						);
						if (i === -1) {
							return;
						}
						const newQueue = [...roomQueue];
						newQueue[i] = updatedSong.song;
						updateRoomQueue(newQueue);
					},
				);

				console.log("ajbfskdbfksdksdkjfnsdkjnvjkdnjkdsn");
				socketRef.current.connect();
				while (!socketRef.current.connected) {
					console.log("awaiting socket connection");
				}
				sendIdentity(socketRef.current);
				console.log("ajbfskdbfksdksdkjfnsdkjnvjkdnjkdsn");

				updateState({ type: actionTypes.SOCKET_INITIALIZED });
				pollLatency();
			}

			if (!socketState.roomJoined && currentRoom && currentRoom.roomID) {
				joinRoom(currentRoom.roomID);
			}
		}
	}, [
		// createSocket,
		currentRoom,
		currentUser,
		mounted,
	]);
	const createSocket = useCallback(() => {
		if (
			socketRef.current !== null &&
			socketRef.current.connected &&
			!socketRef.current.disconnected
		) {
			console.error("Socket connection already created");
			return;
		}
		if (
			currentUser &&
			(!socketRef.current ||
				(socketState.socketConnected && socketRef.current.disconnected))
		) {
			socketRef.current = createSocketConnection();
			if (socketRef.current !== null && !socketState.socketInitialized) {
				initializeSocket();
			}
		}
	}, []);
	const getSocket = useCallback((): Socket | null => {
		if (socketRef.current === null && currentUser) {
			createSocket();
		}
		if (socketRef.current === null) {
			// throw new Error("Socket connection not initialized");
			console.error("Socket connection not initialized");
		}
		return socketRef.current;
	}, [currentUser, createSocket]);

	const updateRoomQueue = useCallback((queue: RoomSongDto[]) => {
		queue.sort((a, b) => a.index - b.index);
		setRoomQueue(queue);
	}, []);

	const setRoomID = useCallback((roomID: string) => {
		rooms
			.getRoomInfo(roomID)
			.then((room: AxiosResponse<RoomDto>) => {
				console.log("Room: " + room);
				if (room.status === 401) {
					//Unauthorized
					//Auth header is either missing or invalid
					setCurrentRoom(undefined);
					setRoomQueue([]);
					setCurrentRoomVotes([]);
				} else if (room.status === 500) {
					//Internal Server Error
					//Something went wrong in the backend (unlikely lmao)
					setCurrentRoom(undefined);
					setRoomQueue([]);
					setCurrentRoomVotes([]);
					throw new Error("Internal Server Error");
				} else {
					const r: RoomDto = room.data;
					setCurrentRoom(r);
					setRoomQueue([]);
					setCurrentRoomVotes([]);
					roomControls.requestRoomQueue();
				}
			})
			.catch((error) => {
				setCurrentRoom(undefined);
				setRoomQueue([]);
				setCurrentRoomVotes([]);
				if (error instanceof RequiredError) {
					// a required field is missing
					throw new Error("Parameter missing from request to get room");
				} else {
					// some other error
					throw new Error("Error getting room");
				}
			});
	}, []);

	const spotifyAuth: SpotifyAuth = useMemo(
		() => ({
			exchangeCodeWithBackend: async (
				code: string,
				state: string,
				redirectURI: string,
			): Promise<SpotifyCallbackResponse> => {
				try {
					authAPI
						.spotifyCallback(code, state)
						.then((sp: AxiosResponse<SpotifyCallbackResponse>) => {
							if (sp.status === 401) {
								//Unauthorized
								//Auth header is either missing or invalid
							} else if (sp.status === 500) {
								//Internal Server Error
								//Something went wrong in the backend (unlikely lmao)
								throw new Error("Internal Server Error");
							}
							setSpotifyTokens(sp.data.spotifyTokens);
							return sp.data;
						})
						.catch((error) => {
							if (error instanceof RequiredError) {
								// a required field is missing
								throw new Error("Parameter missing from request to get user");
							} else {
								// some other error
								throw new Error("Error getting user");
							}
						});
				} catch (error) {
					console.error("Failed to exchange code with backend:", error);
				}
				throw new Error(
					"Something went wrong while exchanging code with backend",
				);
			},
			getSpotifyTokens: async (): Promise<SpotifyTokenPair | null> => {
				if (spotifyTokens && spotifyTokens.epoch_expiry > Date.now()) {
					if (spotifyTokens.epoch_expiry - Date.now() > 1000 * 60 * 5) {
						return spotifyTokens;
					}
				}

				if (authenticated) {
					authAPI
						.getSpotifyTokens()
						.then((sp: AxiosResponse<SpotifyTokenPair>) => {
							if (sp.status === 401) {
								//Unauthorized
								//Auth header is either missing or invalid
							} else if (sp.status === 500) {
								//Internal Server Error
								//Something went wrong in the backend (unlikely lmao)
								throw new Error("Internal Server Error");
							}
							setSpotifyTokens(sp.data);
							return sp.data;
						})
						.catch((error) => {
							if (error instanceof RequiredError) {
								// a required field is missing
								throw new Error("Parameter missing from request to get user");
							} else {
								// some other error
								throw new Error("Error getting user");
							}
						});
				}
				console.error("Cannot get Spotify tokens without being authenticated");
				return null;
			},
		}),
		[authAPI, authenticated, spotifyTokens],
	);

	const joinRoom = useCallback((roomID: string) => {
		if (!currentUser) {
			console.error("User cannot join room without being logged in");
			return;
		}

		const socket = getSocket();
		if (socket !== null) {
			pollLatency();
			const input: ChatEventDto = {
				userID: currentUser.userID,
				body: {
					messageBody: "",
					sender: currentUser,
					roomID: roomID,
					dateCreated: new Date().toISOString(),
				},
			};
			socket.emit(SOCKET_EVENTS.JOIN_ROOM, JSON.stringify(input));
			updateState({ type: actionTypes.SENT_ROOM_JOIN });

			//request chat history
			roomControls.requestLiveChatHistory();
			updateState({ type: actionTypes.ROOM_CHAT_REQUESTED });
		}
	}, []);

	const leaveRoom = useCallback(() => {
		pollLatency();
		if (!currentUser) {
			console.error("User cannot leave room without being logged in");
			return;
		}

		if (!currentRoom) {
			console.error("User cannot leave room without being in a room");
			return;
		}

		const socket = getSocket();
		updateState({ type: actionTypes.START_ROOM_LEAVE });
		if (socket !== null) {
			const input: ChatEventDto = {
				userID: currentUser.userID,
				body: {
					messageBody: "",
					sender: currentUser,
					roomID: currentRoom.roomID,
					dateCreated: new Date().toISOString(),
				},
			};
			socket.emit(SOCKET_EVENTS.LEAVE_ROOM, JSON.stringify(input));
		}
		setRoomMessages([]);
		updateState({ type: actionTypes.ROOM_LEAVE_CONFIRMED });
		setCurrentRoom(undefined);
		setRoomQueue([]);
	}, []);

	const enterDM = useCallback((usernames: string[]) => {
		pollLatency();
		if (!currentUser) {
			console.error("User is not logged in");
			return;
		}
		const promises: Promise<UserDto>[] = usernames.map((username) =>
			getUser(username),
		);
		Promise.all(promises)
			.then((users) => {
				const socket = getSocket();
				setDmParticipants(users);
				if (socket !== null) {
					const input = {
						userID: currentUser.userID,
						participantID: users[0].userID,
					};
					socket.emit(SOCKET_EVENTS.ENTER_DM, JSON.stringify(input));
					updateState({ type: actionTypes.REQUEST_DM_JOIN });
					dmControls.requestDirectMessageHistory();
					updateState({ type: actionTypes.DMS_REQUESTED });
				}
			})
			.catch((error) => {
				console.error("Failed to get user info:", error);
			});
	}, []);

	const leaveDM = useCallback(() => {
		pollLatency();
		if (socketState.dmJoined) {
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}
			const socket = getSocket();
			if (socket !== null) {
				const input = {
					userID: currentUser.userID,
				};
				socket.emit(SOCKET_EVENTS.EXIT_DM, JSON.stringify(input));
				console.log("emit exitDirectMessage with body:", input);
				updateState({ type: actionTypes.REQUEST_DM_LEAVE });
				setDmParticipants([]);
				setDirectMessages([]);
			}
		}
	}, []);

	// Method to send a ping and wait for a response or timeout
	const sendPing = useCallback((timeout: number = TIMEOUT): Promise<void> => {
		if (pingSent) {
			console.log("A ping is already waiting for a response. Please wait.");
			return Promise.resolve();
		}
		const socket = getSocket();
		if (socket !== null) {
			const startTime = Date.now();
			setPingSent(true);
			socket.volatile.emit("ping", null, (hitTime: string) => {
				console.log("Ping hit time:", hitTime);
				console.log("Ping sent successfully.");
				const roundTripTime = Date.now() - startTime;
				console.log(`Ping round-trip time: ${roundTripTime}ms`);
				setPingSent(false);
				setBackendLatency(roundTripTime);
			});

			return new Promise<void>((resolve, reject) => {
				// const startTime = Date.now();
				setPingSent(true);

				// Set up a timeout
				// const timeoutId = setTimeout(() => {
				// 	pingSent = false;
				// 	console.log("Ping timed out.");
				// 	reject(new Error("Ping timed out"));
				// }, timeout);

				// Send the ping message with a callback
				// socket.volatile.emit("ping", null, () => {
				// 	console.log("Ping sent successfully.");
				// 	clearTimeout(timeoutId);
				// 	const roundTripTime = Date.now() - startTime;
				// 	console.log(`Ping round-trip time: ${roundTripTime}ms`);
				// 	pingSent = false;
				// 	backendLatency = roundTripTime;
				// 	resolve();
				// });
			}).catch((error) => {
				console.error("Ping failed:", error.message);
				// Optionally, retry sending the ping here
				throw error; // Re-throw the error to maintain the Promise<void> type
			});
		}
		return Promise.resolve();
	}, []);

	const getTimeOffset = useCallback(() => {
		const socket = getSocket();
		if (socket !== null) {
			let t0 = Date.now();
			socket.emit("time_sync", { t0: Date.now() });
		}
	}, []);

	const pollLatency = useCallback(() => {
		sendPing().then(() => {
			console.log("Ping sent");
			getTimeOffset();
			console.log("Awaiting time offset");
		});
	}, []);

	const calculateSeekTime = useCallback(
		async (startTimeUtc: number, mediaDurationMs: number): Promise<number> => {
			await pollLatency();
			console.log(`Device is ${backendLatency} ms behind the server`);
			console.log(`Device's clock is ${timeOffset} ms behind the server`);
			console.log(
				`Media is supposed to start at ${startTimeUtc} ms since epoch`,
			);

			// Get the current server time
			const serverTime = Date.now() + timeOffset;

			// Convert startTimeUtc to milliseconds since epoch
			const startTimeMs = new Date(startTimeUtc).getTime();

			// Calculate the elapsed time since media started
			const elapsedTimeMs = serverTime - startTimeMs;

			// Calculate the seek position within the media duration
			let seekPosition = Math.max(0, Math.min(elapsedTimeMs, mediaDurationMs));

			console.log(`Seek position: ${seekPosition} ms`);
			return seekPosition;
		},
		[],
	);

	const dmControls: DirectMessageControls = useMemo(() => {
		return {
			sendDirectMessage: function (message: DirectMessage): void {
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

				if (dmParticipants.length === 0) {
					console.error("User is not sending a message to anyone");
					return;
				}

				if (message.message.messageBody.trim()) {
					message.message.sender = currentUser;
					message.message.recipient = dmParticipants[0];
					socket.emit(
						SOCKET_EVENTS.DIRECT_MESSAGE,
						JSON.stringify(message.message),
					);
				}
			},

			editDirectMessage: function (message: DirectMessage): void {
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

				if (dmParticipants.length === 0) {
					console.error("User is not sending a message to anyone");
					return;
				}

				if (message.message.messageBody.trim()) {
					let payload = {
						userID: currentUser.userID,
						participantID: dmParticipants[0].userID,
						action: "edit",
						message: message.message,
					};
					socket.emit(SOCKET_EVENTS.MODIFY_DM, JSON.stringify(payload));
				}
			},

			deleteDirectMessage: function (message: DirectMessage): void {
				const socket = getSocket();
				if (!socket) {
					console.error("Socket connection not initialized");
					return;
				}

				if (!currentUser) {
					console.error("User is not logged in");
					return;
				}

				if (dmParticipants.length === 0) {
					console.error("User is not sending a message to anyone");
					return;
				}

				let payload = {
					userID: currentUser.userID,
					participantID: dmParticipants[0].userID,
					action: "delete",
					message: message.message,
				};
				socket.emit(SOCKET_EVENTS.MODIFY_DM, JSON.stringify(payload));
			},

			requestDirectMessageHistory: function (): void {
				const socket = getSocket();
				if (!socket) {
					console.error("Socket connection not initialized");
					return;
				}

				if (socketState.dmsRequested) {
					console.log("Already requested DM history");
					return;
				}

				if (!currentUser) {
					console.error("User is not logged in");
					return;
				}

				if (dmParticipants.length === 0) {
					console.error("User is not sending a message to anyone");
					return;
				}

				const input = {
					userID: currentUser.userID,
					participantID: dmParticipants[0].userID,
				};
				socket.emit(
					SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY,
					JSON.stringify(input),
				);
				updateState({ type: actionTypes.DMS_REQUESTED });
			},
		};
	}, [currentUser, dmParticipants]);

	const roomControls: RoomControls = useMemo(() => {
		return {
			sendLiveChatMessage: function (message: string): void {
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

			sendReaction: function (emoji: string): void {
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

			requestLiveChatHistory: function (): void {
				const socket = getSocket();
				if (!socket) {
					console.error("Socket connection not initialized");
					return;
				}

				// if (this.requestingLiveChatHistory) {
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

			canControlRoom: function (): boolean {
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

			requestRoomQueue: function (): void {
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

			playbackHandler: {
				spotifyDevices,
				handlePlayback: async function (
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

						const activeDevice =
							await roomControls.playbackHandler.getFirstDevice();
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
				getFirstDevice: async function (): Promise<string> {
					if (!spotifyTokens) {
						throw new Error("Spotify tokens not found");
					}
					try {
						let d = spotifyDevices;
						if (!d.devices || d.devices.length === 0) {
							d = {
								devices: await roomControls.playbackHandler.getDevices(),
							};
						}

						if (d.devices.length > 0) {
							const first: Device = d.devices[0];
							if (!first.id) {
								throw new Error("Device ID not found");
							}
							return first.id;
						} else {
							Alert.alert(
								"No Devices Found",
								"No devices are currently active.",
							);
							throw new Error("No devices found");
						}
					} catch (err) {
						console.error("An error occurred while getting the device ID", err);
						throw err;
					}
				},
				getDevices: async function (): Promise<Device[]> {
					if (!spotifyTokens) {
						throw new Error("Spotify tokens not found");
					}
					try {
						const api = SpotifyApi.withAccessToken(
							clientId,
							spotifyTokens.tokens,
						);
						const data: Devices = await api.player.getAvailableDevices();
						setSpotifyDevices(data);
						return data.devices;
					} catch (err) {
						console.error("An error occurred while fetching devices", err);
						throw err;
					}
				},
				getDeviceIDs: async function (): Promise<string[]> {
					let devices: Device[];
					if (spotifyDevices.devices.length === 0) {
						devices = await roomControls.playbackHandler.getDevices();
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
				setActiveDevice: async function (
					deviceID: string | null,
				): Promise<void> {
					if (!spotifyTokens) {
						throw new Error("Spotify tokens not found");
					}
					if (!deviceID) {
						throw new Error("Cannot set active device to null");
					}
					try {
						const api = SpotifyApi.withAccessToken(
							clientId,
							spotifyTokens.tokens,
						);

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
				userListeningToRoom: async function (
					currentTrackUri: string,
				): Promise<boolean> {
					if (!spotifyTokens) {
						throw new Error("Spotify tokens not found");
					}
					if (!validTrackUri(currentTrackUri)) {
						throw new Error("Invalid track URI");
					}
					if (roomPlaying) {
						const api = SpotifyApi.withAccessToken(
							clientId,
							spotifyTokens.tokens,
						);
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
				startPlayback: function (): void {
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

				pausePlayback: function (): void {
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

				stopPlayback: function (): void {
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

				nextTrack: function (): void {
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
			},
			queue: {
				enqueueSong: function (song: RoomSongDto): void {
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
				dequeueSong: function (song: RoomSongDto): void {
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
				upvoteSong: function (song: RoomSongDto): void {
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
				downvoteSong: function (song: RoomSongDto): void {
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
				swapSongVote: function (song: RoomSongDto): void {
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
				undoSongVote: function (song: RoomSongDto): void {
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
			},
		};
	}, [
		getSocket,
		// pollLatency,
		currentUser,
		currentRoom,
		spotifyTokens,
		spotifyDevices,
		currentSong,
		roomPlaying,
		// socketState,
	]);

	// let t: string | null = tokenState.token;
	// if (t === null) {
	// 	auth
	// 		.getToken()
	// 		.then((token) => {
	// 			t = token;
	// 			if (t !== null && !spotifyTokens) {
	// 				spotifyAuth.getSpotifyTokens().then((tokens) => {
	// 					if (tokens) {
	// 						setSpotifyTokens(tokens);
	// 					}
	// 					console.log("Spotify tokens fetched:", tokens);
	// 				});
	// 			}
	// 		})
	// 		.catch((error) => {
	// 			console.error("Error getting token:", error);
	// 		});
	// }

	// on mount, initialize the socket
	useEffect(() => {
		socketRef.current = createSocketConnection();
		setMounted(true);
		initializeSocket();
		const s = socketRef.current;
		return () => {
			if (s !== null) {
				leaveRoom();
				s.disconnect();
			}
			setMounted(false);
		};
	}, []);

	//if auth info changes, get user info & spotify tokens
	useEffect(() => {
		// if user is not authenticated, disconnect from socket
		if (!currentUser || !authenticated) {
			if (socketRef.current !== null) {
				if (socketRef.current.connected || !socketRef.current.disconnected) {
					socketRef.current.disconnect();
					console.error("Socket disconnected. User is not authenticated");
				}
				socketRef.current = null;
			} else {
				// user is not authenticated & socket doesn't exist anyway
				// ignore
			}
			updateState({ type: actionTypes.RESET });
			return;
		}

		const getUserDetails = async () => {
			if (tokenState.token !== null) {
				console.log("Getting user");
				users
					.getProfile()
					.then((u: AxiosResponse<UserDto>) => {
						console.log("User: " + u);
						if (u.status === 401) {
							//Unauthorized
							//Auth header is either missing or invalid
							setCurrentUser(undefined);
						} else if (u.status === 500) {
							//Internal Server Error
							//Something went wrong in the backend (unlikely lmao)
							throw new Error("Internal Server Error");
						}
						setCurrentUser(u.data);
					})
					.catch((error) => {
						if (error instanceof RequiredError) {
							// a required field is missing
							throw new Error("Parameter missing from request to get user");
						} else {
							// some other error
							throw new Error("Error getting user");
						}
					});

				bookmarks.getBookmarks(users).then((fetchedBookmarks) => {
					setUserBookmarks(fetchedBookmarks);
				});

				// get spotify tokens
				let tokens: SpotifyTokenPair | null = null;
				spotifyAuth
					.getSpotifyTokens()
					.then((t) => {
						if (t !== null) {
							tokens = t;
							setSpotifyTokens(tokens);
							roomControls.playbackHandler.getDevices();
						}
					})
					.catch((error) => {
						console.error("Failed to get Spotify tokens:", error);
					});
			}
		};
		getUserDetails();

		//// from here on, we know that the user is authenticated
		if (socketRef.current === null) {
			if (authenticated) {
				if (currentUser) {
					console.log(
						"User authenticated & we have their info, but socket is null. Creating socket",
					);
					updateState({ type: actionTypes.RESET });
					createSocket();
				} else {
					console.error("User is authenticated but we don't have their info");
					getUserDetails();
				}
			}
			return;
		}

		// reconnect if socket is disconnected
		if (
			!socketRef.current.connected ||
			socketRef.current.disconnected ||
			!socketState.socketConnected
		) {
			console.log("Reconnecting socket");
			updateState({ type: actionTypes.RESET });
			socketRef.current.connect();
			return;
		}

		//// from here on, we know that the socket exists and is connected

		// fix inconsistencies in handshake 'connected'
		if (!socketState.socketConnected) {
			if (socketRef.current.connected) {
				console.log("Socket is connected");
				updateState({ type: actionTypes.SOCKET_CONNECTED });
			}
		}

		if (!socketState.socketInitialized) {
			console.log("Socket is connected but not initialized. Initializing...");
			initializeSocket();
			updateState({ type: actionTypes.SOCKET_INITIALIZED });
			return;
		}

		//// from here on, we know that the socket is connected and initialized
		// send identity if not sent
		if (!socketState.sentIdentity) {
			console.log(
				"User is connected via sockets but identity not sent. Sending identity...",
			);
			sendIdentity(socketRef.current);
			updateState({ type: actionTypes.SENT_IDENTITY });
			return;
		}

		if (!socketState.identityConfirmed) {
			console.log("Identity not confirmed. Retry sending identity...");
			sendIdentity(socketRef.current);
			updateState({ type: actionTypes.SENT_IDENTITY });
			return;
		}

		// get dms if state appears to expect dms
		// disconnect if otherwise
		// join dms if socket is connected but user is not in dms
		if (dmParticipants.length > 0) {
			if (!socketState.sentDMJoin) {
				console.log("User is connected to dms but not joined. Joining...");
				enterDM(dmParticipants.map((u) => u.username));
				updateState({ type: actionTypes.REQUEST_DM_JOIN });
				return;
			}

			if (!socketState.dmJoined) {
				console.log("User tried to join dms but failed. Retrying...");
				enterDM(dmParticipants.map((u) => u.username));
				updateState({ type: actionTypes.REQUEST_DM_JOIN });
				return;
			}

			if (!socketState.dmsRequested) {
				console.log(
					"User is connected to dms but no messages have been requested",
				);
				dmControls.requestDirectMessageHistory();
				updateState({ type: actionTypes.DMS_REQUESTED });
				return;
			}

			if (!socketState.dmsReceived) {
				console.log(
					"User is connected to dms but no messages have been received",
				);
				dmControls.requestDirectMessageHistory();
				updateState({ type: actionTypes.DMS_REQUESTED });
				return;
			}
		}
		// disconnect from dms if no participants & user is in dms somehow
		else if (dmParticipants.length === 0) {
			if (
				socketState.sentDMJoin ||
				socketState.dmJoined ||
				socketState.dmsRequested ||
				socketState.dmsReceived
			) {
				leaveDM();
				updateState({ type: actionTypes.REQUEST_DM_LEAVE });
				return;
			}
		}

		if (currentRoom) {
			if (!socketState.sentRoomJoin) {
				console.log("User is in a room but not joined in backend. Joining...");
				joinRoom(currentRoom.roomID);
				updateState({ type: actionTypes.SENT_ROOM_JOIN });
				return;
			}

			if (!socketState.roomJoined) {
				console.log("User tried to join room but failed. Retrying...");
				joinRoom(currentRoom.roomID);
				updateState({ type: actionTypes.SENT_ROOM_JOIN });
				return;
			}

			if (!socketState.roomChatReceived) {
				if (socketState.roomChatRequested) {
					console.log("Live chat was requested but not received. Retrying...");
					roomControls.requestLiveChatHistory();
					updateState({ type: actionTypes.ROOM_CHAT_REQUESTED });
					return;
				} else {
					console.log(
						"User is in a room but the live chat has not been requested",
					);
					roomControls.requestLiveChatHistory();
					updateState({ type: actionTypes.ROOM_CHAT_REQUESTED });
					return;
				}
			}

			if (!socketState.roomQueueReceived) {
				if (socketState.roomQueueRequested) {
					console.log("Room queue was requested but not received. Retrying...");
					roomControls.requestRoomQueue();
					updateState({ type: actionTypes.ROOM_QUEUE_REQUESTED });
					return;
				} else {
					console.log(
						"User is in a room but room queue has not been requested",
					);
					roomControls.requestRoomQueue();
					updateState({ type: actionTypes.ROOM_QUEUE_REQUESTED });
					return;
				}
			}
		} else {
			// user is not in a room
			updateState({ type: actionTypes.CLEAR_ROOM_STATE });
		}
	}, [
		authenticated,
		currentRoom,
		currentSong,
		currentUser,
		directMessages,
		dmParticipants,
		roomQueue,
		roomMessages,
		currentRoomVotes,
		socketState,
	]);

	useEffect(() => {
		getUserDetails(spotifyAuth);
	}, [refreshUser]);

	useEffect(() => {}, []);

	return (
		<LiveContext.Provider
			value={{
				socketHandshakes: socketState,

				currentUser,
				userBookmarks,

				sendPing,
				getTimeOffset,
				pollLatency,

				currentRoom,
				currentSong,
				joinRoom,
				leaveRoom,
				roomMessages,
				roomQueue,
				roomPlaying,
				roomEmojiObjects,
				roomControls,

				dmControls,
				directMessages,
				enterDM,
				leaveDM,
				dmParticipants,
				currentRoomVotes,

				spotifyAuth,
			}}
		>
			{children}
		</LiveContext.Provider>
	);
};

export const useLive = () => {
	const context = useContext(LiveContext);
	if (!context) {
		throw new Error("useLive must be used within a LiveProvider");
	}
	return context;
};
