import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./../prisma/prisma.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./auth/auth.module";
import { RoomsModule } from "./modules/rooms/rooms.module";
import { DtoGenModule } from "./modules/dto-gen/dto-gen.module";
import { DbUtilsModule } from "./modules/db-utils/db-utils.module";
import { LiveModule } from "./live/live.module";
import { S3Module } from "./s3/s3.module";
import { SpotifyModule } from "./spotify/spotify.module";
import { HttpModule } from "@nestjs/axios";
import { TasksModule } from "./tasks/tasks.module";
import { BullConfigModule } from "./bull-config/bull-config.module";
import { BullBoardModule } from "./bull-board/bull-board.module";
import { memoryStorage } from "multer";
import { SearchModule } from "./modules/search/search.module";
import { GenresModule } from "./modules/genres/genres.module";
import { ScheduleModule } from "@nestjs/schedule";
import { SongsModule } from "./modules/songs/songs.module";
import { MurLockModule } from "murlock";
import { MyLogger } from "./logger/logger.service";
import { RecommendationsModule } from "./recommendations/recommendations.module";
import { ImageModule } from './image/image.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		UsersModule,
		AuthModule,
		RoomsModule,
		DtoGenModule,
		DbUtilsModule,
		LiveModule,
		S3Module,
		MulterModule.register({
			dest: "./uploads",
			storage: memoryStorage(),
		}),
		SpotifyModule,
		HttpModule,
		BullBoardModule,
		TasksModule,
		BullConfigModule,
		SearchModule,
		GenresModule,
		ScheduleModule.forRoot(),
		SongsModule,
		MurLockModule.forRoot({
			redisOptions: { url: "redis://localhost:6379" },
			wait: 1000,
			maxAttempts: 10,
			logLevel: "log",
			ignoreUnlockFail: false,
		}),
		RecommendationsModule,
		ImageModule,
	],
	controllers: [AppController],
	providers: [AppService, MyLogger],
})
export class AppModule {}
