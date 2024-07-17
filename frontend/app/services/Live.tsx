import { io, Socket } from "socket.io-client";
import { LiveChatMessageDto, RoomDto, UserDto } from "../../api-client";
import { ChatEventDto } from "../models/ChatEventDto";
import axios from "axios";
import auth from "./AuthManagement";
import * as utils from ".//Utils";

export type Message = {
	message: LiveChatMessageDto;
	me?: boolean;
};

type stateSetMessages = React.Dispatch<React.SetStateAction<Message[]>>;
type stateSetJoined = React.Dispatch<React.SetStateAction<boolean>>;
type setMessage = React.Dispatch<React.SetStateAction<string>>;

class LiveChatService {
	private static instance: LiveChatService;
	private socket: Socket;
	private currentUser: UserDto | null = null;
	private currentRoom: RoomDto | null = null;

	private setMessages: stateSetMessages | null = null;
	private setJoined: stateSetJoined | null = null;
	private setMessage: setMessage | null = null;

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

	public async initializeSocket() {
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

		if (!this.currentUser) {
			throw new Error("Something went wrong while getting user's info");
		}

		this.socket.on("userJoinedRoom", (response: ChatEventDto) => {
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

			const u: UserDto = this.currentUser;
			const input = {
				userID: u.userID,
				body: {
					messageBody: "",
					sender: u,
					roomID: this.currentRoom.roomID,
					dateCreated: new Date(),
				},
			};
			this.socket.emit("getChatHistory", JSON.stringify(input));
		});

		this.socket.on("chatHistory", (history: LiveChatMessageDto[]) => {
			if (!this.currentUser) {
				//throw new Error("Something went wrong while getting user's info");
				return;
			}

			if (!this.setMessages) {
				return;
			}

			const u = this.currentUser;
			const chatHistory = history.map((msg) => ({
				message: msg,
				me: msg.sender.userID === u.userID,
			}));
			this.setMessages(chatHistory);
		});

		this.socket.on("liveMessage", (newMessage: ChatEventDto) => {
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

			if (!newMessage.body) {
				//throw new Error("Message body not found");
				return;
			}

			const message = newMessage.body;
			const u = this.currentUser;
			const me = message.sender.userID === u.userID;
			if (me) {
				this.setMessage("");
			}
			this.setMessages((prevMessages) => [
				...prevMessages,
				{ message, me: message.sender.userID === u.userID },
			]);
		});

		this.socket.on("userLeftRoom", (response: ChatEventDto) => {
			if (!this.currentUser) {
				//throw new Error("Something went wrong while getting user's info");
				return;
			}

			console.log("User left room:", response);
		});

		this.socket.on("error", (response: ChatEventDto) => {
			if (!this.currentUser) {
				//throw new Error("Something went wrong while getting user's info");
				return;
			}

			console.error("Error:", response.errorMessage);
		});

		this.socket.on("connect", () => {
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

			if (this.setJoined && this.currentRoom) {
				this.joinRoom(this.currentRoom.roomID, this.setJoined);
			}
		});
	}

	public async joinRoom(roomID: string, setJoined: stateSetJoined) {
		if (!this.currentUser) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		this.setJoined = setJoined;

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
	}

	public async leaveRoom(roomID: string) {
		if (!this.currentUser) {
			//throw new Error("Something went wrong while getting user's info");
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
				roomID: roomID,
				dateCreated: new Date(),
			},
		};
		this.socket.emit("leaveRoom", JSON.stringify(input));
	}

	public async sendMessage(message: string, setMessage: setMessage) {
		if (!this.currentUser) {
			//throw new Error("Something went wrong while getting user's info");
			return;
		}

		if (!this.currentRoom) {
			//throw new Error("Current room not set");
			return;
		}

		this.setMessage = setMessage;

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
		if (this.socket) {
			this.socket.disconnect();
		}
	}
}
// Export the singleton instance
export const liveChatService = LiveChatService.getInstance();
