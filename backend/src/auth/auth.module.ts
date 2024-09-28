import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { LocalStrategy } from "./local.strategy";
import { JwtStrategy } from "./jwt.strategy";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../../prisma/prisma.module";
import { SpotifyAuthController } from "./spotify/spotifyauth.controller";
import { SpotifyAuthModule } from "./spotify/spotifyauth.module";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY || JWT_SECRET_KEY === undefined) {
	throw new Error("Missing JWT_SECRET_KEY in environment variables");
}

@Module({
	imports: [
		PassportModule,
		JwtModule.register({
			secret: JWT_SECRET_KEY,
			signOptions: { expiresIn: "2h" },
		}),
		ConfigModule.forRoot(), // Ensure ConfigModule is imported to access environment variables
		PrismaModule,
		SpotifyAuthModule,
	],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	controllers: [AuthController, SpotifyAuthController],
	exports: [AuthService],
})
export class AuthModule {}
