import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { DtoGenService } from "../../dto-gen/dto-gen.service";
import { DbUtilsService } from "../../db-utils/db-utils.service";
import * as PrismaTypes from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
	MinPriorityQueue,
	MaxPriorityQueue,
	IGetCompareValue,
} from "@datastructures-js/priority-queue";
import { RoomDto } from "../dto/room.dto";
import { VoteDto } from "../dto/vote.dto";
import { RoomSongDto } from "../dto/roomsong.dto";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { SpotifyService } from "../../../spotify/spotify.service";
import { SpotifyAuthService } from "src/auth/spotify/spotifyauth.service";

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

export class RoomSong {
	private _score: number;
	public readonly userID: string;
	public readonly spotifyID: string;
	private votes: VoteDto[];
	public readonly insertTime: Date;
	private playbackStartTime: Date | null;
	private spotifyDetails: Spotify.Track | null = null;
	private internalSongID: string;
	private internalQueueItemID: string;

	constructor(
		spotifyID: string,
		userID: string,
		internalSongID?: string,
		insertTime: Date = new Date(),
		playbackStartTime: Date | null = null,
	) {
		this._score = 0;
		this.userID = userID;
		this.spotifyID = spotifyID;
		this.votes = [];
		this.insertTime = insertTime;
		this.playbackStartTime = playbackStartTime;
		if (internalSongID) {
			this.internalSongID = internalSongID;
		}
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

	addVotes(votes: PrismaTypes.vote[]) {
		const voteDtos: VoteDto[] = votes.map((v) => ({
			isUpvote: v.is_upvote,
			userID: v.user_id,
			spotifyID: v.queue_id,
			createdAt: v.vote_time,
		}));
		this.votes.push(...voteDtos);
		this._score = this.calculateScore();
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

	swapVote(userID: string, swapTime: Date): boolean {
		const index = this.votes.findIndex((v) => v.userID === userID);
		if (index === -1) {
			return false;
		}
		this.votes[index].isUpvote = !this.votes[index].isUpvote;
		this.votes[index].createdAt = swapTime;
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
		const result: RoomSongDto = {
			spotifyID: this.spotifyID,
			userID: this.userID,
			score: this._score,
		};
		if (this.playbackStartTime) {
			result.startTime = this.playbackStartTime;
		}
		if (this.spotifyDetails) {
			result.track = this.spotifyDetails;
		}
		return result;
	}

	getVotes(): VoteDto[] {
		return this.votes;
	}

	exportNewVotes(): Prisma.voteCreateManyInput[] {
		const votes: Prisma.voteCreateManyInput[] = [];
		for (const vote of this.votes) {
			votes.push({
				is_upvote: vote.isUpvote,
				vote_time: vote.createdAt,
				queue_id: this.queueItemID,
				user_id: vote.userID,
			});
		}
		return votes;
	}

	getPlaybackStartTime(): Date | null {
		return this.playbackStartTime;
	}

	setPlaybackStartTime(startTime: Date): void {
		this.playbackStartTime = startTime;
	}

	get spotifyInfo(): Spotify.Track | null {
		return this.spotifyDetails;
	}

	set spotifyInfo(info: Spotify.Track) {
		this.spotifyDetails = info;
	}

	get songID(): string {
		return this.internalSongID;
	}

	set songID(id: string) {
		this.internalSongID = id;
	}

	get queueItemID(): string {
		return this.internalQueueItemID;
	}

	set queueItemID(id: string) {
		this.internalQueueItemID = id;
	}

	isPlaying(): boolean {
		if (!this.playbackStartTime || this.playbackStartTime === null) {
			return false;
		}
		if (!this.spotifyDetails || this.spotifyDetails === null) {
			throw new Error("Song does not have spotify info");
		}
		return (
			this.playbackStartTime.valueOf() + this.spotifyDetails.duration_ms >=
			new Date().valueOf()
		);
	}
}

export class ActiveRoom {
	public readonly room: RoomDto;
	private queue: MaxPriorityQueue<RoomSong>; //priority queue of songs (automatically ordered by score)
	private historicQueue: MinPriorityQueue<RoomSong>; //priority queue of songs that have already been played

	constructor(room: RoomDto) {
		this.room = room;
		this.initQueues();
	}

	initQueues() {
		const getSongScore: IGetCompareValue<RoomSong> = (song) => song.score;
		this.queue = new MaxPriorityQueue<RoomSong>(getSongScore);
		const playbackStartTime: IGetCompareValue<RoomSong> = (song) => {
			const playbackTime: Date | null = song.getPlaybackStartTime();
			if (!playbackTime || playbackTime === null) {
				throw new Error("Song has no playback start time");
			}
			return playbackTime.valueOf();
		};
		this.historicQueue = new MinPriorityQueue<RoomSong>(playbackStartTime);
	}

	reflushRoomSongs(songs: RoomSong[]) {
		this.initQueues();
		for (let i = 0; i < songs.length; i++) {
			const song = songs[i];
			if (song.spotifyID === null) {
				throw new Error("Song does not have a spotify id");
			}

			const startTime = song.getPlaybackStartTime();
			if (startTime !== null && startTime.valueOf() < Date.now().valueOf()) {
				this.historicQueue.enqueue(song);
			} else {
				this.queue.enqueue(song);
			}
		}
		this.getCurrentOrNextSong();
	}

	async reloadQueue(prisma: PrismaService) {
		//load historic queue from db
		const roomID = this.room.roomID;
		const queueItems = await prisma.queue.findMany({
			where: {
				room_id: roomID,
			},
			orderBy: {
				start_time: "asc",
			},
			include: {
				vote: true,
				song: true,
			},
		});
		if (!queueItems || queueItems === null) {
			throw new Error("There was an issue fetching the queue");
		}

		// assume first person who voted for the song is the enqueuer
		const songEnqueuers: string[] = [];
		for (const queueItem of queueItems) {
			if (queueItem.vote.length === 0) {
				// assign song to room owner
				songEnqueuers.push(this.room.creator.userID);
			} else {
				const enqueuer = queueItem.vote[0].user_id;
				songEnqueuers.push(enqueuer);
			}
		}

		const rs: RoomSong[] = [];
		for (let i = 0; i < queueItems.length; i++) {
			const queueItem = queueItems[i];
			const songEnqueuer = songEnqueuers[i];
			if (queueItem.song.spotify_id === null) {
				throw new Error("Song does not have a spotify id");
			}

			const song = new RoomSong(
				queueItem.song.spotify_id,
				songEnqueuer,
				queueItem.song_id,
				queueItem.insert_time,
				queueItem.start_time,
			);
			song.addVotes(queueItem.vote);
			rs.push(song);
		}
		await this.reflushRoomSongs(rs);
	}

	updateQueue() {
		//update queue
		this.queue = MaxPriorityQueue.fromArray(this.queue.toArray());
	}

	getQueueLockName(): string {
		return `EDIT_QUEUE_LOCK_${this.room.roomID}`;
	}

	async flushtoDB(
		spotify: SpotifyService,
		api: SpotifyApi,
		prisma: PrismaService,
	) {
		//flush queue to db
		await navigator.locks.request(this.getQueueLockName(), async () => {
			//ensure individual songs are in db

			//get all songs in queue
			const historicQueue: RoomSong[] = this.historicQueue.toArray();
			const upcomingQueue: RoomSong[] = this.queue.toArray();
			const queue: RoomSong[] = historicQueue.concat(upcomingQueue);

			//ensure enqueued songs are in db (songs table)
			const tracks: Spotify.Track[] = await spotify.getManyTracks(
				queue.map((s) => s.spotifyID),
				api,
			);
			const songs: PrismaTypes.song[] = await spotify.addTracksToDB(tracks);

			//ensure enqueued songs are queueitems associated with room
			const newQueueItems: Prisma.queueCreateManyInput[] = [];
			for (let i = 0, n = historicQueue.length; i < n; i++) {
				const dbSong = songs.find(
					(s) => s.spotify_id === historicQueue[i].spotifyID,
				);
				if (!dbSong || dbSong === null) {
					throw new Error("Song is not in the database somehow?");
				}

				historicQueue[i].songID = dbSong.song_id;
				const song = historicQueue[i];
				newQueueItems.push({
					room_id: this.room.roomID,
					song_id: song.songID,
					is_done_playing: true,
					start_time: song.getPlaybackStartTime(),
					insert_time: song.insertTime,
				});
			}
			for (let i = 0, n = upcomingQueue.length; i < n; i++) {
				const dbSong = songs.find(
					(s) => s.spotify_id === upcomingQueue[i].spotifyID,
				);
				if (!dbSong || dbSong === null) {
					throw new Error("Song is not in the database somehow?");
				}

				historicQueue[i].songID = dbSong.song_id;
				const song = upcomingQueue[i];
				newQueueItems.push({
					room_id: this.room.roomID,
					song_id: dbSong.song_id,
					is_done_playing: false,
					start_time: song.getPlaybackStartTime(),
					insert_time: song.insertTime,
				});
			}
			await prisma.queue.createMany({
				data: newQueueItems,
			});

			//link queue items to songs
			const queueItems = await prisma.queue.findMany({
				where: {
					room_id: this.room.roomID,
				},
				include: {
					vote: true,
					song: true,
				},
				orderBy: {
					start_time: "asc",
				},
			});

			//link queue item ids & song ids to songs
			for (let i = 0, n = queue.length; i < n; i++) {
				if (!queue[i].songID || queue[i].songID === null) {
					const dbSong = queueItems.find(
						(q) =>
							q.song.spotify_id === queue[i].spotifyID &&
							q.insert_time === queue[i].insertTime &&
							q.start_time === queue[i].getPlaybackStartTime(),
					);
					if (!dbSong || dbSong === null) {
						throw new Error("Song is not in the queue somehow?");
					}
					queue[i].songID = dbSong.song_id;
					queue[i].queueItemID = dbSong.queue_id;
				}

				if (!queue[i].spotifyInfo && queue[i].spotifyID !== null) {
					const song = queue[i];
					const track = tracks.find((t) => t.id === song.spotifyID);
					if (!track || track === null) {
						throw new Error("Song is not in the queue somehow?");
					}
					song.spotifyInfo = track;
				}
			}

			await this.reflushRoomSongs(queue);

			//ensure votes are in db
			const existingVotes: PrismaTypes.vote[] = await prisma.vote.findMany({
				where: {
					queue_id: {
						in: queue.map((s) => s.queueItemID),
					},
				},
				include: {
					queue: true,
					users: true,
				},
			});
			const newVotes: Prisma.voteCreateManyInput[] = [];
			for (const song of queue) {
				const v = song.exportNewVotes();
				if (v.length > 0) {
					for (const vote of v) {
						const existingVote = existingVotes.find(
							(ev) =>
								ev.queue_id === song.queueItemID &&
								ev.user_id === vote.user_id &&
								ev.is_upvote === vote.is_upvote &&
								ev.vote_time === vote.vote_time,
						);
						if (existingVote) {
							continue;
						}
						newVotes.push(vote);
					}
				}
			}
			await prisma.vote.createMany({
				data: newVotes,
			});
		});
	}

	async getCurrentOrNextSong(): Promise<RoomSong | null> {
		if (this.queue.isEmpty()) {
			return null;
		}
		let result = this.historicQueue.front();
		if (result.isPlaying()) {
			return result;
		}

		result = this.queue.front();
		while (!result.isPlaying()) {
			result = this.queue.dequeue();
			this.historicQueue.enqueue(result);

			if (this.queue.isEmpty()) {
				return null;
			}

			result = this.queue.front();
			if (result.spotifyInfo === null) {
				throw new Error(
					"Queue songs do not have spotify info, after explicitly requesting it. Something has gone very wrong",
				);
			}
		}
		return result;
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

	async swapVote(
		spotifyID: string,
		userID: string,
		swapTime: Date,
	): Promise<boolean> {
		let result = false;
		await navigator.locks.request(this.getQueueLockName(), async () => {
			this.updateQueue();
			const songs: RoomSong[] = this.queue.toArray();
			const index = songs.findIndex((s) => s.spotifyID === spotifyID);
			if (index === -1) {
				result = false;
				return;
			}
			result = songs[index].swapVote(userID, swapTime);
			this.queue = MaxPriorityQueue.fromArray(songs);
		});
		return result;
	}

	async addSong(
		spotifyID: string,
		userID: string,
		insertTime: Date,
	): Promise<boolean> {
		let result = false;
		await navigator.locks.request(this.getQueueLockName(), async () => {
			this.updateQueue();
			const songs: RoomSong[] = this.queue.toArray();
			if (!songs.find((s) => s.spotifyID === spotifyID)) {
				this.queue.enqueue(
					new RoomSong(spotifyID, userID, undefined, insertTime),
				);
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
			const songsWithoutInfo: number[] = [];
			for (let i = 0, n = songs.length; i < n; i++) {
				if (!songs[i].spotifyInfo) {
					songsWithoutInfo.push(i);
				}
			}
			if (songsWithoutInfo.length > 0) {
				const songIDs: string[] = songsWithoutInfo.map(
					(i) => songs[i].spotifyID,
				);
				const songInfo = await api.tracks.get(songIDs);
				for (const i of songsWithoutInfo) {
					const info = songInfo.find((s) => s.id === songs[i].spotifyID);
					if (info) {
						songs[i].spotifyInfo = info;
					}
				}
				//update queue
				this.queue = MaxPriorityQueue.fromArray(songs);
			}

			// Now the lock will be released.
		});
	}

	async playSongNow(): Promise<RoomSong | null> {
		let result: RoomSong | null = null;
		await navigator.locks.request(this.getQueueLockName(), async () => {
			this.updateQueue();
			const song = this.queue.dequeue();
			if (!song || song === null) {
				return;
			}
			song.setPlaybackStartTime(new Date());
			this.historicQueue.enqueue(song);
			result = song;
		});
		return result;
	}

	async isPlaying(): Promise<boolean> {
		this.updateQueue();
		if (this.historicQueue.isEmpty()) {
			return false;
		}
		const song = await this.getCurrentOrNextSong();
		return song !== null && song.isPlaying();
	}

	/*
	isPaused(): boolean {}
	*/
	isEmpty(): boolean {
		return this.queue.isEmpty();
	}
}

@Injectable()
export class RoomQueueService {
	roomQueues: Map<string, ActiveRoom>; //map roomID to room data structure

	constructor(
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly prisma: PrismaService,
		private readonly spotify: SpotifyService,
		private readonly spotifyAuth: SpotifyAuthService,
	) {
		this.roomQueues = new Map<string, ActiveRoom>();
	}

	async createRoomQueue(roomID: string): Promise<void> {
		const room: RoomDto | null = await this.dtogen.generateRoomDto(roomID);
		if (!room || room === null) {
			throw new Error("Room does not exist");
		}
		const activeRoom = new ActiveRoom(room);
		await activeRoom.reloadQueue(this.prisma);
		this.roomQueues.set(roomID, activeRoom);
	}

	async addSong(
		roomID: string,
		spotifyID: string,
		userID: string,
		insertTime: Date,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
		}
		const activeRoom = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.addSong(spotifyID, userID, insertTime);
	}

	async removeSong(
		roomID: string,
		spotifyID: string,
		userID: string,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.removeSong(spotifyID, userID);
	}

	async upvoteSong(
		roomID: string,
		spotifyID: string,
		userID: string,
		createdAt: Date,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
		}
		const vote: VoteDto = {
			isUpvote: true,
			userID: userID,
			spotifyID: spotifyID,
			createdAt: createdAt,
		};
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.addVote(vote);
	}

	async downvoteSong(
		roomID: string,
		spotifyID: string,
		userID: string,
		createdAt: Date,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
		}
		const vote: VoteDto = {
			isUpvote: false,
			userID: userID,
			spotifyID: spotifyID,
			createdAt: createdAt,
		};
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.addVote(vote);
	}

	async undoSongVote(
		roomID: string,
		spotifyID: string,
		userID: string,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
		}
		const vote: VoteDto = {
			isUpvote: true,
			userID: userID,
			spotifyID: spotifyID,
			createdAt: new Date(),
		};
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.removeVote(vote);
	}

