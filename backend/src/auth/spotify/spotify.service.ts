import { Injectable } from "@nestjs/common";
import fetch from "node-fetch";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { ConfigService } from "@nestjs/config";

export type SpotifyTokenResponse = {
	access_token: string;
	token_type: string;
	scope: string;
	expires_in: number;
	refresh_token: string;
};

@Injectable()
export class SpotifyAuthService {
	private clientId;
	private clientSecret;
	private redirectUri;
	private authHeader;

	constructor(private configService: ConfigService) {
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

	async exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
		const details = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: "Basic " + this.authHeader,
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code: code,
				redirect_uri: this.redirectUri,
			}),
		})
			.then((response) => response.json())
			.catch((error) => {
				console.error("Error:", error);
				throw new Error("Failed to exchange code for token");
			});

		return details as SpotifyTokenResponse;
	}
}
