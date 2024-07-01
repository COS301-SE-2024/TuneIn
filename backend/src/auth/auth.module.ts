import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { LocalStrategy } from "./local.strategy";
import { JwtStrategy } from "./jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { UsersService } from "../modules/users/users.service";
import { DbUtilsService } from "../modules/db-utils/db-utils.service";
import { DtoGenService } from "../modules/dto-gen/dto-gen.service";
import { SpotifyAuthController } from "./spotify/spotifyauth.controller";
import { SpotifyAuthModule } from "./spotify/spotifyauth.module";
import { SpotifyModule } from "../spotify/spotify.module";

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
		SpotifyModule,
		SpotifyAuthModule,
	],
	providers: [
		AuthService,
		LocalStrategy,
		JwtStrategy,
		PrismaService,
		DtoGenService,
		DbUtilsService,
		UsersService,
		ConfigService,
	],
	controllers: [AuthController, SpotifyAuthController],
	exports: [AuthService],
})
export class AuthModule {}
