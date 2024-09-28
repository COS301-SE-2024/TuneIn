import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { DtoGenService } from "../../dto-gen/dto-gen.service";
// import { DbUtilsService } from "../../db-utils/db-utils.service";
import * as PrismaTypes from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
	MinPriorityQueue,
	// MaxPriorityQueue,
	IGetCompareValue,
	PriorityQueue,
	ICompare,
} from "@datastructures-js/priority-queue";
import { RoomDto } from "../dto/room.dto";
import { VoteDto } from "../dto/vote.dto";
import { RoomSongDto } from "../dto/roomsong.dto";
// import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { SpotifyService } from "../../../spotify/spotify.service";
// import { SpotifyAuthService } from "src/auth/spotify/spotifyauth.service";
import { MurLockService } from "murlock";
// import { TasksService } from "../../../tasks/tasks.service";

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
	public inactive = false;
	public minutesInactive = 0;

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
	async setQueue(
		songs: RoomSong[],
		spotify: SpotifyService,
		murLockService: MurLockService,
	) {
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
					const prev = this.spotifyIDs();
					this.queue = PriorityQueue.fromArray(
						sortRoomSongs(songs),
						this.compareRoomSongs,
					);
					const current = this.spotifyIDs();

					//if prev and current are not the same, then the queue has changed
					// update the spotify playlist
					let changed = false;
					if (prev.length !== current.length) {
						changed = true;
					}
					let i = 0;
					if (!changed) {
						for (i = 0; i < prev.length; i++) {
							if (prev[i] !== current[i]) {
								changed = true;
								break;
							}
						}
					}
					if (changed) {
						console.log("Queue has changed, updating spotify playlist");
						const start = this.historicQueue.size() + i;
						await spotify.updateRoomPlaylist(
							this.room.spotifyPlaylistID,
							current,
							start,
						);
					}
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
	async refreshQueue(spotify: SpotifyService, murLockService: MurLockService) {
		await this.setQueue(this.queue.toArray(), spotify, murLockService);
	}

	/**
	 * Reloads the queue from the database
	 * @param prisma
	 * @param murLockService
	 */
	async reloadQueue(
		prisma: PrismaService,
		spotify: SpotifyService,
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
					try {
						const song = new RoomSong(
							queueItem.song.spotify_id,
							songEnqueuer,
							JSON.parse(queueItem.song.track_info as string),
							queueItem.insert_time,
							queueItem.start_time,
						);
						song.addVotes(queueItem.vote);
						rs.push(song);
					} catch (e) {
						console.error(
							"Error in reloadQueue. Song could not be loaded from database queue",
						);
						console.error(e);
					}
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
		const ids: string[] = rs.map((s) => s.spotifyID);
		await spotify.updateRoomPlaylist(this.room.spotifyPlaylistID, ids, 0);
	}

	spotifyIDs(): string[] {
		const songs: RoomSong[] = this.queue.toArray();
		const result: string[] = songs.map((s) => s.spotifyID);
		return result;
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

	async flushToDB(
		spotify: SpotifyService,
		prisma: PrismaService,
		murLockService: MurLockService,
	) {
		//flush queue to db
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(`Acquire lock: ${this.getQueueLockName()}`);
				try {
					//ensure individual songs are in db

					//get all songs in queue
					const historicQueue: RoomSong[] = this.historicQueue.toArray();
					const upcomingQueue: RoomSong[] = this.queue.toArray();
					const queue: RoomSong[] = historicQueue.concat(upcomingQueue);

					//ensure enqueued songs are in db (songs table)
					const tracks: Spotify.Track[] = queue.map((s) => s.spotifyInfo);
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

						const song = historicQueue[i];
						newQueueItems.push({
							room_id: this.room.roomID,
							song_id: dbSong.song_id,
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
						if (!queue[i].queueItemID) {
							const dbSong = queueItems.find(
								(q) =>
									q.song.spotify_id === queue[i].spotifyID &&
									q.insert_time === queue[i].insertTime &&
									q.start_time === queue[i].getPlaybackStartTime(),
							);
							if (!dbSong || dbSong === null) {
								throw new Error("Song is not in the queue somehow?");
							}
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
				} catch (e) {
					console.error("Error in flushToDB");
					console.error(e);
				}
			},
		);
	}

	async getCurrentSong(
		spotify: SpotifyService,
		murLockService: MurLockService,
	): Promise<RoomSong | null> {
		await this.refreshQueue(spotify, murLockService);
		console.log("historicQueue");
		console.log(this.historicQueue.toArray());
		console.log("currentQueue");
		console.log(this.queue.toArray());
		if (this.queue.isEmpty()) {
			return null;
		} else {
			await this.updateQueue(murLockService);
			return this.queue.front();
		}
	}

	async addVote(
		vote: VoteDto,
		spotify: SpotifyService,
		murLockService: MurLockService,
	): Promise<boolean> {
		let result = false;
		this.printQueueBrief();
		const songs: RoomSong[] = this.queue.toArray();
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'addVote'`,
				);
				try {
					const index = songs.findIndex((s) => s.spotifyID === vote.spotifyID);
					if (index === -1 || !songs[index]) {
						result = false;
						return;
					}
					result = songs[index].addVote(vote);
				} catch (e) {
					console.error("Error in addVote");
					console.error(e);
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'addVote'`,
				);
			},
		);
		if (result) await this.setQueue(songs, spotify, murLockService);
		this.printQueueBrief();
		return result;
	}

	async removeVote(
		vote: VoteDto,
		spotify: SpotifyService,
		murLockService: MurLockService,
	): Promise<boolean> {
		let result = false;
		this.printQueueBrief();
		const songs: RoomSong[] = this.queue.toArray();
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'removeVote'`,
				);
				try {
					const index = songs.findIndex((s) => s.spotifyID === vote.spotifyID);
					if (index === -1 || songs[index] === null || !songs[index]) {
						result = false;
						return;
					}
					result = songs[index].removeVote(vote);
				} catch (e) {
					console.error("Error in removeVote");
					console.error(e);
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'removeVote'`,
				);
			},
		);
		if (result) await this.setQueue(songs, spotify, murLockService);
		this.printQueueBrief();
		return result;
	}

	async swapVote(
		spotifyID: string,
		userID: string,
		swapTime: Date,
		spotify: SpotifyService,
		murLockService: MurLockService,
	): Promise<boolean> {
		let result = false;
		await this.refreshQueue(spotify, murLockService);
		this.printQueueBrief();
		const songs: RoomSong[] = this.queue.toArray();
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'swapVote'`,
				);
				try {
					const index = songs.findIndex((s) => s.spotifyID === spotifyID);
					if (index === -1 || songs[index] === null || !songs[index]) {
						result = false;
						return;
					}
					result = songs[index].swapVote(userID, swapTime);
				} catch (e) {
					console.error("Error in swapVote");
					console.error(e);
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'swapVote'`,
				);
			},
		);
		if (result) await this.setQueue(songs, spotify, murLockService);
		this.printQueueBrief();
		return result;
	}

	async addSongs(
		songs: RoomSongDto[],
		userID: string,
		murLockService: MurLockService,
	): Promise<boolean> {
		console.log(`Attempting to add ${songs.length} songs to the queue`);
		let result = false;
		const roomSongs: RoomSong[] = this.queue.toArray();
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'addSong'`,
				);
				try {
					for (const song of songs) {
						if (!roomSongs.find((s) => s.spotifyID === song.spotifyID)) {
							this.queue.enqueue(
								new RoomSong(
									song.spotifyID,
									userID,
									song.track,
									song.insertTime,
								),
							);
							result = true;
						}
					}
				} catch (e) {
					console.error("Error in addSongs");
					console.error(e);
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'addSong'`,
				);
			},
		);
		await this.updateQueue(murLockService);
		return result;
	}

	async removeSongs(
		songs: RoomSongDto[],
		userID: string,
		spotify: SpotifyService,
		murLockService: MurLockService,
	): Promise<boolean> {
		console.log(`Attempting to remove ${songs.length} songs`);
		let result = false;
		await this.refreshQueue(spotify, murLockService);
		const roomSongs: RoomSong[] = this.queue.toArray();
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'removeSong'`,
				);
				try {
					for (const song of songs) {
						const index = roomSongs.findIndex(
							(s) => s.spotifyID === song.spotifyID,
						);
						console.log(
							`Found song with id: ${song.spotifyID} at index: ${index}`,
						);
						if (
							index === -1 ||
							roomSongs[index] === null ||
							!roomSongs[index]
						) {
							console.log(
								`Not removing because one of these is true: 'index === -1': ${
									index === -1
								}, 'roomSongs[index] === null': ${
									roomSongs[index] === null
								}, '!roomSongs[index]': ${!roomSongs[index]}`,
							);
							continue;
						}
						if (roomSongs[index].userID !== userID) {
							if (this.room.creator.userID !== userID) {
								console.log(
									`Not removing because the user ${userID} is not the enqueuer or room owner`,
								);
								continue;
							}
						}
						roomSongs.splice(index, 1);
						result = true;
					}
				} catch (e) {
					console.error("Error in removeSongs");
					console.error(e);
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'removeSong'`,
				);
			},
		);
		if (result) await this.setQueue(roomSongs, spotify, murLockService);
		await this.updateQueue(murLockService);
		return result;
	}

	queueAsRoomSongDto(): RoomSongDto[] {
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
		const songs: RoomSong[] = this.queue.toArray();
		const votes: VoteDto[] = [];
		for (const song of songs) {
			votes.push(...song.getVotes());
		}
		return votes;
	}

	async play(murLockService: MurLockService): Promise<RoomSong | null> {
		if (this.queue.isEmpty()) {
			return null;
		}
		let result: RoomSong | null = null;
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'ActiveRoom.play'`,
				);
				try {
					const song = this.queue.front();
					const st = song.getPlaybackStartTime();
					if (song.isPaused() && song.pauseTime !== null && st !== null) {
						const offset = song.pauseTime.valueOf() - st.valueOf();
						const adjustedStart = new Date(Date.now() + offset);
						this.queue.front().setPlaybackStartTime(adjustedStart);
						this.queue.front().pauseTime = null;
					} else if (st === null) {
						this.queue.front().setPlaybackStartTime(new Date());
					}
					result = this.queue.front();
				} catch (e) {
					console.error("Error in removeSongs");
					console.error(e);
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'ActiveRoom.play'`,
				);
			},
		);
		if (result !== null) await this.updateQueue(murLockService);
		return result;
	}

	async pauseSong() {
		if (this.queue.isEmpty()) {
			return;
		}
		this.queue.front().pauseTime = new Date();
	}

	async playNext(murLockService: MurLockService): Promise<RoomSong | null> {
		if (this.queue.isEmpty()) {
			return null;
		}
		let result: RoomSong | null = null;
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'ActiveRoom.playNext'`,
				);
				try {
					this.queue.dequeue();
					if (this.queue.isEmpty()) {
						return;
					}
					this.queue.front().setPlaybackStartTime(new Date());
					result = this.queue.front();
				} catch (e) {
					console.error("Error in playNext");
					console.error(e);
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'ActiveRoom.playNext'`,
				);
			},
		);
		await this.updateQueue(murLockService);
		return result;
	}

	async playPrev(
		spotify: SpotifyService,
		murLockService: MurLockService,
	): Promise<RoomSong | null> {
		// if paused, remove pause time
		await murLockService.runWithLock(
			this.getQueueLockName(),
			QUEUE_LOCK_TIMEOUT,
			async () => {
				console.log(
					`Acquire lock: ${this.getQueueLockName()} in function 'playPrev'`,
				);
				try {
					if (!this.queue.isEmpty()) {
						const song = this.queue.front();
						if (song.isPaused()) {
							this.queue.front().pauseTime = null;
						}
					}
				} catch (e) {
					console.error("Error in playPrev");
					console.error(e);
				}
				console.log(
					`Release lock: ${this.getQueueLockName()} in function 'playPrev'`,
				);
			},
		);

		//find newest song in historic queue
		if (this.historicQueue.isEmpty()) {
			return null;
		}
		const lastSong = this.historicQueue.dequeue();
		lastSong.setPlaybackStartTime(new Date());
		const oldQueue = this.queue.toArray();
		oldQueue.unshift(lastSong);
		for (let i = 1, n = oldQueue.length; i < n; i++) {
			oldQueue[i].setPlaybackStartTime(new Date(Number.MAX_SAFE_INTEGER));
		}
		await this.setQueue(oldQueue, spotify, murLockService);
		await this.updateQueue(murLockService);
		return this.queue.front();
	}

	async isPlaying(): Promise<boolean> {
		if (this.queue.isEmpty()) {
			return false;
		}
		const song = this.queue.front();
		return song.isPlaying();
	}

	async isPaused(): Promise<boolean> {
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

	get songs(): RoomSong[] {
		return this.queue.toArray();
	}
}

