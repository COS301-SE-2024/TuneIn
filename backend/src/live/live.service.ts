import { Injectable } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { Server } from "socket.io";
import { PlaybackEventDto } from "./dto/playbackevent.dto";
import { SOCKET_EVENTS } from "../common/constants";
import {
	RoomQueueService,
	ActiveRoom,
} from "../modules/rooms/roomqueue/roomqueue.service";
import { RoomSongDto } from "../modules/rooms/dto/roomsong.dto";

const MAX_ANNOUNCEMENTS_PER_ROOM = 5;
const ROOM_ACTIVITY_TIMEOUT = 10;
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

	@Cron("0 * * * * *") // Run this every 1 minutes
	async checkRoomQueues() {
		// const jobs = this.schedulerRegistry.getCronJobs();
		let now = new Date().valueOf();
		console.log(
			`${new Date().valueOf()} Checking room queues (${new Date().toISOString()})`,
		);
		const rooms: Map<string, ActiveRoom> = this.roomQueue.roomQueues;
		const roomsToRemove: string[] = [];
		for (const room of rooms.values()) {
			console.log(`Checking room ${room.room.roomID}`);
			now = new Date().valueOf();
			if (room.inactive) {
				room.minutesInactive++;
				console.log(
					`Room ${room.room.roomID} has been inactive for ${room.minutesInactive} minutes`,
				);
				if (room.minutesInactive >= ROOM_ACTIVITY_TIMEOUT) {
					console.log(
						`Will remove room ${room.room.roomID} from queue due to inactivity`,
					);
					roomsToRemove.push(room.room.roomID);
					continue;
				}
			}
			if (room.songs.length === 0) {
				room.inactive = true;
				console.log(
					`Room ${room.room.roomID} has no songs in the queue. Marking as inactive.`,
				);
				continue;
			}

			console.log(`Flushing room ${room.room.roomID} to DB`);
			const start: Date = new Date();
			await this.roomQueue.flushToDB(room.room.roomID);
			console.log(
				`Finished flushing room ${room.room.roomID} to DB in ${
					new Date().valueOf() - start.valueOf()
				}ms`,
			);

			if (room.songs.length > 0) {
				const head = room.songs[0];
				const st = head.getPlaybackStartTime();
				if (st !== null) {
					const expectedEndTime = st + head.songDurationMs + 5000; // 5 seconds of buffer for this code to run
					if (now > expectedEndTime) {
						console.log(
							`Room ${room.room.roomID}: Removing played songs from queue`,
						);
						await this.roomQueue.getQueueState(room.room.roomID); // this will trigger played songs to be removed (via ActiveRoom.updateQueue)
					}
				}
				this.cancelSongAnnouncements(room.room.roomID);
				if (room.songs[0].getPlaybackStartTime() === null) {
					room.songs[0].setPlaybackStartTime(new Date().valueOf());
					await this.roomQueue.refreshQueue(room.room.roomID);
				}
				const songsAsRoomSongDto: RoomSongDto[] = room
					.queueAsRoomSongDto()
					.slice(0, MAX_ANNOUNCEMENTS_PER_ROOM);
				const currentSong: RoomSongDto = songsAsRoomSongDto[0];
				if (!currentSong.startTime) {
					console.warn(
						`The current song in the queue for room ${room.room.roomID} has no start time. Skipping room entirely.`,
					);
					continue;
				}
				const currentSongEvent: PlaybackEventDto = {
					date_created: new Date(),
					userID: null,
					roomID: room.room.roomID,
					spotifyID: currentSong.spotifyID,
					song: currentSong,
					UTC_time: currentSong.startTime,
				};
				if (currentSong.startTime < now) {
					if (!currentSong.pauseTime) {
						this.server
							.to(room.room.roomID)
							.emit(SOCKET_EVENTS.CURRENT_MEDIA, currentSongEvent);
					} else {
						console.warn(
							`The current song in the queue for room ${room.room.roomID} is paused. Skipping room entirely.`,
						);
					}
				}
				for (const song of songsAsRoomSongDto) {
					if (!song.startTime) {
						console.warn(
							`A song in the queue for room ${room.room.roomID} has no start time. Skipping queue.`,
						);
						break;
					}
					if (song.startTime < now) {
						console.warn(
							`A song in the queue for room ${room.room.roomID} has a start time in the past. Skipping song.`,
						);
						continue;
					}
					const event: PlaybackEventDto = {
						date_created: new Date(),
						userID: null,
						roomID: room.room.roomID,
						spotifyID: song.spotifyID,
						song: song,
						UTC_time: song.startTime,
					};
					this.createSongAnnouncement(
						room.room.roomID,
						new Date(song.startTime),
						event,
					);
				}
			}
		}
		for (const roomID of roomsToRemove) {
			this.roomQueue.roomQueues.delete(roomID);
		}
	}

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
				if (event.song) {
					console.log(
						`${roomID}: Play song (index=${event.song.index}): ${event.song.spotifyID}`,
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
