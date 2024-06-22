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
import { UsersService } from "src/modules/users/users.service";
import { DbUtilsService } from "src/modules/db-utils/db-utils.service";
import { DtoGenService } from "src/modules/dto-gen/dto-gen.service";
import { SpotifyAuthService } from "./spotify/spotifyauth.service";
import { SpotifyAuthController } from "./spotify/spotifyauth.controller";
import { SpotifyAuthModule } from "./spotify/spotifyauth.module";
import { HttpModule } from "@nestjs/axios";
import { DbUtilsModule } from "src/modules/db-utils/db-utils.module";
import { SpotifyModule } from "src/spotify/spotify.module";

@Module({
	imports: [
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || "your_jwt_secret",
			signOptions: { expiresIn: "2h" },
		}),
		ConfigModule.forRoot(), // Ensure ConfigModule is imported to access environment variables
		PrismaModule,
		SpotifyAuthModule,
		HttpModule,
		DbUtilsModule,
		SpotifyModule,
	],
	providers: [
		AuthService,
		LocalStrategy,
		JwtStrategy,
		PrismaService,
		DtoGenService,
		DbUtilsService,
		UsersService,
		SpotifyAuthService,
		ConfigService,
	],
	controllers: [AuthController, SpotifyAuthController],
	exports: [AuthService, SpotifyAuthService],
})
export class AuthModule {}
