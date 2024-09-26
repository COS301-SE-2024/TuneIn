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
import { TasksService } from "../../../tasks/tasks.service";

const QUEUE_LOCK_TIMEOUT = 20000;

export class RoomSong {
	private _score: number;
	public readonly userID: string;
	public readonly spotifyID: string;
	private votes: VoteDto[];
	public readonly insertTime: Date;
	private playbackStartTime: Date | null;
	private spotifyDetails: Spotify.Track;
	private internalQueueItemID: string;
	public pauseTime: Date | null = null;

	constructor(
		spotifyID: string,
		userID: string,
		spotifyDetails: Spotify.Track,
		insertTime: Date = new Date(),
		playbackStartTime: Date | null = null,
	) {
		this._score = 0;
		this.userID = userID;
		this.spotifyID = spotifyID;
		this.votes = [];
		this.insertTime = insertTime;
		this.playbackStartTime = playbackStartTime;
		this.spotifyDetails = spotifyDetails;
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
			insertTime: this.insertTime,
			track: this.spotifyDetails,
		};
		if (this.playbackStartTime) {
			result.startTime = this.playbackStartTime;
		}
		if (this.pauseTime !== null) {
			result.pauseTime = this.pauseTime;
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

	get spotifyInfo(): Spotify.Track {
		return this.spotifyDetails;
	}

	set spotifyInfo(info: Spotify.Track) {
		this.spotifyDetails = info;
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
		if (this.pauseTime !== null) {
			return false;
		}
		return (
			this.playbackStartTime.valueOf() + this.spotifyDetails.duration_ms >=
			new Date().valueOf()
		);
	}

	isPaused(): boolean {
		if (!this.playbackStartTime || this.playbackStartTime === null) {
			return false;
		}
		if (this.pauseTime !== null) {
			return true;
		}
		return false;
	}
}

function sortRoomSongs(queue: RoomSong[]): RoomSong[] {
	if (queue.length === 0) {
		return queue;
	}
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
				song.insertTime +
				" - startTime: " +
				song.getPlaybackStartTime(),
		);
	}
	const head: RoomSong = queue[0];
	const tempQueue: RoomSong[] = queue;
	let sortedWithHead = true;
	// the current playing song must stay in the front of the queue
	if (head.isPaused() || head.isPlaying()) {
		// remove head from tempQueue
		tempQueue.shift();
		sortedWithHead = false;
	}
	tempQueue.sort((a, b) => {
		if (a.score === b.score) {
			return a.insertTime.valueOf() - b.insertTime.valueOf();
		}
		return b.score - a.score;
	});
	if (!sortedWithHead) {
		tempQueue.unshift(head);
	}
	if (tempQueue.length > 0) {
		const currentStartTime = head.getPlaybackStartTime();
		if (currentStartTime !== null) {
			//update all start times to be sequential
			let pos = currentStartTime.getTime();
			for (let i = 0; i < tempQueue.length; i++) {
				const song: RoomSong = tempQueue[i];
				const t: Date = new Date(pos);
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
				song.insertTime +
				" - startTime: " +
				song.getPlaybackStartTime(),
		);
	}
	console.log("===================================");
	console.log("###################################");
	return tempQueue;
}

export class ActiveRoom {
	public readonly room: RoomDto;
	private queue: PriorityQueue<RoomSong>; //priority queue of songs (automatically ordered by score)
	private historicQueue: MinPriorityQueue<RoomSong>; //priority queue of songs that have already been played
	private compareRoomSongs: ICompare<RoomSong> = (a: RoomSong, b: RoomSong) => {
		if (a.score === b.score) {
			return a.insertTime.valueOf() - b.insertTime.valueOf();
		}
		return b.score - a.score;
	};

	constructor(room: RoomDto, murLockService: MurLockService) {
		this.room = room;
		this.createQueues(murLockService);
	}

