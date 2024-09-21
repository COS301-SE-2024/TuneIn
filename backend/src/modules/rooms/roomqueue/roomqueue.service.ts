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
	PriorityQueue,
	ICompare,
} from "@datastructures-js/priority-queue";
import { RoomDto } from "../dto/room.dto";
import { VoteDto } from "../dto/vote.dto";
import { RoomSongDto } from "../dto/roomsong.dto";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { SpotifyService } from "../../../spotify/spotify.service";
import { SpotifyAuthService } from "src/auth/spotify/spotifyauth.service";
import { MurLockService } from "murlock";

const QUEUE_LOCK_TIMEOUT = 20000;

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
		if (
			index === -1 ||
			this.votes[index] === null ||
			this.votes[index] === undefined
		) {
			return false;
		}
		const vote = this.votes[index];
		if (!vote || vote === null) {
			return false;
		}
		vote.isUpvote = !vote.isUpvote;
		vote.createdAt = swapTime;
		this.votes[index] = vote;
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
			index: -1,
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
			console.log("this.spotifyDetails: ", this.spotifyDetails);
			throw new Error("Song does not have spotify info");
		}
		return (
			this.playbackStartTime.valueOf() + this.spotifyDetails.duration_ms >=
			new Date().valueOf()
		);
	}
}

function sortRoomSongs(queue: RoomSong[]): RoomSong[] {
	console.log("###################################");
	console.log("===================================");
	console.log("SORTING QUEUE");
	console.log("Pre-sorted queue:");
	for (const song of queue) {
		console.log(
			song.spotifyID +
				" - score: " +
				song.score +
				" - insertTime: " +
				song.insertTime,
		);
	}
	const tempQueue: RoomSong[] = queue;
	tempQueue.sort((a, b) => {
		if (a.score === b.score) {
			return a.insertTime.valueOf() - b.insertTime.valueOf();
		}
		return b.score - a.score;
	});
	if (tempQueue.length > 0) {
		const head: RoomSong = tempQueue[0];
		const currentStartTime = head.getPlaybackStartTime();
		if (currentStartTime !== null) {
			//update all start times to be sequential
			const initStartTime = currentStartTime.getMilliseconds();
			let pos = 0;
			for (let i = 0; i < tempQueue.length; i++) {
				const song: RoomSong = tempQueue[i];
				if (song.spotifyInfo === null) {
					console.log(
						"Song does not have spotify info. Will try again next time",
					);
					break;
				}
				const t: Date = new Date(initStartTime + pos);
				song.setPlaybackStartTime(t);
				tempQueue[i] = song;
				pos += song.spotifyInfo.duration_ms;
			}
		}
	}
	console.log("===================================");
	console.log("Sorted queue:");
	for (const song of tempQueue) {
		console.log(
			song.spotifyID +
				" - score: " +
				song.score +
				" - insertTime: " +
				song.insertTime,
		);
	}
	console.log("===================================");
	console.log("###################################");
	return tempQueue;
}

export class ActiveRoom {
	public readonly room: RoomDto;
	//private queue: MaxPriorityQueue<RoomSong>; //priority queue of songs (automatically ordered by score)
	private queue: PriorityQueue<RoomSong>; //priority queue of songs (automatically ordered by score)
	private historicQueue: MinPriorityQueue<RoomSong>; //priority queue of songs that have already been played
	private compareRoomSongs: ICompare<RoomSong> = (a: RoomSong, b: RoomSong) => {
		if (a.score === b.score) {
			return a.insertTime.valueOf() - b.insertTime.valueOf();
		}
		return b.score - a.score;
	};

	constructor(room: RoomDto) {
		this.room = room;
		this.initQueues();
	}

