import { Controller, Get, Query, Request } from "@nestjs/common";
import { SpotifyAuthService, SpotifyTokenResponse } from "./spotify.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("spotify")
export class SpotifyAuthController {
	constructor(private readonly spotifyAuth: SpotifyAuthService) {}

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
		console.log(tokens);
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
