import { Injectable } from "@nestjs/common";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { ConfigService } from "@nestjs/config";
import * as PrismaTypes from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
	SpotifyTokenPair,
	SpotifyTokenResponse,
	SpotifyAuthService,
} from "../auth/spotify/spotifyauth.service";
import { PrismaService } from "./../../prisma/prisma.service";
// import { sleep } from "../common/utils";
import { MurLockService } from "murlock";
import { RoomDto } from "../modules/rooms/dto/room.dto";

const NUMBER_OF_RETRIES = 3;
const TABLE_LOCK_TIMEOUT = 30000;

@Injectable()
export class SpotifyService {
	private clientId: string;
	private clientSecret: string;
	// private redirectUri: string;
	// private authHeader: string;
	private TuneInAPI: Spotify.SpotifyApi; // an API client for the TuneIn Spotify account

	constructor(
		private readonly configService: ConfigService,
		private readonly prisma: PrismaService,
		private readonly murLockService: MurLockService,
		private readonly spotifyAuthService: SpotifyAuthService,
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

		// this.authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
		// 	"base64",
		// );

		const tuneinID = this.configService.get<string>("TUNEIN_USER_ID");
		if (!tuneinID) {
			throw new Error("Missing TUNEIN_USER_ID");
		}
		let error: Error | undefined;
		this.spotifyAuthService.getSpotifyTokens(tuneinID).then((tp) => {
			for (let i = 0; i < NUMBER_OF_RETRIES; i++) {
				try {
					this.TuneInAPI = SpotifyApi.withAccessToken(clientId, tp.tokens);
					break;
				} catch (e) {
					error = e as Error;
					console.error(e);
				}
			}
			if (error) {
				throw error;
			}
		});
	}

