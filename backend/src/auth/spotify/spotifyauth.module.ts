import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { SpotifyAuthService } from "./spotifyauth.service";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DbUtilsModule } from "../../modules/db-utils/db-utils.module";
import { SpotifyModule } from "../../spotify/spotify.module";
import { TasksModule } from "../../tasks/tasks.module";
@Module({
	imports: [
		HttpModule,
		PrismaModule,
		DbUtilsModule,
		SpotifyModule,
		TasksModule,
		ConfigModule.forRoot(), // Ensure ConfigModule is imported to access environment variables
	],
	controllers: [],
	providers: [SpotifyAuthService],
	exports: [SpotifyAuthService],
})
export class SpotifyAuthModule {}
