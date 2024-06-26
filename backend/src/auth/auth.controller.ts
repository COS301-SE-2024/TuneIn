import {
	Controller,
	Post,
	Body,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import {
	AuthService,
	CognitoDecodedToken,
	JWTPayload,
	RegisterBody,
	LoginBody,
} from "./auth.service";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "src/modules/users/users.service";
import * as PrismaTypes from "@prisma/client";

@Controller("auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly usersService: UsersService,
	) {}

	@Post("login")
	@ApiTags("auth")
	@ApiOperation({ summary: "Login in the API using Cognito" })
	@ApiBody({ type: LoginBody })
	@ApiResponse({
		status: 201,
		description: "The record has been successfully created.",
		type: String,
	})
	@ApiResponse({ status: 403, description: "Forbidden." })
	async login(@Body() loginInfo: LoginBody) {
		/*
		const users = await this.authService.listUsers();
		console.log(users);
		console.log(users.Users);
		if (!users) {
			throw new HttpException(
				"Invalid credentials. Could not create user. AuthError01",
				HttpStatus.UNAUTHORIZED,
			);
		}

		if (!users.Users || users.Users.length === 0) {
			throw new HttpException(
				"Invalid credentials. Could not create user. AuthError02",
				HttpStatus.UNAUTHORIZED,
			);
		}

		//match the email address given with the email in the UserPool
		let userMatch = null;
		let userEmail = "";
		for (let i = 0; i < users.Users.length; i++) {
			if (!users.Users[i] || users.Users[i] === undefined) {
				continue;
			}
			console.log("users.Users[i]", users.Users[i]);
			const attrs = users.Users[i].Attributes;
			console.log("attrs", attrs);
			if (!attrs || attrs === undefined || attrs.length === 0) {
				continue;
			}

			// if "email" is the Name of an attribute in users.Users[i].Attributes
			if (attrs.find((attribute) => attribute.Name === "email")) {
				const attr = attrs.find((attribute) => attribute.Name === "email");
				if (!attr || attr === undefined) {
					continue;
				}
				//if the userCognitoSub matches the UserSub in the UserPool
				if (users.Users[i].Username === authInfo.userCognitoSub && attr.Value) {
					userMatch = users.Users[i];
					userEmail = attr.Value;
					break;
				}
			}
		}

		if (userMatch === null || !userMatch) {
			throw new HttpException(
				"Invalid credentials. Could not create user. AuthError03",
				HttpStatus.UNAUTHORIZED,
			);
		}

		// add users to table
		const successful: boolean = await this.authService.createUser(
			authInfo.username,
			userEmail,
			authInfo.userCognitoSub,
		);

		if (!successful) {
			throw new HttpException(
				"Invalid credentials. Could not create user. AuthError04",
				HttpStatus.UNAUTHORIZED,
			);
		}
		*/
		if (!loginInfo.token || loginInfo.token === null) {
			throw new HttpException(
				"Invalid request. Missing Cognito access token. AuthControllerLoginError01",
				HttpStatus.UNAUTHORIZED,
			);
		}
		const cognitoAccessToken: string = loginInfo.token;
		console.log("cognitoAccessToken", cognitoAccessToken);
		const authInfo: CognitoDecodedToken =
			await this.authService.decodeAndVerifyCognitoJWT(cognitoAccessToken);
		const userID: string = authInfo.username;
		console.log("authInfo", authInfo);

		const user: PrismaTypes.users | null =
			await this.usersService.findOne(userID);
		if (!user || user === null) {
			throw new HttpException(
				"Invalid credentials. Could not create user. AuthControllerLoginError01",
				HttpStatus.UNAUTHORIZED,
			);
		}
		if (!user.email || user.email === null) {
			throw new HttpException(
				"User (" +
					user.username +
					") does not have an email address. AuthControllerLoginError02",
				HttpStatus.UNAUTHORIZED,
			);
		}

		const payload: JWTPayload = {
			id: authInfo.username,
			username: user.username,
			email: user.email,
		};

		console.log("payload", payload);
		//generate JWT token using payload
		const token: string = await this.authService.generateJWT(payload);
		console.log("token", token);

		//return the JWT as a string
		return { token: token };
	}

	@Post("register")
	@ApiTags("auth")
	@ApiOperation({ summary: "Register a new user in the API using Cognito" })
	@ApiBody({ type: RegisterBody })
	@ApiResponse({
		status: 201,
		description: "The record has been successfully created.",
		type: RegisterBody,
	})
	@ApiResponse({ status: 403, description: "Forbidden." })
	async register(@Body() registerInfo: RegisterBody) {
		const successful: boolean = await this.authService.createUser(
			registerInfo.username,
			registerInfo.email,
			registerInfo.userCognitoSub,
		);

		if (!successful) {
			throw new HttpException(
				"Invalid credentials. Could not create user. AuthRegisterError01",
				HttpStatus.UNAUTHORIZED,
			);
		}

		throw new HttpException("Successfully created user.", HttpStatus.CREATED);
	}

	//TODO: Add a POST method to refresh an expired JWT token
	//TODO: Add a POST method to logout a user
}
