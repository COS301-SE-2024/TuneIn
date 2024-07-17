import { io, Socket } from "socket.io-client";
import { LiveChatMessageDto, RoomDto, UserDto } from "../../api-client";
import { ChatEventDto } from "../models/ChatEventDto";
import axios from "axios";
import auth from "./AuthManagement";
import * as utils from ".//Utils";

type Message = {
	message: LiveChatMessageDto;
	me?: boolean;
};

class LiveChatService {
	private static instance: LiveChatService;
	private socket: Socket;
	private currentUser: UserDto | null = null;
	private roomObjRef: RoomDto | null = null;
	private token: string | null = null;
	private roomID: string | null = null;

	private setMessages: React.Dispatch<React.SetStateAction<Message[]>> | null =
		null;

	private constructor() {
		this.roomID = null;
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

	public async initializeSocket(
		setMessages: Function,
		setMessage: Function,
		setJoined: Function,
	) {
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

		/*
		try {
			const roomDto = await axios.get(`${utils.API_BASE_URL}/rooms/${roomID}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			roomObjRef = roomDto.data;
		} catch (error) {
			console.error("Error fetching room:", error);
		}
        */

		this.socket.on("userJoinedRoom", (response: ChatEventDto) => {
			if (!this.currentUser) {
				throw new Error("Something went wrong while getting user's info");
			}

			if (!this.roomID) {
				throw new Error("Room ID not set");
			}

			if (
				response.body &&
				response.body.sender.userID === this.currentUser.userID
			) {
				setJoined(true);
			}

			const u: UserDto = this.currentUser;
			const input = {
				userID: u.userID,
				body: {
					messageBody: "",
					sender: u,
					roomID: this.roomID,
					dateCreated: new Date(),
				},
			};
			this.socket.emit("getChatHistory", JSON.stringify(input));
		});

		this.socket.on("chatHistory", (history: LiveChatMessageDto[]) => {
			if (!this.currentUser) {
				throw new Error("Something went wrong while getting user's info");
			}

			const u = this.currentUser;
			const chatHistory = history.map((msg) => ({
				message: msg,
				me: msg.sender.userID === u.userID,
			}));
			setMessages(chatHistory);
		});

		this.socket.on("liveMessage", (newMessage: ChatEventDto) => {
			if (!this.currentUser) {
				throw new Error("Something went wrong while getting user's info");
			}

			if (!newMessage.body) {
				throw new Error("Message body not found");
			}

			const message = newMessage.body;
			const u = this.currentUser;
			const me = message.sender.userID === u.userID;
			if (me) {
				setMessage("");
			}
			this.setMessages((prevMessages) => [
				...prevMessages,
				{ message, me: message.sender.userID === u.userID },
			]);
		});

		this.socket.on("userLeftRoom", (response: ChatEventDto) => {
			if (!this.currentUser) {
				throw new Error("Something went wrong while getting user's info");
			}

			console.log("User left room:", response);
		});

		this.socket.on("error", (response: ChatEventDto) => {
			if (!this.currentUser) {
				throw new Error("Something went wrong while getting user's info");
			}

			console.error("Error:", response.errorMessage);
		});

		this.socket.on("connect", () => {
			if (!this.currentUser) {
				throw new Error("Something went wrong while getting user's info");
			}

			const input = {
				userID: this.currentUser.userID,
			};
			this.socket.emit("connectUser", JSON.stringify(input));
		});

		this.socket.on("connected", (response: ChatEventDto) => {
			if (!this.currentUser) {
				throw new Error("Something went wrong while getting user's info");
			}

			if (!this.roomID) {
				throw new Error("Room ID not set");
			}

			if (!setJoined && this.roomObjRef) {
				this.joinRoom(this.roomID);
			}
		});
	}

	public async joinRoom(roomID: string) {
		if (!this.currentUser) {
			throw new Error("Something went wrong while getting user's info");
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
			throw new Error("Something went wrong while getting user's info");
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
		this.socket.emit("leaveRoom", JSON.stringify(input));
	}

	/*

	const sendMessage = () => {
		if (message.trim() && currentUser.current && socket.current) {
			const u: UserDto = currentUser.current;
			const newMessage: LiveChatMessageDto = {
				messageBody: message,
				sender: u,
				roomID: roomID,
				dateCreated: new Date(),
			};
			const input: ChatEventDto = {
				userID: u.userID,
				body: newMessage,
			};
			console.log("Sending message:", input);
			socket.current.emit("liveMessage", JSON.stringify(input));
			// do not add the message to the state here, wait for the server to send it back
			//setMessages([...messages, { message: newMessage, me: true }]);
		}
	};
	*/
	public async sendMessage(message: string, roomID: string) {
		if (!this.currentUser) {
			throw new Error("Something went wrong while getting user's info");
		}

		if (message.trim()) {
			const u = this.currentUser;
			const newMessage = {
				messageBody: message,
				sender: u,
				roomID: roomID,
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
		if (this.socket) {
			this.socket.disconnect();
		}
	}
}
// Export the singleton instance
export const liveChatService = LiveChatService.getInstance();
