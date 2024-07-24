import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";

@Injectable()
export class LiveService {
	private server: Server;

	serverSet(): boolean {
		return this.server !== undefined;
	}

	setServer(server: Server): void {
		this.server = server;
	}
}
