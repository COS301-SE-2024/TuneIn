import { Injectable } from "@nestjs/common";
import { DbUtilsService } from "../../modules/db-utils/db-utils.service";
import { DtoGenService } from "../../modules/dto-gen/dto-gen.service";
import { UserDto } from "../../modules/users/dto/user.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import * as PrismaTypes from "@prisma/client";

interface liveChatUser {
	user: UserDto;
	roomID: string | undefined;
}

@Injectable()
export class RoomUsersService {
	constructor(
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly prisma: PrismaService,
	) {}

	private connectedUsers = new Map<string, liveChatUser>();

	async addConnectedUser(
		socketId: string,
		userId: string,
		roomID?: string,
	): Promise<void> {
		if (this.connectedUsers.has(socketId)) {
			return;
		}
		if (!(await this.dbUtils.userExists(userId))) {
			throw new Error("User with ID " + userId + " does not exist");
		}
		const user: UserDto = await this.dtogen.generateUserDto(userId);

		if (roomID && roomID !== undefined) {
			if (!(await this.dbUtils.roomExists(roomID))) {
				throw new Error("Room with ID " + roomID + " does not exist");
			}
			this.connectedUsers.set(socketId, { user, roomID });
		} else {
			this.connectedUsers.set(socketId, { user, roomID: undefined });
		}

		console.log("Added connected user: " + user);
		console.log("Connected users: " + this.connectedUsers);
	}

	removeConnectedUser(socketId: string) {
		this.connectedUsers.delete(socketId);
	}