	async wait(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	getUserlessAPI(): Spotify.SpotifyApi {
		return this.spotifyAuthService.getUserlessAPI();
	}

	async getSelf(token: SpotifyTokenResponse): Promise<Spotify.UserProfile> {
		let attempts = 0;
		let error: Error | undefined;
		for (let i = 0; i < NUMBER_OF_RETRIES; i++) {
			try {
				const api = SpotifyApi.withAccessToken(this.clientId, token);
				const user = await api.currentUser.profile();
				return user;
			} catch (e) {
				error = e as Error;
				attempts++;
				console.error(e);
				await this.wait(5000 * attempts);
			}
		}
		if (error) {
			throw error;
		}
		throw new Error("Failed to get user profile");
	}

	async getAudioFeatures(spotifyID: string): Promise<Spotify.AudioFeatures> {
		let attempts = 0;
		let error: Error | undefined;
		for (let i = 0; i < NUMBER_OF_RETRIES; i++) {
			try {
				const audioFeatures = await this.spotifyAuthService
					.getUserlessAPI()
					.tracks.audioFeatures(spotifyID);
				return audioFeatures;
			} catch (e) {
				error = e as Error;
				attempts++;
				console.error(e);
				await this.wait(5000 * attempts);
			}
		}
		if (error) {
			throw error;
		}
		throw new Error("Failed to get audio features");
	}

	async getManyAudioFeatures(
		spotifyIDs: string[],
	): Promise<Spotify.AudioFeatures[]> {
		let attempts = 0;
		let error: Error | undefined;
		for (let i = 0; i < NUMBER_OF_RETRIES; i++) {
			try {
				const promises: Promise<Spotify.AudioFeatures[]>[] = [];
				for (let i = 0; i < spotifyIDs.length; i += 100) {
					const ids = spotifyIDs.slice(i, i + 100);
					promises.push(
						this.spotifyAuthService.getUserlessAPI().tracks.audioFeatures(ids),
					);
					await this.wait(500); // for rate limiting
				}
				const results: Spotify.AudioFeatures[][] = await Promise.all(promises);
				const features: Spotify.AudioFeatures[] = [];
				for (const result of results) {
					features.push(...result);
				}
				return features;
			} catch (e) {
				error = e as Error;
				attempts++;
				console.error(e);
				await this.wait(5000 * attempts);
			}
		}
		if (error) {
			throw error;
		}
		throw new Error("Failed to get audio features");
	}

	async getUserPlaylists(
		tk: SpotifyTokenPair,
	): Promise<Spotify.SimplifiedPlaylist[]> {
		let attempts = 0;
		let error: Error | undefined;
		for (let i = 0; i < NUMBER_OF_RETRIES; i++) {
			try {
				if (new Date().getTime() > tk.epoch_expiry) {
					throw new Error("Token has expired");
				}

				const api = SpotifyApi.withAccessToken(this.clientId, tk.tokens);
				const initialPlaylistsFetch: Spotify.Page<Spotify.SimplifiedPlaylist> =
					await api.currentUser.playlists.playlists();
				const total = initialPlaylistsFetch.total;
				const promises = [];
				let i = 0;
				while (i < total) {
					const p = api.currentUser.playlists.playlists(50, i);
					promises.push(p);
					i += 50;
					await this.wait(500); // for rate limiting
				}
				const playlists: Spotify.Page<Spotify.SimplifiedPlaylist>[] =
					await Promise.all(promises);
				const userPlaylists: Spotify.SimplifiedPlaylist[] = [];
				for (const p of playlists) {
					userPlaylists.push(...p.items);
				}
				return userPlaylists;
			} catch (e) {
				error = e as Error;
				attempts++;
				console.error(e);
				await this.wait(5000 * attempts);
			}
		}
		if (error) {
			throw error;
		}
		throw new Error("Failed to get user playlists");
	}

	async getRoomPlaylist(room: RoomDto): Promise<Spotify.Playlist> {
		const r = await this.prisma.room.findUnique({
			where: {
				room_id: room.roomID,
			},
		});
		if (r === null) {
			throw new Error("Room not found somehow");
		}
		let attempts = 0;
		let error: Error | undefined;
		for (let i = 0; i < NUMBER_OF_RETRIES; i++) {
			try {
				if (r.playlist_id) {
					const playlist: Spotify.Playlist =
						await this.TuneInAPI.playlists.getPlaylist(r.playlist_id);
					return playlist;
				} else {
					const user: Spotify.UserProfile =
						await this.TuneInAPI.currentUser.profile();
					const playlist: Spotify.Playlist =
						await this.TuneInAPI.playlists.createPlaylist(user.id, {
							name: room.room_name,
							description: room.description,
							public: true,
							collaborative: false,
						});
					//upload playlist image here
					return playlist;
				}
			} catch (e) {
				error = e as Error;
				attempts++;
				console.error(e);
				await this.wait(5000 * attempts);
			}
		}
		if (error) {
			throw error;
		}
		throw new Error("Failed to create playlist");
	}

	async updateRoomPlaylist(
		playlistID: string,
		trackIDs: string[],
		start = 0,
	): Promise<void> {
		let attempts = 0;
		let error: Error | undefined;
		for (let i = 0; i < NUMBER_OF_RETRIES; i++) {
			try {
				// handle current playlist songs, if not empty
				if (start > 0) {
					// get current playlist state
					const currentPlaylist: Spotify.Page<
						Spotify.PlaylistedTrack<Spotify.Track>
					> = await this.TuneInAPI.playlists.getPlaylistItems(playlistID);
					const currentTracks: Spotify.PlaylistedTrack<Spotify.Track>[] = [];
					while (currentTracks.length < currentPlaylist.total) {
						const tracks: Spotify.Page<Spotify.PlaylistedTrack<Spotify.Track>> =
							await this.TuneInAPI.playlists.getPlaylistItems(
								playlistID,
								undefined,
								undefined,
								50,
								currentTracks.length,
							);
						currentTracks.push(...tracks.items);
					}
					const currentTrackIDs: string[] = currentTracks.map(
						(track) => track.track.id,
					);

					//delete all songs from start
					const deleteIDs: string[] = currentTrackIDs.slice(start);
					await this.TuneInAPI.playlists.removeItemsFromPlaylist(playlistID, {
						tracks: deleteIDs.map((id) => ({ uri: `spotify:track:${id}` })),
					});
				}

				const uris: string[] = trackIDs.map((id) => `spotify:track:${id}`);
				await this.TuneInAPI.playlists.addItemsToPlaylist(
					playlistID,
					uris.slice(start),
					start,
				);
				return;
			} catch (e) {
				error = e as Error;
				attempts++;
				console.error(e);
				await this.wait(5000 * attempts);
			}
		}
		if (error) {
			throw error;
		}
		throw new Error("Failed to update playlist");
	}

	async getUserPlaylistTracks(
		tk: SpotifyTokenPair,
		playlistID: string,
	): Promise<Spotify.Track[]> {
		let attempts = 0;
		let error: Error | undefined;
		for (let i = 0; i < NUMBER_OF_RETRIES; i++) {
			try {
				if (new Date().getTime() > tk.epoch_expiry) {
					throw new Error("Token has expired");
				}

				const api = SpotifyApi.withAccessToken(this.clientId, tk.tokens);
				const playlistInfo: Spotify.Playlist<Spotify.Track> =
					await api.playlists.getPlaylist(playlistID);

				let i = 0;
				const promises: Promise<
					Spotify.Page<Spotify.PlaylistedTrack<Spotify.Track>>
				>[] = [];
				while (i < playlistInfo.tracks.total) {
					promises.push(
						api.playlists.getPlaylistItems(
							playlistID,
							undefined,
							undefined,
							50,
							i,
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
				return result;
			} catch (e) {
				error = e as Error;
				attempts++;
				console.error(e);
				await this.wait(5000 * attempts);
			}
		}
		if (error) {
			throw error;
		}
		throw new Error("Failed to get playlist tracks");
	}

	async getAllLikedSongs(tk: SpotifyTokenPair): Promise<Spotify.SavedTrack[]> {
		let attempts = 0;
		let error: Error | undefined;
		for (let i = 0; i < NUMBER_OF_RETRIES; i++) {
			try {
				if (new Date().getTime() > tk.epoch_expiry) {
					throw new Error("Token has expired");
				}
				const api = SpotifyApi.withAccessToken(this.clientId, tk.tokens);
				const initialSongsFetch: Spotify.Page<Spotify.SavedTrack> =
					await api.currentUser.tracks.savedTracks();
				const total = initialSongsFetch.total;
				let i = 0;
				const promises: Promise<Spotify.Page<Spotify.SavedTrack>>[] = [];
				while (i < total) {
					const p = api.currentUser.tracks.savedTracks(50, i);
					promises.push(p);
					i += 50;
					await this.wait(500); // for rate limiting
				}

				const songs: Spotify.Page<Spotify.SavedTrack>[] = await Promise.all(
					promises,
				);
				const likedSongs: Spotify.SavedTrack[] = [];
				for (const s of songs) {
					likedSongs.push(...s.items);
				}
				return likedSongs;
			} catch (e) {
				error = e as Error;
				attempts++;
				console.error(e);
				await this.wait(5000 * attempts);
			}
		}
		if (error) {
			throw error;
		}
		throw new Error("Failed to get liked songs");
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
		let result: PrismaTypes.song | undefined;
		await this.murLockService.runWithLock(
			"SONG_TABLE_EDIT_LOCK",
			TABLE_LOCK_TIMEOUT,
			async () => {
				try {
					console.log(`Acquire song table lock for 'addTrackToDB'`);
					const song: PrismaTypes.song | null =
						await this.prisma.song.findFirst({
							where: {
								spotify_id: track.id,
							},
						});
					if (song) {
						result = song;
						return;
					}
					const genre = track.album.genres[0];
					const audioFeatures: Spotify.AudioFeatures =
						await this.getAudioFeatures(track.id);
					const s: Prisma.songCreateInput = {
						name: track.name,
						artists: track.artists.map((artist) => artist.name),
						duration: track.duration_ms,
						genre: genre !== undefined && genre !== null ? genre : "Unknown",
						artwork_url: this.getLargestImage(track.album.images).url,
						audio_features: JSON.stringify(audioFeatures),
						spotify_id: track.id,
					};
					result = await this.prisma.song.create({
						data: s,
					});
					console.log(`Release song table lock for 'addTrackToDB'`);
				} catch (e) {
					console.error("Error in addTrackToDB");
					console.error(e);
				}
			},
		); //end mutex
		if (result === undefined) {
			throw new Error("Failed to add song to database");
		}
		return result;
	}

	async addTracksToDB(tracks: Spotify.Track[]): Promise<PrismaTypes.song[]> {
		let result: PrismaTypes.song[] = [];
		await this.murLockService.runWithLock(
			"SONG_TABLE_EDIT_LOCK",
			TABLE_LOCK_TIMEOUT,
			async () => {
				try {
					console.log(`Acquire song table lock for 'addTracksToDB'`);
					const allIDs: string[] = tracks.map((track) => track.id);
					const audioFeatures = await this.getManyAudioFeatures(allIDs);
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

					const createList: Prisma.songCreateInput[] = [];
					const editList: Prisma.songUpdateInput[] = [];
					const editListIDs: string[] = [];
					for (const track of tracks) {
						if (track.id !== null) {
							let trackFeatures: Spotify.AudioFeatures | undefined =
								audioFeatures.find((feature) => feature.id === track.id);
							if (trackFeatures === undefined) {
								trackFeatures = await this.getAudioFeatures(track.id);
							}
							const genre = track.album.genres[0];
							if (!foundIDs.includes(track.id)) {
								const song: Prisma.songCreateInput = {
									name: track.name,
									artists: track.artists.map((artist) => artist.name),
									duration: track.duration_ms,
									genre:
										genre !== undefined && genre !== null ? genre : "Unknown",
									artwork_url: this.getLargestImage(track.album.images).url,
									audio_features: JSON.stringify(trackFeatures),
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
									spotify_id: track.id,
								};
								editList.push(song);
								editListIDs.push(track.id);
							}
						}
					}
					const promises: (
						| Prisma.PrismaPromise<PrismaTypes.song[]>
						| Prisma.PrismaPromise<Prisma.BatchPayload>
					)[] = [];
					if (createList.length > 0) {
						promises.push(
							this.prisma.song.createManyAndReturn({
								data: createList,
								skipDuplicates: true,
							}),
						);
					}
					if (editList.length > 0) {
						promises.push(
							this.prisma.song.updateMany({
								where: {
									spotify_id: {
										in: editListIDs,
									},
								},
								data: editList,
							}),
						);
					}
					await Promise.all(promises);
					result = await this.prisma.song.findMany({
						where: {
							spotify_id: {
								in: allIDs,
							},
						},
					});
				} catch (e) {
					console.error("Error in addTracksToDB");
					console.error(e);
				}
				console.log(`Release song table lock for 'addTracksToDB'`);
			},
		); //end mutex
		return result;
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
		let attempts = 0;
		let error: Error | undefined;
		for (let i = 0; i < NUMBER_OF_RETRIES; i++) {
			try {
				const promises: Promise<Spotify.Track[]>[] = [];
				for (let i = 0; i < trackIDs.length; i += 50) {
					const ids = trackIDs.slice(i, i + 50);
					promises.push(
						this.spotifyAuthService.getUserlessAPI().tracks.get(ids),
					);
				}
				const results: Spotify.Track[][] = await Promise.all(promises);
				const tracks: Spotify.Track[] = [];
				for (const result of results) {
					tracks.push(...result);
				}
				return tracks;
			} catch (e) {
				error = e as Error;
				attempts++;
				console.error(e);
				await this.wait(5000 * attempts);
			}
		}
		if (error) {
			throw error;
		}
		throw new Error("Failed to get tracks");
	}
}
