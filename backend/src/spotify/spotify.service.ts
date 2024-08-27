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

const NUMBER_OF_RETRIES = 3;

@Injectable()
export class SpotifyService {
	private clientId;
	private clientSecret;
	private redirectUri;
	private authHeader;

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
		private readonly prisma: PrismaService,
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
	}

	async getSelf(token: SpotifyTokenResponse): Promise<Spotify.UserProfile> {
		const api = SpotifyApi.withAccessToken(this.clientId, token);
		const user = await api.currentUser.profile();
		return user;
	}

	async getUserPlaylists(
		tk: SpotifyTokenPair,
	): Promise<Spotify.SimplifiedPlaylist[]> {
		if (new Date().getTime() > tk.epoch_expiry) {
			throw new Error("Token has expired");
		}

		const api = SpotifyApi.withAccessToken(this.clientId, tk.tokens);
		let total = Number.MAX_SAFE_INTEGER;
		let retrieved = 0;
		const userPlaylists: Spotify.SimplifiedPlaylist[] = [];
		while (retrieved < total) {
			const playlists = await api.currentUser.playlists.playlists(
				50,
				retrieved,
			);
			if (total === Number.MAX_SAFE_INTEGER) {
				total = playlists.total;
			}
			playlists.items.forEach((playlist) => {
				console.log(playlist.name);
			});
			userPlaylists.push(...playlists.items);
			retrieved += playlists.items.length;
			await sleep(1000);
		}

		//dedupe
		const seen = new Set();
		const userPlaylistsDeduped = userPlaylists.filter((el) => {
			const duplicate = seen.has(el.id);
			seen.add(el.id);
			return !duplicate;
		});
		return userPlaylistsDeduped;
	}

	async getAllLikedSongs(tk: SpotifyTokenPair): Promise<Spotify.SavedTrack[]> {
		if (new Date().getTime() > tk.epoch_expiry) {
			throw new Error("Token has expired");
		}

		const api = SpotifyApi.withAccessToken(this.clientId, tk.tokens);
		let total = Number.MAX_SAFE_INTEGER;
		let retrieved = 0;
		const likedSongs: Spotify.SavedTrack[] = [];
		while (retrieved < total) {
			console.log(retrieved + " / " + total + " liked songs");
			for (let i = 0; i < NUMBER_OF_RETRIES; i++) {
				try {
					const tracks = await api.currentUser.tracks.savedTracks(
						50,
						retrieved,
					);
					if (total === Number.MAX_SAFE_INTEGER) {
						total = tracks.total;
					}
					likedSongs.push(...tracks.items);
					retrieved += tracks.items.length;
					break;
				} catch (e) {
					console.error(e);
				}
				console.log("Retrying...");
			}
			await sleep(1000);
		}

		//dedupe
		console.log("Deduping liked songs");
		const seen = new Set();
		const likedSongsDeduped = likedSongs.filter((el) => {
			const duplicate = seen.has(el.track.id);
			seen.add(el.track.id);
			return !duplicate;
		});
		return likedSongsDeduped;
	}

	async importUserLibrary(tk: SpotifyTokenPair, userID: string): Promise<void> {
		if (new Date().getTime() > tk.epoch_expiry) {
			throw new Error("Token has expired");
		}

		const api = SpotifyApi.withAccessToken(this.clientId, tk.tokens);

		const playlists: Spotify.SimplifiedPlaylist[] = await this.getUserPlaylists(
			tk,
		);
		const likedSongs: Spotify.SavedTrack[] = await this.getAllLikedSongs(tk);

		const foundSongs: Spotify.PlaylistedTrack[] = [];
		for (const playlist of playlists) {
			const fullPlaylist: Spotify.Playlist = await api.playlists.getPlaylist(
				playlist.id,
			);

			//get all song ids in the playlist
			const playlistSongIds: string[] = fullPlaylist.tracks.items.map(
				(track) => track.track.id,
			);

			//find playlist songs that are in the database
			const existingSongs: PrismaTypes.song[] | null =
				await this.prisma.song.findMany({
					where: {
						spotify_id: {
							in: playlistSongIds,
						},
					},
				});
			if (!existingSongs || existingSongs === null) {
				throw new Error("Failed to find songs");
			}

			//find songs that are not in the database
			const newSongIds: string[] = playlistSongIds.filter((id) => {
				return !existingSongs.some((song) => song.spotify_id === id);
			});

			//gather PlaylistedTrack objects for new songs
			const newSongs: Spotify.PlaylistedTrack[] =
				fullPlaylist.tracks.items.filter((track) => {
					return newSongIds.includes(track.track.id);
				});

			foundSongs.push(...newSongs);
			await sleep(1000);
		}

		//find liked songs already in db
		let likedSongsInDB: PrismaTypes.song[] | null =
			await this.prisma.song.findMany({
				where: {
					spotify_id: {
						in: likedSongs.map((track) => track.track.id),
					},
				},
			});
		if (!likedSongsInDB || likedSongsInDB === null) {
			throw new Error("Failed to find songs");
		}

		const ls: PrismaTypes.song[] = likedSongsInDB;
		//collect liked songs not in db
		const newLikedSongs: Spotify.SavedTrack[] = likedSongs.filter((track) => {
			return !ls.some((song) => song.spotify_id === track.track.id);
		});

		const dbLikedSongs: Prisma.songCreateInput[] = [];
		for (const track of newLikedSongs) {
			const song: Prisma.songCreateInput = {
				name: track.track.name,
				duration: track.track.duration_ms,
				artist: track.track.artists[0].name,
				genres: track.track.album.genres ? track.track.album.genres : [],
				artwork_url: this.getLargestImage(track.track.album.images).url,
				spotify_id: track.track.id,
			};
			dbLikedSongs.push(song);
		}

		const newSongs: PrismaTypes.song[] =
			await this.prisma.song.createManyAndReturn({
				data: dbLikedSongs,
				skipDuplicates: true,
			});
		console.log("Created " + newSongs.length + " new songs");

		let allIDs: string[] = likedSongs.map((track) => track.track.id);
		likedSongsInDB = await this.prisma.song.findMany({
			where: {
				spotify_id: {
					in: allIDs,
				},
			},
		});
		allIDs = likedSongsInDB.map((song) => song.song_id);

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
					playlist: allIDs,
				},
			});
		} else {
			const likedSongsPlaylist: Prisma.playlistCreateInput = {
				name: "Liked Songs (generated by TuneIn)",
				users: {
					connect: { user_id: userID },
				},
				playlist: allIDs,
			};
			await this.prisma.playlist.create({
				data: likedSongsPlaylist,
			});
		}
	}

	async findSavedSongInDB(
		song: Spotify.SavedTrack,
	): Promise<PrismaTypes.song | null> {
		const search = await this.prisma.song.findFirst({
			where: {
				spotify_id: song.track.id,
			},
		});
		return search;
	}

	async findPlaylistSongInDB(
		song: Spotify.PlaylistedTrack,
	): Promise<PrismaTypes.song | null> {
		const search = await this.prisma.song.findFirst({
			where: {
				spotify_id: song.track.id,
			},
		});
		return search;
	}

	getLargestImage(images: Spotify.Image[]): Spotify.Image {
		let largest = 0;
		for (let i = 0; i < images.length; i++) {
			if (images[i].height * images[i].width > largest) {
				largest = i;
			}
		}
		return images[largest];
	}
}