@Injectable()
export class RoomQueueService {
	public roomQueues: Map<string, ActiveRoom>; //map roomID to room data structure

	constructor(
		// private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly prisma: PrismaService,
		private readonly spotify: SpotifyService,
		// private readonly spotifyAuth: SpotifyAuthService,
		private readonly murLockService: MurLockService, // private readonly tasksService: TasksService,
	) {
		this.roomQueues = new Map<string, ActiveRoom>();
	}

	async createRoomQueue(roomID: string): Promise<void> {
		let room: RoomDto = await this.dtogen.generateRoomDto(roomID);
		if (room.spotifyPlaylistID === "") {
			await this.spotify.getRoomPlaylist(room);
			room = await this.dtogen.generateRoomDto(roomID);
		}
		const activeRoom = new ActiveRoom(room, this.murLockService);
		await activeRoom.reloadQueue(
			this.prisma,
			this.spotify,
			this.murLockService,
		);
		this.roomQueues.set(roomID, activeRoom);
		console.log(
			`Created room queue for room ${roomID} with active room: ${activeRoom}`,
		);
	}

	async refreshQueue(roomID: string): Promise<void> {
		const activeRoom = await this.getRoom(roomID);
		await activeRoom.refreshQueue(this.spotify, this.murLockService);
	}