	initQueues() {
		//const getSongScore: IGetCompareValue<RoomSong> = (song) => song.score;
		//this.queue = new MaxPriorityQueue<RoomSong>(getSongScore);
		this.queue = new PriorityQueue<RoomSong>(this.compareRoomSongs);
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
			if (song) {
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
		}
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
				if (queueItem.vote[0]) {
					const enqueuer = queueItem.vote[0].user_id;
					songEnqueuers.push(enqueuer);
				}
			}
		}

		const rs: RoomSong[] = [];
		for (let i = 0; i < queueItems.length; i++) {
			const queueItem = queueItems[i];
			if (queueItem) {
				const songEnqueuer = songEnqueuers[i];
				if (queueItem.song.spotify_id && songEnqueuer) {
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
			}
		}
		await this.reflushRoomSongs(rs);
	}

	updateQueue() {
		//update queue
		this.queue = PriorityQueue.fromArray(
			sortRoomSongs(this.queue.toArray()),
			this.compareRoomSongs,
		);
	}

	getQueueLockName(): string {
		return `EDIT_QUEUE_LOCK_${this.room.roomID}`;
	}

	async flushtoDB(
		spotify: SpotifyService,
		api: SpotifyApi,
		prisma: PrismaService,
		murLockService: MurLockService,
	) {
		//flush queue to db
		/*
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(`Acquire lock: ${this.getQueueLockName()}`);
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
				console.log(`Release lock: ${this.getQueueLockName()}`);
			},
		);
		*/
	}

	async getNextSong(murLockService: MurLockService): Promise<RoomSong | null> {
		console.log("historicQueue");
		console.log(this.historicQueue.toArray());
		console.log("currentQueue");
		console.log(this.queue.toArray());

		let result: RoomSong | null = null;
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'getNextSong'`,
				);
				this.updateQueue();
				if (this.queue.isEmpty()) {
					return;
				} else {
					let song = this.queue.front();
					if (song === null) {
						return;
					}
					let t = song.getPlaybackStartTime();
					// while there are songs in the queue that have played already
					while (t && t < new Date()) {
						// add them to the historic queue, if not there yet
						const s = this.historicQueue
							.toArray()
							.find(
								(s) =>
									s.spotifyID === song.spotifyID &&
									s.getPlaybackStartTime() === t,
							);
						if (!s) {
							this.historicQueue.enqueue(song);
						}

						// remove them from the queue until we find an unplayed song
						console.log("Removing song from queue, since it's already played");
						console.log(song);
						this.queue.dequeue();
						song = this.queue.front();
						if (song === null) {
							return;
						}

						t = song.getPlaybackStartTime();
					}
					result = song;
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'getNextSong'`,
				);
			},
		);
		return result;
	}

	async addVote(
		vote: VoteDto,
		murLockService: MurLockService,
	): Promise<boolean> {
		let result = false;
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'addVote'`,
				);
				this.updateQueue();
				this.printQueueBrief();
				const songs: RoomSong[] = this.queue.toArray();
				const index = songs.findIndex((s) => s.spotifyID === vote.spotifyID);
				if (index === -1 || !songs[index]) {
					result = false;
					return;
				}
				result = songs[index].addVote(vote);
				this.queue = PriorityQueue.fromArray(
					sortRoomSongs(songs),
					this.compareRoomSongs,
				);
				this.printQueueBrief();
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'addVote'`,
				);
			},
		);
		return result;
	}

	async removeVote(
		vote: VoteDto,
		murLockService: MurLockService,
	): Promise<boolean> {
		let result = false;
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'removeVote'`,
				);
				this.updateQueue();
				this.printQueueBrief();
				const songs: RoomSong[] = this.queue.toArray();
				const index = songs.findIndex((s) => s.spotifyID === vote.spotifyID);
				if (index === -1 || songs[index] === null || !songs[index]) {
					result = false;
					return;
				}
				result = songs[index].removeVote(vote);
				this.queue = PriorityQueue.fromArray(
					sortRoomSongs(songs),
					this.compareRoomSongs,
				);
				this.printQueueBrief();
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'removeVote'`,
				);
				this.updateQueue();
			},
		);
		return result;
	}

	async swapVote(
		spotifyID: string,
		userID: string,
		swapTime: Date,
		murLockService: MurLockService,
	): Promise<boolean> {
		let result = false;
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'swapVote'`,
				);
				this.updateQueue();
				this.printQueueBrief();
				const songs: RoomSong[] = this.queue.toArray();
				const index = songs.findIndex((s) => s.spotifyID === spotifyID);
				if (index === -1 || songs[index] === null || !songs[index]) {
					result = false;
					return;
				}
				result = songs[index].swapVote(userID, swapTime);
				this.queue = PriorityQueue.fromArray(
					sortRoomSongs(songs),
					this.compareRoomSongs,
				);
				this.printQueueBrief();
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'swapVote'`,
				);
			},
		);
		return result;
	}

	async addSong(
		spotifyID: string,
		userID: string,
		insertTime: Date,
		murLockService: MurLockService,
	): Promise<boolean> {
		let result = false;
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'addSong'`,
				);
				this.updateQueue();
				const songs: RoomSong[] = this.queue.toArray();
				if (!songs.find((s) => s.spotifyID === spotifyID)) {
					this.queue.enqueue(
						new RoomSong(spotifyID, userID, undefined, insertTime),
					);
					result = true;
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'addSong'`,
				);
			},
		);
		return result;
	}

	async removeSong(
		spotifyID: string,
		userID: string,
		murLockService: MurLockService,
	): Promise<boolean> {
		let result = false;
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'removeSong'`,
				);
				this.updateQueue();
				const songs: RoomSong[] = this.queue.toArray();
				const index = songs.findIndex((s) => s.spotifyID === spotifyID);
				if (index === -1 || songs[index] === null || !songs[index]) {
					result = false;
					return;
				}
				if (songs[index].userID !== userID) {
					result = false;
					return;
				}
				songs.splice(index, 1);
				this.queue = PriorityQueue.fromArray(songs, this.compareRoomSongs);
				result = true;
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'removeSong'`,
				);
			},
		);
		return result;
	}

	queueAsRoomSongDto(): RoomSongDto[] {
		this.updateQueue();
		const tempQueue: RoomSong[] = this.queue.toArray();
		const result: RoomSongDto[] = tempQueue.map((rs) => {
			const i = tempQueue.indexOf(rs);
			const s: RoomSongDto = rs.asRoomSongDto();
			s.index = i;
			return s;
		});
		return result;
	}

	songAsRoomSongDto(spotifyID: string): RoomSongDto | null {
		const tempQueue: RoomSong[] = this.queue.toArray();
		const song = tempQueue.find((s) => s.spotifyID === spotifyID);
		if (!song || song === null) {
			return null;
		}
		const result: RoomSongDto = song.asRoomSongDto();
		const i = tempQueue.indexOf(song);
		result.index = i;
		return result;
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

	async getSpotifyInfo(api: SpotifyApi, murLockService: MurLockService) {
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				// The lock has been acquired.
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'getSpotifyInfo'`,
				);
				//get spotify info for all songs
				this.updateQueue();
				const songs = this.queue.toArray();
				const songsWithoutInfo: RoomSong[] = [];
				for (let i = 0, n = songs.length; i < n; i++) {
					const s = songs[i];
					if (s && s.spotifyInfo === null) {
						songsWithoutInfo.push(s);
					}
				}
				if (songsWithoutInfo.length > 0) {
					const songIDs: string[] = [];
					for (const song of songsWithoutInfo) {
						if (song && song.spotifyID !== null) {
							songIDs.push(song.spotifyID);
						}
					}
					const songInfo: Spotify.Track[] = [];
					for (let i = 0, n = songIDs.length; i < n; i += 50) {
						const ids = songIDs.slice(i, i + 50);
						const info = await api.tracks.get(ids);
						songInfo.push(...info);
					}
					for (let i = 0, n = songs.length; i < n; i++) {
						const song = songs[i];
						const info = songInfo.find((s) => song && s.id === song.spotifyID);
						if (info && songs[i]) {
							songs[i].spotifyInfo = info;
						}
					}
					//update queue
					this.queue = PriorityQueue.fromArray(
						sortRoomSongs(songs),
						this.compareRoomSongs,
					);
				}

				// Now the lock will be released.
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'getSpotifyInfo'`,
				);
			},
		);
	}

	async playNext(murLockService: MurLockService): Promise<RoomSong | null> {
		let result: RoomSong | null = null;
		await murLockService.runWithLock(
			this.getQueueLockName(),
			5000,
			async () => {
				result = await this.getNextSong(murLockService);
				if (result !== null) {
					result.setPlaybackStartTime(new Date());
				}
			},
		);
		return result;
	}

	// async skipSong(murLockService: MurLockService): Promise<RoomSong | null> {
	// 	let result: RoomSong | null = null;
	// 	await murLockService.runWithLock(
	// 		this.getQueueLockName(),
	// 		QUEUE_LOCK_TIMEOUT,
	// 		async () => {
	// 			console.log(`Acquire lock: ${this.getQueueLockName()}`);
	// 			this.updateQueue();
	// 			if (this.queue.isEmpty()) {
	// 				return;
	// 			}
	// 			const song = this.queue.dequeue();
	// 			if (!song || song === null) {
	// 				return;
	// 			}
	// 			this.historicQueue.enqueue(song);
	// 			result = song;
	// 			console.log(`Release lock: ${this.getQueueLockName()}`);
	// 		},
	// 	);
	// 	return result;
	// }

	async isPlaying(murLockService: MurLockService): Promise<boolean> {
		this.updateQueue();
		if (this.historicQueue.isEmpty()) {
			return false;
		}
		const song = await this.getNextSong(murLockService);
		return song !== null && song.isPlaying();
	}

	/*
	isPaused(): boolean {}
	*/
	isEmpty(): boolean {
		return this.queue.isEmpty();
	}

	printQueueBrief() {
		const songs = this.queue.toArray();
		console.log("Queue:");
		for (const song of songs) {
			console.log(
				song.spotifyID +
					" - score: " +
					song.score +
					" - insertTime: " +
					song.insertTime,
			);
		}
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
		private readonly murLockService: MurLockService,
	) {
		this.roomQueues = new Map<string, ActiveRoom>();
	}

	async createRoomQueue(roomID: string): Promise<void> {
		const room: RoomDto | null = await this.dtogen.generateRoomDto(roomID);
		if (!room || room === null) {
			throw new Error("Room does not exist");
		}
		console.log("1");
		console.log(room);
		const activeRoom = new ActiveRoom(room);
		console.log("2");
		await activeRoom.reloadQueue(this.prisma);
		console.log("3");
		this.roomQueues.set(roomID, activeRoom);
		console.log("4");
		console.log(
			`Created room queue for room ${roomID} with active room: ${activeRoom}`,
		);
	}

	async addSong(
		roomID: string,
		spotifyID: string,
		userID: string,
		insertTime: Date,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
		}
		const activeRoom = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.addSong",
			);
		}
		const result: boolean = await activeRoom.addSong(
			spotifyID,
			userID,
			insertTime,
			this.murLockService,
		);
		await activeRoom.getSpotifyInfo(
			this.spotifyAuth.getUserlessAPI(),
			this.murLockService,
		);
		return result;
	}

	async removeSong(
		roomID: string,
		spotifyID: string,
		userID: string,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.removeSong",
			);
		}
		return await activeRoom.removeSong(spotifyID, userID, this.murLockService);
	}

	async upvoteSong(
		roomID: string,
		spotifyID: string,
		userID: string,
		createdAt: Date,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
		}
		const vote: VoteDto = {
			isUpvote: true,
			userID: userID,
			spotifyID: spotifyID,
			createdAt: createdAt,
		};
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.upvoteSong",
			);
		}
		console.log("upvoteSong for spotifyID: ", spotifyID);
		return await activeRoom.addVote(vote, this.murLockService);
	}

	async downvoteSong(
		roomID: string,
		spotifyID: string,
		userID: string,
		createdAt: Date,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
		}
		const vote: VoteDto = {
			isUpvote: false,
			userID: userID,
			spotifyID: spotifyID,
			createdAt: createdAt,
		};
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.downvoteSong",
			);
		}
		console.log("upvoteSong for spotifyID: ", spotifyID);
		return await activeRoom.addVote(vote, this.murLockService);
	}

	async undoSongVote(
		roomID: string,
		spotifyID: string,
		userID: string,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
		}
		const vote: VoteDto = {
			isUpvote: true,
			userID: userID,
			spotifyID: spotifyID,
			createdAt: new Date(),
		};
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.undoSongVote",
			);
		}
		return await activeRoom.removeVote(vote, this.murLockService);
	}

	async swapSongVote(
		roomID: string,
		spotifyID: string,
		userID: string,
		insertTime: Date,
	): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.swapSongVote",
			);
		}
		return await activeRoom.swapVote(
			spotifyID,
			userID,
			insertTime,
			this.murLockService,
		);
	}

	async getQueueState(roomID: string): Promise<{
		room: RoomDto;
		songs: RoomSongDto[];
		votes: VoteDto[];
	}> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.getQueueState",
			);
		}
		return {
			room: activeRoom.room,
			songs: activeRoom.queueAsRoomSongDto(),
			votes: activeRoom.allVotes(),
		};
	}

	async getSongAsRoomSongDto(
		roomID: string,
		spotifyID: string,
	): Promise<RoomSongDto | null> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.getSongAsRoomSongDto",
			);
		}
		return activeRoom.songAsRoomSongDto(spotifyID);
	}

	async initiatePlayback(roomID: string): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.initiatePlayback",
			);
		}
		if (!(await activeRoom.isPlaying(this.murLockService))) {
			if (activeRoom.isEmpty()) {
				return false;
			} else {
				const s = await activeRoom.getNextSong(this.murLockService);
				if (!s || s === null) {
					return false;
				}
			}
		}
		/*
		activeRoom.flushtoDB(
			this.spotify,
			this.spotifyAuth.getUserlessAPI(),
			this.prisma,
			this.murLockService,
		);
		*/
		return true;
	}

	async getNextSong(roomID: string): Promise<RoomSongDto | null> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.getNextSong",
			);
		}
		await activeRoom.getSpotifyInfo(
			this.spotifyAuth.getUserlessAPI(),
			this.murLockService,
		);
		const song = await activeRoom.getNextSong(this.murLockService);
		if (!song || song === null) {
			return null;
		}
		return song.asRoomSongDto();
	}

	//is song playing
	async isPlaying(roomID: string): Promise<boolean> {
		if (!this.roomQueues.has(roomID)) {
			console.log("creating room queue");
			await this.createRoomQueue(roomID);
		}
		console.log("getting active room");
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		console.log("got active room");
		console.log(activeRoom);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.isPlaying",
			);
		}
		return await activeRoom.isPlaying(this.murLockService);
	}

	async isPaused(roomID: string): Promise<boolean> {
		console.log(`room (${roomID}) is never paused`);
		return false;
		// if (!this.roomQueues.has(roomID)) {
		// await this.createRoomQueue(roomID);
		// }
		// const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		// if (!activeRoom || activeRoom === undefined) {
		// 	throw new Error("Weird error. HashMap is broken");
		// }
		// return activeRoom.isPaused();
	}

	async playSongNow(roomID: string): Promise<RoomSongDto | null> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.playSongNow",
			);
		}
		const song = await activeRoom.playNext(this.murLockService);
		if (!song || song === null) {
			return null;
		}
		return song.asRoomSongDto();
	}

	/*
	async pauseSong(roomID: string): Promise<void> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
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
			await this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.skipSong",
			);
		}
		await activeRoom.playNext(this.murLockService);
	}

	/*
	async resumeSong(roomID: string): Promise<Date> {
		
	}
	*/
}
