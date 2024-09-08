import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import auth from "./services/AuthManagement";
import * as utils from "./services/Utils";
import { RoomDto, UserDto } from "../api";

import { SimpleSpotifyPlayback } from "./services/SimpleSpotifyPlayback";
import { DirectMessageDto } from "./models/DmDto";
import { EmojiReactionDto } from "./models/EmojiReactionDto";
import { Emoji } from "rn-emoji-picker/dist/interfaces";
import { RoomSongDto } from "./models/RoomSongDto";
import { VoteDto } from "./models/VoteDto";
import { QueueEventDto } from "./models/QueueEventDto";
import { ObjectConfig } from "react-native-flying-objects";
import { Text } from "react-native";
import { ChatEventDto } from "./models/ChatEventDto";
import { PlaybackEventDto } from "./models/PlaybackEventDto";
import { set } from "react-datepicker/dist/date_utils";
import { LiveChatMessageDto } from "./models/LiveChatMessageDto";

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

interface LiveContextType {
	socket: Socket | null;
	currentRoom: RoomDto | null;
	currentUser: UserDto | null;
	messages: LiveChatMessageDto[];
	joinRoom: (roomId: string) => void;
	sendMessage: (message: string) => void;
	leaveRoom: () => void;
	// Add any other functions that are used in live room interactions
}

interface LiveContextControls {
	joinRoom: (roomId: string) => void;
	leaveRoom: () => void;
	enterDM: (otherUser: UserDto) => void;
	leaveDM: () => void;
	sendPing: (timeout?: number) => Promise<void>;
	getTimeOffset: () => void;
	pollLatency: () => void;
	calculateSeekTime: (
		startTimeUtc: number,
		mediaDurationMs: number,
	) => Promise<number>;
}

interface QueueControls {
	enqueueSong: (song: RoomSongDto) => void;
	dequeueSong: (song: RoomSongDto) => void;
	upvoteSong: (song: RoomSongDto, vote: VoteDto) => void;
	downvoteSong: (song: RoomSongDto, vote: VoteDto) => void;
	swapSongVote: (song: RoomSongDto) => void;
	undoSongVote: (song: RoomSongDto) => void;
}

interface RoomControls {
	joinRoom: (roomId: string) => void;
	leaveRoom: () => void;
	sendLiveChatMessage: (message: string) => void;
	sendReaction: (emoji: Emoji) => void;
	requestLiveChatHistory: () => void;
	canControlRoom: () => boolean;
	requestRoomQueue: () => void;
	playback: PlaybackControls;
	queue: QueueControls;
}

interface DirectMessageControls {
	sendDirectMessage: (message: DirectMessage) => void;
	editDirectMessage: (message: DirectMessage) => void;
	deleteDirectMessage: (message: DirectMessage) => void;å
	requestDirectMessageHistory: () => void;
}

interface PlaybackControls {
	startPlayback: () => void;
	pausePlayback: () => void;
	stopPlayback: () => void;
}

export type SpotifyTokenResponse = {
	access_token: string;
	token_type: string;
	scope: string;
	expires_in: number;
	refresh_token: string;
};

export type SpotifyTokenRefreshResponse = {
	access_token: string;
	token_type: string;
	scope: string;
	expires_in: number;
};

export type SpotifyTokenPair = {
	tokens: SpotifyTokenResponse;
	epoch_expiry: number;
};

export type SpotifyCallbackResponse = {
	token: string;
	spotifyTokens: SpotifyTokenResponse;
};

const LiveContext = createContext<LiveContextType | undefined>(undefined);

