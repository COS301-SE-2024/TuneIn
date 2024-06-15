import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";

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
	handleMessage(client: any, payload: any): string {
		console.log(payload);
		//Hello World
		this.server.emit("message", { response: "Hello World" });
	}
}
