import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { DtoGenService } from "../../dto-gen/dto-gen.service";
import { DbUtilsService } from "../../db-utils/db-utils.service";
import * as PrismaTypes from "@prisma/client";
import {
	PriorityQueue,
	MinPriorityQueue,
	MaxPriorityQueue,
	ICompare,
	IGetCompareValue,
} from "@datastructures-js/priority-queue";
import { RoomDto } from "../dto/room.dto";
import { VoteDto } from "../dto/vote.dto";
import { RoomSongDto } from "../dto/roomsong.dto";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import * as Spotify from "@spotify/web-api-ts-sdk";

// Postgres tables:
/*
CREATE TABLE IF NOT EXISTS public.vote
(
    vote_id uuid NOT NULL DEFAULT uuid_generate_v4(),
    is_upvote boolean NOT NULL DEFAULT true,
    queue_id uuid NOT NULL,
    CONSTRAINT vote_pkey PRIMARY KEY (vote_id),
    CONSTRAINT queue_id FOREIGN KEY (queue_id)
        REFERENCES public.queue (queue_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS public.queue
(
    room_id uuid NOT NULL,
    song_id uuid NOT NULL,
    is_done_playing boolean NOT NULL DEFAULT false,
    queue_id uuid NOT NULL DEFAULT uuid_generate_v4(),
    start_time timestamp with time zone,
    CONSTRAINT queue_id PRIMARY KEY (queue_id),
    CONSTRAINT room_id FOREIGN KEY (room_id)
        REFERENCES public.room (room_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT song_id FOREIGN KEY (song_id)
        REFERENCES public.song (song_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

CREATE TABLE IF NOT EXISTS public.room
(
    room_id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text COLLATE pg_catalog."default" NOT NULL,
    room_creator uuid NOT NULL,
    playlist_photo text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default" DEFAULT 'This room has no description'::text,
    date_created timestamp with time zone NOT NULL DEFAULT now(),
    nsfw boolean NOT NULL DEFAULT false,
    is_temporary boolean DEFAULT false,
    room_language text COLLATE pg_catalog."default" DEFAULT 'English'::text,
    explicit boolean DEFAULT false,
    tags text[] COLLATE pg_catalog."default",
    CONSTRAINT room_pkey PRIMARY KEY (room_id),
    CONSTRAINT room_creator FOREIGN KEY (room_creator)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
*/

class RoomSong {
	private _score: number;
	public readonly userID: string;
	public readonly spotifyID: string;
	private votes: VoteDto[];
	public readonly insertTime: Date;
	private spotifyDetails: Spotify.Track | null = null;

	constructor(spotifyID: string, userID: string) {
		this._score = 0;
		this.userID = userID;
		this.spotifyID = spotifyID;
		this.votes = [];
		this.insertTime = new Date();
	}

	private calculateScore(): number {
		let result = 0;
		for (const vote of this.votes) {
			if (vote.isUpvote) {
				result++;
			} else {
				result--;
			}
		}
		return result;
	}

	addVote(vote: VoteDto): boolean {
		if (this.votes.find((v) => v.userID === vote.userID)) {
			return false;
		}
		this.votes.push(vote);
		this._score = this.calculateScore();
		return true;
	}

	removeVote(vote: VoteDto): boolean {
		const index = this.votes.findIndex(
			(v) => v.userID === vote.userID && v.spotifyID === vote.spotifyID,
		);
		if (index === -1) {
			return false;
		}
		this.votes.splice(index, 1);
		this._score = this.calculateScore();
		return true;
	}

	swapVote(userID: string): boolean {
		const index = this.votes.findIndex((v) => v.userID === userID);
		if (index === -1) {
			return false;
		}
		this.votes[index].isUpvote = !this.votes[index].isUpvote;
		this._score = this.calculateScore();
		return true;
	}

	getUserVote(userID: string): VoteDto | null {
		const vote = this.votes.find((v) => v.userID === userID);
		if (!vote || vote === null) {
			return null;
		}
		return vote;
	}

	get score(): number {
		return this._score;
	}

	get voteCount(): number {
		return this.votes.length;
	}

