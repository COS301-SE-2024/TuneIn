import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { SOCKET_EVENTS } from "src/config/constants";

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

	handleConnection(client: any, ...args: any[]) {
		console.log("Client connected");
	}

	handleDisconnect(client: any) {
		console.log("Client disconnected");
	}

	@SubscribeMessage("message")
	handleMessage(client: any, payload: any): void {
		console.log(payload);
		//Hello World
		this.server.emit("message", { response: "Hello World" });
	}

  @SubscribeMessage(SOCKET_EVENTS.CONNECTION)
  handleJoinRoom(client: any, payload: any): void {
    //this.server.emit();
  }

  @SubscribeMessage(SOCKET_EVENTS.DISCONNECT)
  handleLeaveRoom(client: any, payload: any): void {
    //this.server.emit();
  }

  @SubscribeMessage(SOCKET_EVENTS.LIVE_MESSAGE)
  handleLiveMessage(client: any, payload: any): void {
    //this.server.emit();
  }

  @SubscribeMessage(SOCKET_EVENTS.GET_LIVE_CHAT_HISTORY)
  handleGetLiveChatHistory(client: any, payload: any): void {
    //this.server.emit();
  }

  @SubscribeMessage(SOCKET_EVENTS.DIRECT_MESSAGE)
  handleDirectMessage(client: any, payload: any): void {
    //this.server.emit();
  }

  @SubscribeMessage(SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY)
  handleGetDirectMessageHistory(client: any, payload: any): void {
    //this.server.emit();
  }

  @SubscribeMessage(SOCKET_EVENTS.TYPING)
  handleTyping(client: any, payload: any): void {
    //this.server.emit();
  }

  @SubscribeMessage(SOCKET_EVENTS.STOP_TYPING)
  handleStopTyping(client: any, payload: any): void {
	//this.server.emit();
  }

  @SubscribeMessage(SOCKET_EVENTS.ERROR)
  handleError(client: any, payload: any): void {
	//this.server.emit();
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  handleJoinRoom(client: any, payload: any): void {
	//this.server.emit();
  }

  @SubscribeMessage(SOCKET_EVENTS.LEAVE_ROOM)
  handleLeaveRoom(client: any, payload: any): void {
	//this.server.emit();
  }

}
