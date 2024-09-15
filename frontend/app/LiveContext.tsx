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

const clientId = SPOTIFY_CLIENT_ID;
if (!clientId) {
	throw new Error(
		"No Spotify client ID (SPOTIFY_CLIENT_ID) provided in environment variables",
	);
}

const TIMEOUT = 5000000;
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

interface SpotifyAuth {
	exchangeCodeWithBackend: (
		code: string,
		state: string,
		redirectURI: string,
	) => Promise<SpotifyCallbackResponse>;
	getSpotifyTokens: () => Promise<SpotifyTokenPair | null>;
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

interface DirectMessageControls {
	sendDirectMessage: (message: DirectMessage) => void;
	editDirectMessage: (message: DirectMessage) => void;
	deleteDirectMessage: (message: DirectMessage) => void;
	requestDirectMessageHistory: () => void;
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
	const [socketHandshakesCompleted, setSocketHandshakesCompleted] = useState<{
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
	}>({
		socketConnected: false,
		socketInitialized: false,
		sentIdentity: false,
		identityConfirmed: false,
		sentRoomJoin: false,
		roomJoined: false,
		roomChatRequested: false,
		roomChatReceived: false,
		roomQueueRequested: false,
		roomQueueReceived: false,
		sentDMJoin: false,
		dmJoined: false,
		dmsRequested: false,
		dmsReceived: false,
	});

	const sendIdentity = useCallback((socket: Socket) => {
		if (
			currentUser &&
			!socketHandshakesCompleted.sentIdentity &&
			!socketHandshakesCompleted.identityConfirmed
		) {
			const input: ChatEventDto = {
				userID: currentUser.userID,
			};
			socket.emit("connectUser", JSON.stringify(input));
			setSocketHandshakesCompleted((prev) => {
				return {
					...prev,
					sentIdentity: true,
				};
			});
		}
	}, []);

