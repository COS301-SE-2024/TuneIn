import { Module } from "@nestjs/common";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenModule } from "../dto-gen/dto-gen.module";
import { DbUtilsModule } from "../db-utils/db-utils.module";
import { AuthModule } from "../../auth/auth.module";
import { RoomQueueModule } from "./roomqueue/roomqueue.module";
import { RoomAnalyticsService } from "./roomanalytics.service";
import { RecommendationsModule } from "../../recommendations/recommendations.module";
import { SpotifyModule } from "../../spotify/spotify.module";
import { DmUsersModule } from "../../live/dmusers/dmusers.module";

@Module({
	imports: [
		PrismaModule,
		DtoGenModule,
		DbUtilsModule,
		AuthModule,
		RoomQueueModule,
		RecommendationsModule,
		SpotifyModule,
		DmUsersModule,
	],
	controllers: [RoomsController],
	providers: [RoomsService, RoomAnalyticsService],
	exports: [RoomsService, RoomAnalyticsService],
})
export class RoomsModule {}
