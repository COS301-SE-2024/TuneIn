import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule, ConfigService } from "@nestjs/config";
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
import { RedisModule } from "nestjs-redis";
import { RedisLockModule } from "nestjs-simple-redis-lock";
import { MurLockModule } from "murlock";
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
			maxAttempts: 3,
			logLevel: "log",
			ignoreUnlockFail: false,
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
