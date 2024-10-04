import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useRef,
	useMemo,
	useCallback,
	useReducer,
} from "react";
import { io, Socket } from "socket.io-client";
import * as utils from "./services/Utils";
import bookmarks from "./services/BookmarkService";
import {
	DirectMessageDto,
	LiveChatMessageDto,
	RoomDto,
	SpotifyCallbackResponse,
	SpotifyTokenPair,
	UserDto,
	RoomSongDto,
} from "../api";
import { EmojiReactionDto } from "./models/EmojiReactionDto";
import { VoteDto } from "./models/VoteDto";
import { QueueEventDto } from "./models/QueueEventDto";
import { ObjectConfig } from "react-native-flying-objects";
import { Text } from "react-native";
import { ChatEventDto } from "./models/ChatEventDto";
import { PlaybackEventDto } from "./models/PlaybackEventDto";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "react-native-dotenv";
import { useAPI } from "./APIContext";
import { AxiosResponse } from "axios";
import { RequiredError } from "../api/base";
import { SOCKET_EVENTS } from "../constants";
import {
	useLiveState,
	actionTypes,
	RESET_EVENTS,
} from "./hooks/useSocketState";
import {
	LiveMessage,
	RoomControls,
	useRoomControls,
} from "./hooks/useRoomControls";
import {
	DirectMessage,
	DirectMessageControls,
	useDirectMessageControls,
} from "./hooks/useDMControls";
import { set } from "react-datepicker/dist/date_utils";

const clientId = SPOTIFY_CLIENT_ID;
if (!clientId) {
	throw new Error(
		"No Spotify client ID (SPOTIFY_CLIENT_ID) provided in environment variables",
	);
}

const TIMEOUT = 300000;
export interface SpotifyAuth {
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
	recentDMs: { message: DirectMessageDto; room?: RoomDto }[];
	setFetchRecentDMs: React.Dispatch<React.SetStateAction<boolean>>;

	getSocket: () => Socket | null;
	sendPing: (timeout?: number) => Promise<void>;
	getTimeOffset: () => void;
	pollLatency: () => void;

	currentRoom: RoomDto | undefined;
	currentSong: RoomSongDto | undefined;
	joinRoom: (roomId: string) => void;
	leaveRoom: () => void;
	roomMessages: LiveMessage[];
	roomQueue: RoomSongDto[];
	roomParticipants: UserDto[];
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
	const [roomParticipants, setRoomParticipants] = useState<UserDto[]>([]);
	const [currentRoomVotes, setCurrentRoomVotes] = useState<VoteDto[]>([]);
	const [roomMessages, setRoomMessages] = useState<LiveMessage[]>([]);
	const [dmParticipants, setDmParticipants] = useState<UserDto[]>([]);
	const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
	const [roomEmojiObjects, setRoomEmojiObjects] = useState<ObjectConfig[]>([]);
	const [timeOffset, setTimeOffset] = useState<number>(0);
	const [backendLatency, setBackendLatency] = useState<number>(0);
	const [pingSent, setPingSent] = useState<boolean>(false);
	const [spotifyTokens, setSpotifyTokens] = useState<SpotifyTokenPair>();
	const [keepUserSynced, setKeepUserSynced] = useState<boolean>(true);
	const [refreshUser, setRefreshUser] = useState<boolean>(false);
	const [roomPlaying, setRoomPlaying] = useReducer(
		(state: boolean, action: RoomSongDto | undefined) => {
			if (action) {
				console.log("action.startTime");
				console.log(action.startTime);
				console.log(typeof action.startTime);

				//note action.startTime is TZ time as "2024-09-23T12:29:31.682Z"
				//convert to Date object
				let st: Date | undefined;
				if (typeof action.startTime === "string") {
					st = new Date(action.startTime);
				} else {
					st = action.startTime;
				}
				if (st && st.getTime() < Date.now()) {
					if (!action.pauseTime) {
						return true;
					}
					return true;
				}
			} else {
				return false;
			}
			return state;
		},
		false,
	);
	const {
		socketState,
		updateState,
		socketEventsReceived,
		handleReceivedEvent,
	} = useLiveState();
	const socketRef = useRef<Socket | null>(null);
	const [socketCreationTime, setSocketCreationTime] = useState<Date>(
		new Date(0),
	);
	const [idSendTime, setIDSendTime] = useState<Date>(new Date(0));
	const [roomJoinSendTime, setRoomJoinSendTime] = useState<Date>(new Date(0));
	const [dmJoinSendTime, setdmJoinSendTime] = useState<Date>(new Date(0));
	const [recentDMs, setRecentDMs] = useState<
		{ message: DirectMessageDto; room?: RoomDto }[]
	>([]);
	const [fetchRecentDMs, setFetchRecentDMs] = useState<boolean>(true);
	const intervalRef = useRef<NodeJS.Timeout>();