	async swapSongVote(
		roomID: string,
		spotifyID: string,
		userID: string,
		insertTime: Date,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.swapVote(spotifyID, userID, insertTime);
	}

	getQueueState(roomID: string): {
		room: RoomDto;
		songs: RoomSongDto[];
		votes: VoteDto[];
	} {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
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
			this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.songAsRoomSongDto(spotifyID);
	}

	async initiatePlayback(roomID: string): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		if (!activeRoom.isPlaying()) {
			if (activeRoom.isEmpty()) {
				return false;
			} else {
				const s = activeRoom.getCurrentOrNextSong();
				if (!s || s === null) {
					return false;
				}
			}
		}
		return true;
	}

	async getCurrentOrNextSong(roomID: string): Promise<RoomSongDto | null> {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		await activeRoom.getSpotifyInfo(this.spotifyAuth.getUserlessAPI());
		const song = await activeRoom.getCurrentOrNextSong();
		if (!song || song === null) {
			return null;
		}
		return song.asRoomSongDto();
	}

	//is song playing
	async isPlaying(roomID: string): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		return activeRoom.isPlaying();
	}

	async isPaused(roomID: string): Promise<boolean> {
		console.log(`room (${roomID}) is never paused`);
		return false;
		// if (!this.roomQueues.has(roomID)) {
		// 	this.createRoomQueue(roomID);
		// }
		// const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		// if (!activeRoom || activeRoom === undefined) {
		// 	throw new Error("Weird error. HashMap is broken");
		// }
		// return activeRoom.isPaused();
	}

	async playSongNow(roomID: string): Promise<RoomSongDto | null> {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		const song = await activeRoom.playSongNow();
		if (!song || song === null) {
			return null;
		}
		return song.asRoomSongDto();
	}

	/*
	async pauseSong(roomID: string): Promise<void> {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		await activeRoom.pauseSong();
	}
		*/

	/*
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
	*/

	async skipSong(roomID: string): Promise<void> {
		if (!this.roomQueues.has(roomID)) {
			this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error("Weird error. HashMap is broken");
		}
		await activeRoom.playSongNow();
	}

	/*
	async resumeSong(roomID: string): Promise<Date> {
		
	}
	*/
}
