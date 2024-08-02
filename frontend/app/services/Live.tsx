import { io, Socket } from "socket.io-client";
import { LiveChatMessageDto, RoomDto, UserDto } from "../../api-client";
import { ChatEventDto } from "../models/ChatEventDto";
import { PlaybackEventDto } from "../models/PlaybackEventDto";
import axios from "axios";
import auth from "./AuthManagement";
import songService from "./SongService";
import * as utils from "./Utils";
import { SimpleSpotifyPlayback } from "./SimpleSpotifyPlayback";

const TIMEOUT = 5000000;

export type Message = {
	message: LiveChatMessageDto;
	me?: boolean;
};

type stateSetMessages = React.Dispatch<React.SetStateAction<Message[]>>;
type stateSetJoined = React.Dispatch<React.SetStateAction<boolean>>;
type stateSetMessage = React.Dispatch<React.SetStateAction<string>>;
type stateSetIsSending = React.Dispatch<React.SetStateAction<boolean>>;

let playback: SimpleSpotifyPlayback | null = null;

class LiveSocketService {
	private static instance: LiveSocketService;
	private socket: Socket;
	private currentUser: UserDto | null = null;
	private currentRoom: RoomDto | null = null;
	private initialised = false;
	private isConnecting = false;
	private requestingChatHistory = false;

	private backendLatency: number = 0;
	private timeOffset: number = 0;

	private setMessages: stateSetMessages | null = null;
	private setJoined: stateSetJoined | null = null;
	private setMessage: stateSetMessage | null = null;
	private setIsSending: stateSetIsSending | null = null;

	private chatHistoryReceived = false;
	private pingSent = false;