	asRoomSongDto(): RoomSongDto {
		return {
			spotifyID: this.spotifyID,
			userID: this.userID,
			score: this._score,
		};
	}

	getVotes(): VoteDto[] {
		return this.votes;
	}
	get spotifyInfo(): Spotify.Track | null {
		return this.spotifyDetails;
	}

	set spotifyInfo(info: Spotify.Track) {
		this.spotifyDetails = info;
	}
}

class ActiveRoom {
	public readonly room: RoomDto;
	private queue: MaxPriorityQueue<RoomSong>; //priority queue of songs (automatically ordered by score)

	constructor(room: RoomDto) {
		this.room = room;
		const getSongScore: IGetCompareValue<RoomSong> = (song) => song.score;
		this.queue = new MaxPriorityQueue<RoomSong>(getSongScore);
	}

	updateQueue() {
		//update queue
		this.queue = MaxPriorityQueue.fromArray(this.queue.toArray());
	}

	getQueueLockName(): string {
		return `EDIT_QUEUE_LOCK_${this.room.roomID}`;
	}

	async addVote(vote: VoteDto): Promise<boolean> {
		let result = false;
		await navigator.locks.request(this.getQueueLockName(), async () => {
			this.updateQueue();
			const songs: RoomSong[] = this.queue.toArray();
			const index = songs.findIndex((s) => s.spotifyID === vote.spotifyID);
			if (index === -1) {
				result = false;
				return;
			}
			result = songs[index].addVote(vote);
			this.queue = MaxPriorityQueue.fromArray(songs);
		});
		return result;
	}

	async removeVote(vote: VoteDto): Promise<boolean> {
		let result = false;
		await navigator.locks.request(this.getQueueLockName(), async () => {
			this.updateQueue();
			const songs: RoomSong[] = this.queue.toArray();
			const index = songs.findIndex((s) => s.spotifyID === vote.spotifyID);
			if (index === -1) {
				result = false;
				return;
			}
			result = songs[index].removeVote(vote);
			this.queue = MaxPriorityQueue.fromArray(songs);
		});
		return result;
	}

	async swapVote(spotifyID: string, userID: string): Promise<boolean> {
		let result = false;
		await navigator.locks.request(this.getQueueLockName(), async () => {
			this.updateQueue();
			const songs: RoomSong[] = this.queue.toArray();
			const index = songs.findIndex((s) => s.spotifyID === spotifyID);
			if (index === -1) {
				result = false;
				return;
			}
			result = songs[index].swapVote(userID);
			this.queue = MaxPriorityQueue.fromArray(songs);
		});
		return result;
	}

	async addSong(spotifyID: string, userID: string): Promise<boolean> {
		let result = false;
		await navigator.locks.request(this.getQueueLockName(), async () => {
			this.updateQueue();
			const songs: RoomSong[] = this.queue.toArray();
			if (!songs.find((s) => s.spotifyID === spotifyID)) {
				this.queue.enqueue(new RoomSong(spotifyID, userID));
				result = true;
			}
		});
		return result;
	}

	async removeSong(spotifyID: string, userID: string): Promise<boolean> {
		let result = false;
		await navigator.locks.request(this.getQueueLockName(), async () => {
			this.updateQueue();
			const songs: RoomSong[] = this.queue.toArray();
			const index = songs.findIndex((s) => s.spotifyID === spotifyID);
			if (index === -1) {
				result = false;
				return;
			}
			if (songs[index].userID !== userID) {
				result = false;
				return;
			}
			songs.splice(index, 1);
			this.queue = MaxPriorityQueue.fromArray(songs);
			result = true;
		});
		return result;
	}

	queueAsRoomSongDto(): RoomSongDto[] {
		this.updateQueue();
		return this.queue.toArray().map((s) => s.asRoomSongDto());
	}

	songAsRoomSongDto(spotifyID: string): RoomSongDto | null {
		const song = this.queue.toArray().find((s) => s.spotifyID === spotifyID);
		if (!song || song === null) {
			return null;
		}
		return song.asRoomSongDto();
	}

	allVotes(): VoteDto[] {
		this.updateQueue();
		const songs: RoomSong[] = this.queue.toArray();
		const votes: VoteDto[] = [];
		for (const song of songs) {
			votes.push(...song.getVotes());
		}
		return votes;
	}

