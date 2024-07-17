import { HttpModule } from "@nestjs/axios";
import { Module, forwardRef } from "@nestjs/common";
import { SpotifyAuthService } from "./spotifyauth.service";
import { ConfigService } from "@nestjs/config";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DbUtilsModule } from "../../modules/db-utils/db-utils.module";
import { SpotifyModule } from "../../spotify/spotify.module";
import { TasksModule } from "../../tasks/tasks.module";
import { AuthService } from "../auth.service";
import { AuthModule } from "../auth.module";

@Module({
	imports: [
		HttpModule,
		PrismaModule,
		DbUtilsModule,
		SpotifyModule,
		TasksModule,
		forwardRef(() => AuthModule),
	],
	controllers: [],
	providers: [SpotifyAuthService, ConfigService, AuthService],
	exports: [SpotifyAuthService],
})
export class SpotifyAuthModule {}
