import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as AWS from "aws-sdk";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService {
	private cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;
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

		this.cognitoIdentityServiceProvider =
			new AWS.CognitoIdentityServiceProvider({
				region: "af-south-1",
				accessKeyId: this.accessKeyId,
				secretAccessKey: this.secretAccessKey,
			});
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
			const response = await this.prisma.users.create({ data: user });
			console.log(response);
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
