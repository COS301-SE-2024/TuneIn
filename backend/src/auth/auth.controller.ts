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

@Controller("auth")
@ApiTags("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	@ApiOperation({
		summary: "Authenticate a user using a Cognito JWT token",
		description:
			"This method will authenticate a user using a Cognito JWT token. The token is decoded and verified, and a new JWT token is generated and returned. See https://jwt.io/ for more information on JWT tokens.",
		operationId: "login",
	})
	@ApiBody({
		type: LoginBody,
		required: true,
		description: "Cognito JWT token",
		examples: {
			token: {
				value: "(see https://jwt.io/)",
			},
		},
	})
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

		const { username, email } = await this.authService.getUsernameAndEmail(
			userID,
		);

		const payload: JWTPayload = {
			id: authInfo.username,
			username: username,
			email: email,
		};

		console.log("payload", payload);
		//generate JWT token using payload
		const token: string = await this.authService.generateJWT(payload);
		console.log("token", token);

		//return the JWT as a string
		return { token: token };
	}

	@Post("register")
	@ApiOperation({
		summary: "Register a new user in the API using Cognito",
		description:
			"This method will register a new user in the API using Cognito. The user's Cognito username, email, and Cognito sub ID are required. The user will be created in the our database and will be able to authenticate using the Cognito JWT token.",
		operationId: "register",
	})
	@ApiBody({ type: RegisterBody, required: true, description: "User info" })
	@ApiBody({
		type: RegisterBody,
		required: true,
		description: "User's Cognito information",
		examples: {
			register: {
				value: {
					username: "cognito-username",
					email: "john@example.com",
					userCognitoSub: "cognito-sub-id",
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: "User successfully registered.",
		type: RegisterBody,
	})
	@ApiResponse({ status: 400, description: "Bad request." })
	async register(@Body() registerInfo: RegisterBody) {
		const successful: boolean = await this.authService.createUser(
			registerInfo.username,
			registerInfo.email,
			registerInfo.userCognitoSub,
		);

		if (!successful) {
			throw new HttpException(
				"Invalid credentials. Could not create user. AuthRegisterError01",
				HttpStatus.BAD_REQUEST,
			);
		}

		throw new HttpException("Successfully created user.", HttpStatus.CREATED);
	}

	@Post("refresh")
	@ApiOperation({
		summary: "Refresh an expired (or almost expired) JWT token",
		description:
			"This method will refresh an expired (or almost expired) JWT token. The expired token is sent in the request body, and a new JWT token is generated and returned. The new token will have a new expiration date.",
		operationId: "refresh",
	})
	@ApiBody({
		type: RefreshBody,
		required: true,
		description: "The expired JWT token",
		examples: {
			register: {
				value: {
					username: "cognito-username",
					email: "john@example.com",
					userCognitoSub: "cognito-sub-id",
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: "JWT token successfully refreshed.",
		type: String,
	})
	@ApiResponse({ status: 400, description: "Bad request." })
	@ApiResponse({ status: 401, description: "Unauthorized." })
	async refresh(@Body() rb: RefreshBody) {
		if (!rb || rb === null) {
			throw new HttpException(
				"Invalid request. Missing JWT token. AuthControllerRefreshError01",
				HttpStatus.BAD_REQUEST,
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
