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
	RefreshBody,
} from "./auth.service";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "../modules/users/users.service";
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
		status: 200,
		description: "User successfully logged in. JWT token returned.",
		type: String,
	})
	@ApiResponse({ status: 403, description: "Forbidden." })
	async login(@Body() loginInfo: LoginBody) {
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
		status: 200,
		description: "User successfully registered.",
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
	@Post("refresh")
	@ApiTags("auth")
	@ApiOperation({ summary: "Refresh an expired (or almost expired) JWT token" })
	@ApiResponse({
		status: 200,
		description: "JWT token successfully refreshed.",
		type: String,
	})
	@ApiResponse({ status: 403, description: "Forbidden." })
	async refresh(@Body() rb: RefreshBody) {
		if (!rb || rb === null) {
			throw new HttpException(
				"Invalid request. Missing JWT token. AuthControllerRefreshError01",
				HttpStatus.UNAUTHORIZED,
			);
		}
		try {
			console.log("rb");
			console.log(rb);
			console.log(typeof rb);
			const token: string = rb.refreshToken;
			const payload: JWTPayload = await this.authService.refreshJWT(token);
			const newToken: string = await this.authService.generateJWT(payload);
			return { token: newToken };
		} catch (e) {
			console.error(e);
			throw new HttpException(
				"Invalid JWT token. AuthControllerRefreshError02",
				HttpStatus.UNAUTHORIZED,
			);
		}
	}

	//TODO: Add a POST method to logout a user
}
