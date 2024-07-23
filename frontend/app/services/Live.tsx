import { io, Socket } from "socket.io-client";
import { LiveChatMessageDto, RoomDto, UserDto } from "../../api-client";
import { ChatEventDto } from "../models/ChatEventDto";
import axios from "axios";
import auth from "./AuthManagement";
import * as utils from ".//Utils";

const TIMEOUT = 5000;

export type Message = {
	message: LiveChatMessageDto;
	me?: boolean;
};

type stateSetMessages = React.Dispatch<React.SetStateAction<Message[]>>;
type stateSetJoined = React.Dispatch<React.SetStateAction<boolean>>;
type stateSetMessage = React.Dispatch<React.SetStateAction<string>>;
type stateSetIsSending = React.Dispatch<React.SetStateAction<boolean>>;

class LiveChatService {
	private static instance: LiveChatService;
	private socket: Socket;
	private currentUser: UserDto | null = null;
	private currentRoom: RoomDto | null = null;
	private initialised = false;
	private isConnecting = false;
	private requestingChatHistory = false;

	private backendLatency: number = 0;

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

	public static getInstance(): LiveChatService {
		if (!LiveChatService.instance) {
			LiveChatService.instance = new LiveChatService();
		}
		return LiveChatService.instance;
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
		const input = {
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

		return new Promise<void>((resolve, reject) => {
			const startTime = Date.now();
			this.pingSent = true;

			// Set up a timeout
			const timeoutId = setTimeout(() => {
				this.pingSent = false;
				console.log("Ping timed out.");
				reject(new Error("Ping timed out"));
			}, timeout);

			// Send the ping message with a callback
			this.socket.volatile.emit("ping", () => {
				clearTimeout(timeoutId);
				const roundTripTime = Date.now() - startTime;
				console.log(`Ping round-trip time: ${roundTripTime}ms`);
				this.pingSent = false;
				this.backendLatency = roundTripTime;
				resolve();
			});
		}).catch((error) => {
			console.error("Ping failed:", error.message);
			// Optionally, retry sending the ping here
			throw error; // Re-throw the error to maintain the Promise<void> type
		});
	}

	public async initialiseSocket() {
		console.log("Initialising socket");
		console.log("initialised:", this.initialised);
		if (!this.initialised && !this.isConnecting) {
			this.isConnecting = true;

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

				if (!this.setJoined) {
					//throw new Error("setJoined not set");
					return;
				}

				if (!this.currentRoom) {
					//throw new Error("Current room not set");
					return;
				}

				if (
					response.body &&
					response.body.sender.userID === this.currentUser.userID
				) {
					this.setJoined(true);
				}

				this.requestChatHistory();
			});

			this.socket.on("chatHistory", (history: LiveChatMessageDto[]) => {
				console.log("SOCKET EVENT: chatHistory", history);
				if (!this.currentUser) {
					//throw new Error("Something went wrong while getting user's info");
					return;
				}

				if (!this.setMessages) {
					return;
				}

				this.chatHistoryReceived = true;

				const u = this.currentUser;
				const chatHistory = history.map((msg) => ({
					message: msg,
					me: msg.sender.userID === u.userID,
				}));
				this.setMessages(chatHistory);

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

				if (!this.setMessages) {
					return;
				}

				if (!this.setMessage) {
					return;
				}

				if (!this.setIsSending) {
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
					this.setMessage("");
					this.setIsSending(false);
					this.setIsSending = null;
				}
				this.setMessages((prevMessages) => [
					...prevMessages,
					{ message, me: message.sender.userID === u.userID },
				]);
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

				const input = {
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
	}

	public async joinRoom(
		roomID: string,
		setJoined: stateSetJoined,
		setMessages: stateSetMessages,
		setMessage: stateSetMessage,
	) {
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
		const input = {
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
		const input = {
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
	}

	public async sendMessage(message: string, setIsSending: stateSetIsSending) {
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
			const input = {
				userID: u.userID,
				body: newMessage,
			};
			this.socket.emit("liveMessage", JSON.stringify(input));
		}
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
export const live = LiveChatService.getInstance();