	const sendIdentity = useCallback(
		(socket: Socket) => {
			console.log("Sending identity to server");
			if (
				currentUser &&
				!socketState.sentIdentity &&
				!socketState.identityConfirmed
			) {
				setIDSendTime(new Date());
				const input: ChatEventDto = {
					userID: currentUser.userID,
				};
				socket.emit(SOCKET_EVENTS.CONNECT_USER, JSON.stringify(input));
				updateState({ type: actionTypes.SENT_IDENTITY });
			}
		},
		[
			currentUser,
			socketState.identityConfirmed,
			socketState.sentIdentity,
			updateState,
		],
	);

	const updateRoomQueue = useCallback((queue: RoomSongDto[]) => {
		if (queue.length === 0) {
			setRoomQueue([]);
			setCurrentSong(undefined);
			setRoomPlaying(undefined);
			return;
		}
		console.log(`Room queue updating with input:`);
		console.log(queue);
		queue = queue.sort((a, b) => a.score - b.score);
		console.log(`Room queue post-sort:`);
		console.log(queue);
		setRoomQueue(queue);
		setCurrentSong(queue[0]);
		setRoomPlaying(queue[0]);
	}, []);

	const spotifyAuth: SpotifyAuth = useMemo(
		() => ({
			exchangeCodeWithBackend: async (
				code: string,
				state: string,
				redirectURI: string,
			): Promise<SpotifyCallbackResponse> => {
				try {
					return authAPI
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
								console.error(error);
								throw new Error("Error getting user");
							}
						});
				} catch (error) {
					console.error(error);
					console.error(
						"Something went wrong while exchanging code with backend",
					);
					throw new Error(
						"Something went wrong while exchanging code with backend",
					);
				}
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
			userlessAPI: SpotifyApi.withClientCredentials(
				SPOTIFY_CLIENT_ID,
				SPOTIFY_CLIENT_SECRET,
				[],
			),
		}),
		[authAPI, authenticated, spotifyTokens],
	);

	// Method to send a ping and wait for a response or timeout
	const sendPing = useCallback(
		(timeout: number = TIMEOUT): Promise<void> => {
			if (pingSent) {
				console.log("A ping is already waiting for a response. Please wait.");
				return Promise.resolve();
			}
			const socket = socketRef.current;
			if (socket !== null && socket.connected) {
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
		},
		[pingSent],
	);

	const getTimeOffset = useCallback(() => {
		const socket = socketRef.current;
		if (socket !== null && socket.connected) {
			socket.emit("time_sync", { t0: Date.now() });
		}
	}, []);

	const pollLatency = useCallback(() => {
		sendPing().then(() => {
			console.log("Ping sent");
			getTimeOffset();
			console.log("Awaiting time offset");
		});
	}, [getTimeOffset, sendPing]);

	const roomControls: RoomControls = useRoomControls({
		currentUser,
		keepUserSynced,
		currentRoom,
		socket: socketRef.current,
		currentSong,
		roomQueue,
		setRoomQueue,
		spotifyTokens,
		spotifyAuth,
		roomPlaying,
		pollLatency,
	});

	const setRoomID = useCallback(
		(roomID: string) => {
			console.log(`setRoomID`);
			if (!currentRoom || currentRoom.roomID !== roomID) {
				rooms
					.getRoomInfo(roomID)
					.then((room: AxiosResponse<RoomDto>) => {
						if (room.status === 401) {
							//Unauthorized
							//Auth header is either missing or invalid
						} else if (room.status === 500) {
							//Internal Server Error
							//Something went wrong in the backend (unlikely lmao)
							throw new Error("Internal Server Error");
						} else {
							const r: RoomDto = room.data;
							setCurrentRoom(r);
							roomControls.requestRoomQueue();
						}
					})
					.catch((error) => {
						if (error instanceof RequiredError) {
							// a required field is missing
							throw new Error("Parameter missing from request to get room");
						} else {
							// some other error
							throw new Error("Error getting room");
						}
					});
				rooms
					.getRoomUsers(roomID)
					.then((users: AxiosResponse<UserDto[]>) => {
						if (users.status === 401) {
							//Unauthorized
							//Auth header is either missing or invalid
							setRoomParticipants([]);
						} else if (users.status === 500) {
							//Internal Server Error
							//Something went wrong in the backend (unlikely lmao)
							setRoomParticipants([]);
							throw new Error("Internal Server Error");
						} else {
							setRoomParticipants(users.data);
						}
					})
					.catch((error) => {
						setRoomParticipants([]);
						if (error instanceof RequiredError) {
							// a required field is missing
							throw new Error(
								"Parameter missing from request to get room users",
							);
						} else {
							// some other error
							throw new Error("Error getting room users");
						}
					});
			}
		},
		[roomControls, rooms],
	);

	const joinRoom = useCallback<(roomID: string) => void>(
		(roomID: string) => {
			if (!currentUser) {
				console.error("User cannot join room without being logged in");
				return;
			}

			setRoomID(roomID);

			const socket = socketRef.current;
			if (socket !== null && socket.connected) {
				setRoomJoinSendTime(new Date());
				// pollLatency();
				const input: ChatEventDto = {
					userID: currentUser.userID,
					body: {
						messageID: "",
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
		},
		[currentUser, roomControls, setRoomID, updateState],
	);

	const resetRoom = () => {
		setCurrentRoom(undefined);
		setCurrentSong(undefined);
		setRoomQueue([]);
		setRoomParticipants([]);
		setCurrentRoomVotes([]);
		setRoomMessages([]);
		setRoomEmojiObjects([]);
		setRoomPlaying(undefined);
		updateState({ type: actionTypes.CLEAR_ROOM_STATE });
	};

	const leaveRoom = useCallback(() => {
		// pollLatency();
		if (!currentUser) {
			console.error("User cannot leave room without being logged in");
			return;
		}

		if (!currentRoom) {
			console.error("User cannot leave room without being in a room");
			return;
		}

		const socket = socketRef.current;
		updateState({ type: actionTypes.START_ROOM_LEAVE });
		if (socket !== null && socket.connected) {
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
			socket.emit(SOCKET_EVENTS.LEAVE_ROOM, JSON.stringify(input));
		}
		resetRoom();
	}, [currentRoom, currentUser, updateState]);

	const dmControls: DirectMessageControls = useDirectMessageControls({
		currentUser,
		dmParticipants,
		socket: socketRef.current,
		pollLatency,
	});

	const enterDM = useCallback(
		(usernames: string[]) => {
			// pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}
			const promises: Promise<UserDto>[] = usernames.map((username) =>
				getUser(username),
			);
			promises.push();
			Promise.all(promises)
				.then((dmUsers) => {
					const socket = socketRef.current;
					setDmParticipants(dmUsers);
					if (socket !== null && socket.connected) {
						setdmJoinSendTime(new Date());
						const input = {
							userID: currentUser.userID,
							participantID: dmUsers[0].userID,
						};
						socket.emit(SOCKET_EVENTS.ENTER_DM, JSON.stringify(input));
						updateState({ type: actionTypes.REQUEST_DM_JOIN });
						dmControls.requestDirectMessageHistory();
						updateState({ type: actionTypes.DMS_REQUESTED });

						users
							.getDMsByUsername(dmUsers[0].username)
							.then((dmsResponse) => {
								const dms = dmsResponse.data;
								const dmHistory = dms.map(
									(msg: DirectMessageDto) =>
										({
											message: msg,
											me: msg.sender.userID === currentUser.userID,
											messageSent: true,
										}) as DirectMessage,
								);
								setDirectMessages(dmHistory);
							})
							.catch((error) => {
								console.error("Failed to get direct messages:", error);
							});
					}
				})
				.catch((error) => {
					console.error("Failed to get user info:", error);
				});
		},
		[currentUser, dmControls, getUser, updateState],
	);

	const leaveDM = useCallback(() => {
		// pollLatency();
		if (socketState.dmJoined) {
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}
			const socket = socketRef.current;
			if (socket !== null && socket.connected) {
				const input = {
					userID: currentUser.userID,
				};
				socket.emit(SOCKET_EVENTS.EXIT_DM, JSON.stringify(input));
				updateState({ type: actionTypes.REQUEST_DM_LEAVE });
				setDmParticipants([]);
				setDirectMessages([]);
				updateState({ type: actionTypes.CLEAR_DM_STATE });
			}
		}
	}, [currentUser, socketState.dmJoined, updateState]);

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
		[backendLatency, pollLatency, timeOffset],
	);

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

	const getUserDetails = useCallback(
		async (spotifyAuth: SpotifyAuth) => {
			if (tokenState.token !== null) {
				console.log(`getUserDetails`);
				if (!currentUser || refreshUser) {
					console.log(`getUserDetails: getting user`);
					users
						.getProfile()
						.then((u: AxiosResponse<UserDto>): void => {
							if (u.status === 401) {
								//Unauthorized
								//Auth header is either missing or invalid
								setCurrentUser(undefined);
							} else if (u.status === 500) {
								//Internal Server Error
								//Something went wrong in the backend (unlikely lmao)
								throw new Error("Internal Server Error");
							} else {
								setCurrentUser(u.data);
								setRefreshUser(false);
							}
						})
						.catch((error: Error): void => {
							if (error instanceof RequiredError) {
								// a required field is missing
								throw new Error("Parameter missing from request to get user");
							} else {
								// some other error
								throw new Error("Error getting user");
							}
						});
				}

				if (userBookmarks.length === 0) {
					console.log(`getUserDetails: getting bookmarks`);
					bookmarks.getBookmarks(users).then((fetchedBookmarks) => {
						setUserBookmarks(fetchedBookmarks);
					});
				}

				// get spotify tokens
				if (!spotifyTokens) {
					console.log(`getUserDetails: getting spotify tokens`);
					spotifyAuth
						.getSpotifyTokens()
						.then((t) => {
							if (t !== null) {
								setSpotifyTokens(t);
								roomControls.playbackHandler.getDevices();
							}
						})
						.catch((error) => {
							console.error("Failed to get Spotify tokens:", error);
						});
				}
			}
		},
		[
			currentUser,
			refreshUser,
			roomControls.playbackHandler,
			spotifyTokens,
			tokenState.token,
			userBookmarks.length,
			users,
		],
	);

	// Fetch chats from backend
	const fetchChats = useCallback(async () => {
		if (!currentUser) {
			if (!refreshUser) {
				setRefreshUser(true);
			}
			return;
		}
		try {
			const chatResponse = await users.getDMs();
			if (chatResponse.status !== 200) {
				//Unauthorized
				//Auth header is either missing or invalid
				return;
			}
			const chats: DirectMessageDto[] = chatResponse.data;
			const roomIDs: string[] = [];
			for (const message of chats) {
				if (message.bodyIsRoomID) {
					// shared room is: ##roomID##
					const roomID = message.messageBody.substring(
						2,
						message.messageBody.length - 2,
					);
					roomIDs.push(roomID);
				}
			}
			const roomsPromise: AxiosResponse<RoomDto[]> =
				await rooms.getRooms(roomIDs);
			if (roomsPromise.status !== 200) {
				return;
			}
			const sharedRooms: RoomDto[] = roomsPromise.data;
			const fetchedRecentDMs: {
				message: DirectMessageDto;
				room?: RoomDto;
			}[] = [];
			for (let i = 0, n = chats.length; i < n; i++) {
				const message = chats[i];
				if (message.bodyIsRoomID) {
					// shared room is: ##roomID##
					const roomID = message.messageBody.substring(
						2,
						message.messageBody.length - 2,
					);
					const r = sharedRooms.find((room) => room.roomID === roomID);
					if (r) {
						const room: RoomDto = r;
						fetchedRecentDMs.push({ message, room });
						continue;
					}
				}
				fetchedRecentDMs.push({ message });
			}
			setRecentDMs(fetchedRecentDMs);
		} catch (error) {
			console.log(error);
		}
	}, [currentUser, refreshUser, rooms, users]);

	const attachListeners = useCallback(
		(socket: Socket | null) => {
			if (socket !== null) {
				socket.removeAllListeners();

				if (!currentUser) {
					console.error(
						"Cannot listen for socket events without being logged in",
					);
					return;
				}

				socket.on(SOCKET_EVENTS.USER_JOINED_ROOM, (response: ChatEventDto) => {
					handleReceivedEvent(SOCKET_EVENTS.USER_JOINED_ROOM);
					if (response.userID !== null) {
						if (response.userID === currentUser.userID) {
							updateState({ type: actionTypes.ROOM_JOIN_CONFIRMED });
						}
						const joinedParticipant = roomParticipants.find(
							(p) => p.userID === response.userID,
						);
						if (!joinedParticipant && currentRoom) {
							setRoomID(currentRoom.roomID); //will update room info & participants
						}
					}
					roomControls.requestLiveChatHistory();
					roomControls.requestRoomQueue();
				});

				socket.on(
					SOCKET_EVENTS.LIVE_CHAT_HISTORY,
					(history: LiveChatMessageDto[]) => {
						handleReceivedEvent(SOCKET_EVENTS.LIVE_CHAT_HISTORY);
						const chatHistory = history.map((msg) => ({
							message: msg,
							me: msg.sender.userID === currentUser.userID,
						}));
						setRoomMessages(chatHistory);
					},
				);

				socket.on(SOCKET_EVENTS.LIVE_MESSAGE, (newMessage: ChatEventDto) => {
					handleReceivedEvent(SOCKET_EVENTS.LIVE_MESSAGE);
					if (!socketState.roomChatRequested || !socketState.roomChatReceived) {
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
				});

				socket.on(SOCKET_EVENTS.USER_LEFT_ROOM, (response: ChatEventDto) => {
					handleReceivedEvent(SOCKET_EVENTS.USER_LEFT_ROOM);
					if (response.userID !== null) {
						if (response.userID === currentUser.userID) {
							updateState({ type: actionTypes.ROOM_LEAVE_CONFIRMED });
						}
						const joinedParticipant = roomParticipants.find(
							(p) => p.userID === response.userID,
						);
						if (!joinedParticipant && currentRoom) {
							setRoomID(currentRoom.roomID); //will update room info & participants
						}
					}
				});

				socket.on(SOCKET_EVENTS.ERROR, (response: ChatEventDto) => {
					handleReceivedEvent(SOCKET_EVENTS.ERROR);
					console.error("Socket Error from Server:", response.errorMessage);
				});

				socket.on("connect", () => {
					handleReceivedEvent("connect");
					console.log("Connected to the server!");
					if (socket === null) {
						console.error("Socket connection not initialized");
						throw new Error("Socket connection not initialized");
					}
					sendIdentity(socket);
				});

				socket.on(SOCKET_EVENTS.CONNECTED, (response: ChatEventDto) => {
					handleReceivedEvent(SOCKET_EVENTS.CONNECTED);
					console.log("Identity confirmed by server");
					if (currentRoom) {
						joinRoom(currentRoom.roomID);
					}
				});

				socket.on("connect_error", (error) => {
					handleReceivedEvent("connect_error");
					if (socket.active) {
						// temporary failure, the socket will automatically try to reconnect
						console.error(
							"Socket had an error while connecting. Socket.io will reconnect accordingly",
						);
					} else {
						console.error("Failed connecting to the socket server");
						console.error("Socket.io reason for connection failure: " + error);
						socket.connect();
					}
				});

				socket.on("disconnect", (reason) => {
					handleReceivedEvent("disconnect");
					if (socket.active) {
						// temporary disconnection, the socket will automatically try to reconnect
						console.error(
							"Socket temporarily disconnected. Socket.io will reconnect accordingly",
						);
					} else {
						console.error("Disconnected from the server");
						console.error("Socket.io reason for disconnection: " + reason);
					}
				});

				socket.on(
					SOCKET_EVENTS.CURRENT_MEDIA,
					async (response: PlaybackEventDto) => {
						handleReceivedEvent(SOCKET_EVENTS.CURRENT_MEDIA);
						if (!response.UTC_time) {
							console.log("UTC time not found");
							return;
						}

						if (!response.spotifyID) {
							throw new Error("Server did not return song ID");
						}

						if (response.song && response.song !== null) {
							if (
								!currentSong ||
								response.song.spotifyID !== currentSong.spotifyID
							) {
								setCurrentSong(response.song);
								setRoomPlaying(response.song);
							}
						}
						if (
							!(await roomControls.playbackHandler.userListeningToRoom(true))
						) {
							if (!currentSong) {
								return;
							}
							if (!keepUserSynced) {
								return;
							}
							if (
								roomControls.state &&
								!roomControls.state.is_playing &&
								roomControls.state.item.id !== currentSong.spotifyID
							) {
								await roomControls.playbackHandler.handlePlayback("play");
							}
						}
					},
				);

				socket.on(
					SOCKET_EVENTS.PLAY_MEDIA,
					async (response: PlaybackEventDto) => {
						handleReceivedEvent(SOCKET_EVENTS.PLAY_MEDIA);
						if (!response.UTC_time) {
							console.log("UTC time not found");
							return;
						}

						if (!response.spotifyID) {
							throw new Error("Server did not return song ID");
						}

						if (response.song && response.song !== null) {
							if (
								!currentSong ||
								response.song.spotifyID !== currentSong.spotifyID
							) {
								setCurrentSong(response.song);
								setRoomPlaying(response.song);
							}
						}

						await fetchSongInfo([response.spotifyID]); //pre-fetch spotify info for later
						if (
							!(await roomControls.playbackHandler.userListeningToRoom(true))
						) {
							if (!currentSong) {
								return;
							}
							if (!keepUserSynced) {
								return;
							}
							if (
								roomControls.state &&
								!roomControls.state.is_playing &&
								roomControls.state.item.id !== currentSong.spotifyID
							) {
								await roomControls.playbackHandler.handlePlayback("play");
							}
						}
					},
				);

				socket.on(
					SOCKET_EVENTS.PAUSE_MEDIA,
					async (response: PlaybackEventDto) => {
						handleReceivedEvent(SOCKET_EVENTS.PAUSE_MEDIA);
						if (await roomControls.playbackHandler.userListeningToRoom(true)) {
							await roomControls.playbackHandler.handlePlayback("pause");
						}
					},
				);

				socket.on(
					SOCKET_EVENTS.STOP_MEDIA,
					async (response: PlaybackEventDto) => {
						handleReceivedEvent(SOCKET_EVENTS.STOP_MEDIA);
						if (await roomControls.playbackHandler.userListeningToRoom(true)) {
							await roomControls.playbackHandler.handlePlayback("pause");
						}
					},
				);

				socket.on("time_sync_response", (data) => {
					handleReceivedEvent("time_sync_response");
					const t2 = Date.now();
					const t1 = data.t1;
					const offset = (t1 - data.t0 + (data.t2 - t2)) / 2;
					setTimeOffset(offset);
					console.log(`Time offset: ${offset} ms`);
				});

				socket.on(SOCKET_EVENTS.DIRECT_MESSAGE, (data: DirectMessageDto) => {
					handleReceivedEvent(SOCKET_EVENTS.DIRECT_MESSAGE);
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
				});

				socket.on(SOCKET_EVENTS.USER_ONLINE, (data: { userID: string }) => {
					handleReceivedEvent(SOCKET_EVENTS.USER_ONLINE);
					if (data.userID === currentUser.userID) {
						updateState({ type: actionTypes.DM_JOIN_CONFIRMED });
					}
					//we can use this to update the user's status
				});

				socket.on(SOCKET_EVENTS.USER_OFFLINE, (data: { userID: string }) => {
					handleReceivedEvent(SOCKET_EVENTS.USER_OFFLINE);
					if (data.userID === currentUser.userID) {
						updateState({ type: actionTypes.DM_LEAVE_CONFIRMED });
					}
					//we can use this to update the user's status
				});

				// (unused) for edits and deletes of direct messages
				socket.on(SOCKET_EVENTS.CHAT_MODIFIED, (data) => {
					handleReceivedEvent(SOCKET_EVENTS.CHAT_MODIFIED);
				});

				socket.on(SOCKET_EVENTS.DM_HISTORY, (data: DirectMessageDto[]) => {
					handleReceivedEvent(SOCKET_EVENTS.DM_HISTORY);
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
				});

				socket.on(
					SOCKET_EVENTS.EMOJI_REACTION,
					(reaction: EmojiReactionDto) => {
						handleReceivedEvent(SOCKET_EVENTS.EMOJI_REACTION);
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

				socket.on(
					SOCKET_EVENTS.QUEUE_STATE,
					(response: {
						room: RoomDto;
						songs: RoomSongDto[];
						votes: VoteDto[];
					}) => {
						handleReceivedEvent(SOCKET_EVENTS.QUEUE_STATE);
						setCurrentRoom(response.room);
						updateRoomQueue(response.songs);
						setCurrentRoomVotes(response.votes);
					},
				);

				socket.on(SOCKET_EVENTS.SONG_ADDED, (newSongs: QueueEventDto) => {
					handleReceivedEvent(SOCKET_EVENTS.SONG_ADDED);
					const newQueue = [...roomQueue];
					for (let i = 0; i < newSongs.songs.length; i++) {
						if (
							newQueue.find(
								(song) => song.spotifyID === newSongs.songs[i].spotifyID,
							)
						) {
							continue;
						}
						newQueue.push(newSongs.songs[i]);
					}
					updateRoomQueue(newQueue);
				});

				socket.on(SOCKET_EVENTS.SONG_REMOVED, (removedSong: QueueEventDto) => {
					handleReceivedEvent(SOCKET_EVENTS.SONG_REMOVED);
					let newQueue = [...roomQueue];
					for (let i = 0; i < removedSong.songs.length; i++) {
						newQueue = newQueue.filter(
							(song) => song.spotifyID !== removedSong.songs[i].spotifyID,
						);
					}
					updateRoomQueue(newQueue);
				});

				socket.on(SOCKET_EVENTS.VOTE_UPDATED, (updatedSong: QueueEventDto) => {
					handleReceivedEvent(SOCKET_EVENTS.VOTE_UPDATED);
					const i = roomQueue.findIndex(
						(song) => song.spotifyID === updatedSong.songs[0].spotifyID,
					);
					if (i === -1) {
						return;
					}
					const newQueue = [...roomQueue];
					newQueue[i] = updatedSong.songs[0];
					updateRoomQueue(newQueue);
				});
			}
		},
		[
			currentRoom,
			currentSong,
			currentUser,
			dmControls,
			handleReceivedEvent,
			joinRoom,
			keepUserSynced,
			roomControls,
			roomMessages,
			roomParticipants,
			roomQueue,
			sendIdentity,
			setRoomID,
			socketState.roomChatReceived,
			socketState.roomChatRequested,
			updateRoomQueue,
			updateState,
		],
	);

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
		// updateState({ type: actionTypes.SOCKET_INITIALIZED });
		console.log("==================== CREATING SOCKET ====================");
		if (socketRef.current !== null) {
			return socketRef.current;
		} else if (socketRef.current === null && currentUser) {
			const s = io(utils.API_BASE_URL + "/live", {
				transports: ["websocket"],
				timeout: TIMEOUT,
			});
			setSocketCreationTime(new Date());
			attachListeners(s);
			return s;
		}
		return null;
	}, [
		attachListeners,
		currentUser,
		socketState.socketConnected,
		socketState.socketInitialized,
	]);
	const createSocket = useCallback(
		(authenticated: boolean) => {
			if (socketRef.current !== null) {
				if (socketRef.current.connected || !socketRef.current.disconnected) {
					if (!socketRef.current.active) {
						socketRef.current.connect();
					}
				}
				console.error("Socket connection already created");
				return;
			}
			if (
				authenticated &&
				(socketRef.current === null || !socketState.socketConnected)
			) {
				if (socketRef.current === null) {
					socketRef.current = createSocketConnection();
					setIDSendTime(new Date(0));
					setRoomJoinSendTime(new Date(0));
					setdmJoinSendTime(new Date(0));
					handleReceivedEvent(RESET_EVENTS);
				} else {
					if (
						socketCreationTime !== new Date(0) &&
						socketCreationTime.getSeconds() - new Date().getSeconds() > TIMEOUT
					) {
						console.log("Reconnecting socket");
						handleReceivedEvent(RESET_EVENTS);
						updateState({ type: actionTypes.RESET });
						return;
					}
				}
				// if (socketRef.current !== null && !socketState.socketInitialized) {
				// 	initializeSocket();
				// }
			}
		},
		[
			createSocketConnection,
			handleReceivedEvent,
			socketCreationTime,
			socketState.socketConnected,
		],
	);
	const getSocket = useCallback<() => Socket | null>(() => {
		if (socketRef.current === null && currentUser) {
			createSocket(currentUser && authenticated);
		}
		if (socketRef.current === null) {
			// throw new Error("Socket connection not initialized");
			console.error("Socket connection not initialized");
		}
		return socketRef.current;
	}, [currentUser, createSocket, authenticated]);

	const initializeSocket = useCallback<() => void>(() => {
		console.log("Initializing socket");
		if (!currentUser) {
			return;
		}
		if (socketRef.current === null) {
			// createSocket();
		}

		if (socketRef.current !== null) {
			if (!socketState.socketInitialized && currentUser !== undefined) {
				attachListeners(socketRef.current);
				if (!socketState.sentIdentity) {
					sendIdentity(socketRef.current);
				}
				updateState({ type: actionTypes.SOCKET_INITIALIZED });
				pollLatency();
			}

			if (
				!socketState.roomJoined &&
				currentRoom &&
				currentRoom.roomID &&
				roomJoinSendTime !== new Date(0) &&
				roomJoinSendTime.getSeconds() - new Date().getSeconds() > TIMEOUT
			) {
				joinRoom(currentRoom.roomID);
			}
		}
	}, [
		attachListeners,
		currentRoom,
		currentUser,
		joinRoom,
		pollLatency,
		roomJoinSendTime,
		sendIdentity,
		socketState.roomJoined,
		socketState.sentIdentity,
		socketState.socketInitialized,
		updateState,
	]);

	const disconnectSocket = useCallback(() => {
		if (socketRef.current !== null) {
			if (socketState.roomJoined) {
				leaveRoom();
			}
			if (socketState.dmJoined) {
				leaveDM();
			}
			socketRef.current.removeAllListeners();
			socketRef.current.disconnect();
			updateState({ type: actionTypes.RESET });
			socketRef.current = null;
			setSocketCreationTime(new Date(0));
			setIDSendTime(new Date(0));
			setRoomJoinSendTime(new Date(0));
			setdmJoinSendTime(new Date(0));
			handleReceivedEvent(RESET_EVENTS);
		}
	}, [
		handleReceivedEvent,
		leaveDM,
		leaveRoom,
		socketState.dmJoined,
		socketState.roomJoined,
		updateState,
	]);

	// on mount, initialize the socket
	// useEffect(() => {
	// 	socketRef.current = createSocketConnection();
	// 	handleReceivedEvent(RESET_EVENTS);
	// 	initializeSocket();
	// 	const s = socketRef.current;
	// 	return () => {
	// 		disconnectSocket();
	// 		if (s !== null) {
	// 			leaveRoom();
	// 			s.disconnect();
	// 		}
	// 	};
	// }, []);

	//if auth info changes, get user info & spotify tokens
	useEffect(() => {
		console.log("Running main effect");
		// console.table(socketState);
		// console.table(socketEventsReceived);

		// if user is not authenticated, disconnect from socket
		if (!currentUser || !authenticated) {
			if (socketRef.current !== null) {
				if (socketRef.current.connected || !socketRef.current.disconnected) {
					socketRef.current.disconnect();
					console.error("Socket disconnected. User is not authenticated");
				}
				disconnectSocket();
				socketRef.current.removeAllListeners();
				socketRef.current.disconnect();
				updateState({ type: actionTypes.RESET });
				socketRef.current = null;
				handleReceivedEvent(RESET_EVENTS);
			} else {
				// user is not authenticated & socket doesn't exist anyway
				// ignore
				console.error("User is not authenticated & socket doesn't exist");
				getUserDetails(spotifyAuth);
			}
			updateState({ type: actionTypes.RESET });
			return;
		}

		//// from here on, we know that the user is authenticated
		if (socketRef.current === null) {
			if (authenticated) {
				if (currentUser) {
					createSocket(currentUser && authenticated);
				} else {
					console.error("User is authenticated but we don't have their info");
					getUserDetails(spotifyAuth);
				}
			}
			return;
		}

		if (fetchRecentDMs) {
			fetchChats();
			setFetchRecentDMs(false);
		}

		// reconnect if socket is disconnected
		if (
			!socketState.socketConnected &&
			(!socketRef.current.connected || socketRef.current.disconnected) &&
			socketCreationTime !== new Date(0) &&
			socketCreationTime.getSeconds() - new Date().getSeconds() > TIMEOUT
		) {
			console.log("Reconnecting socket");
			handleReceivedEvent(RESET_EVENTS);
			updateState({ type: actionTypes.RESET });
			if (!socketRef.current.active) {
				socketRef.current.connect();
			}
			return;
		}

		//// from here on, we know that the socket exists and is connected

		// fix inconsistencies in handshake 'connected'
		// if (!socketState.socketConnected) {
		// 	if (socketRef.current.connected) {
		// 		updateState({ type: actionTypes.SOCKET_CONNECTED });
		// 	}
		// }

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

		if (
			!socketState.identityConfirmed &&
			idSendTime !== new Date(0) &&
			idSendTime.getSeconds() - new Date().getSeconds() > TIMEOUT
		) {
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

			if (
				!socketState.dmJoined &&
				dmJoinSendTime !== new Date(0) &&
				dmJoinSendTime.getSeconds() - new Date().getSeconds() > TIMEOUT
			) {
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

			if (
				!socketState.roomJoined &&
				roomJoinSendTime !== new Date(0) &&
				roomJoinSendTime.getSeconds() - new Date().getSeconds() > TIMEOUT
			) {
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
			// updateState({ type: actionTypes.CLEAR_ROOM_STATE });
			users
				.getCurrentRoom()
				.then((r) => {
					if (r.status >= 200 && r.status < 300) {
						console.log(`User was already in room`);
						console.log(r.data);
						setRoomID(r.data.roomID);
					}
				})
				.catch(() => {
					console.error(`Something bad happened`);
				});
		}
		// }, [
		// 	authenticated,
		// 	currentRoom,
		// 	currentSong,
		// 	currentUser,
		// 	directMessages,
		// 	dmParticipants,
		// 	roomQueue,
		// 	roomMessages,
		// 	currentRoomVotes,
		// ]);
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
		socketRef.current?.connected,
		socketRef.current?.disconnected,
		tokenState.token,
		users,
		spotifyAuth,
		dmControls,
		roomControls,
		// socketState,
		socketEventsReceived,
		socketCreationTime,
		idSendTime,
		// updateState,
		// disconnectSocket,
		// handleReceivedEvent,
		// getUserDetails,
		// createSocket,
		// initializeSocket,
		// sendIdentity,
		dmJoinSendTime,
		// enterDM,
		// leaveDM,
		roomJoinSendTime,
		// joinRoom,
	]);

	useEffect(() => {
		if (socketRef.current !== null) {
			attachListeners(socketRef.current);
		}
	}, [attachListeners]);

	useEffect(() => {
		if (roomQueue.length > 0) {
			if (!currentSong || roomQueue[0].spotifyID !== currentSong.spotifyID) {
				setCurrentSong(roomQueue[0]);
				setRoomPlaying(currentSong);
			}
		} else {
			if (currentSong) {
				setCurrentSong(undefined);
				setRoomPlaying(undefined);
			}
		}
	}, [roomQueue]);

	useEffect(() => {
		console.log(`refreshUser: ${refreshUser}`);
		getUserDetails(spotifyAuth);
	}, [refreshUser]);

	// on mount
	useEffect(() => {
		const interval = setInterval(() => {
			console.log(`Fetching Spotify tokens...`);
			if (currentUser && authenticated) {
				spotifyAuth.getSpotifyTokens();
			}
		}, 60 * 1000);
		intervalRef.current = interval;
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {}, []);

	return (
		<LiveContext.Provider
			value={{
				socketHandshakes: socketState,

				currentUser,
				refreshUser,
				setRefreshUser,
				userBookmarks,
				recentDMs,
				setFetchRecentDMs,

				getSocket,
				sendPing,
				getTimeOffset,
				pollLatency,

				currentRoom,
				currentSong,
				joinRoom,
				leaveRoom,
				roomMessages,
				roomQueue,
				roomParticipants,
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
