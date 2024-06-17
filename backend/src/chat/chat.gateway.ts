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

@WebSocketGateway({
	namespace: "/live-chat",
	transports: ["websocket"],
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly connectedUsers: ConnectedUsersService,
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
	) {}

	@WebSocketServer() server: Server;

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
		@MessageBody() payload: ChatEventDto,
	): Promise<void> {
		console.log(payload);
		//Hello World
		this.server.emit("message", { response: "Hello World" });
	}

	@SubscribeMessage(SOCKET_EVENTS.CONNECT)
	async handleAuth(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatEventDto,
	): Promise<void> {
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
			let user: UserProfileDto;
			if 
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	/*
	@SubscribeMessage(SOCKET_EVENTS.DISCONNECT)
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatEventDto,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}
	*/

	@SubscribeMessage(SOCKET_EVENTS.LIVE_MESSAGE)
	async handleLiveMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatEventDto,
	): Promise<void> {
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
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.GET_LIVE_CHAT_HISTORY)
	async handleGetLiveChatHistory(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatEventDto,
	): Promise<void> {
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
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.DIRECT_MESSAGE)
	async handleDirectMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatEventDto,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY)
	async handleGetDirectMessageHistory(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatEventDto,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.TYPING)
	async handleTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatEventDto,
	): Promise<void> {
		try {
			//this.server.emit();
			/*
			validate auth

			get room id
			if room does not exist
				return error

			emit to room: TYPING, { userId: user.id }
			*/
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.STOP_TYPING)
	async handleStopTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatEventDto,
	): Promise<void> {
		try {
			//this.server.emit();
			/*
			validate auth

			get room id
			if room does not exist
				return error

			emit to room: STOP_TYPING, { userId: user.id }
			*/
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	/*
	@SubscribeMessage(SOCKET_EVENTS.ERROR)
	async handleError(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatEventDto,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}
	*/

	@SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatEventDto,
	): Promise<void> {
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
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.LEAVE_ROOM)
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatEventDto,
	): Promise<void> {
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
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	async handleThrownError(client: Socket, error: Error): Promise<void> {
		const errorResponse: ChatEventDto = {
			event: SOCKET_EVENTS.ERROR,
			sender: null,
			date_created: new Date(),
			errorMessage: error.message,
		};
		this.server.emit(SOCKET_EVENTS.ERROR, errorResponse);
	}
}
