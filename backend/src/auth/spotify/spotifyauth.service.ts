import { Injectable } from "@nestjs/common";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { SpotifyUser } from "src/spotify/models/user";
import { Prisma } from "@prisma/client";
import * as PrismaTypes from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { JWTPayload } from "../auth.service";
import * as jwt from "jsonwebtoken";
import { IsObject, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { DbUtilsService } from "src/modules/db-utils/db-utils.service";
import { SpotifyService } from "src/spotify/spotify.service";
import { TasksService } from "src/tasks/tasks.service";
import { AxiosError } from "axios";

export type SpotifyTokenResponse = {
	access_token: string;
	token_type: string;
	scope: string;
	expires_in: number;
	refresh_token: string;
};

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
		/*
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
        */
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

		const user: Prisma.usersCreateInput = {
			username: spotifyUser.id,
			profile_picture: spotifyUser.images[largest].url,
			full_name: spotifyUser.display_name,
			external_links: {
				spotify: spotifyUser.external_urls.spotify,
			},
			email: spotifyUser.email,
		};

		try {
			const response = await this.prisma.users.create({ data: user });
			console.log(response);
			await this.tasksService.addImportLibraryTask(tk, response.user_id);
			for (let i = 0; i < 10; i++) {
				await this.tasksService.addTask({ i });
			}
			return response;
		} catch (err) {
			console.log(err);
			throw new Error("Failed to create user");
		}
	}
}