	const createSocketConnection = useCallback((): Socket | null => {
		if (socketHandshakesCompleted.socketConnected) {
			if (socketHandshakesCompleted.socketInitialized) {
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
		setSocketHandshakesCompleted({
			socketConnected: false,
			socketInitialized: false,
			sentIdentity: false,
			identityConfirmed: false,
			sentRoomJoin: false,
			roomJoined: false,
			roomChatRequested: false,
			roomChatReceived: false,
			roomQueueRequested: false,
			roomQueueReceived: false,
			sentDMJoin: false,
			dmJoined: false,
			dmsRequested: false,
			dmsReceived: false,
		});
		console.log("==================== CREATING SOCKET ====================");
		if (socketRef.current === null && currentUser) {
			const s = io(utils.API_BASE_URL + "/live", {
				transports: ["websocket"],
				timeout: TIMEOUT,
			});
			s.on("connect", () => {
				console.log("Connected to the server!");
				setSocketHandshakesCompleted((prev) => {
					return {
						...prev,
						socketConnected: true,
					};
				});
				console.log(s.connected);
				if (!socketHandshakesCompleted.sentIdentity) {
					sendIdentity(s);
				}
				s.on("connected", (response) => {
					console.log("Identity confirmed by server");
					setSocketHandshakesCompleted((prev) => {
						return {
							...prev,
							sentIdentity: true,
							identityConfirmed: true,
						};
					});
				});
			});
			s.on("disconnect", () => {
				console.log("Disconnected from the server");
				setSocketHandshakesCompleted({
					socketConnected: false,
					socketInitialized: false,
					sentIdentity: false,
					identityConfirmed: false,
					sentRoomJoin: false,
					roomJoined: false,
					roomChatRequested: false,
					roomChatReceived: false,
					roomQueueRequested: false,
					roomQueueReceived: false,
					sentDMJoin: false,
					dmJoined: false,
					dmsRequested: false,
					dmsReceived: false,
				});
			});
			s.connect();
			return s;
		}
		return null;
	}, [currentUser, socketHandshakesCompleted]);
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
			console.log(
				"socketInitialized:",
				socketHandshakesCompleted.socketInitialized,
			);
			console.log("mounted:", mounted);
			console.log("currentUser:", currentUser);
			if (
				!socketHandshakesCompleted.socketInitialized &&
				mounted &&
				currentUser !== undefined
			) {
				socketRef.current.on("userJoinedRoom", (response: ChatEventDto) => {
					console.log("SOCKET EVENT: userJoinedRoom", response);
					const u: UserDto = currentUser;
					if (
						response.body &&
						response.body.sender.userID === currentUser.userID
					) {
						setSocketHandshakesCompleted((prev) => {
							return {
								...prev,
								roomJoined: true,
							};
						});
					}
					roomControls.requestLiveChatHistory();
				});

				socketRef.current.on(
					"liveChatHistory",
					(history: LiveChatMessageDto[]) => {
						console.log("SOCKET EVENT: liveChatHistory", history);
						const chatHistory = history.map((msg) => ({
							message: msg,
							me: msg.sender.userID === currentUser.userID,
						}));
						setRoomMessages(chatHistory);
						setSocketHandshakesCompleted((prev) => {
							return {
								...prev,
								roomChatRequested: false,
								roomChatReceived: true,
							};
						});
					},
				);

				socketRef.current.on("liveMessage", (newMessage: ChatEventDto) => {
					console.log("SOCKET EVENT: liveMessage", newMessage);
					if (
						!socketHandshakesCompleted.roomChatRequested ||
						!socketHandshakesCompleted.roomChatReceived
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
				});

				socketRef.current.on("userLeftRoom", (response: ChatEventDto) => {
					console.log("SOCKET EVENT: userLeftRoom", response);
					console.log("User left room:", response);
				});

				socketRef.current.on("error", (response: ChatEventDto) => {
					console.log("SOCKET EVENT: error", response);
					console.error("Error:", response.errorMessage);
				});

				socketRef.current.on("connect", () => {
					console.log("SOCKET EVENT: connect");
					if (socketRef.current === null) {
						console.error("Socket connection not initialized");
						return Promise.reject(
							new Error("Socket connection not initialized"),
						);
					}

					setSocketHandshakesCompleted((prev) => {
						return {
							...prev,
							socketConnected: true,
						};
					});
					sendIdentity(socketRef.current);
				});

				socketRef.current.on("connected", (response: ChatEventDto) => {
					console.log("SOCKET EVENT: connected", response);
					setSocketHandshakesCompleted((prev) => {
						return {
							...prev,
							sentIdentity: true,
							identityConfirmed: true,
						};
					});
					if (currentRoom) {
						joinRoom(currentRoom.roomID);
					}
				});

				socketRef.current.on(
					"playMedia",
					async (response: PlaybackEventDto) => {
						console.log("SOCKET EVENT: playMedia", response);
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
					"pauseMedia",
					async (response: PlaybackEventDto) => {
						console.log("SOCKET EVENT: pauseMedia", response);
						const deviceID =
							await roomControls.playbackHandler.getFirstDevice();
						if (deviceID && deviceID !== null) {
							roomControls.playbackHandler.handlePlayback("pause", deviceID);
						}
					},
				);

				socketRef.current.on(
					"stopMedia",
					async (response: PlaybackEventDto) => {
						console.log("SOCKET EVENT: stopMedia", response);
						const deviceID =
							await roomControls.playbackHandler.getFirstDevice();
						if (deviceID && deviceID !== null) {
							roomControls.playbackHandler.handlePlayback("pause", deviceID);
						}
					},
				);

				socketRef.current.on("time_sync_response", (data) => {
					console.log("SOCKET EVENT: time_sync_response", data);
					const t2 = Date.now();
					const t1 = data.t1;
					const offset = (t1 - data.t0 + (data.t2 - t2)) / 2;
					setTimeOffset(offset);
					console.log(`Time offset: ${offset} ms`);
				});

				socketRef.current.on("directMessage", (data: DirectMessageDto) => {
					console.log("SOCKET EVENT: directMessage", data);
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

				socketRef.current.on("userOnline", (data: { userID: string }) => {
					console.log("SOCKET EVENT: userOnline", data);
					if (data.userID === currentUser.userID) {
						setSocketHandshakesCompleted((prev) => {
							return {
								...prev,
								dmJoined: true,
							};
						});
					}
					//we can use this to update the user's status
				});

				socketRef.current.on("userOffline", (data: { userID: string }) => {
					console.log("SOCKET EVENT: userOffline", data);
					if (data.userID === currentUser.userID) {
						setSocketHandshakesCompleted((prev) => {
							return {
								...prev,
								dmJoined: false,
							};
						});
					}
					//we can use this to update the user's status
				});

				// (unused) for edits and deletes of direct messages
				socketRef.current.on("chatModified", (data) => {});

				socketRef.current.on("dmHistory", (data: DirectMessageDto[]) => {
					console.log("SOCKET EVENT: dmHistory", data);
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
					setSocketHandshakesCompleted((prev) => {
						return {
							...prev,
							dmsRequested: false,
							dmsReceived: true,
						};
					});
				});

				socketRef.current.on("emojiReaction", (reaction: EmojiReactionDto) => {
					console.log("SOCKET EVENT: emojiReaction", reaction);
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
				});

				socketRef.current.on(
					"queueState",
					(response: {
						room: RoomDto;
						songs: RoomSongDto[];
						votes: VoteDto[];
					}) => {
						console.log("SOCKET EVENT: queueState", response);
						setCurrentRoom(response.room);
						updateRoomQueue(response.songs);
						setCurrentRoomVotes(response.votes);
					},
				);

				socketRef.current.on("songAdded", (newSong: QueueEventDto) => {
					console.log("SOCKET EVENT: songAdded", newSong);
					const newQueue = [...roomQueue, newSong.song];
					updateRoomQueue(newQueue);
				});

				socketRef.current.on("songRemoved", (removedSong: QueueEventDto) => {
					console.log("SOCKET EVENT: songRemoved", removedSong);
					let newQueue = [...roomQueue];
					newQueue = newQueue.filter(
						(song) => song.spotifyID !== removedSong.song.spotifyID,
					);
					updateRoomQueue(newQueue);
				});

				socketRef.current.on("voteUpdated", (updatedSong: QueueEventDto) => {
					console.log("SOCKET EVENT: voteUpdated", updatedSong);
					const i = roomQueue.findIndex(
						(song) => song.spotifyID === updatedSong.song.spotifyID,
					);
					if (i === -1) {
						return;
					}
					const newQueue = [...roomQueue];
					newQueue[i] = updatedSong.song;
					updateRoomQueue(newQueue);
				});

				console.log("ajbfskdbfksdksdkjfnsdkjnvjkdnjkdsn");
				socketRef.current.connect();
				while (!socketRef.current.connected) {
					console.log("awaiting socket connection");
				}
				sendIdentity(socketRef.current);
				console.log("ajbfskdbfksdksdkjfnsdkjnvjkdnjkdsn");

				setSocketHandshakesCompleted((prev) => {
					return {
						...prev,
						socketInitialized: true,
					};
				});
				pollLatency();
			}

			if (
				!socketHandshakesCompleted.roomJoined &&
				currentRoom &&
				currentRoom.roomID
			) {
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
				(socketHandshakesCompleted.socketConnected &&
					socketRef.current.disconnected))
		) {
			socketRef.current = createSocketConnection();
			if (
				socketRef.current !== null &&
				!socketHandshakesCompleted.socketInitialized
			) {
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
			socket.emit("joinRoom", JSON.stringify(input));

			setSocketHandshakesCompleted((prev) => {
				return {
					...prev,
					sentRoomJoin: true,
				};
			});

			//request chat history
			roomControls.requestLiveChatHistory();
			setSocketHandshakesCompleted((prev) => {
				return {
					...prev,
					roomChatRequested: true,
					roomChatReceived: false,
				};
			});
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
		setSocketHandshakesCompleted((prev) => {
			return {
				...prev,
				roomJoined: false,
			};
		});

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
			socket.emit("leaveRoom", JSON.stringify(input));
		}
		setRoomMessages([]);
		setSocketHandshakesCompleted((prev) => {
			return {
				...prev,
				sentRoomJoin: false,
				roomJoined: false,
				roomChatRequested: false,
				roomChatReceived: false,
				roomQueueRequested: false,
				roomQueueReceived: false,
			};
		});
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
					socket.emit("enterDirectMessage", JSON.stringify(input));
					setSocketHandshakesCompleted((prev) => {
						return {
							...prev,
							sentDMJoin: true,
							dmJoined: false,
						};
					});
					dmControls.requestDirectMessageHistory();
					setSocketHandshakesCompleted((prev) => {
						return {
							...prev,
							dmsRequested: false,
							dmsReceived: false,
						};
					});
				}
			})
			.catch((error) => {
				console.error("Failed to get user info:", error);
			});
	}, []);

	const leaveDM = useCallback(() => {
		pollLatency();
		if (socketHandshakesCompleted.dmJoined) {
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}
			const socket = getSocket();
			if (socket !== null) {
				const input = {
					userID: currentUser.userID,
				};
				socket.emit("exitDirectMessage", JSON.stringify(input));
				console.log("emit exitDirectMessage with body:", input);
				setSocketHandshakesCompleted((prev) => {
					return {
						...prev,
						dmJoined: false,
						dmsRequested: false,
						dmsReceived: true,
					};
				});
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
					socket.emit("directMessage", JSON.stringify(message.message));
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
					socket.emit("modifyDirectMessage", JSON.stringify(payload));
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
				socket.emit("modifyDirectMessage", JSON.stringify(payload));
			},

			requestDirectMessageHistory: function (): void {
				const socket = getSocket();
				if (!socket) {
					console.error("Socket connection not initialized");
					return;
				}

				if (socketHandshakesCompleted.dmsRequested) {
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

				setSocketHandshakesCompleted((prev) => {
					return {
						...prev,
						dmsRequested: true,
						dmsReceived: false,
					};
				});
				const input = {
					userID: currentUser.userID,
					participantID: dmParticipants[0].userID,
				};
				socket.emit("getDirectMessageHistory", JSON.stringify(input));
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
					socket.emit("liveMessage", JSON.stringify(input));
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
				socket.volatile.emit("emojiReaction", JSON.stringify(newReaction));
			},

			requestLiveChatHistory: function (): void {
				const socket = getSocket();
				if (!socket) {
					console.error("Socket connection not initialized");
					return;
				}

				// if (this.requestingLiveChatHistory) {
				if (socketHandshakesCompleted.roomChatRequested) {
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
				socket.emit("getLiveChatHistory", JSON.stringify(input));
				setSocketHandshakesCompleted((prev) => {
					return {
						...prev,
						roomChatRequested: true,
					};
				});
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
				socket.emit("requestQueue", JSON.stringify(input));
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
					socket.emit("initPlay", JSON.stringify(input));
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
					socket.emit("initPause", JSON.stringify(input));
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
					socket.emit("initStop", JSON.stringify(input));
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
					socket.emit("initNext", JSON.stringify(input));
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
					socket.emit("enqueueSong", JSON.stringify(input));
					console.log("emitted: enqueueSong");
					socket.emit("requestQueue", JSON.stringify(input));
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
					socket.emit("dequeueSong", JSON.stringify(input));
					console.log("emitted: dequeueSong");
					socket.emit("requestQueue", JSON.stringify(input));
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
					socket.emit("upvoteSong", JSON.stringify(input));
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
					socket.emit("downvoteSong", JSON.stringify(input));
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
					socket.emit("swapSongVote", JSON.stringify(input));
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
					socket.emit("undoSongVote", JSON.stringify(input));
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
		// socketHandshakesCompleted,
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
			setSocketHandshakesCompleted({
				socketConnected: false,
				socketInitialized: false,
				sentIdentity: false,
				identityConfirmed: false,
				sentRoomJoin: false,
				roomJoined: false,
				roomChatRequested: false,
				roomChatReceived: false,
				roomQueueRequested: false,
				roomQueueReceived: false,
				sentDMJoin: false,
				dmJoined: false,
				dmsRequested: false,
				dmsReceived: false,
			});
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
					setSocketHandshakesCompleted({
						socketConnected: false,
						socketInitialized: false,
						sentIdentity: false,
						identityConfirmed: false,
						sentRoomJoin: false,
						roomJoined: false,
						roomChatRequested: false,
						roomChatReceived: false,
						roomQueueRequested: false,
						roomQueueReceived: false,
						sentDMJoin: false,
						dmJoined: false,
						dmsRequested: false,
						dmsReceived: false,
					});
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
			!socketHandshakesCompleted.socketConnected
		) {
			console.log("Reconnecting socket");
			setSocketHandshakesCompleted({
				socketConnected: false,
				socketInitialized: false,
				sentIdentity: false,
				identityConfirmed: false,
				sentRoomJoin: false,
				roomJoined: false,
				roomChatRequested: false,
				roomChatReceived: false,
				roomQueueRequested: false,
				roomQueueReceived: false,
				sentDMJoin: false,
				dmJoined: false,
				dmsRequested: false,
				dmsReceived: false,
			});
			socketRef.current.connect();
			return;
		}

		//// from here on, we know that the socket exists and is connected

		// fix inconsistencies in handshake 'connected'
		if (!socketHandshakesCompleted.socketConnected) {
			if (socketRef.current.connected) {
				console.log("Socket is connected");
				setSocketHandshakesCompleted((prev) => {
					return {
						...prev,
						socketConnected: true,
					};
				});
			}
		}

		if (!socketHandshakesCompleted.socketInitialized) {
			console.log("Socket is connected but not initialized. Initializing...");
			initializeSocket();
			setSocketHandshakesCompleted(() => {
				return {
					...socketHandshakesCompleted,
					socketInitialized: true,
					sentIdentity: false,
					identityConfirmed: false,
				};
			});
			return;
		}

		//// from here on, we know that the socket is connected and initialized
		// send identity if not sent
		if (!socketHandshakesCompleted.sentIdentity) {
			console.log(
				"User is connected via sockets but identity not sent. Sending identity...",
			);
			sendIdentity(socketRef.current);
			setSocketHandshakesCompleted((prev) => {
				return {
					...prev,
					sentIdentity: true,
					identityConfirmed: false,
				};
			});
			return;
		}

		if (!socketHandshakesCompleted.identityConfirmed) {
			console.log("Identity not confirmed. Retry sending identity...");
			sendIdentity(socketRef.current);
			setSocketHandshakesCompleted((prev) => {
				return {
					...prev,
					sentIdentity: true,
					identityConfirmed: false,
				};
			});
			return;
		}

		// get dms if state appears to expect dms
		// disconnect if otherwise
		// join dms if socket is connected but user is not in dms
		if (dmParticipants.length > 0) {
			if (!socketHandshakesCompleted.sentDMJoin) {
				console.log("User is connected to dms but not joined. Joining...");
				enterDM(dmParticipants.map((u) => u.username));
				setSocketHandshakesCompleted((prev) => {
					return {
						...prev,
						sentDMJoin: true,
						dmJoined: false,
						dmsRequested: false,
						dmsReceived: false,
					};
				});
				return;
			}

			if (!socketHandshakesCompleted.dmJoined) {
				console.log("User tried to join dms but failed. Retrying...");
				enterDM(dmParticipants.map((u) => u.username));
				setSocketHandshakesCompleted((prev) => {
					return {
						...prev,
						sentDMJoin: true,
						dmJoined: false,
						dmsRequested: false,
						dmsReceived: false,
					};
				});
				return;
			}

			if (!socketHandshakesCompleted.dmsRequested) {
				console.log(
					"User is connected to dms but no messages have been requested",
				);
				dmControls.requestDirectMessageHistory();
				setSocketHandshakesCompleted((prev) => {
					return {
						...prev,
						dmsRequested: true,
						dmsReceived: false,
					};
				});
				return;
			}

			if (!socketHandshakesCompleted.dmsReceived) {
				console.log(
					"User is connected to dms but no messages have been received",
				);
				dmControls.requestDirectMessageHistory();
				setSocketHandshakesCompleted((prev) => {
					return {
						...prev,
						dmsRequested: true,
						dmsReceived: false,
					};
				});
				return;
			}
		}
		// disconnect from dms if no participants & user is in dms somehow
		else if (dmParticipants.length === 0) {
			if (
				socketHandshakesCompleted.sentDMJoin ||
				socketHandshakesCompleted.dmJoined ||
				socketHandshakesCompleted.dmsRequested ||
				socketHandshakesCompleted.dmsReceived
			) {
				leaveDM();
				setSocketHandshakesCompleted((prev) => {
					return {
						...prev,
						sentDMJoin: false,
						dmJoined: false,
						dmsRequested: false,
						dmsReceived: false,
					};
				});
				return;
			}
		}

		if (currentRoom) {
			if (!socketHandshakesCompleted.sentRoomJoin) {
				console.log("User is in a room but not joined in backend. Joining...");
				joinRoom(currentRoom.roomID);
				setSocketHandshakesCompleted((prev) => {
					return {
						...prev,
						sentRoomJoin: true,
						roomJoined: false,
					};
				});
				return;
			}

			if (!socketHandshakesCompleted.roomJoined) {
				console.log("User tried to join room but failed. Retrying...");
				joinRoom(currentRoom.roomID);
				return;
			}

			if (!socketHandshakesCompleted.roomChatReceived) {
				if (socketHandshakesCompleted.roomChatRequested) {
					console.log("Live chat was requested but not received. Retrying...");
					roomControls.requestLiveChatHistory();
					setSocketHandshakesCompleted((prev) => {
						return {
							...prev,
							roomChatRequested: true,
							roomChatReceived: false,
						};
					});
					return;
				} else {
					console.log(
						"User is in a room but the live chat has not been requested",
					);
					roomControls.requestLiveChatHistory();
					setSocketHandshakesCompleted((prev) => {
						return {
							...prev,
							roomChatRequested: true,
							roomChatReceived: false,
						};
					});
					return;
				}
			}

			if (!socketHandshakesCompleted.roomQueueReceived) {
				if (socketHandshakesCompleted.roomQueueRequested) {
					console.log("Room queue was requested but not received. Retrying...");
					roomControls.requestRoomQueue();
					setSocketHandshakesCompleted((prev) => {
						return {
							...prev,
							roomQueueRequested: true,
							roomQueueReceived: false,
						};
					});
					return;
				} else {
					console.log(
						"User is in a room but room queue has not been requested",
					);
					roomControls.requestRoomQueue();
					setSocketHandshakesCompleted((prev) => {
						return {
							...prev,
							roomQueueRequested: true,
							roomQueueReceived: false,
						};
					});
					return;
				}
			}
		} else {
			// user is not in a room
			setSocketHandshakesCompleted((prev) => {
				return {
					...prev,
					sentRoomJoin: false,
					roomJoined: false,
					roomChatRequested: false,
					roomChatReceived: false,
					roomQueueRequested: false,
					roomQueueReceived: false,
				};
			});
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
		socketHandshakesCompleted,
	]);

	useEffect(() => {}, []);

	return (
		<LiveContext.Provider
			value={{
				socketHandshakes: socketHandshakesCompleted,

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