	getConnectedUser(socketId: string): liveChatUser | null {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			return null;
		}
		return u;
	}

	getUserId(socketId: string): string | null {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			return null;
		}
		const user = u.user;
		if (!user || user === undefined) {
			throw new Error("Connected user does not have a user object");
		}
		if (!user.userID || user.userID === undefined) {
			throw new Error("Connected user does not have a userID");
		}
		return user.userID;
	}

	async setRoomId(socketId: string, roomID: string) {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			throw new Error("Connected user does not exist");
		}
		if (!(await this.dbUtils.roomExists(roomID))) {
			throw new Error("Room with ID " + roomID + " does not exist");
		}
		u.roomID = roomID;
	}

	async leaveRoom(socketId: string) {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			throw new Error("Connected user does not exist");
		}
		if (!u.roomID || u.roomID === undefined) {
			//throw new Error("Connected user does not have a roomID");
		}
		u.roomID = undefined;
	}

	getRoomId(socketId: string): string | null {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			return null;
		}
		if (!u.roomID || u.roomID === undefined) {
			throw new Error("Connected user does not have a roomID");
		}
		return u.roomID;
	}

	getRoomUsers(roomID: string): UserDto[] {
		const users: UserDto[] = [];
		this.connectedUsers.forEach((value) => {
			if (value.roomID === roomID) {
				users.push(value.user);
			}
		});
		return users;
	}

	//is song playing
	async isPlaying(roomID: string): Promise<boolean> {
		//if queue is non-empty, return true
		const queue: PrismaTypes.queue[] | null = await this.prisma.queue.findMany({
			where: {
				room_id: roomID,
				is_done_playing: false,
				start_time: {
					not: null,
				},
			},
			orderBy: {
				start_time: "asc",
			},
		});
		if (!queue || queue === null) {
			throw new Error("There was an issue fetching the queue");
		}
		if (queue.length > 0) {
			return true;
		}
		return false;
	}

	async isPaused(roomID: string): Promise<boolean> {
		//if queue is non-empty, return true
		const queue: PrismaTypes.queue[] | null = await this.prisma.queue.findMany({
			where: {
				room_id: roomID,
				is_done_playing: false,
				start_time: {
					not: null,
				},
			},
			orderBy: {
				start_time: "asc",
			},
		});
		if (!queue || queue === null) {
			throw new Error("There was an issue fetching the queue");
		}
		if (queue.length > 0) {
			return true;
		}
		return false;
	}

	//get current song
	async getCurrentSong(roomID: string): Promise<string | null> {
		const queue: PrismaTypes.queue[] | null = await this.prisma.queue.findMany({
			where: {
				room_id: roomID,
				is_done_playing: false,
			},
			orderBy: {
				start_time: "asc",
			},
		});
		if (!queue || queue === null) {
			throw new Error("There was an issue fetching the queue");
		}
		if (queue.length === 0) {
			return null;
		}
		const q = queue[0];
		if (q === null || !q) {
			throw new Error("Queue is null");
		}
		return q.song_id;
	}

	async getCurrentSongStartTime(roomID: string): Promise<Date | null> {
		const queue: PrismaTypes.queue | null = await this.prisma.queue.findFirst({
			where: {
				room_id: roomID,
				is_done_playing: false,
				start_time: {
					not: null,
				},
			},
			orderBy: {
				start_time: "asc",
			},
		});
		if (!queue || queue === null) {
			return null;
		}
		if (!queue.start_time || queue.start_time === null) {
			throw new Error("Song start time is null");
		}
		return queue.start_time;
	}

	//get queue in order
	async getUpcomingQueueInOrder(
		roomID: string,
	): Promise<{ songID: string; votes: number }[]> {
		const queueItems: PrismaTypes.queue[] | null =
			await this.prisma.queue.findMany({
				where: {
					room_id: roomID,
					is_done_playing: false,
					start_time: {
						equals: null,
					},
				},
				orderBy: {
					insert_time: "asc", // this line break things
				},
			});
		if (!queueItems || queueItems === null) {
			throw new Error("There was an issue fetching the queue");
		}
		const queueIDs: string[] = [];
		for (let i = 0; i < queueItems.length; i++) {
			const q = queueItems[i];
			if (q) {
				queueIDs.push(q.queue_id);
			}
		}

		//SELECT * from vote where vote.queue_id in queueIDs
		const votes: PrismaTypes.vote[] | null = await this.prisma.vote.findMany({
			where: {
				queue_id: {
					in: queueIDs,
				},
			},
		});
		if (!votes || votes === null) {
			throw new Error("There was an issue fetching the votes");
		}

		//<song id, score>
		const songVotes: Map<string, number> = new Map<string, number>();
		for (let i = 0; i < votes.length; i++) {
			const vote = votes[i];
			if (vote) {
				const songInQueue: PrismaTypes.queue | undefined = queueItems.find(
					(queueItem) => queueItem.queue_id === vote.queue_id,
				);
				if (!songInQueue || songInQueue === undefined) {
					throw new Error(
						"Vote somehow does not correspond to a song in the queue",
					);
				}

				const songID = songInQueue.song_id;
				if (songVotes.has(songID)) {
					const sv: number | undefined = songVotes.get(songID);
					if (!sv || sv === undefined) {
						throw new Error(
							"Song vote is somehow undefined (it shouldn't be because we checked. blame typescript)",
						);
					}
					if (vote.is_upvote) {
						songVotes.set(songID, sv + 1);
					} else {
						songVotes.set(songID, sv - 1);
					}
				} else {
					if (vote.is_upvote) {
						songVotes.set(songID, 1);
					} else {
						songVotes.set(songID, -1);
					}
				}
			}
		}

		const songVotePairs: [string, number][] = Array.from(
			songVotes,
			([songID, votes]) => [songID, votes],
		);

		// Sort the array by votes in descending order
		songVotePairs.sort((a, b) => b[1] - a[1]);

		// Insert songs with no votes at the end
		queueItems.forEach((item) => {
			if (!songVotes.has(item.song_id)) {
				songVotePairs.push([item.song_id, 0]);
			}
		});

		// Convert to desired result format
		const result = songVotePairs.map(([songID, votes]) => ({ songID, votes }));
		return result;
	}

	async getQueueHead(roomID: string): Promise<string | null> {
		if (await this.isPaused(roomID)) {
			return await this.getCurrentSong(roomID);
		}

		const queue: { songID: string; votes: number }[] =
			await this.getUpcomingQueueInOrder(roomID);
		if (queue.length === 0) {
			return null;
		}
		const q = queue[0];
		if (!q || q === null) {
			throw new Error("Queue is null");
		}
		return q.songID;
	}

	async playSongNow(roomID: string, songID: string): Promise<Date> {
		const queue: PrismaTypes.queue | null = await this.prisma.queue.findFirst({
			where: {
				room_id: roomID,
				song_id: songID,
				is_done_playing: false,
			},
		});
		if (!queue || queue === null) {
			throw new Error("Song is not in the queue");
		}
		const startTime = new Date();
		await this.prisma.queue.update({
			where: {
				queue_id: queue.queue_id,
			},
			data: {
				start_time: startTime,
			},
		});
		return startTime;
	}

	async pauseSong(roomID: string): Promise<void> {
		const queue: PrismaTypes.queue | null = await this.prisma.queue.findFirst({
			where: {
				room_id: roomID,
				is_done_playing: false,
				start_time: {
					not: null,
				},
			},
			orderBy: {
				start_time: "asc",
			},
		});
		if (!queue || queue === null) {
			throw new Error("There is no song playing");
		}
		await this.prisma.queue.update({
			where: {
				queue_id: queue.queue_id,
			},
			data: {
				start_time: null,
			},
		});
	}

	async stopSong(roomID: string): Promise<void> {
		const queue: PrismaTypes.queue | null = await this.prisma.queue.findFirst({
			where: {
				room_id: roomID,
				is_done_playing: false,
				start_time: {
					not: null,
				},
			},
			orderBy: {
				start_time: "asc",
			},
		});
		if (!queue || queue === null) {
			throw new Error("There is no song playing");
		}
		await this.prisma.queue.update({
			where: {
				queue_id: queue.queue_id,
			},
			data: {
				is_done_playing: true,
			},
		});
	}

	async skipSong(roomID: string): Promise<void> {
		const queue: PrismaTypes.queue | null = await this.prisma.queue.findFirst({
			where: {
				room_id: roomID,
				is_done_playing: false,
				start_time: {
					not: null,
				},
			},
			orderBy: {
				start_time: "asc",
			},
		});
		if (!queue || queue === null) {
			throw new Error("There is no song playing");
		}
		await this.prisma.queue.update({
			where: {
				queue_id: queue.queue_id,
			},
			data: {
				is_done_playing: true,
			},
		});
	}

	async resumeSong(roomID: string): Promise<Date> {
		const queue: PrismaTypes.queue | null = await this.prisma.queue.findFirst({
			where: {
				room_id: roomID,
				is_done_playing: false,
				start_time: {
					not: null,
				},
			},
			orderBy: {
				start_time: "asc",
			},
		});
		if (!queue || queue === null) {
			throw new Error("There is no song paused");
		}
		const startTime = new Date();
		await this.prisma.queue.update({
			where: {
				queue_id: queue.queue_id,
			},
			data: {
				start_time: startTime,
			},
		});
		return startTime;
	}
}
