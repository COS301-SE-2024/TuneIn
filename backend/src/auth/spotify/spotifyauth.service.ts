import { HttpException, Injectable } from "@nestjs/common";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { Prisma } from "@prisma/client";
import * as PrismaTypes from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { JWTPayload } from "../auth.service";
import * as jwt from "jsonwebtoken";
import { IsNumber, IsObject, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { DbUtilsService } from "../../modules/db-utils/db-utils.service";
import { SpotifyService } from "../../spotify/spotify.service";
import { TasksService } from "../../tasks/tasks.service";
import { AxiosError } from "axios";

export class SpotifyTokenResponse {
	@ApiProperty()
	@IsString()
	access_token: string;

	@ApiProperty()
	@IsString()
	token_type: string;

	@ApiProperty()
	@IsString()
	scope: string;

	@ApiProperty()
	@IsNumber()
	expires_in: number;

	@ApiProperty()
	@IsString()
	refresh_token: string;
}

export class SpotifyTokenRefreshResponse {
	@ApiProperty()
	@IsString()
	access_token: string;

	@ApiProperty()
	@IsString()
	token_type: string;

	@ApiProperty()
	@IsString()
	scope: string;

	@ApiProperty()
	@IsNumber()
	expires_in: number;
}

export type SpotifyTokenPair = {
	tokens: SpotifyTokenResponse;
	epoch_expiry: number;
};

export class SpotifyCallbackResponse {
	@ApiProperty()
	@IsString()
	token: string;

	@ApiProperty()
	@IsObject()
	spotifyTokens: SpotifyTokenResponse;
}

@Injectable()
export class SpotifyAuthService {
	private clientId;
	private clientSecret;
	private redirectUri;
	private authHeader;

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
		private readonly prisma: PrismaService,
		private readonly dbUtils: DbUtilsService,
		private readonly spotify: SpotifyService,
		private readonly tasksService: TasksService,
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

	async exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
		try {
			const response = await firstValueFrom(
				this.httpService.post(
					"https://accounts.spotify.com/api/token",
					{
						grant_type: "authorization_code",
						code: code,
						redirect_uri: this.redirectUri,
					},
					{
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
							Authorization: `Basic ${this.authHeader}`,
						},
					},
				),
			);

			if (!response || !response.data) {
				throw new Error("Failed to exchange code for token");
			}

			return response.data as SpotifyTokenResponse;
		} catch (err) {
			if (err instanceof AxiosError) {
				console.log(err.response?.data);
			}
			throw new Error("Failed to exchange code for token");
		}
	}

	async refreshAccessToken(
		tk: SpotifyTokenResponse,
	): Promise<SpotifyTokenResponse> {
		try {
			const response = await firstValueFrom(
				this.httpService.post(
					"https://accounts.spotify.com/api/token",
					{
						grant_type: "refresh_token",
						refresh_token: tk.refresh_token,
					},
					{
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
							Authorization: `Basic ${this.authHeader}`,
						},
					},
				),
			);

			if (!response || !response.data) {
				throw new Error("Failed to refresh token");
			}

			const refreshToken: SpotifyTokenRefreshResponse =
				response.data as SpotifyTokenRefreshResponse;
			const result: SpotifyTokenResponse = {
				access_token: refreshToken.access_token,
				token_type: refreshToken.token_type,
				scope: refreshToken.scope,
				expires_in: refreshToken.expires_in,
				refresh_token: tk.refresh_token,
			};
			return result;
		} catch (err) {
			if (err instanceof AxiosError) {
				console.log(err.response?.data);
			}
			throw new Error("Failed to refresh token");
		}
	}

	async generateJWT(user: PrismaTypes.users): Promise<string> {
		const secretKey = this.configService.get<string>("JWT_SECRET_KEY");
		const expiresIn = this.configService.get<string>("JWT_EXPIRATION_TIME");

		if (!secretKey || secretKey === undefined || secretKey === "") {
			throw new Error("Missing JWT secret key");
		}

		if (!expiresIn || expiresIn === undefined || expiresIn === "") {
			throw new Error("Missing JWT expiration time");
		}

		if (!user || user === null) {
			throw new Error("Cannot generate JWT for null user");
		}

		if (!user.email || user.email === null) {
			throw new Error("Cannot generate JWT for user without email");
		}

		const payload: JWTPayload = {
			username: user.username,
			id: user.user_id,
			email: user.email,
		};

		const token = jwt.sign(payload, secretKey, { expiresIn });
		return token;
	}

	async createUser(tk: SpotifyTokenPair): Promise<PrismaTypes.users> {
		//get user
		if (tk.epoch_expiry < Date.now()) {
			throw new Error("Token has expired");
		}

		const spotifyUser: Spotify.UserProfile = await this.spotify.getSelf(
			tk.tokens,
		);

		//find largest profile picture
		let largest = 0;
		for (let i = 0; i < spotifyUser.images.length; i++) {
			if (spotifyUser.images[i].height > largest) {
				largest = i;
			}
		}

		console.log("spotifyUser image : " + spotifyUser.images);
		console.log("\nimage size: " + largest);
		const existingUser: PrismaTypes.users[] | null =
			await this.prisma.users.findMany({
				where: { username: spotifyUser.id },
			});
		if (!existingUser || existingUser === null) {
			throw new Error("Failed to find user");
		}
		if (existingUser && existingUser.length > 0) {
			return existingUser[0];
		}

		const profilePicture = largest > 0 ? spotifyUser.images[largest]?.url : 'https://example.com/default-profile-picture.png';

		const user: Prisma.usersCreateInput = {
			username: spotifyUser.id,
			profile_picture: profilePicture,
			full_name: spotifyUser.display_name,
			external_links: {
				spotify: spotifyUser.external_urls.spotify,
			},
			email: spotifyUser.email,
		};

		try {
			const response = await this.prisma.users.create({ data: user });
			console.log(response);
			//await this.tasksService.addImportLibraryTask(tk, response.user_id);
			return response;
		} catch (err) {
			console.log(err);
			throw new Error("Failed to create user");
		}
	}

	async saveUserSpotifyTokens(tk: SpotifyTokenPair, userID: string) {
		const user = await this.prisma.users.findFirst({
			where: { user_id: userID },
		});

		if (!user) {
			throw new Error("User not found");
		}

		const tokens: Prisma.authenticationCreateInput = {
			token: JSON.stringify(tk),
			users: {
				connect: {
					user_id: user.user_id,
				},
			},
		};

		try {
			await this.prisma.authentication.create({ data: tokens });
		} catch (err) {
			console.log(err);
			throw new Error("Failed to save tokens");
		}
	}

	async getSpotifyTokens(userID: string): Promise<SpotifyTokenPair> {
		const tokens = await this.prisma.authentication.findFirst({
			where: { user_id: userID },
		});

		if (!tokens) {
			throw new HttpException("User's Spotify tokens not found", 404);
		}

		const tk: SpotifyTokenPair = JSON.parse(tokens.token) as SpotifyTokenPair;
		if (tk.epoch_expiry < Date.now()) {
			//Token expired
			const newToken = await this.refreshAccessToken(tk.tokens);
			const newPair: SpotifyTokenPair = {
				tokens: newToken,
				epoch_expiry: Date.now() + newToken.expires_in * 1000,
			};
			await this.saveUserSpotifyTokens(newPair, userID);
			return newPair;
		}
		return JSON.parse(tokens.token) as SpotifyTokenPair;
	}
}
