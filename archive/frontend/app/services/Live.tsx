import { io, Socket } from "socket.io-client";
import { UserDto } from "../models/UserDto";
import { RoomDto } from "../models/RoomDto";
import { ChatEventDto } from "../models/ChatEventDto";
import { PlaybackEventDto } from "../models/PlaybackEventDto";
import axios from "axios";
import auth from "./AuthManagement";
import songService from "./SongService";
import * as utils from "./Utils";
import { SimpleSpotifyPlayback } from "./SimpleSpotifyPlayback";
import { DirectMessageDto } from "../models/DmDto";
import { LiveChatMessageDto } from "../models/LiveChatMessageDto";
import { EmojiReactionDto } from "../models/EmojiReactionDto";
import { Emoji } from "rn-emoji-picker/dist/interfaces";
import { RoomSongDto } from "../models/RoomSongDto";
import { VoteDto } from "../models/VoteDto";
import { QueueEventDto } from "../models/QueueEventDto";
import { ObjectConfig } from "react-native-flying-objects";
import { Text } from "react-native";
import { ToastAndroid } from "react-native";
import { Room } from "../models/Room";

const TIMEOUT = 5000000;

export type LiveMessage = {
	message: LiveChatMessageDto;
	me?: boolean;
};

export type DirectMessage = {
	message: DirectMessageDto;
	me?: boolean;
	messageSent: boolean;
	room?: Room;
};

// How to integrate Emoji Reactions
/*
assuming there is a state variable for emojis,
- add a type for the state variable (just before the LiveChatService class)
- add a private variable in this class for the state variable
- add the setState function to the joinRoom function and assign it when the user joins the room
- in the initialiseSocket function, there is a socket.on("emojiReaction") event, add the new reaction to the state variable

that's it
then emojis received the from the server will be added to the state variable

then whatever you do with the state variable will be reflected in the component
*/

type stateSetLiveMessages = React.Dispatch<React.SetStateAction<LiveMessage[]>>;
type stateSetDirectMessages = React.Dispatch<
	React.SetStateAction<DirectMessage[]>
>;
type stateSetJoined = React.Dispatch<React.SetStateAction<boolean>>;
type stateSetConnected = React.Dispatch<React.SetStateAction<boolean>>;
type stateSetMessage = React.Dispatch<React.SetStateAction<string>>;
type stateSetIsSending = React.Dispatch<React.SetStateAction<boolean>>;
type stateSetQueue = React.Dispatch<React.SetStateAction<RoomSongDto[]>>;
type stateSetEmojiObject = React.Dispatch<React.SetStateAction<ObjectConfig[]>>;

let playback: SimpleSpotifyPlayback | null = null;

class LiveSocketService {
	private static instance: LiveSocketService;
	private socket: Socket;
	private initialised = false;
	private isConnecting = false;
	private requestingLiveChatHistory = false;
	private requestingDMHistory = false;
	private dmsConnected = false;

	private backendLatency: number = 0;
	private timeOffset: number = 0;

	private setLiveChatMessages: stateSetLiveMessages | null = null;
	private setDMs: stateSetDirectMessages | null = null;
	private setJoined: stateSetJoined | null = null;
	private setConnected: stateSetConnected | null = null;
	private setIsSending: stateSetIsSending | null = null;
	private setQueue: stateSetQueue | null = null;
	private setObjects: stateSetEmojiObject | null = null;

	private liveChatHistoryReceived = false;
	private dmHistoryReceived = false;
	private pingSent = false;

	private fetchedHistory: DirectMessage[] = [];

	private constructor() {
		this.socket = io(utils.API_BASE_URL + "/live", {
			transports: ["websocket"],
		});
	}

	public static getInstance(): LiveSocketService {
		if (!LiveSocketService.instance) {
			LiveSocketService.instance = new LiveSocketService();
		}
		return LiveSocketService.instance;
	}

	public static instanceExists(): boolean {
		return Boolean(LiveSocketService.instance);
	}

	public dmsAreConnected(): boolean {
		return this.dmsConnected;
	}

	public getFetchedDMs(): DirectMessage[] {
		return this.fetchedHistory;
	}