	async flushToDB(roomID: string): Promise<void> {
		const activeRoom = await this.getRoom(roomID);
		await activeRoom.flushToDB(this.spotify, this.prisma, this.murLockService);
	}

	async clearRoomQueue(roomID: string): Promise<void> {
		const activeRoom = await this.getRoom(roomID);
		await activeRoom.clearQueue(this.murLockService);
	}

	async getRoom(roomID: string): Promise<ActiveRoom> {
		if (!this.roomQueues.has(roomID)) {
			await this.createRoomQueue(roomID);
		}
		const activeRoom: ActiveRoom | undefined = this.roomQueues.get(roomID);
		if (!activeRoom || activeRoom === undefined) {
			throw new Error(
				"Weird error. HashMap is broken: RoomQueueService.getQueueState",
			);
		}
		return activeRoom;
	}

	async addSongs(
		roomID: string,
		userID: string,
		songs: RoomSongDto[],
	): Promise<boolean> {
		const activeRoom = await this.getRoom(roomID);
		const ids: string[] = songs.map((s) => s.spotifyID);
		const tracks: Spotify.Track[] = await this.spotify.getManyTracks(ids);
		for (let i = 0; i < songs.length; i++) {
			songs[i].track = tracks[i];
		}
		const result: boolean = await activeRoom.addSongs(
			songs,
			userID,
			this.murLockService,
		);
		return result;
	}

