import { Injectable } from "@nestjs/common";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import * as PrismaTypes from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
	SpotifyTokenPair,
	SpotifyTokenResponse,
} from "../auth/spotify/spotifyauth.service";
import { PrismaService } from "./../../prisma/prisma.service";
import { sleep } from "../common/utils";
import { MurLockService } from "murlock";

const NUMBER_OF_RETRIES = 3;

@Injectable()
export class SpotifyService {
	private clientId;
	private clientSecret;
	private redirectUri;
	private authHeader;
	private userlessAPI: Spotify.SpotifyApi;

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
		private readonly prisma: PrismaService,
		private readonly murLockService: MurLockService,
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

		const redirectUri = this.configService.get<string>("SPOTIFY_REDIRECT_URI");
		if (!redirectUri) {
			throw new Error("Missing SPOTIFY_REDIRECT_URI");
		}
		this.redirectUri = redirectUri;

		this.authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
			"base64",
		);

		this.userlessAPI = Spotify.SpotifyApi.withClientCredentials(
			this.clientId,
			this.clientSecret,
		);
	}

	async wait(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async getSelf(token: SpotifyTokenResponse): Promise<Spotify.UserProfile> {
		const api = SpotifyApi.withAccessToken(this.clientId, token);
		const user = await api.currentUser.profile();
		return user;
	}

	async getAudioFeatures(spotifyID: string): Promise<Spotify.AudioFeatures> {
		const audioFeatures = await this.userlessAPI.tracks.audioFeatures(
			spotifyID,
		);
		return audioFeatures;
	}

	async getManyAudioFeatures(
		spotifyIDs: string[],
	): Promise<Spotify.AudioFeatures[]> {
		const promises: Promise<Spotify.AudioFeatures[]>[] = [];
		for (let i = 0; i < spotifyIDs.length; i += 100) {
			const ids = spotifyIDs.slice(i, i + 100);
			promises.push(this.userlessAPI.tracks.audioFeatures(ids));
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
		tk: SpotifyTokenPair,
	): Promise<Spotify.SimplifiedPlaylist[]> {
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
	}

	async getPlaylistTracks(
		tk: SpotifyTokenPair,
		playlistID: string,
	): Promise<Spotify.Track[]> {
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
				api.playlists.getPlaylistItems(playlistID, undefined, undefined, 50, i),
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
	}

	async getAllLikedSongs(tk: SpotifyTokenPair): Promise<Spotify.SavedTrack[]> {
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
			5000,
			async () => {
				const song: PrismaTypes.song | null = await this.prisma.song.findFirst({
					where: {
						spotify_id: track.id,
					},
				});
				if (song) {
					result = song;
					return;
				}
				const genre = track.album.genres[0];
				const s: Prisma.songCreateInput = {
					name: track.name,
					artists: track.artists.map((artist) => artist.name),
					duration: track.duration_ms,
					genre: genre !== undefined && genre !== null ? genre : "Unknown",
					artwork_url: this.getLargestImage(track.album.images).url,
					// audio_features: JSON.stringify(audioFeatures),
					audio_features: {},
					spotify_id: track.id,
				};
				result = await this.prisma.song.create({
					data: s,
				});
			},
		); //end mutex
		if (result === undefined) {
			throw new Error("Failed to add song to database");
		}
		// addAudioFeaturesToSongs([result]);
		return result;
	}

	async addTracksToDB(tracks: Spotify.Track[]): Promise<PrismaTypes.song[]> {
		let result: PrismaTypes.song[] = [];
		await this.murLockService.runWithLock(
			"SONG_TABLE_EDIT_LOCK",
			5000,
			async () => {
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

				const createList: Prisma.songCreateInput[] = [];
				const editList: Prisma.songUpdateInput[] = [];
				const editListIDs: string[] = [];
				for (const track of tracks) {
					if (track.id !== null) {
						const genre = track.album.genres[0];
						if (!foundIDs.includes(track.id)) {
							const song: Prisma.songCreateInput = {
								name: track.name,
								artists: track.artists.map((artist) => artist.name),
								duration: track.duration_ms,
								genre:
									genre !== undefined && genre !== null ? genre : "Unknown",
								artwork_url: this.getLargestImage(track.album.images).url,
								// audio_features: JSON.stringify(audioFeatures),
								audio_features: {},
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
								// audio_features: JSON.stringify(audioFeatures),
								audio_features: {},
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
			},
		); //end mutex
		// addAudioFeaturesToSongs(result);
		return result;
	}

	/*
	async addAudioFeaturesToSongs(
		songs: PrismaTypes.song[],
		api: SpotifyApi,
	): Promise<void> {
		await this.murLockService.runWithLock("SONG_TABLE_EDIT_LOCK", 5000, async () => {
			const songIDs: string[] = [];
			for (const song of songs) {
				if (song.spotify_id) {
					songIDs.push(song.spotify_id);
				}
			}
			const features: Spotify.AudioFeatures[] =
				await api.tracks.audioFeatures(songIDs);
			const updateList: Prisma.songUpdateInput[] = [];
			for (const feature of features) {
				const song: Prisma.songUpdateInput = {
					spotify_id: feature.id,
					audio_features: JSON.stringify(feature),
				};
				updateList.push(song);
			}
			await this.prisma.song.updateMany({
				where: {
					spotify_id: {
						in: songIDs,
					},
				},
				data: updateList,
			});
		});
	}
	*/

	async getManyTracks(
		trackIDs: string[],
		api: SpotifyApi,
	): Promise<Spotify.Track[]> {
		const promises: Promise<Spotify.Track[]>[] = [];
		for (let i = 0; i < trackIDs.length; i += 50) {
			const ids = trackIDs.slice(i, i + 50);
			promises.push(api.tracks.get(ids));
		}
		const results: Spotify.Track[][] = await Promise.all(promises);
		const tracks: Spotify.Track[] = [];
		for (const result of results) {
			tracks.push(...result);
		}
		return tracks;
	}
}
