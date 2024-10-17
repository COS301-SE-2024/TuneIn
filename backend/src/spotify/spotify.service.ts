import { Injectable, HttpException } from "@nestjs/common";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { ConfigService } from "@nestjs/config";
import * as PrismaTypes from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
	SpotifyTokenPair,
	SpotifyTokenResponse,
	SpotifyTokenRefreshResponse,
} from "../auth/spotify/spotifyauth.service";
import { PrismaService } from "./../../prisma/prisma.service";
// import { sleep } from "../common/utils";
import { MurLockService } from "murlock";
import { RoomDto } from "../modules/rooms/dto/room.dto";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { AxiosError } from "axios";
import { ImageService } from "../image/image.service";
import { RetryService } from "../retry/retry.service";

const TABLE_LOCK_TIMEOUT = 30000;
const MAX_BYTES_PER_IMAGE = 256 * 1000;
const RETRIES = 3;

@Injectable()
export class SpotifyService {
	private clientId: string;
	private clientSecret: string;
	// private redirectUri: string;
	private authHeader: string;
	private userlessAPI: Spotify.SpotifyApi;
	// private TuneInAPI: Spotify.SpotifyApi; // an API client for the TuneIn Spotify account

	constructor(
		private readonly configService: ConfigService,
		private readonly prisma: PrismaService,
		private readonly murLockService: MurLockService,
		private readonly httpService: HttpService,
		private readonly imageService: ImageService,
		private readonly retryService: RetryService,
	) {
		const clientId = this.configService.get<string>("SPOTIFY_CLIENT_ID");
		if (!clientId) {
			throw new Error("Missing SPOTIFY_CLIENT_ID");
		}
		this.clientId = clientId;

		const clientSecret = this.configService.get<string>(
			"SPOTIFY_CLIENT_SECRET",
		);
		if (!clientSecret) {
			throw new Error("Missing SPOTIFY_CLIENT_SECRET");
		}
		this.clientSecret = clientSecret;

		// const redirectUri = this.configService.get<string>("SPOTIFY_REDIRECT_URI");
		// if (!redirectUri) {
		// 	throw new Error("Missing SPOTIFY_REDIRECT_URI");
		// }
		// this.redirectUri = redirectUri;

		this.authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
			"base64",
		);