	async getSpotifyInfo(api: SpotifyApi) {
		await navigator.locks.request(this.getQueueLockName(), async () => {
			// The lock has been acquired.
			//get spotify info for all songs
			this.updateQueue();
			const songs = this.queue.toArray();
			const songsWithoutInfo = songs.filter((s) => s.spotifyInfo === null);
			const songIDs = songsWithoutInfo.map((s) => s.spotifyID);
			const songInfo = await api.tracks.get(songIDs);
			for (const s of songsWithoutInfo) {
				const info = songInfo.find((i) => i.id === s.spotifyID);
				if (info) {
					s.spotifyInfo = info;
					//update songs array
					const index = songs.findIndex(
						(song) => song.spotifyID === s.spotifyID,
					);
					if (index === -1) {
						throw new Error("Song not found in queue");
					}
					songs[index] = s;
				}
			}
			//update queue
			this.queue = MaxPriorityQueue.fromArray(songs);

			// Now the lock will be released.
		});
	}

	isPlaying(): boolean {}
}

@Injectable()
export class RoomQueueService {
	roomQueues: Map<string, ActiveRoom>; //map roomID to room data structure

	constructor(
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly prisma: PrismaService,
	) {
		this.roomQueues = new Map<string, ActiveRoom>();
	}

	async addSong(
		roomID: string,
		spotifyID: string,
		userID: string,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			const room: RoomDto | null = await this.dtogen.generateRoomDto(roomID);
			if (!room || room === null) {
				throw new Error("Room does not exist");
			}
			this.roomQueues.set(roomID, new ActiveRoom(room));
		}
		const activeRoom = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.addSong(spotifyID, userID);
	}

	removeSong(roomID: string, spotifyID: string, userID: string): boolean {
		if (!this.roomQueues.has(roomID)) {
			throw new Error("Room does not exist");
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.removeSong(spotifyID, userID);
	}

	upvoteSong(roomID: string, spotifyID: string, userID: string): boolean {
		if (!this.roomQueues.has(roomID)) {
			throw new Error("Room does not exist");
		}
		const vote: VoteDto = {
			isUpvote: true,
			userID: userID,
			spotifyID: spotifyID,
		};
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.addVote(vote);
	}

	downvoteSong(roomID: string, spotifyID: string, userID: string): boolean {
		if (!this.roomQueues.has(roomID)) {
			throw new Error("Room does not exist");
		}
		const vote: VoteDto = {
			isUpvote: false,
			userID: userID,
			spotifyID: spotifyID,
		};
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.addVote(vote);
	}

	undoSongVote(roomID: string, spotifyID: string, userID: string): boolean {
		if (!this.roomQueues.has(roomID)) {
			throw new Error("Room does not exist");
		}
		const vote: VoteDto = {
			isUpvote: true,
			userID: userID,
			spotifyID: spotifyID,
		};
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.removeVote(vote);
	}

	swapSongVote(roomID: string, spotifyID: string, userID: string): boolean {
		if (!this.roomQueues.has(roomID)) {
			throw new Error("Room does not exist");
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.swapVote(spotifyID, userID);
	}

	getQueueState(roomID: string): {
		room: RoomDto;
		songs: RoomSongDto[];
		votes: VoteDto[];
	} {
		if (!this.roomQueues.has(roomID)) {
			throw new Error("Room does not exist");
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return {
			room: activeRoom.room,
			songs: activeRoom.queueAsRoomSongDto(),
			votes: activeRoom.allVotes(),
		};
	}

	getSongAsRoomSongDto(roomID: string, spotifyID: string): RoomSongDto | null {
		if (!this.roomQueues.has(roomID)) {
			throw new Error("Room does not exist");
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.songAsRoomSongDto(spotifyID);
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
		return queue[0].song_id;
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
					insert_time: "asc",
				},
			});
		if (!queueItems || queueItems === null) {
			throw new Error("There was an issue fetching the queue");
		}
		const queueIDs: string[] = [];
		for (let i = 0; i < queueItems.length; i++) {
			queueIDs.push(queueItems[i].queue_id);
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
		return queue[0].songID;
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