	private constructor() {
		this.currentRoom = null;
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

	public requestChatHistory() {
		if (this.requestingChatHistory) {
			return;
		}

		if (!this.currentUser) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		if (!this.currentRoom) {
			//throw new Error("Current room not set");
			return;
		}

		if (!this.setMessages) {
			return;
		}

		if (this.chatHistoryReceived) {
			return;
		}

		this.requestingChatHistory = true;

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
		this.socket.emit("getLiveChatHistory", JSON.stringify(input));
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

	public async initialiseSocket() {
		console.log("Initialising socket");
		console.log("initialised:", this.initialised);
		if (!this.initialised && !this.isConnecting) {
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
				console.error("Error fetching user's own info:", error);
			}

			console.log("Current user:", this.currentUser);

			if (!this.currentUser) {
				throw new Error("Something went wrong while getting user's info");
			}

			this.socket.on("userJoinedRoom", (response: ChatEventDto) => {
				console.log("SOCKET EVENT: userJoinedRoom", response);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				if (this.setJoined) {
					if (
						response.body &&
						response.body.sender.userID === this.currentUser.userID
					) {
						this.setJoined(true);
					}
				}

				if (!this.currentRoom) {
					//throw new Error("Current room not set");
					return;
				}
				this.requestChatHistory();
			});

			this.socket.on("chatHistory", (history: LiveChatMessageDto[]) => {
				console.log("SOCKET EVENT: chatHistory", history);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				this.chatHistoryReceived = true;
				if (this.setMessages) {
					const u = this.currentUser;
					const chatHistory = history.map((msg) => ({
						message: msg,
						me: msg.sender.userID === u.userID,
					}));
					this.setMessages(chatHistory);
				}
				this.requestingChatHistory = false;
			});

			this.socket.on("liveMessage", (newMessage: ChatEventDto) => {
				console.log("SOCKET EVENT: liveMessage", newMessage);
				if (!this.chatHistoryReceived) {
					this.requestChatHistory();
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
					if (this.setMessage) this.setMessage("");
					if (this.setIsSending) {
						this.setIsSending(false);
						this.setIsSending = null;
					}
				}
				if (this.setMessages) {
					this.setMessages((prevMessages) => [
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

				if (!this.currentRoom) {
					//throw new Error("Current room not set");
					return;
				}

				if (!this.currentRoom.roomID) {
					throw new Error("Room ID not set");
				}

				if (
					this.setJoined &&
					this.currentRoom &&
					this.setMessages &&
					this.setMessage
				) {
					this.joinRoom(
						this.currentRoom.roomID,
						this.setJoined,
						this.setMessages,
						this.setMessage,
					);
				}
			});

			this.socket.on("playMedia", async (response: PlaybackEventDto) => {
				console.log("SOCKET EVENT: playMedia", response);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				if (!this.currentRoom) {
					//throw new Error("Current room not set");
					return;
				}

				if (!response.UTC_time) {
					//throw new Error("UTC time not found");
					return;
				}

				if (!response.songID) {
					throw new Error("Server did not return song ID");
				}
				const songID: string = response.songID;
				const spotifyID: string = await songService.getSpotifyID(songID);

				if (!playback) {
					playback = SimpleSpotifyPlayback.getInstance();
				}

				const deviceID = await playback.getFirstDevice();
				if (deviceID && deviceID !== null) {
					playback.handlePlayback(
						"play",
						deviceID,
						spotifyID,
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
		setMessages: stateSetMessages,
		setMessage: stateSetMessage,
	) {
		this.pollLatency();
		if (!this.currentUser) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		this.setJoined = setJoined;
		this.setMessages = setMessages;
		this.setMessage = setMessage;

		try {
			const token = await auth.getToken();
			const roomDto = await axios.get(`${utils.API_BASE_URL}/rooms/${roomID}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			this.currentRoom = roomDto.data;
		} catch (error) {
			console.error("Error fetching room:", error);
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
		this.chatHistoryReceived = false;
		this.requestChatHistory();
		this.requestingChatHistory = true;
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

		if (this.setMessages) {
			this.setMessages([]);
		}
		this.chatHistoryReceived = false;
		this.requestingChatHistory = false;
		this.currentRoom = null;
	}

	public async sendMessage(message: string, setIsSending: stateSetIsSending) {
		this.pollLatency();
		if (!this.currentUser) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		if (!this.currentRoom) {
			//throw new Error("Current room not set");
			return;
		}

		this.setIsSending = setIsSending;

		if (message.trim()) {
			const u = this.currentUser;
			const newMessage = {
				messageBody: message,
				sender: u,
				roomID: this.currentRoom.roomID,
				dateCreated: new Date(),
			};
			const input: ChatEventDto = {
				userID: u.userID,
				body: newMessage,
			};
			this.socket.emit("liveMessage", JSON.stringify(input));
		}
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

	public startPlayback(roomID: string) {
		this.pollLatency();
		if (!this.currentUser) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		if (!this.currentRoom) {
			//throw new Error("Current room not set");
			return;
		}

		const u = this.currentUser;
		const input: PlaybackEventDto = {
			userID: u.userID,
			roomID: roomID,
			songID: null,
			UTC_time: null,
		};
		this.socket.emit("initPlay", JSON.stringify(input));
	}

	public pausePlayback(roomID: string) {
		this.pollLatency();
		if (!this.currentUser) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		if (!this.currentRoom) {
			//throw new Error("Current room not set");
			return;
		}

		const u = this.currentUser;
		const input: PlaybackEventDto = {
			userID: u.userID,
			roomID: roomID,
			songID: null,
			UTC_time: null,
		};
		this.socket.emit("initPause", JSON.stringify(input));
	}

	public stopPlayback(roomID: string) {
		this.pollLatency();
		if (!this.currentUser) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		if (!this.currentRoom) {
			//throw new Error("Current room not set");
			return;
		}

		const u = this.currentUser;
		const input: PlaybackEventDto = {
			userID: u.userID,
			roomID: roomID,
			songID: null,
			UTC_time: null,
		};
		this.socket.emit("initStop", JSON.stringify(input));
	}

	public canControlRoom(): boolean {
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
		this.setMessages = null;
		this.setJoined = null;
		this.setMessage = null;
		if (this.socket) {
			this.socket.disconnect();
		}
	}
}
// Export the singleton instance
export const live = LiveSocketService.getInstance();
export const initialiseSocket = live.initialiseSocket;
