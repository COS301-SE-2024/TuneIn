// tasks.processor.ts
import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { SpotifyTokenPair } from "../auth/spotify/spotifyauth.service";
import { SpotifyService } from "../spotify/spotify.service";
import { Prisma } from "@prisma/client";
import * as PrismaTypes from "@prisma/client";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { PrismaService } from "../../prisma/prisma.service";
import { ActiveRoom } from "../modules/rooms/roomqueue/roomqueue.service";
import { MurLockService } from "murlock";

@Processor("task-queue")
export class TasksProcessor {
	constructor(
		private readonly spotifyService: SpotifyService,
		private readonly prisma: PrismaService,
		private readonly murLockService: MurLockService,
	) {}

	@Process("process-task")
	async handleTask(job: Job) {
		console.log("Processing task:", job.data);
		// Your background task processing logic here
	}

	@Process("import-library")
	async importUserLibrary(job: Job) {
		console.log(`${job.name} job started`);
		const tk: SpotifyTokenPair = job.data.token;
		const userID: string = job.data.user_id;
		if (new Date().getTime() > tk.epoch_expiry) {
			throw new Error("Token has expired");
		}
		console.log(`Importing user library for user: ${userID}`);

		// handle user's liked songs
		let start = new Date().valueOf();
		console.log(`Getting liked songs...`);
		const likedSongs: Spotify.SavedTrack[] =
			await this.spotifyService.getAllLikedSongs(tk);
		console.log(`Got liked songs in ${new Date().valueOf() - start}ms`);
		start = new Date().valueOf();
		const likedTracks: Spotify.Track[] = likedSongs.map((track) => track.track);
		const likedSongsDB: PrismaTypes.song[] =
			await this.spotifyService.addTracksToDB(likedTracks);
		console.log(`Added liked songs to DB in ${new Date().valueOf() - start}ms`);
		const likedSongIDs: string[] = likedSongsDB.map((song) => song.song_id);
		const likedSongsPlaylist: PrismaTypes.playlist | null =
			await this.prisma.playlist.findFirst({
				where: {
					name: "Liked Songs (generated by TuneIn)",
					user_id: userID,
				},
			});
		if (likedSongsPlaylist) {
			await this.prisma.playlist.update({
				where: {
					playlist_id: likedSongsPlaylist.playlist_id,
				},
				data: {
					playlist: likedSongIDs,
				},
			});
		} else {
			const likedSongsPlaylist: Prisma.playlistCreateInput = {
				name: "Liked Songs (generated by TuneIn)",
				users: {
					connect: { user_id: userID },
				},
				playlist: likedSongIDs,
			};
			await this.prisma.playlist.create({
				data: likedSongsPlaylist,
			});
		}
		console.log(`Finished importing liked songs`);

		// handle user's playlists
		console.log(`Getting user playlists...`);
		start = new Date().valueOf();
		const playlists: Spotify.SimplifiedPlaylist[] =
			await this.spotifyService.getUserPlaylists(tk);
		console.log(`Got user playlists in ${new Date().valueOf() - start}ms`);
		console.log(`Getting playlist tracks...`);
		let allSongs = 0;
		playlists.forEach((playlist) => {
			const tracks = playlist.tracks;
			if (tracks !== null) allSongs += tracks.total;
		});
		start = new Date().valueOf();
		const playlistTracksPromises = playlists.map(async (playlist) => {
			return this.spotifyService.getPlaylistTracks(tk, playlist.id);
		});
		const playlistTracks: Spotify.Track[][] = await Promise.all(
			playlistTracksPromises,
		);
		console.log(
			`Got all playlist tracks (${allSongs}) for ${
				playlists.length
			} playlists in ${new Date().valueOf() - start}ms`,
		);
		console.log(`Adding playlist songs to DB...`);
		start = new Date().valueOf();
		const playlistsInDBPromises = playlistTracks.map(async (tracks) => {
			return this.spotifyService.addTracksToDB(tracks);
		});
		const playlistSongsDB: PrismaTypes.song[][] = await Promise.all(
			playlistsInDBPromises,
		);
		console.log(
			`Added all playlist songs to DB in ${new Date().valueOf() - start}ms`,
		);
		console.log(`Creating playlists in DB...`);
		start = new Date().valueOf();
		const playlistsCreationPromises: Prisma.PrismaPromise<PrismaTypes.playlist>[] =
			[];
		for (let i = 0; i < playlists.length; i++) {
			const playlist = playlists[i];
			const playlistSongs = playlistSongsDB[i];
			const playlistSongIDs = playlistSongs.map((song) => song.song_id);
			const playlistInDB: PrismaTypes.playlist | null =
				await this.prisma.playlist.findFirst({
					where: {
						name: playlist.name,
						user_id: userID,
					},
				});
			if (playlistInDB) {
				playlistsCreationPromises.push(
					this.prisma.playlist.update({
						where: {
							playlist_id: playlistInDB.playlist_id,
						},
						data: {
							playlist: playlistSongIDs,
						},
					}),
				);
			} else {
				const playlistInDB: Prisma.playlistCreateInput = {
					name: playlist.name,
					users: {
						connect: { user_id: userID },
					},
					playlist: playlistSongIDs,
				};
				playlistsCreationPromises.push(
					this.prisma.playlist.create({
						data: playlistInDB,
					}),
				);
			}
		}
		await Promise.all(playlistsCreationPromises);
		console.log(
			`Finished creating playlists in DB in ${new Date().valueOf() - start}ms`,
		);
	}

	// @Process("get-room-spotify-info")
	// async getRoomSpotifyInfo(job: Job) {
	// 	console.log(`${job.name} job started`);
	// 	const {
	// 		room,
	// 	}: {
	// 		room: ActiveRoom;
	// 	} = job.data;
	// 	const api: Spotify.SpotifyApi = this.spotifyService.getUserlessAPI();
	// 	console.log(
	// 		`Getting Spotify info for room '${room.room.room_name}' (${room.room.roomID})`,
	// 	);
	// 	const start = new Date().valueOf();
	// 	await room.getSpotifyInfo(api, this.prisma, this.murLockService);
	// 	await room.flushtoDB(
	// 		this.spotifyService,
	// 		api,
	// 		this.prisma,
	// 		this.murLockService,
	// 	);
	// 	const end = new Date().valueOf();
	// 	const milliseconds = end - start;
	// 	console.log(
	// 		`Finished getting Spotify info for room '${room.room.room_name}' (${room.room.roomID}) in ${milliseconds}ms`,
	// 	);
	// }

	@Process("fix-spotify-info")
	async fixSpotifyInfo(job: Job) {
		console.log(`${job.name} job started`);
		await this.spotifyService.fixSpotifyInfo();
	}
}
