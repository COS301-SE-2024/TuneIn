import { Injectable } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { Server } from "socket.io";

@Injectable()
export class LiveService {
	private server: Server;
	private roomJobs: Map<string, CronJob[]>;
	constructor(
		private readonly schedulerRegistry: SchedulerRegistry,
		private readonly roomQueue: RoomQueueService,
	) {
		this.roomJobs = new Map<string, CronJob[]>();
	}

	async wait(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

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
	createSongAnnouncement(
		roomID: string,
		startTime: Date,
		event: PlaybackEventDto,
	): void {
		if (!this.serverSet()) {
			throw new Error("Server not set");
		}
		console.log(
			`Creating new song announcement for room ${roomID} at ${startTime.toISOString()}`,
		);
		const job = new CronJob(startTime, async () => {
			try {
				console.log(`${roomID}: New song announcement for room`);
				if (event.song && event.song.track) {
					console.log(
						`${roomID}: Play song (index=${event.song.index}): ${event.song.spotifyID} ${event.song.track.name} by ${event.song.track.artists[0].name}`,
					);
				}
				for (let i = 0; i < 5; i++) {
					this.server.to(roomID).emit(SOCKET_EVENTS.CURRENT_MEDIA, event);
					console.log(`${roomID}: Sent announcement ${i + 1} of 5`);
					await this.wait(1000);
				}
				console.log(`${roomID}: New song announcement complete.`);
			} catch (err) {
				console.error(`${roomID}: Error sending song announcement`);
				console.error(err);
			}
		});
		this.schedulerRegistry.addCronJob(
			`songAnnouncement-${roomID}-${startTime.valueOf()}`,
			job,
		);
		if (!this.roomJobs.has(roomID)) {
			this.roomJobs.set(roomID, []);
		}
		const queue = this.roomJobs.get(roomID);
		if (queue) queue.push(job);
		job.start();
		console.log(
			`Successfully created announcement for room ${roomID} at ${startTime.toISOString()}`,
		);
	}

	cancelSongAnnouncements(roomID: string): void {
		const jobs = this.roomJobs.get(roomID);
		if (jobs) {
			for (const job of jobs) {
				job.stop();
			}
			this.roomJobs.delete(roomID);
		}
	}
}
