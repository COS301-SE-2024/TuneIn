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
	async handleJoinRoom(client: Socket, payload: any): Promise<void> {
		//this.server.emit();
	}

	@SubscribeMessage(SOCKET_EVENTS.DISCONNECT)
	async handleLeaveRoom(client: Socket, payload: any): Promise<void> {
		//this.server.emit();
	}

	@SubscribeMessage(SOCKET_EVENTS.LIVE_MESSAGE)
	async handleLiveMessage(client: Socket, payload: any): Promise<void> {
		//this.server.emit();
	}

	@SubscribeMessage(SOCKET_EVENTS.GET_LIVE_CHAT_HISTORY)
	async handleGetLiveChatHistory(client: Socket, payload: any): Promise<void> {
		//this.server.emit();
	}

	@SubscribeMessage(SOCKET_EVENTS.DIRECT_MESSAGE)
	async handleDirectMessage(client: Socket, payload: any): Promise<void> {
		//this.server.emit();
	}

	@SubscribeMessage(SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY)
	async handleGetDirectMessageHistory(client: Socket, payload: any): Promise<void> {
		//this.server.emit();
	}

	@SubscribeMessage(SOCKET_EVENTS.TYPING)
	async handleTyping(client: Socket, payload: any): Promise<void> {
		//this.server.emit();
	}

	@SubscribeMessage(SOCKET_EVENTS.STOP_TYPING)
	async handleStopTyping(client: Socket, payload: any): Promise<void> {
		//this.server.emit();
	}

	@SubscribeMessage(SOCKET_EVENTS.ERROR)
	async handleError(client: Socket, payload: any): Promise<void> {
		//this.server.emit();
	}

	@SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
	async handleJoinRoom(client: Socket, payload: any): Promise<void> {
		//this.server.emit();
	}

	@SubscribeMessage(SOCKET_EVENTS.LEAVE_ROOM)
	async handleLeaveRoom(client: Socket, payload: any): Promise<void> {
		//this.server.emit();
	}
}
