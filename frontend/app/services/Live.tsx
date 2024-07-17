import io from "socket.io-client";
//frontend/api-client
import { LiveChatMessageDto, RoomDto, UserDto } from "../../../api-client";
//frontend/app/models/ChatEventDto.ts
import { ChatEventDto } from "../models/ChatEventDto";
import axios from "axios";
import auth from "./AuthManagement";
import * as utils from ".//Utils";

class LiveChatService {
	private static instance: LiveChatService;
	private socket: any = null;
	private userRef: UserDto | null = null;
	private roomObjRef: RoomDto | null = null;
	private token: string | null = null;
	private roomID: string | null = null;

	private constructor() {}

	public static getInstance(): LiveChatService {
		if (!LiveChatService.instance) {
			LiveChatService.instance = new LiveChatService();
		}
		return LiveChatService.instance;
	}

	//public async initializeSocket = async (roomID, setMessages, setMessage, setJoined) => {
	public async initializeSocket(
		roomID: string,
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
			userRef = response.data;
		} catch (error) {
			console.error("Error fetching user's own info:", error);
		}

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

		socket = io.io(utils.API_BASE_URL + "/live-chat", {
			transports: ["websocket"],
		});

		socket.on("userJoinedRoom", (response) => {
			const u = userRef;
			const input = {
				userID: u.userID,
				body: {
					messageBody: "",
					sender: u,
					roomID: roomID,
					dateCreated: new Date(),
				},
			};
			socket.emit("getChatHistory", JSON.stringify(input));
		});

		socket.on("chatHistory", (history) => {
			const u = userRef;
			const chatHistory = history.map((msg) => ({
				message: msg,
				me: msg.sender.userID === u.userID,
			}));
			setMessages(chatHistory);
		});

		socket.on("liveMessage", (newMessage) => {
			const message = newMessage.body;
			const u = userRef;
			const me = message.sender.userID === u.userID;
			if (me) {
				setMessage("");
			}
			setMessages((prevMessages) => [
				...prevMessages,
				{ message, me: message.sender.userID === u.userID },
			]);
		});

		socket.on("userLeftRoom", (response) => {
			console.log("User left room:", response);
		});

		socket.on("error", (response) => {
			console.error("Error:", response.errorMessage);
		});

		socket.on("connect", () => {
			const input = {
				userID: userRef.userID,
			};
			socket.emit("connectUser", JSON.stringify(input));
		});

		socket.on("connected", (response) => {
			if (!setJoined && roomObjRef) {
				joinRoom(roomID);
			}
		});
	}

	public async joinRoom(roomID: string) {
		const u = userRef;
		const input = {
			userID: u.userID,
			body: {
				messageBody: "",
				sender: u,
				roomID: roomID,
				dateCreated: new Date(),
			},
		};
		socket.emit("joinRoom", JSON.stringify(input));
	}

	public async leaveRoom(roomID: string) {
		const u = userRef;
		const input = {
			userID: u.userID,
			body: {
				messageBody: "",
				sender: u,
				roomID: roomID,
				dateCreated: new Date(),
			},
		};
		socket.emit("leaveRoom", JSON.stringify(input));
	}

	public async sendMessage(message: string, roomID: string) {
		if (message.trim()) {
			const u = userRef;
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
			socket.emit("liveMessage", JSON.stringify(input));
		}
	}

	public async disconnectSocket() {
		if (socket) {
			socket.disconnect();
		}
	}
}
// Export the singleton instance
export const liveChatService = LiveChatService.getInstance();
