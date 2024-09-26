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
	ApiQuery,
	ApiResponse,
	ApiSecurity,
	ApiTags,
} from "@nestjs/swagger";
import * as PrismaTypes from "@prisma/client";
import { AuthService, JWTPayload } from "../auth.service";
import { JwtAuthGuard } from "../jwt-auth.guard";

@Controller("auth/spotify")
export class SpotifyAuthController {
	constructor(
		private readonly spotifyAuth: SpotifyAuthService,
		private readonly auth: AuthService,
	) {}

	/*
	@Get("redirect")
	@Redirect()
	@ApiTags("auth")
	@ApiQuery({
		name: "code",
		description:
			"The authorization code returned by Spotify after user consent",
		required: true,
		type: String,
		example: "NApCCg..BkWtQ",
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "state",
		description: "A unique state value to prevent CSRF attacks",
		required: true,
		type: String,
		example: "34fFs29kd09",
		allowEmptyValue: false,
	})
	@ApiOperation({
		summary: "Spotify OAuth Redirect",
		description: "Redirects to the Expo app with the Spotify auth code",
		operationId: "spotifyRedirect",
	})
	@ApiResponse({
		status: 302,
		description: "Redirects to the Expo app with the Spotify auth code",
	})
	async performRedirect(
		@Query("code") code: string,
		@Query("state") state: string,
	) {
		//expecting "/auth/redirect?code={code}&state={state}" from Spotify OAuth
		const stateObj: {
			"expo-redirect": string;
			"ip-address": string;
			"redirect-used": string;
		} = this.spotifyAuth.getStateObject(state);

		//now, redirect to the expo-redirect
		const redirectURI: string = stateObj["expo-redirect"];
		return {
			url: redirectURI,
		};
	}
	*/

	@Get("callback")
	@ApiTags("auth")
	@ApiOperation({
		summary: "Callback for Spotify Auth",
		description:
			"Handles the Spotify auth callback, creates an account for the user (if necessary), authenticates the user, and returns a JWT token",
		operationId: "spotifyCallback",
	})
	@ApiQuery({
		name: "code",
		description:
			"The authorization code returned by Spotify after user consent",
		required: true,
		type: String,
		example: "NApCCg..BkWtQ",
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "state",
		description: "A unique state value to prevent CSRF attacks",
		required: true,
		type: String,
		example: "34fFs29kd09",
		allowEmptyValue: false,
	})
	@ApiResponse({
		status: 201,
		description: "The record has been successfully created.",
		type: SpotifyCallbackResponse,
	})
	@ApiResponse({ status: 403, description: "Forbidden." })
	async handleSpotifyAuthCallback(
		@Query("code") code: string,
		@Query("state") state: string,
	): Promise<SpotifyCallbackResponse> {
		//expecting "/auth/callback?code={code}&state={state}"
		//`http://localhost:3000/auth/spotify/callback?code=${code}&state=${state}`,
		const tokens: SpotifyTokenResponse =
			await this.spotifyAuth.exchangeCodeForToken(code, state);
		const tp: SpotifyTokenPair = {
			tokens: tokens,
			epoch_expiry: new Date().getTime() + (tokens.expires_in - 300) * 1000,
		};
		console.log(tokens);
		const user: PrismaTypes.users = await this.spotifyAuth.createUser(tp);
		await this.spotifyAuth.saveUserSpotifyTokens(tp, user.user_id);
		const jwt: string = await this.spotifyAuth.generateJWT(user);

		const response: SpotifyCallbackResponse = {
			token: jwt,
			spotifyTokens: tp,
		};
		return response;
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get("tokens")
	@ApiTags("auth")
	@ApiOperation({
		summary: "Get Spotify Auth Tokens",
		description: "Returns the user's Spotify Auth Tokens",
		operationId: "getSpotifyTokens",
	})
	@ApiResponse({
		status: 200,
		description: "The user's Spotify Auth Tokens",
		type: SpotifyTokenPair,
	})
	@ApiResponse({ status: 404, description: "User not found" })
	async handleSpotifyTokens(
		@Request() req: Request,
	): Promise<SpotifyTokenPair> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		const tokens: SpotifyTokenPair = await this.spotifyAuth.getSpotifyTokens(
			userInfo.id,
		);
		return tokens;
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get("refresh")
	@ApiTags("auth")
	@ApiOperation({
		summary: "Manually Refresh Spotify Auth Tokens",
		description:
			"This method will manually refresh the user's Spotify Auth Tokens and return the new tokens",
		operationId: "refreshSpotifyTokens",
	})
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