	/**
	 * Creates the queue objects for the room
	 * @param murLockService
	 */
	async createQueues(murLockService: MurLockService) {
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'createQueues'`,
				);
				try {
					this.queue = new PriorityQueue<RoomSong>(this.compareRoomSongs);
					const playbackStartTime: IGetCompareValue<RoomSong> = (song) => {
						const playbackTime: Date | null = song.getPlaybackStartTime();
						if (!playbackTime || playbackTime === null) {
							throw new Error("Song has no playback start time");
						}
						return playbackTime.valueOf();
					};
					this.historicQueue = new MinPriorityQueue<RoomSong>(
						playbackStartTime,
					);
				} catch (e) {
					console.error("Error in createQueues");
					console.error(e);
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'createQueues'`,
				);
			},
		);
	}

	/**
	 * Sets the room queue to the given songs
	 * @param songs The songs to set the queue to
	 * @param murLockService
	 */
	async setQueue(songs: RoomSong[], murLockService: MurLockService) {
		this.inactive = false;
		this.minutesInactive = 0;
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'setQueue'`,
				);
				try {
					this.queue = PriorityQueue.fromArray(
						sortRoomSongs(songs),
						this.compareRoomSongs,
					);
				} catch (e) {
					console.error("Error in setQueue");
					console.error(e);
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'setQueue'`,
				);
			},
		);
	}

	/**
	 * Refreshes the song order in the queue
	 * @param murLockService
	 */
	async refreshQueue(murLockService: MurLockService) {
		await this.setQueue(this.queue.toArray(), murLockService);
	}

	/**
	 * Reloads the queue from the database
	 * @param prisma
	 * @param murLockService
	 */
	async reloadQueue(
		spotify: SpotifyService,
		prisma: PrismaService,
		murLockService: MurLockService,
	) {
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

		const ids: string[] = queueItems.map((q) => q.song.spotify_id);
		const tracks: Spotify.Track[] = await spotify.getManyTracks(ids);

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
						tracks[i],
						queueItem.insert_time,
						queueItem.start_time,
					);
					song.addVotes(queueItem.vote);
					rs.push(song);
				}
			}
		}
		await this.createQueues(murLockService);
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				try {
					for (let i = 0; i < rs.length; i++) {
						const song = rs[i];
						if (song) {
							if (song.spotifyID === null) {
								// throw new Error("Song does not have a spotify id");
								continue;
							}

							const startTime = song.getPlaybackStartTime();
							if (
								startTime !== null &&
								startTime.valueOf() < Date.now().valueOf()
							) {
								this.historicQueue.enqueue(song);
							} else {
								this.queue.enqueue(song);
							}
						}
					}
				} catch (e) {
					console.error("Error in reloadQueue");
					console.error(e);
				}
			},
		);
	}

	async clearQueue(murLockService: MurLockService) {
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'clearQueue'`,
				);
				try {
					this.queue.clear();
				} catch (e) {
					console.error("Error in clearQueue");
					console.error(e);
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'clearQueue'`,
				);
			},
		);
	}

	getQueueLockName(): string {
		return `EDIT_QUEUE_LOCK_${this.room.roomID}`;
	}

	/**
	 * Updates the queue by removing played songs and adding them to the historic queue
	 * @param murLockService
	 */
	async updateQueue(murLockService: MurLockService) {
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'updateQueue'`,
				);
				try {
					// handle played songs
					if (this.queue.isEmpty()) {
						return;
					}
					let song = this.queue.front();
					if (song === null) {
						return;
					}
					let t = song.getPlaybackStartTime();
					// while there are songs in the queue that have played already
					while (t && t < new Date()) {
						const expectedEnd = new Date(
							t.valueOf() + song.spotifyInfo.duration_ms,
						);
						const now = new Date();
						if (now < expectedEnd) {
							break;
						}
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
						if (this.queue.isEmpty()) {
							return;
						}
						song = this.queue.front();
						t = song.getPlaybackStartTime();
					}
				} catch (e) {
					console.error("Error in updateQueue");
					console.error(e);
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'updateQueue'`,
				);
			},
		);
	}
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
				console.log(
					`Getting spotify info for all songs in room ${this.room.roomID}`,
				);
				this.updateQueue();
				const songs = this.queue.toArray();
				const songsWithoutInfo: RoomSong[] = [];
				for (let i = 0, n = songs.length; i < n; i++) {
					const s = songs[i];
					if (s && s.spotifyInfo === null) {
						songsWithoutInfo.push(s);
					}
				}
				console.log(`There are ${songsWithoutInfo.length} songs without info`);
				if (songsWithoutInfo.length > 0) {
					const songIDs: string[] = [];
					for (const song of songsWithoutInfo) {
						if (song && song.spotifyID !== null) {
							songIDs.push(song.spotifyID);
						}
					}
					const songInfo: Spotify.Track[] = [];
					const promises: Promise<Spotify.Track[]>[] = [];
					for (let i = 0, n = songIDs.length; i < n; i += 50) {
						console.log(`Iteration ${i} of getting 50 songs out of ${n}`);
						const ids = songIDs.slice(i, i + 50);
						const info = api.tracks.get(ids);
						promises.push(info);
					}
					console.log(
						`There are ${
							promises.length
						} promises to resolve. Starting at ${new Date()}`,
					);
					const results = await Promise.all(promises);
					console.log(`All promises resolved at ${new Date()}`);
					for (const r of results) {
						songInfo.push(...r);
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
					console.log("Queue updated with spotify info");
				}

				// Now the lock will be released.
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'getSpotifyInfo'`,
				);
			},
		);
	}

	async playNext(murLockService: MurLockService): Promise<RoomSong | null> {
		const result: RoomSong | null = await this.getNextSong(murLockService);
		if (result !== null) {
			result.setPlaybackStartTime(new Date());
		}
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

	async isPaused(murLockService: MurLockService): Promise<boolean> {
		await this.updateQueue(murLockService);
		if (this.queue.isEmpty()) {
			return false;
		}
		const song = this.queue.front();
		return song.isPaused();
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
	activeQueueSongs: Map<string, Spotify.Track>; //map spotifyID to spotify track

	constructor(
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly prisma: PrismaService,
		private readonly spotify: SpotifyService,
		private readonly spotifyAuth: SpotifyAuthService,
		private readonly murLockService: MurLockService,
	) {
		this.roomQueues = new Map<string, ActiveRoom>();
		this.activeQueueSongs = new Map<string, Spotify.Track>();
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
		await activeRoom.getSpotifyInfo(
			this.spotifyAuth.getUserlessAPI(),
			this.murLockService,
		);
		console.log("4");
		this.roomQueues.set(roomID, activeRoom);
		console.log("5");
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
		const song = await activeRoom.getNextSong(this.murLockService);
		if (!song || song === null) {
			return null;
		}
		return song.asRoomSongDto();
	}

	async isPlaying(roomID: string): Promise<boolean> {
		const activeRoom = await this.getRoom(roomID);
		return await activeRoom.isPlaying(this.murLockService);
	}

	async isPaused(roomID: string): Promise<boolean> {
		const activeRoom = await this.getRoom(roomID);
		return await activeRoom.isPaused(this.murLockService);
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

	async pauseSong(roomID: string): Promise<void> {
		const activeRoom = await this.getRoom(roomID);
		await activeRoom.pauseSong(this.murLockService);
	}

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