	// Method to send a ping and wait for a response or timeout
	public async sendPing(timeout: number = TIMEOUT): Promise<void> {
		if (this.pingSent) {
			console.log("A ping is already waiting for a response. Please wait.");
			return;
		}

		const startTime = Date.now();
		this.pingSent = true;
		this.socket.volatile.emit("ping", null, (hitTime: string) => {
			console.log("Ping hit time:", hitTime);
			console.log("Ping sent successfully.");
			const roundTripTime = Date.now() - startTime;
			console.log(`Ping round-trip time: ${roundTripTime}ms`);
			this.pingSent = false;
			this.backendLatency = roundTripTime;
		});

		return new Promise<void>((resolve, reject) => {
			const startTime = Date.now();
			this.pingSent = true;

			// Set up a timeout
			/*
			const timeoutId = setTimeout(() => {
				this.pingSent = false;
				console.log("Ping timed out.");
				reject(new Error("Ping timed out"));
			}, timeout);
			*/

			// Send the ping message with a callback
			/*
			this.socket.volatile.emit("ping", null, () => {
				console.log("Ping sent successfully.");
				clearTimeout(timeoutId);
				const roundTripTime = Date.now() - startTime;
				console.log(`Ping round-trip time: ${roundTripTime}ms`);
				this.pingSent = false;
				this.backendLatency = roundTripTime;
				resolve();
			});
			*/
		}).catch((error) => {
			console.error("Ping failed:", error.message);
			// Optionally, retry sending the ping here
			throw error; // Re-throw the error to maintain the Promise<void> type
		});
	}

	//function to find latency from NTP
	public async getTimeOffset() {
		let t0 = Date.now();

		/* Note: (server code)
			// for determining client and server clock latency
			@SubscribeMessage("time_sync")
			handleTimeSync(
				@ConnectedSocket() client: Socket,
				@MessageBody() data: { t0: number },
			) {
				const t1 = Date.now();
				client.emit("time_sync_response", { t0: data.t0, t1, t2: Date.now() });
			}
		*/
		this.socket.emit("time_sync", { t0: Date.now() });
	}

	public async pollLatency() {
		await this.sendPing();
		await this.getTimeOffset();
	}