	async removeSongs(
		roomID: string,
		userID: string,
		songs: RoomSongDto[],
	): Promise<boolean> {
		const activeRoom = await this.getRoom(roomID);
		return await activeRoom.removeSongs(
			songs,
			userID,
			this.spotify,
			this.murLockService,
		);
	}

	async upvoteSong(
		roomID: string,
		spotifyID: string,
		userID: string,
		createdAt: Date,
	): Promise<boolean> {
		const vote: VoteDto = {
			isUpvote: true,
			userID: userID,
			spotifyID: spotifyID,
			createdAt: createdAt,
		};
		console.log("upvoteSong for spotifyID: ", spotifyID);
		const activeRoom = await this.getRoom(roomID);
		return await activeRoom.addVote(vote, this.spotify, this.murLockService);
	}

	async downvoteSong(
		roomID: string,
		spotifyID: string,
		userID: string,
		createdAt: Date,
	): Promise<boolean> {
		const vote: VoteDto = {
			isUpvote: false,
			userID: userID,
			spotifyID: spotifyID,
			createdAt: createdAt,
		};
		console.log("upvoteSong for spotifyID: ", spotifyID);
		const activeRoom = await this.getRoom(roomID);
		return await activeRoom.addVote(vote, this.spotify, this.murLockService);
	}

