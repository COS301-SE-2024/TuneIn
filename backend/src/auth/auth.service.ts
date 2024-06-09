import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as AWS from "aws-sdk";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService {
	private cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;
	private userPoolId: string;
	private clientId: string;

	constructor(
		private configService: ConfigService,
		private prisma: PrismaService,
	) {
		this.cognitoIdentityServiceProvider =
			new AWS.CognitoIdentityServiceProvider({
				region: "af-south-1",
				accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID"),
				secretAccessKey: this.configService.get<string>(
					"AWS_SECRET_ACCESS_KEY",
				),
			});
		this.userPoolId =
			this.configService.get<string>("AWS_COGNITO_USER_POOL_ID") || "";
		this.clientId =
			this.configService.get<string>("AWS_COGNITO_CLIENT_ID") || "";
	}

	async validateUser(username: string, password: string): Promise<any> {
		if (!this.userPoolId || !this.clientId) {
			throw new Error("Missing Cognito configuration");
		}

		const params: AWS.CognitoIdentityServiceProvider.AdminInitiateAuthRequest =
			{
				AuthFlow: "ADMIN_NO_SRP_AUTH",
				ClientId: this.clientId,
				UserPoolId: this.userPoolId,
				AuthParameters: {
					USERNAME: username,
					PASSWORD: password,
				},
			};

		try {
			const authResponse = await this.cognitoIdentityServiceProvider
				.adminInitiateAuth(params)
				.promise();
			if (authResponse.AuthenticationResult) {
				const user = await this.cognitoIdentityServiceProvider
					.adminGetUser({
						UserPoolId: this.userPoolId,
						Username: username,
					})
					.promise();

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

	// eslint-disable-next-line prettier/prettier
  	async listUsers(): Promise<AWS.CognitoIdentityServiceProvider.ListUsersResponse> {
		const params = {
			UserPoolId: this.userPoolId,
		};

		try {
			const responsePromise = await this.cognitoIdentityServiceProvider
				.listUsers(params)
				.promise();
			const response = await responsePromise;
			return response;
		} catch (error) {
			throw new UnauthorizedException("Error listing users");
		}
	}

	//Sample code
	/*
	if (!userMatch) {
			return { message: "Invalid credentials. No user match" };
		}

		// add users to table
		const successful: boolean = await this.authService.createUser(
			userMatch.Username,
			userEmail,
		);

		if (!successful) {
			return { message: "Invalid credentials. Could not create user" };
		}

		const payload = {
			sub: userMatch.Username,
			username: authInfo.username,
			email: userEmail,
		};

		//generate JWT token using payload
		const token: string = this.authService.generateJWT(payload);
	*/
	async createUser(
		username: string,
		email: string,
		user_id: string,
	): Promise<boolean> {
		const user: Prisma.usersCreateInput = {
			username: username,
			email: email,
			user_id: user_id,
		};
		try {
			this.prisma.users.create({ data: user });
		} catch (err) {
			console.log(err);
			return false;
		}
		return true;
	}

	//input payload
	/*
	const payload = {
			sub: userMatch.Username,
			username: authInfo.username,
			email: userEmail,
		};
	*/
	async generateJWT(payload: {
		sub: string;
		username: string;
		email: string;
	}): Promise<string> {
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
}
