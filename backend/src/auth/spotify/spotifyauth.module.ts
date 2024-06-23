import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { SpotifyAuthService } from "./spotifyauth.service";
import { ConfigService } from "@nestjs/config";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DbUtilsModule } from "src/modules/db-utils/db-utils.module";
import { SpotifyModule } from "src/spotify/spotify.module";
import { TasksModule } from "src/tasks/tasks.module";

@Module({
	imports: [
		HttpModule,
		PrismaModule,
		DbUtilsModule,
		SpotifyModule,
		TasksModule,
	],
	controllers: [],
	providers: [SpotifyAuthService, ConfigService],
	exports: [SpotifyAuthService],
})
export class SpotifyAuthModule {}