	async undoSongVote(
		roomID: string,
		spotifyID: string,
		userID: string,
	): Promise<boolean> {
		const vote: VoteDto = {
			isUpvote: true,
			userID: userID,
			spotifyID: spotifyID,
			createdAt: new Date(),
		};
		const activeRoom = await this.getRoom(roomID);
		return await activeRoom.removeVote(vote, this.spotify, this.murLockService);
	}

	async swapSongVote(
		roomID: string,
		spotifyID: string,
		userID: string,
		insertTime: Date,
	): Promise<boolean> {
		const activeRoom = await this.getRoom(roomID);
		return await activeRoom.swapVote(
			spotifyID,
			userID,
			insertTime,
			this.spotify,
			this.murLockService,
		);
	}

	async getQueueState(roomID: string): Promise<{
		room: RoomDto;
		songs: RoomSongDto[];
		votes: VoteDto[];
	}> {
		const activeRoom = await this.getRoom(roomID);
		await activeRoom.updateQueue(this.murLockService);
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
		const activeRoom = await this.getRoom(roomID);
		return activeRoom.songAsRoomSongDto(spotifyID);
	}

	async getCurrentSong(roomID: string): Promise<RoomSongDto | null> {
		const activeRoom = await this.getRoom(roomID);
		const song = await activeRoom.getCurrentSong(
			this.spotify,
			this.murLockService,
		);
		if (!song || song === null) {
			return null;
		}
		return song.asRoomSongDto();
	}

	async isPlaying(roomID: string): Promise<boolean> {
		const activeRoom = await this.getRoom(roomID);
		return await activeRoom.isPlaying();
	}

	async isPaused(roomID: string): Promise<boolean> {
		const activeRoom = await this.getRoom(roomID);
		return await activeRoom.isPaused();
	}

	async play(roomID: string): Promise<RoomSongDto | null> {
		const activeRoom = await this.getRoom(roomID);
		const song = await activeRoom.play(this.murLockService);
		if (!song || song === null) {
			return null;
		}
		return song.asRoomSongDto();
	}

	async pauseSong(roomID: string): Promise<void> {
		const activeRoom = await this.getRoom(roomID);
		await activeRoom.pauseSong();
	}

	async playNext(roomID: string): Promise<void> {
		const activeRoom = await this.getRoom(roomID);
		await activeRoom.playNext(this.murLockService);
	}

	async playPrev(roomID: string): Promise<void> {
		const activeRoom = await this.getRoom(roomID);
		await activeRoom.playPrev(this.spotify, this.murLockService);
	}
}
