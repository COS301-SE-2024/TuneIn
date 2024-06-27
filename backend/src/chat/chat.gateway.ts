import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "src/config/constants";
import { ChatEventDto } from "./dto/chatevent.dto";
import { ConnectedUsersService } from "./connecteduser/connecteduser.service";
import { DbUtilsService } from "src/modules/db-utils/db-utils.service";
import { DtoGenService } from "src/modules/dto-gen/dto-gen.service";
import { LiveChatMessageDto } from "./dto/livechatmessage.dto";
import { RoomsService } from "src/modules/rooms/rooms.service";

@WebSocketGateway({
	namespace: "/live-chat",
	transports: ["websocket"],
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
})
//@UseFilters(new WsExceptionFilter())
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly connectedUsers: ConnectedUsersService,
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly roomService: RoomsService,
	) {}

	@WebSocketServer() server: Server;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async handleConnection(client: Socket, ...args: any[]) {
		console.log("Client connected with ID: " + client.id);
	}

	async handleDisconnect(client: Socket) {
		console.log("Client (id: " + client.id + ") disconnected");
		this.connectedUsers.removeConnectedUser(client.id);
	}

	@SubscribeMessage("message")
	async handleMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		console.log(p);
		//Hello World
		this.server.emit("message", { response: "Hello World" });
	}

	@SubscribeMessage(SOCKET_EVENTS.CONNECT)
	async handleAuth(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		console.log("Received event: " + SOCKET_EVENTS.CONNECT);
		try {
			/*
			if no token, return error
			if token
				if token is not valid
					return error

			get user info
			add user to connected users
			emit to socket: CONNECTION, { userId: user.id }
			*/

			//auth
			const payload: ChatEventDto = await this.validateInputEvent(p);
			if (!payload.userID) {
				throw new Error("No userID provided");
			}
			await this.connectedUsers.addConnectedUser(client.id, payload.userID);
			const response: ChatEventDto = {
				userID: null,
				date_created: new Date(),
			};
			this.server.emit(SOCKET_EVENTS.CONNECTED, response);
			console.log("Response emitted: " + SOCKET_EVENTS.CONNECTED);
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
		}
	}

	/*
	@SubscribeMessage(SOCKET_EVENTS.DISCONNECT)
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
		}
	}
	*/

	@SubscribeMessage(SOCKET_EVENTS.LIVE_MESSAGE)
	async handleLiveMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		console.log("Received event: " + SOCKET_EVENTS.LIVE_MESSAGE);
		try {
			//this.server.emit();
			/*
			validate auth

			get room id
			if room does not exist
				return error

			create message
			emit to room: LIVE_MESSAGE, { message: payload.message }
			*/

			//auth

			const payload: ChatEventDto = await this.validateInputEvent(p);
			if (!payload.userID) {
				throw new Error("No userID provided");
			}

			if (!payload.body) {
				throw new Error("No body provided");
			}
			const roomID: string = payload.body.roomID;
			if (!roomID) {
				throw new Error("No roomID provided");
			}
			if (!this.dbUtils.roomExists(roomID)) {
				throw new Error("Room does not exist");
			}

			const message: LiveChatMessageDto = payload.body;
			const messageID: string = await this.roomService.createLiveChatMessage(
				message,
				payload.userID,
			);
			const finalMessage: LiveChatMessageDto =
				await this.dtogen.generateLiveChatMessageDto(messageID);
			const response: ChatEventDto = {
				userID: finalMessage.sender.userID,
				date_created: new Date(),
				body: finalMessage,
			};
			this.server.to(roomID).emit(SOCKET_EVENTS.LIVE_MESSAGE, response);
			console.log("Response emitted: " + SOCKET_EVENTS.LIVE_MESSAGE);
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.GET_LIVE_CHAT_HISTORY)
	async handleGetLiveChatHistory(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		console.log("Received event: " + SOCKET_EVENTS.GET_LIVE_CHAT_HISTORY);
		try {
			//this.server.emit();
			/*
			validate auth

			get room id
			if room does not exist
				return error

			get chat history
			emit to socket: LIVE_MESSAGE, { message: chatHistory }
			*/

			//auth

			const payload: ChatEventDto = await this.validateInputEvent(p);
			if (!payload.userID) {
				throw new Error("No userID provided");
			}

			if (!payload.body) {
				throw new Error("No body provided");
			}
			const roomID: string = payload.body.roomID;
			if (!roomID) {
				throw new Error("No roomID provided");
			}
			if (!this.dbUtils.roomExists(roomID)) {
				throw new Error("Room does not exist");
			}

			const messages: LiveChatMessageDto[] =
				await this.roomService.getLiveChatHistoryDto(roomID);
			this.server.emit(SOCKET_EVENTS.CHAT_HISTORY, messages);
			console.log("Response emitted: " + SOCKET_EVENTS.CHAT_HISTORY);
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.DIRECT_MESSAGE)
	async handleDirectMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		console.log("Received event: " + SOCKET_EVENTS.DIRECT_MESSAGE);
		try {
			//this.server.emit();
			console.log(p);
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY)
	async handleGetDirectMessageHistory(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		console.log("Received event: " + SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY);
		try {
			console.log(p);
			//this.server.emit();
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.TYPING)
	async handleTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		console.log("Received event: " + SOCKET_EVENTS.TYPING);
		try {
			//this.server.emit();
			/*
			validate auth

			get room id
			if room does not exist
				return error

			emit to room: TYPING, { userId: user.id }
			*/
			console.log(p);
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.STOP_TYPING)
	async handleStopTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		console.log("Received event: " + SOCKET_EVENTS.STOP_TYPING);
		try {
			//this.server.emit();
			/*
			validate auth

			get room id
			if room does not exist
				return error

			emit to room: STOP_TYPING, { userId: user.id }
			*/
			console.log(p);
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
		}
	}

	/*
	@SubscribeMessage(SOCKET_EVENTS.ERROR)
	async handleError(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
		}
	}
	*/

	@SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		console.log("Received event: " + SOCKET_EVENTS.JOIN_ROOM);
		try {
			//this.server.emit();
			/*
			validate auth

			get room id
			if room does not exist
				return error
			
			add user to room data structure
			add user to socket room
			emit to room: USER_JOINED, { userId: user.id }
			*/

			//auth

			const payload: ChatEventDto = await this.validateInputEvent(p);
			if (!payload.userID) {
				throw new Error("No userID provided");
			}

			if (!payload.body) {
				throw new Error("No body provided");
			}
			const roomID: string = payload.body.roomID;
			if (!roomID) {
				throw new Error("No roomID provided");
			}
			if (!this.dbUtils.roomExists(roomID)) {
				throw new Error("Room does not exist");
			}

			await this.connectedUsers.setRoomId(client.id, roomID);
			client.join(roomID);
			const response: ChatEventDto = {
				userID: null,
				date_created: new Date(),
			};
			this.server.to(roomID).emit(SOCKET_EVENTS.USER_JOINED_ROOM, response);
			console.log("Response emitted: " + SOCKET_EVENTS.USER_JOINED_ROOM);
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.LEAVE_ROOM)
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		console.log("Received event: " + SOCKET_EVENTS.LEAVE_ROOM);
		try {
			//this.server.emit();
			/*
			validate auth

			get room id
			if room does not exist
				return error

			remove user from room data structure
			remove user from socket room
			emit to room: USER_LEFT, { userId: user.id }
			*/

			//auth

			const payload: ChatEventDto = await this.validateInputEvent(p);
			if (!payload.userID) {
				throw new Error("No userID provided");
			}

			const roomID = this.connectedUsers.getRoomId(client.id);
			if (!roomID) {
				throw new Error("User is not in a room");
			}
			if (!this.dbUtils.roomExists(roomID)) {
				throw new Error("Room does not exist");
			}

			const response: ChatEventDto = {
				userID: null,
				date_created: new Date(),
			};
			this.server.to(roomID).emit(SOCKET_EVENTS.USER_LEFT_ROOM, response);
			console.log("Response emitted: " + SOCKET_EVENTS.USER_LEFT_ROOM);
			await this.connectedUsers.leaveRoom(client.id);
			client.leave(roomID);
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
		}
	}

	async validateInputEvent(payload: string): Promise<ChatEventDto> {
		/*
		if no token, return error
		if token
			if token is not valid
				return error
		*/
		let p: ChatEventDto;
		try {
			const j = JSON.parse(payload);
			p = j as ChatEventDto;
		} catch (e) {
			console.error(e);
			throw new Error("Invalid JSON received");
		}
		if (!p.userID) {
			throw new Error("No userID provided");
		}

		const result: ChatEventDto = {
			userID: p.userID,
		};
		if (p.date_created) {
			result.date_created = p.date_created;
		}
		if (p.body) {
			result.body = p.body;
		}
		if (p.errorMessage) {
			throw new Error("errorMessage is not a valid field for input events.");
		}
		return result;
	}

	async handleThrownError(client: Socket, error: Error): Promise<void> {
		const errorResponse: ChatEventDto = {
			userID: null,
			date_created: new Date(),
			errorMessage: error.message,
		};
		this.server.emit(SOCKET_EVENTS.ERROR, errorResponse);
		console.log("Error emitted: " + SOCKET_EVENTS.ERROR);
	}
}
