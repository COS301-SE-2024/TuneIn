import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
	AdminInitiateAuthCommandInput,
	AttributeType,
	AuthenticationResultType,
	CognitoIdentityProvider,
	ListUsersCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super();
	}

	async validate(
		username: string,
		password: string,
	): Promise<{
		username: string;
		attributes: AttributeType[];
		authenticationResult: AuthenticationResultType;
	}> {
		const user = await this.authService.validateUser(username, password);
		return user;
	}
}
