import { Injectable } from "@nestjs/common";
//import { Cron } from "@nestjs/schedule";
import { Server } from "socket.io";

@Injectable()
export class LiveService {
	private server: Server;

	serverSet(): boolean {
		return this.server !== undefined;
	}

	setServer(server: Server): void {
		this.server = server;
	}

	//@Cron("*/5 * * * * *") // Run this every 5 seconds
	/*
	synchronizePlayback(): void {
		const currentTime = Date.now(); // Get current Epoch time

		for (const sessionId in this.queues) {
			const queue = this.queues[sessionId];
			const currentMedia = queue.find((item) => currentTime >= item.startTime);

			if (currentMedia) {
				// Broadcast current playback state to all clients in the session
				this.server.to(sessionId).emit("syncPlayback", {
					mediaId: currentMedia.mediaId,
					position: currentTime - currentMedia.startTime,
				});
			}
		}
	}
	*/
}
