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
import { IsNumber, IsObject, IsString, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { AxiosError } from "axios";
import { Type } from "class-transformer";
import { TasksService } from "../../tasks/tasks.service";

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

export class SpotifyTokenPair {
	@ApiProperty()
	@IsObject()
	@ValidateNested()
	@Type(() => SpotifyTokenResponse)
	tokens: SpotifyTokenResponse;

	@ApiProperty()
	@IsNumber()
	epoch_expiry: number;
}

export class SpotifyCallbackResponse {
	@ApiProperty()
	@IsString()
	token: string;

	@ApiProperty()
	@IsObject()
	@Type(() => SpotifyTokenPair)
	@ValidateNested()
	spotifyTokens: SpotifyTokenPair;
}

@Injectable()
export class SpotifyAuthService {
	private clientId: string;
	private clientSecret: string;
	// private redirectUri: string;
	private authHeader: string;
	// private selfAuthorisedAPI: Spotify.SpotifyApi;

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
		private readonly prisma: PrismaService,
		// private readonly dbUtils: DbUtilsService,
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

		// const redirectUri = this.configService.get<string>("SPOTIFY_REDIRECT_URI");
		// if (!redirectUri) {
		// 	throw new Error("Missing SPOTIFY_REDIRECT_URI");
		// }
		// this.redirectUri = redirectUri;

		this.authHeader = Buffer.from(
			`${this.clientId}:${this.clientSecret}`,
		).toString("base64");

		// this.selfAuthorisedAPI = Spotify.SpotifyApi.withClientCredentials(
		// 	this.clientId,
		// 	this.clientSecret,
		// );
	}

	//how state is constructed in frontend
	/*
	const makeStateVariable = (redirectURI: string) => {
		const state = {
			"unique-pre-padding": generateRandom(10),
			"expo-redirect": redirectURI,
			"ip-address": utils.API_BASE_NO_PORT,
			"redirect-used": SPOTIFY_REDIRECT_URI,
			"unique-post-padding": generateRandom(10),
		};
		const bytes = new TextEncoder().encode(JSON.stringify(state));
		const b64 = utils.bytesToBase64(bytes);
		return b64;
	};
	*/
	getStateObject(state: string): {
		"expo-redirect": string;
		"ip-address": string;
		"redirect-used": string;
	} {
		const decodedState = Buffer.from(state, "base64").toString("utf-8");
		const obj = JSON.parse(decodedState);
		if (!obj["expo-redirect"]) {
			throw new Error(
				"Invalid state parameter. Does not contain expo-redirect",
			);
		}
		if (!obj["ip-address"]) {
			throw new Error("Invalid state parameter. Does not contain ip-address");
		}
		if (!obj["redirect-used"]) {
			throw new Error(
				"Invalid state parameter. Does not contain redirect-used",
			);
		}
		return obj;
	}

	async exchangeCodeForToken(
		code: string,
		state: string,
	): Promise<SpotifyTokenResponse> {
		try {
			//Step 0: Get the redirect URI
			const stateObj = this.getStateObject(state);
			const redirectURI = stateObj["expo-redirect"];

			// Step 1: Create the request options object
			const requestOptions = {
				url: "https://accounts.spotify.com/api/token",
				body: {
					grant_type: "authorization_code",
					code: code,
					redirect_uri: decodeURIComponent(redirectURI),
				},
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `Basic ${this.authHeader}`,
				},
			};

			// Step 2: Log or inspect the request options
			console.log("Request options:", requestOptions);

			// Step 3: Send the request
			const response = await firstValueFrom(
				this.httpService.post(
					requestOptions.url,
					new URLSearchParams(requestOptions.body).toString(), // Convert the body to URL-encoded string
					{ headers: requestOptions.headers },
				),
			);

			console.log(response);

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

	async getSelf(token: SpotifyTokenResponse): Promise<Spotify.UserProfile> {
		let attempts = 0;
		let error: Error | undefined;
		for (let i = 0; i < 3; i++) {
			try {
				const api = Spotify.SpotifyApi.withAccessToken(this.clientId, token);
				const user = await api.currentUser.profile();
				return user;
			} catch (e) {
				error = e as Error;
				attempts++;
				console.error(e);
				await new Promise((resolve) => setTimeout(resolve, 5000 * attempts));
			}
		}
		if (error) {
			throw error;
		}
		throw new Error("Failed to get user profile");
	}

	async createUser(tk: SpotifyTokenPair): Promise<PrismaTypes.users> {
		if (tk.epoch_expiry < Date.now()) {
			tk.tokens = await this.refreshAccessToken(tk.tokens);
		}

		const spotifyUser: Spotify.UserProfile = await this.getSelf(tk.tokens);
		const users: PrismaTypes.users[] = await this.prisma.users.findMany();

		let existingUser: PrismaTypes.users | undefined = users.find(
			(user) => user.email === spotifyUser.email,
		);
		if (!existingUser) {
			//try to find by username
			existingUser = users.find((user) => user.username === spotifyUser.id);
		}
		if (existingUser) {
			return existingUser;
		}

		const user: Prisma.usersCreateInput = {
			username: spotifyUser.id,
			full_name: spotifyUser.display_name,
			external_links: {
				spotify: [spotifyUser.external_urls.spotify],
			},
			email: spotifyUser.email,
		};

		if (spotifyUser.images && spotifyUser.images.length > 0) {
			//find largest profile picture
			let largest = -1;
			for (let i = 0; i < spotifyUser.images.length; i++) {
				const img = spotifyUser.images[i];
				if (
					img !== undefined &&
					img.height !== undefined &&
					img.height > largest
				) {
					largest = i;
				}
			}
			let imageURL = "";
			if (
				largest >= 0 &&
				spotifyUser.images[largest] !== undefined &&
				spotifyUser.images[largest] !== undefined
			) {
				imageURL = spotifyUser.images[largest]?.url || "";
			}

			console.log("spotifyUser image : " + spotifyUser.images);
			console.log("\nimage size: " + largest);

			user.profile_picture =
				imageURL !== ""
					? imageURL
					: "https://example.com/default-profile-picture.png";
		}

		try {
			const response = await this.prisma.users.create({ data: user });
			console.log(response);
			await this.tasksService.addImportLibraryTask(tk, response.user_id);
			return response;
		} catch (err) {
			console.log(err);
			throw new Error("Failed to create user");
		}
	}

	async saveUserSpotifyTokens(tk: SpotifyTokenPair, userID: string) {
		const user = await this.prisma.users.findFirst({
			where: { user_id: userID },
			include: { authentication: true },
		});

		if (!user) {
			throw new Error("User not found");
		}

		try {
			if (user.authentication !== null) {
				await this.prisma.authentication.update({
					where: { user_id: user.user_id },
					data: {
						token: JSON.stringify(tk),
					},
				});
			} else {
				await this.prisma.authentication.create({
					data: {
						token: JSON.stringify(tk),
						user_id: user.user_id,
					},
				});
			}
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
		return tk;
	}
}
