import { Injectable } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { Server } from "socket.io";
import { PlaybackEventDto } from "./dto/playbackevent.dto";
import { SOCKET_EVENTS } from "../common/constants";
import {
	RoomQueueService,
	ActiveRoom,
	RoomSong,
} from "../modules/rooms/roomqueue/roomqueue.service";
import { RoomSongDto } from "../modules/rooms/dto/roomsong.dto";

const MAX_ANNOUNCEMENTS_PER_ROOM = 5;
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
		const now = new Date();
		console.log(`${now.valueOf()} Checking room queues (${now.toISOString()})`);
		const rooms: Map<string, ActiveRoom> = this.roomQueue.roomQueues;
		const roomsToRemove: string[] = [];
		for (const room of rooms.values()) {
			console.log(`Checking room ${room.room.roomID}`);
			if (room.inactive) {
				room.minutesInactive++;
				console.log(
					`Room ${room.room.roomID} has been inactive for ${room.minutesInactive} minutes`,
				);
				if (room.minutesInactive >= 10) {
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

			if (room.songs.length > 0) {
				const head = room.songs[0];
				const st = head.getPlaybackStartTime();
				if (st !== null) {
					const expectedEndTime = new Date(
						st.getTime() + head.spotifyInfo.duration_ms,
					);
					if (now > expectedEndTime) {
						console.log(
							`Room ${room.room.roomID}: Removing played songs from queue`,
						);
						await this.roomQueue.getQueueState(room.room.roomID); // this will trigger played songs to be removed (via ActiveRoom.updateQueue)
					}
				}
				this.cancelSongAnnouncements(room.room.roomID);
				if (room.songs[0].getPlaybackStartTime() === null) {
					room.songs[0].setPlaybackStartTime(new Date());
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
					UTC_time: currentSong.startTime.getTime(),
				};
				if (currentSong.startTime.getTime() < now.getTime()) {
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
						UTC_time: song.startTime.getTime(),
					};
					this.createSongAnnouncement(room.room.roomID, song.startTime, event);
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