export const LiveProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [currentRoom, setCurrentRoom] = useState<RoomDto>();
	const [currentUser, setCurrentUser] = useState<UserDto>();
	const [roomQueue, setRoomQueue] = useState<RoomSongDto[]>([]);
	const [currentRoomVotes, setCurrentRoomVotes] = useState<VoteDto[]>([]);
	const [roomMessages, setRoomMessages] = useState<LiveMessage[]>([]);
	const [otherDMUser, setOtherDMUser] = useState<UserDto>();
	const [dmsConnected, setDmsConnected] = useState<boolean>(false);
	const [dmsRequested, setDmsRequested] = useState<boolean>(false);
	const [dmsReceived, setDmsReceived] = useState<boolean>(false);
	const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
	const [joined, setJoined] = useState<boolean>(false);
	const [socketInitialized, setSocketInitialized] = useState<boolean>(false);
	const [mounted, setMounted] = useState<boolean>(false);
	const [messageSending, setMessageSending] = useState<boolean>(false);
	const [roomChatReceived, setRoomChatReceived] = useState<boolean>(false);
	const [roomChatRequested, setRoomChatRequested] = useState<boolean>(false);
	const [roomEmojiObjects, setRoomEmojiObjects] = useState<ObjectConfig[]>([]);
	const [connected, setConnected] = useState<boolean>(false);
	const [timeOffset, setTimeOffset] = useState<number>(0);
	const [backendLatency, setBackendLatency] = useState<number>(0);
	const [pingSent, setPingSent] = useState<boolean>(false);
	const [spotifyTokens, setSpotifyTokens] = useState<SpotifyTokenPair>(null);
	const createSocket = (): Socket => {
		const s = io(utils.API_BASE_URL + "/live", {
			transports: ["websocket"],
			timeout: TIMEOUT,
		});
		return s;
	};
	const socket = useRef<Socket>(createSocket());
	const playback = SimpleSpotifyPlayback.getInstance();

	const updateRoomQueue = (queue: RoomSongDto[]) => {
		queue.sort((a, b) => a.index - b.index);
		setRoomQueue(queue);
	};

	const getSpotifyTokens = async (): Promise<SpotifyTokenPair | null> => {
		if (spotifyTokens && spotifyTokens.epoch_expiry > Date.now()) {
			if (spotifyTokens.epoch_expiry - Date.now() > 1000 * 60 * 5) {
				return spotifyTokens;
			}
		}

		if (auth.authenticated()) {
			try {
				const token = await auth.getToken();
				const response = await axios.get(
					`${utils.API_BASE_URL}/auth/spotify/tokens`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				const r: SpotifyTokenResponse = response.data;
				return r;
			} catch (error) {
				console.error("Failed to get tokens:", error);
			}
			throw new Error("Something went wrong while getting Spotify tokens");
		} else {
			throw new Error("Cannot fetch Spotify tokens for unauthenticated user");
		}
	}

	const exchangeCodeWithBackend = (
		code: string,
		state: string,
		redirectURI: string,
	):
	Promise<SpotifyCallbackResponse> => {
		try {
			const response = await axios.get(
				`${utils.API_BASE_URL}/auth/spotify/callback?code=${code}&state=${state}&redirect=${encodeURIComponent(
					redirectURI,
				)}`,
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			const r: SpotifyCallbackResponse = response.data;
			return r;
		} catch (error) {
			console.error("Failed to exchange code with backend:", error);
		}
		throw new Error("Something went wrong while exchanging code with backend");
	}

	const initializeSocket = () => {
		if (socket.current) {
			if (!socketInitialized && mounted && currentUser) {
				socket.current.on("userJoinedRoom", (response: ChatEventDto) => {
					console.log("SOCKET EVENT: userJoinedRoom", response);
					const u: UserDto = currentUser;
					if (
						response.body &&
						response.body.sender.userID === currentUser.userID
					) {
						setJoined(true);
					}
					dmControls.requestDirectMessageHistory();
				});

				socket.current.on(
					"liveChatHistory",
					(history: LiveChatMessageDto[]) => {
						console.log("SOCKET EVENT: liveChatHistory", history);
						setRoomChatReceived(true);
						const u = currentUser;
						const chatHistory = history.map((msg) => ({
							message: msg,
							me: msg.sender.userID === u.userID,
						}));
						setRoomMessages(chatHistory);
						setRoomChatRequested(false);
					},
				);

				socket.current.on("liveMessage", (newMessage: ChatEventDto) => {
					console.log("SOCKET EVENT: liveMessage", newMessage);
					if (!roomChatRequested || !roomChatReceived) {
						dmControls.requestDirectMessageHistory();
					}

					if (!newMessage.body) {
						return;
					}
					const message = newMessage.body;
					const u = currentUser;
					const me = message.sender.userID === u.userID;
					if (me) {
						if (setMessageSending) {
							setMessageSending(false);
						}
					}
					if (setRoomMessages) {
						const messages: LiveMessage[] = [
							...roomMessages,
							{ message, me } as LiveMessage,
						];
						setRoomMessages(messages);
					}
				});

				socket.current.on("userLeftRoom", (response: ChatEventDto) => {
					console.log("SOCKET EVENT: userLeftRoom", response);
					console.log("User left room:", response);
				});

				socket.current.on("error", (response: ChatEventDto) => {
					console.log("SOCKET EVENT: error", response);
					console.error("Error:", response.errorMessage);
				});

				socket.current.on("connect", () => {
					console.log("SOCKET EVENT: connect");
					const input: ChatEventDto = {
						userID: currentUser.userID,
					};
					socket.current.emit("connectUser", JSON.stringify(input));
				});

				socket.current.on("connected", (response: ChatEventDto) => {
					console.log("SOCKET EVENT: connected", response);
					if (currentRoom) {
						controls.joinRoom(currentRoom.roomID);
					}
				});

				socket.current.on("playMedia", async (response: PlaybackEventDto) => {
					console.log("SOCKET EVENT: playMedia", response);
					if (!response.UTC_time) {
						console.log("UTC time not found");
						return;
					}

					if (!response.spotifyID) {
						throw new Error("Server did not return song ID");
					}
					/*
					const songID: string = response.spotifyID;
					const spotifyID: string = await songService.getSpotifyID(songID);
					*/

					const deviceID = await playback.getFirstDevice();
					if (deviceID && deviceID !== null) {
						playback.handlePlayback(
							"play",
							deviceID,
							response.spotifyID,
							await controls.calculateSeekTime(response.UTC_time, 0),
						);
					}
				});

				socket.current.on("pauseMedia", async (response: PlaybackEventDto) => {
					console.log("SOCKET EVENT: pauseMedia", response);
					const deviceID = await playback.getFirstDevice();
					if (deviceID && deviceID !== null) {
						playback.handlePlayback("pause", deviceID);
					}
				});

				socket.current.on("stopMedia", async (response: PlaybackEventDto) => {
					console.log("SOCKET EVENT: stopMedia", response);
					const deviceID = await playback.getFirstDevice();
					if (deviceID && deviceID !== null) {
						playback.handlePlayback("pause", deviceID);
					}
				});

				socket.current.on("time_sync_response", (data) => {
					console.log("SOCKET EVENT: time_sync_response", data);
					const t2 = Date.now();
					const t1 = data.t1;
					const offset = (t1 - data.t0 + (data.t2 - t2)) / 2;
					setTimeOffset(offset);
					console.log(`Time offset: ${offset} ms`);
				});

				socket.current.on("directMessage", (data: DirectMessageDto) => {
					console.log("SOCKET EVENT: directMessage", data);
					const u = currentUser;
					const me = data.sender.userID === u.userID;
					const dm = {
						message: data,
						me: data.sender.userID === u.userID,
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

				socket.current.on("userOnline", (data) => {
					console.log("SOCKET EVENT: userOnline", data);
					if (!currentUser) {
						//throw new Error("Something went wrong while getting user's info");
						return;
					}

					if (data.userID === currentUser.userID) {
						setDmsConnected(true);
					}

					//we can use this to update the user's status
				});

				socket.current.on("userOffline", (data) => {
					console.log("SOCKET EVENT: userOffline", data);
					if (!currentUser) {
						//throw new Error("Something went wrong while getting user's info");
						return;
					}

					//we can use this to update the user's status
				});

				// (unused) for edits and deletes of direct messages
				socket.current.on("chatModified", (data) => {});

				socket.current.on("dmHistory", (data: DirectMessageDto[]) => {
					console.log("SOCKET EVENT: dmHistory", data);
					console.log("b");
					setDmsReceived(true);
					console.log("c");
					console.log("Setting DMs");
					const u = currentUser;
					const dmHistory = data.map(
						(msg: DirectMessageDto) =>
							({
								message: msg,
								me: msg.sender.userID === u.userID,
								messageSent: true,
							}) as DirectMessage,
					);
					dmHistory.sort((a, b) => a.message.index - b.message.index);
					setDirectMessages(dmHistory);
					setDmsRequested(false);
				});

				socket.current.on("emojiReaction", (reaction: EmojiReactionDto) => {
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

				socket.current.on(
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

				socket.current.on("songAdded", (newSong: QueueEventDto) => {
					console.log("SOCKET EVENT: songAdded", newSong);
					const newQueue = [...roomQueue, newSong.song];
					updateRoomQueue(newQueue);
				});

				socket.current.on("songRemoved", (removedSong: QueueEventDto) => {
					console.log("SOCKET EVENT: songRemoved", removedSong);
					let newQueue = [...roomQueue];
					newQueue = newQueue.filter(
						(song) => song.spotifyID !== removedSong.song.spotifyID,
					);
					updateRoomQueue(newQueue);
				});

				socket.current.on("voteUpdated", (updatedSong: QueueEventDto) => {
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

				socket.current.connect();
				socket.current.emit(
					"connectUser",
					JSON.stringify({ userID: currentUser.userID }),
				);

				setSocketInitialized(true);
				controls.pollLatency();
			}

			if (!joined && currentRoom && currentRoom.roomID) {
				controls.joinRoom(currentRoom.roomID);
			}
		}
	};

	const controls: LiveContextControls = {
		joinRoom: (roomID: string) => {
			if (!currentUser) {
				console.error("User cannot join room without being logged in");
				return;
			}

			if (socket) {
				controls.pollLatency();
				const u = currentUser;
				const input: ChatEventDto = {
					userID: u.userID,
					body: {
						messageBody: "",
						sender: u,
						roomID: roomID,
						dateCreated: new Date(),
					},
				};
				socket.current.emit("joinRoom", JSON.stringify(input));

				//request chat history
				setRoomChatReceived(false);
				roomControls.requestLiveChatHistory();
				setRoomChatRequested(true);
			}
		},
		leaveRoom: () => {
			controls.pollLatency();
			if (!currentUser) {
				console.error("User cannot leave room without being logged in");
				return;
			}

			if (!currentRoom) {
				console.error("User cannot leave room without being in a room");
				return;
			}

			setJoined(false);
			const u = currentUser;
			const input: ChatEventDto = {
				userID: u.userID,
				body: {
					messageBody: "",
					sender: u,
					roomID: currentRoom.roomID,
					dateCreated: new Date(),
				},
			};
			socket.current.emit("leaveRoom", JSON.stringify(input));
			setRoomMessages([]);
			setRoomChatReceived(false);
			setRoomChatRequested(false);
			setCurrentRoom(undefined);
		},
		enterDM: function (otherUser: UserDto): void {
			controls.pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}
			setOtherDMUser(otherUser);
			setDmsReceived(false);
			setDmsRequested(true);
			const u = currentUser;
			const input = {
				userID: currentUser.userID,
				participantID: otherUser.userID,
			};
			socket.current.emit("enterDirectMessage", JSON.stringify(input));
			dmControls.requestDirectMessageHistory();
		},

		leaveDM: function (): void {
			controls.pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}

			setConnected(false);
			const input = {
				userID: currentUser.userID,
			};
			socket.current.emit("exitDirectMessage", JSON.stringify(input));
			console.log("emit exitDirectMessage with body:", input);
			setOtherDMUser(undefined);
			setDmsReceived(false);
			setDmsRequested(false);
			setDirectMessages([]);
		},
		// Method to send a ping and wait for a response or timeout
		sendPing: function (timeout: number = TIMEOUT): Promise<void> {
			if (pingSent) {
				console.log("A ping is already waiting for a response. Please wait.");
				return Promise.resolve();
			}

			const startTime = Date.now();
			setPingSent(true);
			socket.current.volatile.emit("ping", null, (hitTime: string) => {
				console.log("Ping hit time:", hitTime);
				console.log("Ping sent successfully.");
				const roundTripTime = Date.now() - startTime;
				console.log(`Ping round-trip time: ${roundTripTime}ms`);
				setPingSent(false);
				setBackendLatency(roundTripTime);
			});

			return new Promise<void>((resolve, reject) => {
				const startTime = Date.now();
				setPingSent(true);

				// Set up a timeout
				/*
				const timeoutId = setTimeout(() => {
					pingSent = false;
					console.log("Ping timed out.");
					reject(new Error("Ping timed out"));
				}, timeout);
				*/

				// Send the ping message with a callback
				/*
				socket.current.volatile.emit("ping", null, () => {
					console.log("Ping sent successfully.");
					clearTimeout(timeoutId);
					const roundTripTime = Date.now() - startTime;
					console.log(`Ping round-trip time: ${roundTripTime}ms`);
					pingSent = false;
					backendLatency = roundTripTime;
					resolve();
				});
				*/
			}).catch((error) => {
				console.error("Ping failed:", error.message);
				// Optionally, retry sending the ping here
				throw error; // Re-throw the error to maintain the Promise<void> type
			});
		},
		getTimeOffset: function (): void {
			let t0 = Date.now();
			socket.current.emit("time_sync", { t0: Date.now() });
		},
		//function to find latency from NTP
		pollLatency: function (): void {
			controls.sendPing().then(() => {
				console.log("Ping sent");
				controls.getTimeOffset();
				console.log("Awaiting time offset");
			});
		},
		calculateSeekTime: async (
			startTimeUtc: number,
			mediaDurationMs: number,
		): Promise<number> => {
			await controls.pollLatency();
			console.log(`Device is ${backendLatency} ms behind the server`);
			console.log(`Device's clock is ${timeOffset} ms behind the server`);
			console.log(`Media is supposed to start at ${startTimeUtc} ms since epoch`);

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
	};

	const dmControls: DirectMessageControls = {
		sendDirectMessage: function (message: DirectMessage): void {
			controls.pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}

			if (!otherDMUser) {
				console.error("User is not sending a message to anyone");
				return;
			}

			if (message.message.messageBody.trim()) {
				message.message.sender = currentUser;
				message.message.recipient = otherDMUser;
				socket.current.emit("directMessage", JSON.stringify(message.message));
			}
		},

		editDirectMessage: function (message: DirectMessage): void {
			controls.pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}

			if (!otherDMUser) {
				console.error("User is not sending a message to anyone");
				return;
			}

			if (message.message.body.trim()) {
				const u = currentUser;
				let payload = {
					userID: u.userID,
					participantID: otherDMUser.userID,
					action: "edit",
					message: message.message,
				};
				socket.current.emit("modifyDirectMessage", JSON.stringify(payload));
			}
		},

		deleteDirectMessage: function (message: DirectMessage): void {
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}

			if (!otherDMUser) {
				console.error("User is not sending a message to anyone");
				return;
			}

			const u = currentUser;
			let payload = {
				userID: u.userID,
				participantID: otherDMUser.userID,
				action: "delete",
				message: message.message,
			};
			socket.current.emit("modifyDirectMessage", JSON.stringify(payload));
		},

		requestDirectMessageHistory: function (): void {
			if (dmsRequested) {
				console.log("Already requested DM history");
				return;
			}

			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}

			if (!otherDMUser) {
				console.error("User is not sending a message to anyone");
				return;
			}

			setOtherDMUser(otherDMUser);
			setDmsReceived(false);
			setDmsRequested(true);
			const u = sender;
			const input = {
				userID: u.userID,
				participantID: participantID,
			};
			socket.current.emit("getDirectMessageHistory", JSON.stringify(input));
		},
	};

	const roomControls: RoomControls = {
		joinRoom: function (roomID: string): void {
			if (!currentUser) {
				console.error("User cannot join room without being logged in");
				return;
			}

			if (socket) {
				controls.pollLatency();
				const u = currentUser;
				const input: ChatEventDto = {
					userID: u.userID,
					body: {
						messageBody: "",
						sender: u,
						roomID: roomID,
						dateCreated: new Date(),
					},
				};
				socket.current.emit("joinRoom", JSON.stringify(input));

				//request chat history
				setRoomChatReceived(false);
				roomControls.requestLiveChatHistory();
				setRoomChatRequested(true);
			}
		},

		leaveRoom: function (): void {
			controls.pollLatency();
			if (!currentUser) {
				console.error("User cannot leave room without being logged in");
				return;
			}

			if (!currentRoom) {
				console.error("User cannot leave room without being in a room");
				return;
			}

			setJoined(false);
			const u = currentUser;
			const input: ChatEventDto = {
				userID: u.userID,
				body: {
					messageBody: "",
					sender: u,
					roomID: currentRoom.roomID,
					dateCreated: new Date(),
				},
			};
			socket.current.emit("leaveRoom", JSON.stringify(input));
			setRoomMessages([]);
			setRoomChatReceived(false);
			setRoomChatRequested(false);
			setCurrentRoom(undefined);
		},

		sendLiveChatMessage: function (message: string): void {
			controls.pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}

			if (!currentRoom) {
				console.error("User is not in a room");
				return;
			}

			if (message.trim()) {
				const u = currentUser;
				const newMessage = {
					messageBody: message,
					sender: u,
					roomID: currentRoom.roomID,
					dateCreated: new Date(),
				};
				const input: ChatEventDto = {
					userID: u.userID,
					body: newMessage,
				};
				socket.current.emit("liveMessage", JSON.stringify(input));
			}
		},

		sendReaction: function (emoji: Emoji): void {
			if (!currentUser) {
				return;
			}
			const u = currentUser;
			const newReaction: EmojiReactionDto = {
				date_created: new Date(),
				body: emoji,
				userID: u.userID,
			};
			//make it volatile so that it doesn't get queued up
			//nothing will be lost if it doesn't get sent
			socket.current.volatile.emit(
				"emojiReaction",
				JSON.stringify(newReaction),
			);
		},

		requestLiveChatHistory: function (): void {
			// if (this.requestingLiveChatHistory) {
			if (roomChatRequested) {
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
			setRoomChatRequested(true);
			const input: ChatEventDto = {
				userID: currentUser.userID,
				body: {
					messageBody: "",
					sender: currentUser,
					roomID: currentRoom.roomID,
					dateCreated: new Date(),
				},
			};
			this.socket.emit("getLiveChatHistory", JSON.stringify(input));
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
			socket.current.emit("requestQueue", JSON.stringify(input));
		},

		playback: {
			startPlayback: function (): void {
				controls.pollLatency();
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
				socket.current.emit("initPlay", JSON.stringify(input));
			},

			pausePlayback: function (): void {
				controls.pollLatency();
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
				socket.current.emit("initPause", JSON.stringify(input));
			},

			stopPlayback: function (): void {
				controls.pollLatency();
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
				socket.current.emit("initStop", JSON.stringify(input));
			},
		},
		queue: {
			enqueueSong: function (song: RoomSongDto): void {
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
				socket.current.emit("enqueueSong", JSON.stringify(input));
				console.log("emitted: enqueueSong");
				socket.current.emit("requestQueue", JSON.stringify(input));
				console.log("emitted: requestQueue");
			},
			dequeueSong: function (song: RoomSongDto): void {
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
				socket.current.emit("dequeueSong", JSON.stringify(input));
				console.log("emitted: dequeueSong");
				socket.current.emit("requestQueue", JSON.stringify(input));
				console.log("emitted: requestQueue");
			},
			upvoteSong: function (song: RoomSongDto, vote: VoteDto): void {
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
				socket.current.emit("upvoteSong", JSON.stringify(input));
			},
			downvoteSong: function (song: RoomSongDto, vote: VoteDto): void {
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
				socket.current.emit("downvoteSong", JSON.stringify(input));
			},
			swapSongVote: function (song: RoomSongDto): void {
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
				socket.current.emit("swapSongVote", JSON.stringify(input));
			},
			undoSongVote: function (song: RoomSongDto): void {
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
				socket.current.emit("undoSongVote", JSON.stringify(input));
			},
		},
	};

	useEffect(() => {
		setMounted(true);
		initializeSocket();
		const s = socket.current;
		return () => {
			if (socket) {
				roomControls.leaveRoom();
				s.disconnect();
			}
		};
	}, []);

	useEffect(() => {
		if (!socket.current?.connected) {
			initializeSocket();
			socket.current.connect();
		}
	}, [socket.current, socket.current?.connected]);

	return (
		<LiveContext.Provider
			value={{
				socket,
				currentRoom,
				currentUser,
				messages,
				joinRoom,
				sendMessage,
				leaveRoom,
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
