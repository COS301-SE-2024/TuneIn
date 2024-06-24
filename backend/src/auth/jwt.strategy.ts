import { Strategy, ExtractJwt } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService, JWTPayload } from "./auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		const jwtSecret = process.env.JWT_SECRET_KEY;
		if (!jwtSecret || jwtSecret === "") {
			throw new Error("Missing JWT_SECRET_KEY");
		}

		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtSecret,
		});
	}

	async validate(payload: any) {
		const result: JWTPayload = {
			id: payload.id,
			email: payload.email,
			username: payload.username,
		};
		return result;
	}
}