		let error: Error | undefined;
		for (let i = 0; i < RETRIES; i++) {
			try {
				this.userlessAPI = Spotify.SpotifyApi.withClientCredentials(
					this.clientId,
					this.clientSecret,
				);
				break;
			} catch (e) {
				error = e as Error;
				console.error(e);
			}
		}
		if (error) {
			throw error;
		}
	}

	// async refreshTuneInAPI(): Promise<void> {
	// 	const tuneinID = this.configService.get<string>("TUNEIN_USER_ID");
	// 	if (!tuneinID) {
	// 		throw new Error("Missing TUNEIN_USER_ID");
	// 	}
	// 	let error: Error | undefined;
	// 	await this.getSpotifyTokens(tuneinID).then((tp: SpotifyTokenPair) => {
	// 		for (let i = 0; i < RETRIES; i++) {
	// 			try {
	// 				userAPI = SpotifyApi.withAccessToken(
	// 					this.clientId,
	// 					tp.tokens,
	// 					{
	// 						beforeRequest: (url: string, options) => {
	// 							console.log(`TuneInAPI request: ${url}`);
	// 							console.log(options);
	// 						},
	// 						afterRequest: (url: string, options, response: Response) => {
	// 							console.log(`TuneInAPI response: ${url}`);
	// 							console.log(options);
	// 							console.log(response);
	// 							// if (response.status === 429) {
	// 							// 	const retryAfter = response.headers.get("retry-after");
	// 							// 	if (retryAfter) {
	// 							// 		const delay = parseInt(retryAfter, 10) * 1000;
	// 							// 		console.log(`Rate limited, waiting ${delay}ms`);
	// 							// 		return this.wait(delay).then(() => {
	// 							// 			return;
	// 							// 		});
	// 							// 	}
	// 							// } else if (response.status === 401) {
	// 							// 	console.log(`Token expired, refreshing...`);
	// 							// 	this.getSpotifyTokens(tuneinID);
	// 							// }
	// 							// return;
	// 						},
	// 					},
	// 				);
	// 				break;
	// 			} catch (e) {
	// 				error = e as Error;
	// 				console.error(e);
	// 			}
	// 		}
	// 		if (error) {
	// 			throw error;
	// 		}
	// 	});
	// }

	async downloadImage(url: string): Promise<Buffer> {
		const response = await firstValueFrom(
			this.httpService.get(url, { responseType: "arraybuffer" }),
		);
		if (!response || !response.data) {
			throw new HttpException("Failed to download image", 500);
		}
		return Buffer.from(response.data);
	}

	async wait(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	getUserlessAPI(): Spotify.SpotifyApi {
		return this.userlessAPI;
	}

	async getUserAPI(userID: string): Promise<SpotifyApi> {
		const tp: SpotifyTokenPair = await this.getSpotifyTokens(userID);
		return SpotifyApi.withAccessToken(this.clientId, tp.tokens);
	}

	async getSelf(token: SpotifyTokenResponse): Promise<Spotify.UserProfile> {
		const api = SpotifyApi.withAccessToken(this.clientId, token);
		const user = await this.retryService.spotifyRequestWithRetries(
			api.currentUser.profile(),
		);
		return user;
	}

	async getAudioFeatures(spotifyID: string): Promise<Spotify.AudioFeatures> {
		const audioFeatures = await this.retryService.spotifyRequestWithRetries(
			this.userlessAPI.tracks.audioFeatures(spotifyID),
		);
		return audioFeatures;
	}

	async getManyAudioFeatures(
		spotifyIDs: string[],
	): Promise<Spotify.AudioFeatures[]> {
		const promises: Promise<Spotify.AudioFeatures[]>[] = [];
		for (let i = 0; i < spotifyIDs.length; i += 100) {
			const ids = spotifyIDs.slice(i, i + 100);
			promises.push(
				this.retryService.spotifyRequestWithRetries(
					this.userlessAPI.tracks.audioFeatures(ids),
				),
			);
			await this.wait(500); // for rate limiting
		}
		const results: Spotify.AudioFeatures[][] = await Promise.all(promises);
		const features: Spotify.AudioFeatures[] = [];
		for (const result of results) {
			features.push(...result);
		}
		return features;
	}

	async getUserPlaylists(
		userID: string,
	): Promise<Spotify.SimplifiedPlaylist[]> {
		const tk = await this.getSpotifyTokens(userID);
		const api = SpotifyApi.withAccessToken(this.clientId, tk.tokens);
		const initialPlaylistsFetch: Spotify.Page<Spotify.SimplifiedPlaylist> =
			await this.retryService.spotifyRequestWithRetries(
				api.currentUser.playlists.playlists(),
			);
		const total = initialPlaylistsFetch.total;
		const promises = [];
		for (let i = 0; i < total; i += 50) {
			await this.wait(500); // for rate limiting
			const p = this.retryService.spotifyRequestWithRetries(
				api.currentUser.playlists.playlists(50, i),
			);
			promises.push(p);
		}
		const playlists: Spotify.Page<Spotify.SimplifiedPlaylist>[] =
			await Promise.all(promises);
		const userPlaylists: Spotify.SimplifiedPlaylist[] = [];
		for (const p of playlists) {
			userPlaylists.push(...p.items);
		}
		return userPlaylists;
	}

	async getRoomPlaylist(room: RoomDto): Promise<Spotify.Playlist> {
		const r = await this.prisma.room.findUnique({
			where: {
				room_id: room.roomID,
			},
			include: {
				users: true,
			},
		});
		if (r === null) {
			throw new Error("Room not found somehow");
		}
		const userAPI: SpotifyApi = await this.getUserAPI(r.users.user_id);
		if (r.playlist_id !== null) {
			const playlist: Spotify.Playlist =
				await this.retryService.spotifyRequestWithRetries(
					userAPI.playlists.getPlaylist(r.playlist_id),
				);
			return playlist;
		} else {
			const user: Spotify.UserProfile =
				await this.retryService.spotifyRequestWithRetries(
					userAPI.currentUser.profile(),
				);
			const playlist: Spotify.Playlist =
				await this.retryService.spotifyRequestWithRetries(
					userAPI.playlists.createPlaylist(user.id, {
						name: room.room_name,
						description: room.description,
						public: true,
						collaborative: false,
					}),
				);
			// use regex to check if room.room_image is a valid URL
			if (room.room_image.match(/^(http|https):\/\//)) {
				const imageBuffer = await this.downloadImage(room.room_image);
				let b64: string;
				if (imageBuffer.length < MAX_BYTES_PER_IMAGE) {
					b64 = this.imageService.imageToB64(imageBuffer);
				} else {
					const processedImageBuffer = await this.imageService.compressImage(
						imageBuffer,
						MAX_BYTES_PER_IMAGE,
					);
					b64 = this.imageService.imageToB64(processedImageBuffer);
				}
				console.log(`Size of base64: ${b64.length}`);
				// await this.retryService.spotifyRequestWithRetries(
				//  userAPI.playlists.addCustomPlaylistCoverImageFromBase64String(
				// 		playlist.id,
				// 		b64,
				// 	),
				// );
			}
			await this.prisma.room.update({
				where: {
					room_id: room.roomID,
				},
				data: {
					playlist_id: playlist.id,
				},
			});
			return playlist;
		}
	}

	// async updateRoomPlaylist(
	// 	playlistID: string,
	// 	roomQueueTrackIDs: string[],
	// ): Promise<void> {
	// 	const userAPI: SpotifyApi = await this.getUserAPI(r.users.user_id);
	// 	const currentTracks: Spotify.PlaylistedTrack<Spotify.Track>[] = [];

	// 	// handle current playlist songs, if not empty
	// 	// get current playlist state
	// 	const currentPlaylist: Spotify.Page<
	// 		Spotify.PlaylistedTrack<Spotify.Track>
	// 	> = await this.retryService.spotifyRequestWithRetries(
	// 		userAPI.playlists.getPlaylistItems(playlistID),
	// 	);
	// 	console.log(`First request done`);

	// 	// fetch songs from Spotify with retries
	// 	while (currentTracks.length < currentPlaylist.total) {
	// 		await this.wait(500); // for rate limiting
	// 		console.log(`Loop request`);
	// 		const tracks: Spotify.Page<Spotify.PlaylistedTrack<Spotify.Track>> =
	// 			await this.retryService.spotifyRequestWithRetries(
	// 				userAPI.playlists.getPlaylistItems(
	// 					playlistID,
	// 					undefined,
	// 					undefined,
	// 					50,
	// 					currentTracks.length,
	// 				),
	// 			);
	// 		currentTracks.push(...tracks.items);
	// 	}
	// 	const currentPlaylistTrackIDs: string[] = currentTracks.map(
	// 		(track) => track.track.id,
	// 	);

	// 	//if the playlist and full queue are not the same, then the queue has changed
	// 	// update the spotify playlist
	// 	let changed = false;
	// 	if (roomQueueTrackIDs.length !== currentPlaylistTrackIDs.length) {
	// 		changed = true;
	// 	}
	// 	let start = 0;
	// 	if (!changed) {
	// 		for (start = 0; start < roomQueueTrackIDs.length; start++) {
	// 			if (
	// 				!roomQueueTrackIDs[start] ||
	// 				!currentPlaylistTrackIDs[start] ||
	// 				roomQueueTrackIDs[start] !== currentPlaylistTrackIDs[start]
	// 			) {
	// 				changed = true;
	// 				break;
	// 			}
	// 		}
	// 	}

	// 	if (!changed) return;

	// 	//delete all songs from start
	// 	if (start <= currentPlaylistTrackIDs.length) {
	// 		const deleteIDs: string[] = currentPlaylistTrackIDs.slice(start);
	// 		const promises: Promise<void>[] = [];
	// 		for (let i = 0; i < deleteIDs.length; i += 50) {
	// 			// remove songs from playlist in batches of 50 with retries
	// 			const ids = deleteIDs.slice(i, i + 50);
	// 			await new Promise((resolve) => setTimeout(resolve, 500));
	// 			const deleteRequest = this.retryService.spotifyRequestWithRetries(
	// 				userAPI.playlists.removeItemsFromPlaylist(playlistID, {
	// 					tracks: ids.map((id) => ({ uri: `spotify:track:${id}` })),
	// 				}),
	// 			);
	// 			promises.push(deleteRequest);
	// 		}
	// 		await Promise.all(promises);
	// 	}

	// 	const uris: string[] = roomQueueTrackIDs
	// 		.map((id) => `spotify:track:${id}`)
	// 		.slice(start);
	// 	const promises: Promise<void>[] = [];
	// 	for (let i = 0; i < uris.length; i += 50) {
	// 		const ids = uris.slice(i, i + 50);
	// 		await new Promise((resolve) => setTimeout(resolve, 500));
	// 		const insertRequest = this.retryService.spotifyRequestWithRetries(
	// 			userAPI.playlists.addItemsToPlaylist(playlistID, ids, start + i),
	// 		);
	// 		promises.push(insertRequest);
	// 	}
	// 	await Promise.all(promises);
	// }

	async addSongsToRoomPlaylist(
		room: RoomDto,
		trackIDs: string[],
	): Promise<void> {
		const r = await this.prisma.room.findUnique({
			where: {
				room_id: room.roomID,
			},
			include: {
				users: true,
			},
		});
		if (r === null) {
			throw new Error("Room not found somehow");
		}
		let playlistID: string;
		if (r.playlist_id === null) {
			const playlist = await this.getRoomPlaylist(room);
			playlistID = playlist.id;
		} else {
			playlistID = r.playlist_id;
		}
		const userAPI: SpotifyApi = await this.getUserAPI(r.users.user_id);
		const uris: string[] = trackIDs.map((id) => `spotify:track:${id}`);
		const promises: Promise<void>[] = [];
		for (let i = 0; i < uris.length; i += 50) {
			const ids = uris.slice(i, i + 50);
			await new Promise((resolve) => setTimeout(resolve, 500));
			const insertRequest = this.retryService.spotifyRequestWithRetries(
				userAPI.playlists.addItemsToPlaylist(playlistID, ids),
			);
			promises.push(insertRequest);
		}
		await Promise.all(promises);
	}

	async replaceSongsFromRoomPlaylist(
		room: RoomDto,
		startIndex: number,
		trackIDs: string[],
	): Promise<void> {
		const r = await this.prisma.room.findUnique({
			where: {
				room_id: room.roomID,
			},
			include: {
				users: true,
			},
		});
		if (r === null) {
			throw new Error("Room not found somehow");
		}
		let playlistID: string;
		if (r.playlist_id === null) {
			const playlist = await this.getRoomPlaylist(room);
			playlistID = playlist.id;
		} else {
			playlistID = r.playlist_id;
		}
		const userAPI: SpotifyApi = await this.getUserAPI(r.users.user_id);
		const uris: string[] = trackIDs.map((id) => `spotify:track:${id}`);
		const promises: Promise<void>[] = [];
		for (let i = 0; i < uris.length; i += 50) {
			const ids = uris.slice(i, i + 50);
			await new Promise((resolve) => setTimeout(resolve, 500));
			const updateRequest = this.retryService.spotifyRequestWithRetries(
				userAPI.playlists.updatePlaylistItems(playlistID, {
					uris: ids,
					range_start: startIndex + i,
				}),
			);
			promises.push(updateRequest);
		}
	}

	async saveRoomPlaylist(room: RoomDto, userID: string): Promise<void> {
		const tk = await this.getSpotifyTokens(userID);
		const roomPlaylist: Spotify.Playlist = await this.getRoomPlaylist(room);
		const api = SpotifyApi.withAccessToken(this.clientId, tk.tokens);
		await this.retryService.spotifyRequestWithRetries(
			api.currentUser.playlists.follow(roomPlaylist.id),
		);
	}

	async unsaveRoomPlaylist(room: RoomDto, userID: string): Promise<void> {
		const tk = await this.getSpotifyTokens(userID);
		const roomPlaylist: Spotify.Playlist = await this.getRoomPlaylist(room);
		const api = SpotifyApi.withAccessToken(this.clientId, tk.tokens);
		await this.retryService.spotifyRequestWithRetries(
			api.currentUser.playlists.unfollow(roomPlaylist.id),
		);
	}

	async getUserPlaylistTracks(
		userID: string,
		playlistID: string,
	): Promise<Spotify.Track[]> {
		const tk = await this.getSpotifyTokens(userID);
		const api = SpotifyApi.withAccessToken(this.clientId, tk.tokens);
		const playlistInfo: Spotify.Playlist<Spotify.Track> =
			await this.retryService.spotifyRequestWithRetries(
				api.playlists.getPlaylist(playlistID),
			);

		let i = 0;
		const promises: Promise<
			Spotify.Page<Spotify.PlaylistedTrack<Spotify.Track>>
		>[] = [];
		while (i < playlistInfo.tracks.total) {
			await this.wait(500); // for rate limiting
			promises.push(
				this.retryService.spotifyRequestWithRetries(
					api.playlists.getPlaylistItems(
						playlistID,
						undefined,
						undefined,
						50,
						i,
					),
				),
			);
			i += 50;
		}

		const songs: Spotify.Page<Spotify.PlaylistedTrack<Spotify.Track>>[] =
			await Promise.all(promises);
		const result: Spotify.Track[] = [];
		for (const s of songs) {
			const items: Spotify.PlaylistedTrack<Spotify.Track>[] = s.items;
			const tracks = items.map((item) => item.track);
			result.push(...tracks);
		}
		await this.addTracksToDB(result);
		return result;
	}
	// async getTuneInPlaylistIDs(playlistID: string): Promise<string[]> {
	// 	await this.refreshTuneInAPI();
	// 	const playlistInfo: Spotify.Playlist<Spotify.Track> =
	// 		await this.retryService.spotifyRequestWithRetries(
	// 			userAPI.playlists.getPlaylist(playlistID),
	// 		);

	// 	let i = 0;
	// 	const promises: Promise<
	// 		Spotify.Page<Spotify.PlaylistedTrack<Spotify.Track>>
	// 	>[] = [];
	// 	while (i < playlistInfo.tracks.total) {
	// 		await this.wait(500); // for rate limiting
	// 		promises.push(
	// 			this.retryService.spotifyRequestWithRetries(
	// 				userAPI.playlists.getPlaylistItems(
	// 					playlistID,
	// 					undefined,
	// 					undefined,
	// 					50,
	// 					i,
	// 				),
	// 			),
	// 		);
	// 		i += 50;
	// 	}

	// 	const songs: Spotify.Page<Spotify.PlaylistedTrack<Spotify.Track>>[] =
	// 		await Promise.all(promises);
	// 	const result: string[] = [];
	// 	for (const s of songs) {
	// 		const items: Spotify.PlaylistedTrack<Spotify.Track>[] = s.items;
	// 		const tracks = items.map((item) => item.track);
	// 		result.push(...tracks.map((track) => track.id));
	// 	}
	// 	return result;
	// }

	async getRoomPlaylistIDs(room: RoomDto): Promise<string[]> {
		const r = await this.prisma.room.findUnique({
			where: {
				room_id: room.roomID,
			},
			include: {
				users: true,
			},
		});
		if (r === null) {
			throw new Error("Room not found somehow");
		}
		let playlistID: string;
		if (r.playlist_id === null) {
			const playlist = await this.getRoomPlaylist(room);
			playlistID = playlist.id;
		} else {
			playlistID = r.playlist_id;
		}
		const userAPI: SpotifyApi = await this.getUserAPI(r.users.user_id);
		const playlistInfo: Spotify.Playlist<Spotify.Track> =
			await this.retryService.spotifyRequestWithRetries(
				userAPI.playlists.getPlaylist(playlistID),
			);

		let i = 0;
		const promises: Promise<
			Spotify.Page<Spotify.PlaylistedTrack<Spotify.Track>>
		>[] = [];
		while (i < playlistInfo.tracks.total) {
			await this.wait(500); // for rate limiting
			promises.push(
				this.retryService.spotifyRequestWithRetries(
					userAPI.playlists.getPlaylistItems(
						playlistID,
						undefined,
						undefined,
						50,
						i,
					),
				),
			);
			i += 50;
		}

		const songs: Spotify.Page<Spotify.PlaylistedTrack<Spotify.Track>>[] =
			await Promise.all(promises);
		const result: string[] = [];
		for (const s of songs) {
			const items: Spotify.PlaylistedTrack<Spotify.Track>[] = s.items;
			const tracks = items.map((item) => item.track);
			result.push(...tracks.map((track) => track.id));
		}
		return result;
	}

	async getAllLikedSongs(userID: string): Promise<Spotify.SavedTrack[]> {
		const tk = await this.getSpotifyTokens(userID);
		const api = SpotifyApi.withAccessToken(this.clientId, tk.tokens);
		const initialSongsFetch: Spotify.Page<Spotify.SavedTrack> =
			await this.retryService.spotifyRequestWithRetries(
				api.currentUser.tracks.savedTracks(),
			);
		const total = initialSongsFetch.total;
		let i = 0;
		const promises: Promise<Spotify.Page<Spotify.SavedTrack>>[] = [];
		while (i < total) {
			await this.wait(500); // for rate limiting
			const p = this.retryService.spotifyRequestWithRetries(
				api.currentUser.tracks.savedTracks(50, i),
			);
			promises.push(p);
			i += 50;
		}

		const songs: Spotify.Page<Spotify.SavedTrack>[] = await Promise.all(
			promises,
		);
		const likedSongs: Spotify.SavedTrack[] = [];
		for (const s of songs) {
			likedSongs.push(...s.items);
		}
		return likedSongs;
	}

	getLargestImage(images: Spotify.Image[]): Spotify.Image {
		let largest = 0;
		for (let i = 0; i < images.length; i++) {
			const img = images[i];
			if (img) {
				if (img.height * img.width > largest) {
					largest = i;
				}
			}
		}
		const result = images[largest];
		if (!result) {
			throw new Error("Failed to find largest image");
		}
		return result;
	}

	async addTrackToDB(track: Spotify.Track): Promise<PrismaTypes.song> {
		const song: PrismaTypes.song | null = await this.prisma.song.findFirst({
			where: {
				spotify_id: track.id,
			},
		});
		if (song) {
			return song;
		}
		const genre =
			track.album && track.album.genres && track.album.genres.length > 0
				? track.album.genres[0]
				: undefined;
		const audioFeatures: Spotify.AudioFeatures = await this.getAudioFeatures(
			track.id,
		);
		const s: Prisma.songCreateInput = {
			name: track.name,
			artists: track.artists.map((artist) => artist.name),
			duration: track.duration_ms,
			genre: genre !== undefined && genre !== null ? genre : "Unknown",
			artwork_url: this.getLargestImage(track.album.images).url,
			track_info: JSON.stringify(track),
			audio_features: JSON.stringify(audioFeatures),
			spotify_id: track.id,
		};
		return await this.murLockService
			.runWithLock("SONG_TABLE_EDIT_LOCK", TABLE_LOCK_TIMEOUT, async () => {
				try {
					console.log(`Acquire song table lock for 'addTrackToDB'`);
					return await this.prisma.song.create({
						data: s,
					});
				} catch (e) {
					console.error("Error in addTrackToDB");
					console.error(e);
					throw e;
				} finally {
					console.log(`Release song table lock for 'addTrackToDB'`);
				}
			})
			.catch((e) => {
				throw e;
			}); //end mutex
	}

	async addTracksToDB(tracks: Spotify.Track[]): Promise<PrismaTypes.song[]> {
		return await this.murLockService
			.runWithLock("SONG_TABLE_EDIT_LOCK", TABLE_LOCK_TIMEOUT, async () => {
				try {
					console.log(`Acquire song table lock for 'addTracksToDB'`);
					const allIDs: string[] = tracks.map((track) => track.id);
					const songs: PrismaTypes.song[] = await this.prisma.song.findMany({
						where: {
							spotify_id: {
								in: allIDs,
							},
						},
					});
					const foundIDs: (string | null)[] = songs.map(
						(song) => song.spotify_id,
					);
					const audioFeatures = await this.getManyAudioFeatures(allIDs);

					const createList: Prisma.songCreateInput[] = [];
					const editList: Prisma.songUpdateArgs[] = [];
					const editListIDs: string[] = [];
					for (const track of tracks) {
						if (track.id !== null) {
							let trackFeatures: Spotify.AudioFeatures | undefined =
								audioFeatures.find((feature) => feature.id === track.id);
							if (trackFeatures === undefined) {
								trackFeatures = await this.getAudioFeatures(track.id);
							}
							const genre =
								track.album &&
								track.album.genres &&
								track.album.genres.length > 0
									? track.album.genres[0]
									: undefined;
							if (!foundIDs.includes(track.id)) {
								const song: Prisma.songCreateInput = {
									name: track.name,
									artists: track.artists.map((artist) => artist.name),
									duration: track.duration_ms,
									genre:
										genre !== undefined && genre !== null ? genre : "Unknown",
									artwork_url: this.getLargestImage(track.album.images).url,
									audio_features: JSON.stringify(trackFeatures),
									track_info: JSON.stringify(track),
									spotify_id: track.id,
								};
								createList.push(song);
							} else {
								const song: Prisma.songUpdateInput = {
									name: track.name,
									artists: track.artists.map((artist) => artist.name),
									duration: track.duration_ms,
									genre:
										genre !== undefined && genre !== null ? genre : "Unknown",
									artwork_url: this.getLargestImage(track.album.images).url,
									audio_features: JSON.stringify(trackFeatures),
									track_info: JSON.stringify(track),
									spotify_id: track.id,
								};
								editList.push({
									where: {
										spotify_id: track.id,
									},
									data: song,
								});
								editListIDs.push(track.id);
							}
						}
					}
					await this.prisma.$transaction(
						createList.map((song) => {
							return this.prisma.song.create({
								data: song,
							});
						}),
					);
					await this.prisma.$transaction(
						editList.map((song) => {
							return this.prisma.song.update(song);
						}),
					);
					return await this.prisma.song.findMany({
						where: {
							spotify_id: {
								in: allIDs,
							},
						},
					});
				} catch (e) {
					console.error("Error in addTracksToDB");
					console.error(e);
					throw e;
				} finally {
					console.log(`Release song table lock for 'addTracksToDB'`);
				}
			})
			.catch((e) => {
				throw e;
			}); //end mutex
	}

	async fixSpotifyInfo(): Promise<void> {
		await this.murLockService.runWithLock(
			"SONG_TABLE_EDIT_LOCK",
			TABLE_LOCK_TIMEOUT,
			async () => {
				console.log(`Acquire song table lock for 'fixSpotifyInfo'`);
				try {
					console.log("Running 'fixSpotifyInfo' in SpotifyService");
					const empty = {};
					let songs: PrismaTypes.song[] = await this.prisma.song.findMany();
					// songs.filter(
					// 	(song) =>
					// 		song.spotify_id !== null &&
					// 		song.spotify_id !== undefined &&
					// 		((song.audio_features as string) === "" ||
					// 			(song.track_info as string) === "" ||
					// 			(song.audio_features as string) === "{}" ||
					// 			(song.track_info as string) === "{}" ||
					// 			JSON.parse(song.audio_features as string) === empty ||
					// 			JSON.parse(song.track_info as string) === empty),
					// );
					songs = songs.filter((song) => {
						if (song.spotify_id === null || song.spotify_id === undefined) {
							return false;
						}
						if (song.audio_features === null || song.track_info === null) {
							return true;
						}
						if (
							typeof song.audio_features === "number" ||
							typeof song.track_info === "number" ||
							typeof song.audio_features === "boolean" ||
							typeof song.track_info === "boolean"
						) {
							return false;
						}
						try {
							const audioFeatures = JSON.parse(
								song.audio_features as string,
							) as Spotify.AudioFeatures;
							const trackInfo = JSON.parse(
								song.track_info as string,
							) as Spotify.Track;
							if (
								typeof audioFeatures === "object" &&
								typeof trackInfo === "object"
							) {
							}
							return false;
						} catch (error) {
							// console.log(song.audio_features);
							// console.log(song.track_info);
							// console.error("Error parsing JSON:", error);
							return true;
						}
					});
					console.log(
						`Found ${songs.length} songs with missing audio features`,
					);
					if (songs.length > 0) {
						const spotifyIDs: string[] = songs.map((song) => song.spotify_id);
						const needTrackInfo: PrismaTypes.song[] = songs.filter((song) => {
							console.log(typeof song.track_info);
							console.log(song.track_info);
							if (song.track_info === null || song.track_info === undefined) {
								return true;
							}
							if (
								typeof song.track_info === "number" ||
								typeof song.track_info === "boolean"
							) {
								return true;
							}
							try {
								if (
									(song.track_info as string) === "" ||
									(song.track_info as string) === "{}"
								) {
									return true;
								}

								const trackInfo = JSON.parse(
									song.track_info as string,
								) as Spotify.Track;
								if (typeof trackInfo === "object") {
								}
								if (trackInfo === null || trackInfo === undefined) {
									return true;
								}
								if (trackInfo === empty) {
									return true;
								}
								return false;
							} catch (error) {
								// console.log(song.track_info);
								// console.error("Error parsing JSON:", error);
								return true;
							}
						});
						console.log(
							`Found ${needTrackInfo.length} songs with missing track info`,
						);
						if (needTrackInfo.length > 0) {
							const tracks: Spotify.Track[] = await this.getManyTracks(
								spotifyIDs,
							);
							await this.prisma.$transaction(
								tracks.map((track) => {
									return this.prisma.song.update({
										where: {
											spotify_id: track.id,
										},
										data: {
											track_info: JSON.stringify(track),
										},
									});
								}),
							);
						}

						const features: Spotify.AudioFeatures[] =
							await this.getManyAudioFeatures(spotifyIDs);
						await this.prisma.$transaction(
							features.map((feature) => {
								return this.prisma.song.update({
									where: {
										spotify_id: feature.id,
									},
									data: {
										audio_features: JSON.stringify(feature),
									},
								});
							}),
						);
					}
				} catch (e) {
					console.error("Error in fixSpotifyInfo");
					console.error(e);
				}
				console.log(`Release song table lock for 'fixSpotifyInfo'`);
			},
		);
	}

	async getManyTracks(trackIDs: string[]): Promise<Spotify.Track[]> {
		if (trackIDs.length === 0) {
			return [];
		}
		const trackInfo: Spotify.Track[] = await this.prisma.song
			.findMany({
				where: {
					spotify_id: {
						in: trackIDs,
					},
				},
			})
			.then((songs) => {
				const result: Spotify.Track[] = [];
				for (const song of songs) {
					try {
						result.push(JSON.parse(song.track_info as string) as Spotify.Track);
					} catch (e) {
						console.error(`Failed to parse track info for ${song.spotify_id}`);
						console.error(song.track_info);
						console.error(e);
					}
				}
				return result;
			});
		const notFound: string[] = trackIDs.filter(
			(id) => !trackInfo.map((track) => track.id).includes(id),
		);
		if (notFound.length === 0) {
			return trackInfo;
		}

		const promises: Promise<Spotify.Track[]>[] = [];
		for (let i = 0; i < notFound.length; i += 50) {
			const ids = notFound.slice(i, i + 50);
			promises.push(
				this.retryService.spotifyRequestWithRetries(
					this.userlessAPI.tracks.get(ids),
				),
			);
		}
		const results: Spotify.Track[][] = await Promise.all(promises);
		for (const result of results) {
			trackInfo.push(...result);
		}
		await this.addTracksToDB(results.flat());
		return trackInfo;
	}

	async refreshAccessToken(
		tk: SpotifyTokenResponse,
	): Promise<SpotifyTokenResponse> {
		try {
			console.log("Refreshing expired token");
			const response = await this.retryService.spotifyRequestWithRetries(
				firstValueFrom(
					this.httpService.post(
						"https://accounts.spotify.com/api/token",
						{
							grant_type: "refresh_token",
							refresh_token: tk.refresh_token,
						},
						{
							headers: {
								"Content-Type": "application/x-www-form-urlencoded",
								Authorization: `Basic ${this.authHeader}`,
							},
						},
					),
				),
			);

			if (!response || !response.data) {
				throw new Error("Failed to refresh token");
			}

			const refreshToken: SpotifyTokenRefreshResponse =
				response.data as SpotifyTokenRefreshResponse;
			const result: SpotifyTokenResponse = {
				access_token: refreshToken.access_token,
				token_type: refreshToken.token_type,
				scope: refreshToken.scope,
				expires_in: refreshToken.expires_in,
				refresh_token: tk.refresh_token,
			};
			return result;
		} catch (err) {
			if (err instanceof AxiosError) {
				console.log(err.response?.data);
			}
			throw new Error("Failed to refresh token");
		}
	}

	async saveUserSpotifyTokens(
		tk: SpotifyTokenPair,
		userID: string,
	): Promise<void> {
		console.log("Saving user's Spotify tokens");
		try {
			await this.prisma.authentication.upsert({
				where: { user_id: userID },
				update: {
					token: JSON.stringify(tk),
				},
				create: {
					token: JSON.stringify(tk),
					user_id: userID,
				},
			});
		} catch (err) {
			console.log(err);
			throw new Error("Failed to save tokens");
		}
	}

	async getSpotifyTokens(userID: string): Promise<SpotifyTokenPair> {
		const tokens = await this.prisma.authentication.findFirst({
			where: { user_id: userID },
		});

		if (!tokens) {
			throw new HttpException("User's Spotify tokens not found", 404);
		}

		const tk: SpotifyTokenPair = JSON.parse(tokens.token) as SpotifyTokenPair;
		if (tk.epoch_expiry < Date.now()) {
			//Token expired
			const newToken = await this.refreshAccessToken(tk.tokens);
			const newPair: SpotifyTokenPair = {
				tokens: newToken,
				epoch_expiry: Date.now() + newToken.expires_in * 1000,
			};
			await this.saveUserSpotifyTokens(newPair, userID);
			return newPair;
		}
		return tk;
	}
}
