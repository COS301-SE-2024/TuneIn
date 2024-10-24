import { Module } from "@nestjs/common";
import { RoomQueueService } from "./roomqueue.service";
import { PrismaModule } from "../../../../prisma/prisma.module";
import { DtoGenModule } from "../../dto-gen/dto-gen.module";
import { DbUtilsModule } from "../../db-utils/db-utils.module";
import { SpotifyModule } from "../../../spotify/spotify.module";
import { SpotifyAuthModule } from "../../../auth/spotify/spotifyauth.module";
import { MurLockModule } from "murlock";
import { TasksModule } from "../../../tasks/tasks.module";

@Module({
	imports: [
		PrismaModule,
		DtoGenModule,
		DbUtilsModule,
		SpotifyModule,
		SpotifyAuthModule,
		MurLockModule,
		TasksModule,
	],
	providers: [RoomQueueService],
	exports: [RoomQueueService],
})
export class RoomQueueModule {}