	public async initialiseSocket(setQueue: stateSetQueue) {
		this.setQueue = setQueue;
		console.log("Initialising socket");
		console.log("initialised:", this.initialised);
		if (
			!this.initialised &&
			!this.isConnecting &&
			(await auth.getToken()) !== null
		) {
			this.isConnecting = true;
			if (!playback) {
				playback = SimpleSpotifyPlayback.getInstance();
			}

			const token = await auth.getToken();
			try {
				const response = await axios.get(`${utils.API_BASE_URL}/users`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				this.currentUser = response.data as UserDto;
			} catch (error) {
				console.log("Error fetching user's own info:", error);
				ToastAndroid.show("Failed to fetch user info", ToastAndroid.SHORT);
			}

			console.log("Current user:", this.currentUser);

			if (!this.currentUser) {
				throw new Error("Something went wrong while getting user's info");
			}

			this.socket.on("userJoinedRoom", (response: ChatEventDto) => {
				console.log("SOCKET EVENT: userJoinedRoom", response);
				if (this.setJoined) {

					const u: UserDto = this.getUser();
					if (
						response.body &&
						response.body.sender.userID === this.currentUser.userID
					) {
						this.setJoined(true);
					}
				}

				this.requestLiveChatHistory();
			});

			this.socket.on("liveChatHistory", (history: LiveChatMessageDto[]) => {
				console.log("SOCKET EVENT: liveChatHistory", history);
				this.liveChatHistoryReceived = true;
				if (this.setLiveChatMessages) {
					const u = this.currentUser;
					const chatHistory = history.map((msg) => ({
						message: msg,
						me: msg.sender.userID === u.userID,
					}));
					this.setLiveChatMessages(chatHistory);
				}
				this.requestingLiveChatHistory = false;
			});

			this.socket.on("liveMessage", (newMessage: ChatEventDto) => {
				console.log("SOCKET EVENT: liveMessage", newMessage);
				if (!this.liveChatHistoryReceived) {
					this.requestLiveChatHistory();
				}

				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				if (!newMessage.body) {
					//throw new Error("Message body not found");
					return;
				}

				const message = newMessage.body;
				const u = this.currentUser;
				const me = message.sender.userID === u.userID;
				if (me) {
					if (this.setIsSending) {
						this.setIsSending(false);
						this.setIsSending = null;
					}
				}
				if (this.setLiveChatMessages) {
					this.setLiveChatMessages((prevMessages) => [
						...prevMessages,
						{ message, me: message.sender.userID === u.userID },
					]);
				}
			});

			this.socket.on("userLeftRoom", (response: ChatEventDto) => {
				console.log("SOCKET EVENT: userLeftRoom", response);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				console.log("User left room:", response);
			});

			this.socket.on("error", (response: ChatEventDto) => {
				console.log("SOCKET EVENT: error", response);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				console.error("Error:", response.errorMessage);
			});

			this.socket.on("connect", () => {
				console.log("SOCKET EVENT: connect");
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				const input: ChatEventDto = {
					userID: this.currentUser.userID,
				};
				this.socket.emit("connectUser", JSON.stringify(input));
			});

			this.socket.on("connected", (response: ChatEventDto) => {
				console.log("SOCKET EVENT: connected", response);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				if (
					this.setJoined &&
					this.currentRoom &&
					this.currentRoom.roomID &&
					this.setLiveChatMessages
				) {
					this.joinRoom(
						this.currentRoom.roomID,
						this.setJoined,
						this.setLiveChatMessages,
					);
				}
			});

			this.socket.on("playMedia", async (response: PlaybackEventDto) => {
				console.log("SOCKET EVENT: playMedia", response);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					console.log("User not found");
					return;
				}

				if (!this.currentRoom) {
					//throw new Error("Current room not set");
					console.log("Room not found");
					return;
				}

				if (!response.UTC_time) {
					//throw new Error("UTC time not found");
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

				if (!playback) {
					playback = SimpleSpotifyPlayback.getInstance();
				}

				const deviceID = await playback.getFirstDevice();
				if (deviceID && deviceID !== null) {
					playback.handlePlayback(
						"play",
						deviceID,
						response.spotifyID,
						this.calculateSeekTime(response.UTC_time, 0),
					);
				}
			});

			this.socket.on("pauseMedia", async (response: PlaybackEventDto) => {
				console.log("SOCKET EVENT: pauseMedia", response);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				if (!this.currentRoom) {
					//throw new Error("Current room not set");
					return;
				}

				if (!playback) {
					playback = SimpleSpotifyPlayback.getInstance();
				}

				const deviceID = await playback.getFirstDevice();
				if (deviceID && deviceID !== null) {
					playback.handlePlayback("pause", deviceID);
				}
			});

			this.socket.on("stopMedia", async (response: PlaybackEventDto) => {
				console.log("SOCKET EVENT: stopMedia", response);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				if (!this.currentRoom) {
					//throw new Error("Current room not set");
					return;
				}

				if (!playback) {
					playback = SimpleSpotifyPlayback.getInstance();
				}

				const deviceID = await playback.getFirstDevice();
				if (deviceID && deviceID !== null) {
					playback.handlePlayback("pause", deviceID);
				}
			});

			this.socket.on("time_sync_response", (data) => {
				console.log("SOCKET EVENT: time_sync_response", data);
				const t2 = Date.now();
				const t1 = data.t1;
				const offset = (t1 - data.t0 + (data.t2 - t2)) / 2;
				this.timeOffset = offset;
				console.log(`Time offset: ${this.timeOffset} ms`);
			});

			this.socket.on("directMessage", (data: DirectMessageDto) => {
				console.log("SOCKET EVENT: directMessage", data);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				if (!this.setDMs) {
					//throw new Error("setDMs not set");
					return;
				}

				const u = this.currentUser;
				const me = data.sender.userID === u.userID;
				const dm = {
					message: data,
					me: data.sender.userID === u.userID,
					messageSent: true,
				} as DirectMessage;
				if (me) {
					//if (this.setDMTextBox) this.setDMTextBox("");
				}
				if (this.setDMs) {
					this.setDMs((prevMessages) => {
						const newMessages = [...prevMessages, dm];
						newMessages.sort((a, b) => a.message.index - b.message.index);
						this.fetchedHistory = newMessages;
						return newMessages;
					});
				}
			});

			this.socket.on("userOnline", (data) => {
				console.log("SOCKET EVENT: userOnline", data);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				const onlineUser = data;
				if (data.userID === this.currentUser.userID) {
					if (this.setConnected) {
						this.setConnected(true);
					}
				}

				//we can use this to update the user's status
			});

			this.socket.on("userOffline", (data) => {
				console.log("SOCKET EVENT: userOffline", data);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				//we can use this to update the user's status
			});

			// (unused) for edits and deletes of direct messages
			this.socket.on("chatModified", (data) => {});

			this.socket.on("dmHistory", (data: DirectMessageDto[]) => {
				console.log("SOCKET EVENT: dmHistory", data);
				if (!this.currentUser) {
					console.log("a");
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				console.log("b");
				this.dmHistoryReceived = true;
				console.log("c");
				if (this.setDMs) {
					console.log("Setting DMs");
					const u = this.currentUser;
					const dmHistory = data.map(
						(msg: DirectMessageDto) =>
							({
								message: msg,
								me: msg.sender.userID === u.userID,
								messageSent: true,
							}) as DirectMessage,
					);
					dmHistory.sort((a, b) => a.message.index - b.message.index);
					this.fetchedHistory = dmHistory;
					this.setDMs(dmHistory);
				}
				if (this.requestingDMHistory) {
					this.requestingDMHistory = false;
				}
			});

			this.socket.on("emojiReaction", (reaction: EmojiReactionDto) => {
				console.log("SOCKET EVENT: emojiReaction", reaction);
				//add the new reaction to components
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				//add the new reaction to components
				if (!this.setObjects) {
					return;
				}

				if (reaction.userID === this.currentUser.userID) {
					return;
				}

				this.setObjects((prev) => [
					...prev,
					{ object: <Text style={{ fontSize: 30 }}>{reaction.body}</Text> },
					{ object: <Text style={{ fontSize: 30 }}>{reaction.body}</Text> },
					{ object: <Text style={{ fontSize: 30 }}>{reaction.body}</Text> },
				]);
			});

			this.socket.on(
				"queueState",
				(response: {
					room: RoomDto;
					songs: RoomSongDto[];
					votes: VoteDto[];
				}) => {
					console.log("SOCKET EVENT: queueState", response);

					if (!this.currentUser) {
						//throw new Error("Something went wrong while getting user's info");
						return;
					}

					this.currentRoom = response.room;

					this.currentRoomQueue = response.songs;
					if (this.setQueues.length > 0) {
						// sort songs by index
						this.currentRoomQueue.sort((a, b) => a.index - b.index);
						for (const setQueue of this.setQueues) {
							setQueue(this.currentRoomQueue);
						}
					}

					this.currentRoomVotes = response.votes;
				},
			);

			this.socket.on("songAdded", (newSong: QueueEventDto) => {
				console.log("SOCKET EVENT: songAdded", newSong);

				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				this.currentRoomQueue.push(newSong.song);
				if (this.setQueues.length > 0) {
					for (const setQueue of this.setQueues) {
						setQueue(this.currentRoomQueue);
					}
				}
			});

			this.socket.on("songRemoved", (removedSong: QueueEventDto) => {
				console.log("SOCKET EVENT: songRemoved", removedSong);

				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				this.currentRoomQueue = this.currentRoomQueue.filter(
					(song) => song.spotifyID !== removedSong.song.spotifyID,
				);
				if (this.setQueues.length > 0) {
					for (const setQueue of this.setQueues) {
						setQueue(this.currentRoomQueue);
					}
				}
			});

			this.socket.on("voteUpdated", (updatedSong: QueueEventDto) => {
				console.log("SOCKET EVENT: voteUpdated", updatedSong);

				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				const i = this.currentRoomQueue.findIndex(
					(song) => song.spotifyID === updatedSong.song.spotifyID,
				);
				if (i === -1) {
					return;
				}
				this.currentRoomQueue[i] = updatedSong.song;
				if (this.setQueues.length > 0) {
					for (const setQueue of this.setQueues) {
						setQueue(this.currentRoomQueue);
					}
				}
			});

			console.log("socket connected?", this.socket.connected);
			this.socket.connect();
			this.socket.emit(
				"connectUser",
				JSON.stringify({ userID: this.currentUser.userID }),
			);
			console.log("Socket connected");
			this.initialised = true;
			this.isConnecting = false;
		}
		this.pollLatency();
	}

	public async joinRoom(
		roomID: string,
		setJoined: stateSetJoined,
		setLiveChatMessages: stateSetLiveMessages,
	) {
		this.pollLatency();
		this.setJoined = setJoined;
		this.setLiveChatMessages = setLiveChatMessages;

		try {
			const token = await auth.getToken();
			const roomDto = await axios.get(`${utils.API_BASE_URL}/rooms/${roomID}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			this.currentRoom = roomDto.data;
		} catch (error) {
			console.log("Error fetching room:", error);
			ToastAndroid.show("Failed to fetch room data", ToastAndroid.SHORT);
		}

		const u = this.currentUser;
		const input: ChatEventDto = {
			userID: u.userID,
			body: {
				messageBody: "",
				sender: u,
				roomID: roomID,
				dateCreated: new Date(),
			},
		};
		this.socket.emit("joinRoom", JSON.stringify(input));

		//request chat history
		this.liveChatHistoryReceived = false;
		this.requestLiveChatHistory();
		this.requestingLiveChatHistory = true;
	}

	public async leaveRoom() {
		this.pollLatency();
		if (!this.currentUser) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		if (!this.currentRoom) {
			//throw new Error("Current room not set");
			return;
		}

		if (!this.setJoined) {
			//throw new Error("setJoined not set");
			return;
		}
		this.setJoined(false);
		this.setJoined = null;

		const u = this.currentUser;
		const input: ChatEventDto = {
			userID: u.userID,
			body: {
				messageBody: "",
				sender: u,
				roomID: this.currentRoom.roomID,
				dateCreated: new Date(),
			},
		};
		this.socket.emit("leaveRoom", JSON.stringify(input));

		if (this.setLiveChatMessages) {
			this.setLiveChatMessages([]);
		}
		this.liveChatHistoryReceived = false;
		this.requestingLiveChatHistory = false;
		this.currentRoom = null;
	}

	public async sendLiveChatMessage(
		message: string,
		currentUser: UserDto | null,
		currentRoom: RoomDto | null,
		setIsSending: stateSetIsSending,
	) {
		this.pollLatency();
		if (!currentUser) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		if (!currentRoom) {
			//throw new Error("Current room not set");
			return;
		}

		this.setIsSending = setIsSending;

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
			this.socket.emit("liveMessage", JSON.stringify(input));
		}
	}

	public async sendReaction(emoji: string, currentUser: UserDto | null) {
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
		this.socket.volatile.emit("emojiReaction", JSON.stringify(newReaction));
	}

	public calculateSeekTime(
		startTimeUtc: number,
		mediaDurationMs: number,
	): number {
		this.pollLatency();
		console.log(`Device is ${this.backendLatency} ms behind the server`);
		console.log(`Device's clock is ${this.timeOffset} ms behind the server`);
		console.log(`Media is supposed to start at ${startTimeUtc} ms since epoch`);

		// Get the current server time
		const serverTime = Date.now() + this.timeOffset;

		// Convert startTimeUtc to milliseconds since epoch
		const startTimeMs = new Date(startTimeUtc).getTime();

		// Calculate the elapsed time since media started
		const elapsedTimeMs = serverTime - startTimeMs;

		// Calculate the seek position within the media duration
		let seekPosition = Math.max(0, Math.min(elapsedTimeMs, mediaDurationMs));

		console.log(`Seek position: ${seekPosition} ms`);
		return seekPosition;
	}

	public async enterDM(
		user: UserDto | null,
		participantID: string,
		setDMs: stateSetDirectMessages,
		setConnected: stateSetJoined,
	) {
		this.pollLatency();
		if (!user) {
			return;
		}

		this.setDMs = setDMs;
		this.setConnected = setConnected;
		const u = user;
		const input = {
			userID: u.userID,
			participantID: participantID,
		};
		this.socket.emit("enterDirectMessage", JSON.stringify(input));
	}

	public async leaveDM(user: UserDto | null) {
		this.pollLatency();
		if (!user) {
			//throw new Error("Something went wrong while getting user's info");
			console.log("end of: if (!this.currentUser)");
			return;
		}

		if (this.setDMs) {
			this.setDMs([]);
			this.setDMs = null;
			console.log("end of: if (this.setDMs)");
		}

		if (this.setConnected) {
			this.setConnected(false);
			this.setConnected = null;
			console.log("end of: if (this.setConnected)");
		}

		this.fetchedHistory = [];
		this.dmHistoryReceived = false;
		this.requestingDMHistory = false;

		const u = user;
		const input = {
			userID: u.userID,
		};
		this.socket.emit("exitDirectMessage", JSON.stringify(input));
		console.log("emit exitDirectMessage with body:", input);
	}

	public async sendDM(message: DirectMessage, user: UserDto | null, otherUser: UserDto | null) {
		this.pollLatency();
		if (!user || !otherUser) {
			return;
		}

		if (!this.setDMs) {
			//throw new Error("setDMs not set");
			return;
		}

		if (message.message.messageBody.trim()) {
			message.message.sender = user;
			message.message.recipient = otherUser;
			this.socket.emit("directMessage", JSON.stringify(message.message));
		}
	}

	public async editDM(message: LiveMessage, sender: UserDto | null, otherUser: UserDto | null) {
		this.pollLatency();
		if (!sender || !otherUser) {
			return;
		}

		if (!this.setDMs) {
			//throw new Error("setDMs not set");
			return;
		}

		if (!message.message.messageBody.trim()) {
			return;
		}

		const u = this.currentUser;
		let payload = {
			userID: u.userID,
			participantID: otherUser.userID,
			action: "edit",
			message: message.message,
		};
		this.socket.emit("modifyDirectMessage", JSON.stringify(payload));
	}

	public async deleteDM(message: LiveMessage, sender: UserDto | null, otherUser: UserDto | null) {
		this.pollLatency();
		if (!sender || !otherUser) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		if (!this.setDMs) {
			//throw new Error("setDMs not set");
			return;
		}

		const u = sender;
		let payload = {
			userID: u.userID,
			participantID: otherUser.userID,
			action: "delete",
			message: message.message,
		};
		this.socket.emit("modifyDirectMessage", JSON.stringify(payload));
	}

	public requestDMHistory(sender: UserDto | null, participantID: string) {
		if (this.requestingDMHistory) {
			return;
		}

		if (!sender) {
			return;
		}

		if (!this.setDMs) {
			return;
		}

		if (this.dmHistoryReceived) {
			return;
		}

		this.requestingDMHistory = true;

		const u = sender;
		const input = {
			userID: u.userID,
			participantID: participantID,
		};
		this.socket.emit("getDirectMessageHistory", JSON.stringify(input));
	}

	public receivedDMHistory() {
		return this.dmHistoryReceived;
	}

	public startPlayback(sender: UserDto | null, roomID: string) {
		this.pollLatency();
		if (!sender) {
			return;
		}

		const u = sender;
		const input: PlaybackEventDto = {
			userID: u.userID,
			roomID: roomID,
			spotifyID: null,
			UTC_time: null,
		};
		this.socket.emit("initPlay", JSON.stringify(input));
	}

	public pausePlayback(sender: UserDto | null, roomID: string) {
		this.pollLatency();
		if (!sender) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		const u = sender;
		const input: PlaybackEventDto = {
			userID: u.userID,
			roomID: roomID,
			spotifyID: null,
			UTC_time: null,
		};
		this.socket.emit("initPause", JSON.stringify(input));
	}

	public stopPlayback(sender: UserDto | null, roomID: string) {
		this.pollLatency();
		if (!sender) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		const u = sender;
		const input: PlaybackEventDto = {
			userID: u.userID,
			roomID: roomID,
			spotifyID: null,
			UTC_time: null,
		};
		this.socket.emit("initStop", JSON.stringify(input));
	}

	public requestLiveChatHistory(sender: UserDto | null, roomID: string) {
		if (this.requestingLiveChatHistory) {
			return;
		}

		if (!sender) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		if (!this.setLiveChatMessages) {
			return;
		}

		if (this.liveChatHistoryReceived) {
			return;
		}

		this.requestingLiveChatHistory = true;

		const u = sender;
		const input: ChatEventDto = {
			userID: u.userID,
			body: {
				messageBody: "",
				sender: u,
				roomID: roomID,
				dateCreated: new Date(),
			},
		};
		this.socket.emit("getLiveChatHistory", JSON.stringify(input));
	}

	public canControlRoom(sender: UserDto | null, room: RoomDto | null): boolean {
		if (!room) {
			return false;
		}
		if (!sender) {
			return false;
		}
		if (!room.creator) {
			return false;
		}
		if (room.creator.userID === sender.userID) {
			return true;
		}
		return false;
	}

	public fetchRoomQueue(setQueue: stateSetQueue, sender: UserDto | null, room: RoomDto | null) {
		if (!room) {
			return;
		}
		if (!sender) {
			return;
		}
		if (!this.setQueues.includes(setQueue)) {
			this.setQueues.push(setQueue);
		}
		const input: QueueEventDto = {
			song: {
				spotifyID: "123",
				userID: this.currentUser.userID,
				index: -1,
			},
			roomID: this.currentRoom.roomID,
			createdAt: new Date(),
		};
		this.socket.emit("requestQueue", JSON.stringify(input));
	}

	public getLastRoomQueue(): RoomSongDto[] {
		return this.currentRoomQueue;
	}

	public getLastRoomVotes(): VoteDto[] {
		return this.currentRoomVotes;
	}

	public updateSong(song: RoomSongDto): RoomSongDto {
		const result: RoomSongDto | undefined = this.currentRoomQueue.find(
			(s) => s.spotifyID === song.spotifyID,
		);
		if (!result) {
			return song;
		}
		return result;
	}

	public getCurrentRoom(): RoomDto | null {
		return this.currentRoom;
	}

	public enqueueSong(song: RoomSongDto): void {
		console.log("Enqueueing song", song);
		if (!this.currentRoom) {
			return;
		}
		if (!this.currentUser) {
			return;
		}
		const input: QueueEventDto = {
			song: song,
			roomID: this.currentRoom.roomID,
			createdAt: new Date(),
		};
		this.socket.emit("enqueueSong", JSON.stringify(input));
		console.log("emitted: enqueueSong");
		this.socket.emit("requestQueue", JSON.stringify(input));
		console.log("emitted: requestQueue");
	}

	public dequeueSong(song: RoomSongDto): void {
		console.log("Dequeueing song", song);
		if (!this.currentRoom) {
			return;
		}

		if (!this.currentUser) {
			return;
		}
		const input: QueueEventDto = {
			song: song,
			roomID: this.currentRoom.roomID,
			createdAt: new Date(),
		};
		this.socket.emit("dequeueSong", JSON.stringify(input));
		console.log("emitted: dequeueSong");
		this.socket.emit("requestQueue", JSON.stringify(input));
		console.log("emitted: requestQueue");
	}

	public upvoteSong(song: RoomSongDto): void {
		if (!this.currentRoom) {
			return;
		}

		if (!this.currentUser) {
			return;
		}
		const input: QueueEventDto = {
			song: song,
			roomID: this.currentRoom.roomID,
			createdAt: new Date(),
		};
		this.socket.emit("upvoteSong", JSON.stringify(input));
	}

	public downvoteSong(song: RoomSongDto): void {
		if (!this.currentRoom) {
			return;
		}

		if (!this.currentUser) {
			return;
		}
		const input: QueueEventDto = {
			song: song,
			roomID: this.currentRoom.roomID,
			createdAt: new Date(),
		};
		this.socket.emit("downvoteSong", JSON.stringify(input));
	}

	public swapSongVote(song: RoomSongDto): void {
		if (!this.currentRoom) {
			return;
		}

		if (!this.currentUser) {
			return;
		}
		const input: QueueEventDto = {
			song: song,
			roomID: this.currentRoom.roomID,
			createdAt: new Date(),
		};
		this.socket.emit("swapSongVote", JSON.stringify(input));
	}

	public undoSongVote(song: RoomSongDto): void {
		if (!this.currentRoom) {
			return;
		}

		if (!this.currentUser) {
			return;
		}
		const input: QueueEventDto = {
			song: song,
			roomID: this.currentRoom.roomID,
			createdAt: new Date(),
		};
		this.socket.emit("undoSongVote", JSON.stringify(input));
	}

	public setEmojiObjects(setObjects: stateSetEmojiObject): void {
		this.setObjects = setObjects;
	}

	public roomIsMine(): boolean {
		if (!this.currentRoom) {
			return false;
		}
		if (!this.currentUser) {
			return false;
		}
		if (!this.currentRoom.creator) {
			return false;
		}
		if (this.currentRoom.creator.userID === this.currentUser.userID) {
			return true;
		}
		return false;
	}

	public async disconnectSocket() {
		this.currentUser = null;
		this.currentRoom = null;
		this.setLiveChatMessages = null;
		this.setJoined = null;
		if (this.socket) {
			this.socket.disconnect();
		}
	}
}
// Export the singleton instance
export const live = LiveSocketService.getInstance();
export const initialiseSocket = live.initialiseSocket;
export const instanceExists = LiveSocketService.instanceExists;
