import { Injectable } from "@nestjs/common";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import {
	SpotifyTokenPair,
	SpotifyTokenResponse,
} from "../auth/spotify/spotifyauth.service";

@Injectable()
export class SpotifyService {
	private clientId;
	private clientSecret;
	private redirectUri;
	private authHeader;

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
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
		return userPlaylists;
	}
}
