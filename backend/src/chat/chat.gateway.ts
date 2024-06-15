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
import { LiveChatEventDto } from "./dto/livechatevent.dto";

@WebSocketGateway({
	namespace: "/chat",
	transports: ["websocket"],
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;

	async handleConnection(client: Socket, ...args: any[]) {
		console.log("Client connected");
	}

	async handleDisconnect(client: Socket) {
		console.log("Client disconnected");
	}

	@SubscribeMessage("message")
	async handleMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: any,
	): Promise<void> {
		console.log(payload);
		//Hello World
		this.server.emit("message", { response: "Hello World" });
	}

	@SubscribeMessage(SOCKET_EVENTS.CONNECTION)
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: any,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.DISCONNECT)
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: any,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.LIVE_MESSAGE)
	async handleLiveMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: any,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.GET_LIVE_CHAT_HISTORY)
	async handleGetLiveChatHistory(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: any,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.DIRECT_MESSAGE)
	async handleDirectMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: any,
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
		@MessageBody() payload: any,
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
		@MessageBody() payload: any,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.STOP_TYPING)
	async handleStopTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: any,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.ERROR)
	async handleError(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: any,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: any,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.LEAVE_ROOM)
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: any,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			this.handleThrownError(client, error);
		}
	}

	async handleThrownError(client: Socket, error: Error): Promise<void> {
		const errorResponse: LiveChatEventDto = {
			event: SOCKET_EVENTS.ERROR,
			sender: null,
			date_created: new Date(),
			errorMessage: error.message,
		};
		this.server.emit(SOCKET_EVENTS.ERROR, errorResponse);
	}
}
