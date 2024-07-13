import { Injectable, UnauthorizedException } from "@nestjs/common";
import {
	AdminInitiateAuthCommandInput,
	CognitoIdentityProvider,
	ListUsersCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import * as PrismaTypes from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export type CognitoDecodedToken = {
	sub: string;
	iss: string;
	client_id: string;
	origin_jti: string;
	event_id?: string;
	token_use: string;
	scope?: string;
	auth_time: number;
	exp: number;
	iat: number;
	jti: string;
	username: string;
};

export type JWTPayload = {
	id: string;
	email: string;
	username: string;
};

export class RegisterBody {
	@ApiProperty({ description: "The user's username" })
	@IsString()
	username: string;

	@ApiProperty({ description: "The user's Cognito sub/ID" })
	@IsString()
	userCognitoSub: string;

	@ApiProperty({ description: "The user's email address" })
	@IsString()
	email: string;
}

export class LoginBody {
	@ApiProperty({ description: "The Cognito JWT token" })
	@IsString()
	token: string;
}

export class RefreshBody {
	@ApiProperty({ description: "The JWT token to be refreshed" })
	@IsString()
	refreshToken: string;
}

@Injectable()
export class AuthService {
	private cognitoIdentityServiceProvider: CognitoIdentityProvider;
	private accessKeyId: string;
	private secretAccessKey: string;
	private userPoolId: string;
	private clientId: string;

	constructor(
		private configService: ConfigService,
		private prisma: PrismaService,
	) {
		// Set the AWS credentials
		const accessKeyId = this.configService.get<string>("AWS_ACCESS_KEY_ID");
		if (!accessKeyId) {
			throw new Error("Missing AWS_ACCESS_KEY_ID");
		}
		this.accessKeyId = accessKeyId;

		const secretAccessKey = this.configService.get<string>(
			"AWS_SECRET_ACCESS_KEY",
		);
		if (!secretAccessKey) {
			throw new Error("Missing AWS_SECRET_ACCESS_KEY");
		}
		this.secretAccessKey = secretAccessKey;

		const userPoolId = this.configService.get<string>(
			"AWS_COGNITO_USER_POOL_ID",
		);
		if (!userPoolId) {
			throw new Error("Missing AWS_COGNITO_USER_POOL_ID");
		}
		this.userPoolId = userPoolId;

		const clientId = this.configService.get<string>("AWS_COGNITO_CLIENT_ID");
		if (!clientId) {
			throw new Error("Missing AWS_COGNITO_CLIENT_ID");
		}
		this.clientId = clientId;

		this.cognitoIdentityServiceProvider = new CognitoIdentityProvider({
			region: "af-south-1",

			credentials: {
				accessKeyId: this.accessKeyId,
				secretAccessKey: this.secretAccessKey,
			},
		});
	}

	async validateUser(username: string, password: string): Promise<any> {
		if (!this.userPoolId || !this.clientId) {
			throw new Error("Missing Cognito configuration");
		}

		const params: AdminInitiateAuthCommandInput = {
			AuthFlow: "ADMIN_NO_SRP_AUTH",
			ClientId: this.clientId,
			UserPoolId: this.userPoolId,
			AuthParameters: {
				USERNAME: username,
				PASSWORD: password,
			},
		};

		try {
			const authResponse =
				await this.cognitoIdentityServiceProvider.adminInitiateAuth(params);
			if (authResponse.AuthenticationResult) {
				const user = await this.cognitoIdentityServiceProvider.adminGetUser({
					UserPoolId: this.userPoolId,
					Username: username,
				});

				return {
					username: user.Username,
					attributes: user.UserAttributes,
					authenticationResult: authResponse.AuthenticationResult,
				};
			}
		} catch (error) {
			throw new UnauthorizedException("Invalid credentials");
		}
	}

  	async listUsers(): Promise<ListUsersCommandOutput> {
		const params = {
			UserPoolId: this.userPoolId,
		};

		try {
			const responsePromise =
				await this.cognitoIdentityServiceProvider.listUsers(params);
			const response = await responsePromise;
			return response;
		} catch (error) {
			throw new UnauthorizedException("Error listing users");
		}
	}

	async createUser(
		username: string,
		email: string,
		userID: string,
	): Promise<boolean> {
		const user: Prisma.usersCreateInput = {
			username: username,
			email: email,
			user_id: userID,
		};
		const existingUser = await this.prisma.users.findUnique({
			where: { user_id: userID },
		});
		if (existingUser) {
			return true;
		}
		try {
			const response = await this.prisma.users.create({ data: user });
			console.log(response);
		} catch (err) {
			console.log(err);
			return false;
		}
		return true;
	}

	async generateJWT(payload: JWTPayload): Promise<string> {
		const secretKey = this.configService.get<string>("JWT_SECRET_KEY");
		const expiresIn = this.configService.get<string>("JWT_EXPIRATION_TIME");

		if (!secretKey || secretKey === undefined || secretKey === "") {
			throw new Error("Missing JWT secret key");
		}

		if (!expiresIn || expiresIn === undefined || expiresIn === "") {
			throw new Error("Missing JWT expiration time");
		}

		const token = jwt.sign(payload, secretKey, { expiresIn });
		return token;
	}

	async refreshJWT(jwt_token: string): Promise<JWTPayload> {
		const secretKey = this.configService.get<string>("JWT_SECRET_KEY");
		if (!secretKey || secretKey === undefined || secretKey === "") {
			throw new Error("Missing JWT secret key");
		}

		const decoded: jwt.JwtPayload = jwt.decode(jwt_token) as jwt.JwtPayload;
		console.log("decoded", decoded);

		//ensure user data in Payload is valid
		const user: PrismaTypes.users | null = await this.prisma.users.findUnique({
			where: {
				user_id: decoded.id,
				email: decoded.email,
				username: decoded.username,
			},
		});

		console.log("user", user);

		if (!user) {
			throw new UnauthorizedException("Invalid JWT token");
		}

		const result: JWTPayload = {
			id: decoded.id as string,
			email: decoded.email as string,
			username: decoded.username as string,
		};
		return result;
	}

	/*
	async getUserInfo(jwt_token: string): Promise<any> {
		const secretKey = this.configService.get<string>("JWT_SECRET_KEY");
		const expiresIn = this.configService.get<string>("JWT_EXPIRATION_TIME");

		if (!secretKey || secretKey === undefined || secretKey === "") {
			throw new Error("Missing JWT secret key");
		}

		if (!expiresIn || expiresIn === undefined || expiresIn === "") {
			throw new Error("Missing JWT expiration time");
		}

		const decoded = jwt.verify(jwt_token, secretKey);
		const userID = decoded.sub;
		if (!userID) {
			throw new Error("Invalid JWT token");
		}
		if (typeof userID !== "string") {
			throw new Error("Invalid JWT token");
		}

		const user = await this.prisma.users.findUnique({
			where: { user_id: userID },
		});
		return user;
	}
	*/

	// this funciton will be passed a Request object from the NestJS controller eg:
	/*
	getRoomInfo(@Request() req: any, @Param("roomID") roomID: string): RoomDto {
		return this.roomsService.getRoomInfo(roomID);
	}
	*/
	getUserInfo(req: any): JWTPayload {
		console.log("req", req);
		const result = req.user as JWTPayload;
		console.log(result);
		if (!result) {
			throw new UnauthorizedException(
				"No user found in JWT token. Please log in again",
			);
		}
		if (!result.id) {
			throw new UnauthorizedException(
				"No user ID found in JWT token. Please log in again",
			);
		}
		return result;
	}

	async decodeAndVerifyCognitoJWT(
		jwt_token: string,
	): Promise<CognitoDecodedToken> {
		const verifier = CognitoJwtVerifier.create({
			userPoolId: this.userPoolId,
			tokenUse: "access",
			clientId: this.clientId,
		});

		try {
			const payload = await verifier.verify(jwt_token);
			console.log("Cognito Verification", payload);
			const result: CognitoDecodedToken = payload as CognitoDecodedToken;
			return result;
		} catch (error) {
			console.log(error);
			throw new UnauthorizedException("Invalid JWT token");
		}
	}
}
