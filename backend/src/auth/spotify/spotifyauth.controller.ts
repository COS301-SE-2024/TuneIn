import { Controller, Get, Query, Request, UseGuards } from "@nestjs/common";
import {
	SpotifyAuthService,
	SpotifyCallbackResponse,
	SpotifyTokenPair,
	SpotifyTokenResponse,
} from "./spotifyauth.service";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import * as PrismaTypes from "@prisma/client";
import { SpotifyService } from "../../spotify/spotify.service";
import { JwtAuthGuard } from "../jwt-auth.guard";
import { AuthService, JWTPayload } from "../auth.service";

@Controller("auth/spotify")
export class SpotifyAuthController {
	constructor(
		private readonly spotifyAuth: SpotifyAuthService,
		private readonly spotify: SpotifyService,
		private readonly auth: AuthService,
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
		@Query("state") state: string,
		@Query("redirect") redirectURI: string,
	) {
		//expecting "/auth/callback?code={code}&state={state}"
		//`http://localhost:3000/auth/spotify/callback?code=${code}&state=${state}&redirect=${redirectURI}`,

		const tokens: SpotifyTokenResponse =
			await this.spotifyAuth.exchangeCodeForToken(code, state, redirectURI);
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

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("tokens")
	@ApiTags("auth")
	@ApiOperation({ summary: "Get Spotify Auth Tokens" })
	@ApiResponse({
		status: 200,
		description: "The user's Spotify Auth Tokens",
		type: SpotifyTokenResponse,
	})
	@ApiResponse({ status: 404, description: "User not found" })
	async handleSpotifyTokens(
		@Request() req: Request,
	): Promise<SpotifyTokenResponse> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		const tokens: SpotifyTokenPair = await this.spotifyAuth.getSpotifyTokens(
			userInfo.id,
		);
		return tokens.tokens;
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("refresh")
	@ApiTags("auth")
	@ApiOperation({ summary: "Manually Refresh Spotify Auth Token" })
	@ApiResponse({
		status: 200,
		description: "The user's new Spotify Auth Tokens",
		type: SpotifyTokenResponse,
	})
	@ApiResponse({ status: 404, description: "User not found" })
	async handleSpotifyRefresh(
		@Request() req: Request,
	): Promise<SpotifyTokenResponse> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		const currentTokens: SpotifyTokenPair =
			await this.spotifyAuth.getSpotifyTokens(userInfo.id);
		const refreshedTokens: SpotifyTokenResponse =
			await this.spotifyAuth.refreshAccessToken(currentTokens.tokens);
		const tk: SpotifyTokenPair = {
			tokens: refreshedTokens,
			epoch_expiry:
				new Date().getTime() + (refreshedTokens.expires_in - 300) * 1000,
		};
		await this.spotifyAuth.saveUserSpotifyTokens(tk, userInfo.id);
		return refreshedTokens;
	}
}
