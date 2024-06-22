import { Controller, Get, Query, Request } from "@nestjs/common";
import {
	SpotifyAuthService,
	SpotifyCallbackResponse,
	SpotifyTokenPair,
	SpotifyTokenResponse,
} from "./spotifyauth.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import * as PrismaTypes from "@prisma/client";
import { SpotifyUser } from "src/spotify/models/user";
import { SpotifyService } from "src/spotify/spotify.service";

@Controller("auth/spotify")
export class SpotifyAuthController {
	constructor(
		private readonly spotifyAuth: SpotifyAuthService,
		private readonly spotify: SpotifyService,
	) {}

	@Get("callback")
	@ApiTags("auth")
	@ApiOperation({ summary: "Callback for Spotify Auth" })
	@ApiResponse({
		status: 201,
		description: "The record has been successfully created.",
		type: String,
	})
	@ApiResponse({ status: 403, description: "Forbidden." })
	async handleSpotifyAuthCallback(
		@Request() req: Request,
		@Query("code") code: string,
	) {
		//expecting "/auth/callback?code={code}&state={state}"
		const tokens: SpotifyTokenResponse =
			await this.spotifyAuth.exchangeCodeForToken(code);
		const tp: SpotifyTokenPair = {
			tokens: tokens,
			epoch_expiry: new Date().getTime() + (tokens.expires_in - 300) * 1000,
		};
		console.log(tokens);
		const user: PrismaTypes.users = await this.spotifyAuth.createUser(tp);
		const jwt: string = await this.spotifyAuth.generateJWT(user);

		const response: SpotifyCallbackResponse = {
			token: jwt,
			spotifyTokens: tokens,
		};
		return response;
	}

	@Get("refresh")
	@ApiTags("auth")
	@ApiOperation({ summary: "Manually Refresh Spotify Auth Token" })
	@ApiResponse({
		status: 201,
		description: "The record has been successfully created.",
		type: String,
	})
	@ApiResponse({ status: 403, description: "Forbidden." })
	handleSpotifyRefresh() {
		// Handle Spotify Refresh logic here
	}
}
