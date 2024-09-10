import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
	AttributeType,
	AuthenticationResultType,
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
