import { Injectable } from "@nestjs/common";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import * as PrismaTypes from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
	SpotifyTokenPair,
	SpotifyTokenResponse,
} from "../auth/spotify/spotifyauth.service";
import { PrismaService } from "prisma/prisma.service";

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
			const tracks = await api.currentUser.tracks.savedTracks(50, retrieved);
			if (total === Number.MAX_SAFE_INTEGER) {
				total = tracks.total;
			}
			likedSongs.push(...tracks.items);
			retrieved += tracks.items.length;
		}

		//dedupe
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

		//const api = SpotifyApi.withAccessToken(this.clientId, tk.tokens);
		const playlists: Spotify.SimplifiedPlaylist[] =
			await this.getUserPlaylists(tk);
		const likedSongs: Spotify.SavedTrack[] = await this.getAllLikedSongs(tk);

		/*
		for (const playlist of playlists) {
			const fullPlaylist: Spotify.Playlist = await api.playlists.getPlaylist(playlist.id);
			const dbSongs: PrismaTypes.song[] = [];
			for (const track of fullPlaylist.tracks.items) {
				const song: PrismaTypes.song = {
					name: track.track.name,
					duration: track.track.duration_ms,
				};
			}
		}
			*/
		const dbLikedSongs: Prisma.songCreateInput[] = [];
		const existingSongs: Spotify.SavedTrack[] = [];
		for (const track of likedSongs) {
			const song: Prisma.songCreateInput = {
				name: track.track.name,
				duration: track.track.duration_ms,
				artist: track.track.artists[0].name,
				genre: track.track.album.genres[0],
			};
			const search = await this.prisma.song.findFirst({
				where: {
					name: song.name,
					duration: song.duration,
					artist: song.artist,
					genre: song.genre,
				},
			});
			if (search) {
				existingSongs.push(track);
			} else {
				dbLikedSongs.push(song);
			}
		}

		const ids: string[] = [];
		for (const track of existingSongs) {
			const song = await this.findSavedSongInDB(track);
			if (song) {
				dbLikedSongs.push(song);
			}
		}

		const newSongs: PrismaTypes.song[] =
			await this.prisma.song.createManyAndReturn({
				data: dbLikedSongs,
				skipDuplicates: true,
			});
		ids.push(...newSongs.map((song) => song.song_id));

		const likedSongsPlaylist: Prisma.playlistCreateInput = {
			name: "Liked Songs (generated by TuneIn)",
			users: {
				connect: { user_id: userID },
			},
			playlist: ids,
		};
		await this.prisma.playlist.create({
			data: likedSongsPlaylist,
		});
	}

	async findSavedSongInDB(
		song: Spotify.SavedTrack,
	): Promise<PrismaTypes.song | null> {
		const search = await this.prisma.song.findFirst({
			where: {
				name: song.track.name,
				duration: song.track.duration_ms,
				artist: song.track.artists[0].name,
				genre: song.track.album.genres[0],
			},
		});
		return search;
	}
}
