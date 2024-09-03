import { Test, TestingModule } from "@nestjs/testing";

import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { memoryStorage } from "multer";

import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "./../prisma/prisma.module";

import {
	mockConfigService,
	mockPrismaService,
	mockUsersService,
} from "./service-mocking";

import { AppController } from "../src/app.controller";
import { AppService } from "../src/app.service";
import { AuthController } from "../src/auth/auth.controller";
import { AuthModule } from "../src/auth/auth.module";
import { AuthService } from "../src/auth/auth.service";
import { SpotifyAuthController } from "../src/auth/spotify/spotifyauth.controller";
import { SpotifyAuthModule } from "../src/auth/spotify/spotifyauth.module";
import { SpotifyAuthService } from "../src/auth/spotify/spotifyauth.service";
import { BullBoardModule } from "../src/bull-board/bull-board.module";
import { BullBoardService } from "../src/bull-board/bull-board.service";
import { BullConfigModule } from "../src/bull-config/bull-config.module";
import { LiveGateway } from "../src/live/live.gateway";
import { LiveModule } from "../src/live/live.module";
import { RoomUsersService } from "../src/live/roomusers/roomuser.service";
import { RoomUsersModule } from "../src/live/roomusers/roomuser.module";
import { DbUtilsModule } from "../src/modules/db-utils/db-utils.module";
import { DbUtilsService } from "../src/modules/db-utils/db-utils.service";
import { DtoGenModule } from "../src/modules/dto-gen/dto-gen.module";
import { DtoGenService } from "../src/modules/dto-gen/dto-gen.service";
import { RoomsController } from "../src/modules/rooms/rooms.controller";
import { RoomsModule } from "../src/modules/rooms/rooms.module";
import { RoomsService } from "../src/modules/rooms/rooms.service";
import { SearchController } from "../src/modules/search/search.controller";
//import { SearchModule } from "../src/modules/search/search.module";
import { SearchService } from "../src/modules/search/search.service";
//import { UsersController } from "../src/modules/users/users.controller";
import { UsersModule } from "../src/modules/users/users.module";
import { UsersService } from "../src/modules/users/users.service";
import { S3Module } from "../src/s3/s3.module";
import { S3Service } from "../src/s3/s3.service";
import { SpotifyModule } from "../src/spotify/spotify.module";
import { SpotifyService } from "../src/spotify/spotify.service";
import { TasksModule } from "../src/tasks/tasks.module";
//import { TasksProcessor } from "../src/tasks/tasks.processor";
import { TasksService } from "../src/tasks/tasks.service";
import { GenresService } from "../src/modules/genres/genres.service";
import { GenresController } from "../src/modules/genres/genres.controller";
import { EventQueueService } from "../src/live/eventqueue/eventqueue.service";
import { LiveService } from "../src/live/live.service";
import { SongsService } from "../src/modules/songs/songs.service";
import { SongsController } from "../src/modules/songs/songs.controller";
import { DmUsersService } from "../src/live/dmusers/dmusers.service";
import { DmUsersModule } from "../src/live/dmusers/dmusers.module";
import { MyLogger } from "../src/logger/logger.service";
import { AutoModerationService } from "../src/live/automod/automod.service";
import { AutoModerationModule } from "../src/live/automod/automod.module";
import { RecommendationsService } from "../src/recommendations/recommendations.service";
import { RecommendationsModule } from "../src/recommendations/recommendations.module";
import { RoomAnalyticsService } from "../src/modules/rooms/roomanalytics.service";

const tmpSecret: string | null = mockConfigService.get("JWT_SECRET_KEY");
if (!tmpSecret || tmpSecret === null) {
	throw new Error("Mock JWT_SECRET_KEY is not defined");
}
const JWT_SECRET_KEY: string = tmpSecret;

//AppModule
export async function createAppTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		controllers: [AppController],
		providers: [
			AppService,
			MyLogger,
			{ provide: PrismaService, useValue: mockPrismaService },
		],
		imports: [
			ConfigModule.forRoot({ isGlobal: true }),
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
		],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)
		.overrideProvider(ConfigService)
		.useValue(mockConfigService)
		.compile();
}

//AuthModule
export async function createAuthTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [
			PassportModule,
			JwtModule.register({
				secret: JWT_SECRET_KEY,
				signOptions: { expiresIn: "2h" },
			}),
			ConfigModule.forRoot(), // Ensure ConfigModule is imported to access environment variables

			SpotifyModule,
			SpotifyAuthModule,
		],
		controllers: [AuthController],
		providers: [
			AuthService,
			{ provide: ConfigService, useValue: mockConfigService },
			{ provide: UsersService, useValue: mockUsersService },
			{ provide: PrismaService, useValue: mockPrismaService },
		],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)
		.overrideProvider(ConfigService)
		.useValue(mockConfigService)
		.compile();
}

//SpotifyAuthModule
export async function createSpotifyAuthTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		controllers: [SpotifyAuthController],

		imports: [
			HttpModule,

			DbUtilsModule,
			SpotifyModule,
			TasksModule,
			AuthModule,
		],
		providers: [
			AuthService,
			SpotifyAuthService,
			{ provide: ConfigService, useValue: mockConfigService }, // Provide the mockConfigService
			{ provide: PrismaService, useValue: mockPrismaService },
		],
		exports: [SpotifyAuthService],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)
		.overrideProvider(ConfigService)
		.useValue(mockConfigService)
		.compile();
}

//BullBoardModule
export async function createBullBoardTestingModule(): Promise<TestingModule> {
	// Mock of BullQueue_task-queue
	const mockBullQueue = {
		// Mock methods and properties as needed by BullBoardService
	};

	return await Test.createTestingModule({
		providers: [
			BullBoardService,
			{ provide: "BullQueue_task-queue", useValue: mockBullQueue }, // Provide the mock here
		],
	}).compile();
}

//LiveModule
export async function createLiveTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		providers: [
			LiveGateway,
			{ provide: ConfigService, useValue: mockConfigService },
			{ provide: PrismaService, useValue: mockPrismaService },
			EventQueueService,
			LiveService,
			{ provide: PrismaService, useValue: mockPrismaService },
		],
		imports: [
			RoomUsersModule,
			DmUsersModule,
			DbUtilsModule,
			DtoGenModule,
			RoomsModule,
			UsersModule,
			AutoModerationModule,
		],
		exports: [RoomUsersModule, DmUsersModule, LiveGateway],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)
		.overrideProvider(ConfigService)
		.useValue(mockConfigService)
		.compile();
}

//RoomUsersModule
export async function createRoomUsersTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [DtoGenModule, DbUtilsModule, AutoModerationModule],
		providers: [
			RoomUsersService,
			{ provide: PrismaService, useValue: mockPrismaService },
		],
		exports: [RoomUsersService],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)

		.compile();
}

//DmUsersModule
export async function createDMUsersTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [DtoGenModule, DbUtilsModule, UsersModule, AutoModerationModule],
		providers: [
			DmUsersService,
			{ provide: PrismaService, useValue: mockPrismaService },
		],
		exports: [DmUsersService],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)

		.compile();
}

//DbUtilsModule
export async function createDbUtilsTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [ConfigModule.forRoot({ isGlobal: true })],
		providers: [
			DbUtilsService,
			{ provide: PrismaService, useValue: mockPrismaService },
		],
		exports: [DbUtilsService],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)

		.compile();
}

//DtoGenModule
export async function createDtoGenTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [DbUtilsModule, ConfigModule.forRoot({ isGlobal: true })],
		providers: [
			{ provide: PrismaService, useValue: mockPrismaService },
			{ provide: ConfigService, useValue: mockConfigService },
			DtoGenService,
		],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)
		.overrideProvider(ConfigService)
		.useValue(mockConfigService)
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)
		.overrideProvider(ConfigService)
		.useValue(mockConfigService)
		.compile();
}

//RoomsModule
export async function createRoomsTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [DtoGenModule, DbUtilsModule, AuthModule, RecommendationsModule],
		controllers: [RoomsController],
		providers: [
			RoomsService,
			RoomAnalyticsService,
			{ provide: PrismaService, useValue: mockPrismaService },
			{ provide: ConfigService, useValue: mockConfigService },
			DtoGenService,
			DbUtilsService,
			AuthService,
		],
		exports: [RoomsService, RoomAnalyticsService],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)
		.overrideProvider(ConfigService)
		.useValue(mockConfigService)
		.compile();
}

//SearchModule
export async function createSearchTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [ConfigModule.forRoot({ isGlobal: true })],
		controllers: [SearchController],
		providers: [
			SearchService,
			{ provide: PrismaService, useValue: mockPrismaService },
			{ provide: ConfigService, useValue: mockConfigService },
			AuthService,
			DtoGenService,
			DbUtilsService,
		],
		exports: [SearchService],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)
		.overrideProvider(ConfigService)
		.useValue(mockConfigService)
		.compile();
}

//UsersModule
export async function createUsersTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [RecommendationsModule],
		providers: [
			UsersService,
			{ provide: PrismaService, useValue: mockPrismaService },
			DtoGenService,
			DbUtilsService,
			AuthService,
			{ provide: ConfigService, useValue: mockConfigService }, // Provide the mockConfigService
		],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)
		.overrideProvider(ConfigService)
		.useValue(mockConfigService)
		.compile();
}

//S3Module
export async function createS3TestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [ConfigModule],
		providers: [
			S3Service,
			{ provide: ConfigService, useValue: mockConfigService },
		],
	})
		.overrideProvider(ConfigService)
		.useValue(mockConfigService)
		.compile();
}

//SpotifyModule
export async function createSpotifyTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [HttpModule, DbUtilsModule],
		providers: [
			SpotifyService,
			{ provide: ConfigService, useValue: mockConfigService },
			{ provide: PrismaService, useValue: mockPrismaService },
		],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)
		.overrideProvider(ConfigService)
		.useValue(mockConfigService)
		.compile();
}

//TasksModule
export async function createTasksTestingModule(): Promise<TestingModule> {
	// Mock of BullQueue_task-queue
	const mockBullQueue = {
		// Mock methods and properties as needed by BullBoardService
	};

	return await Test.createTestingModule({
		imports: [SpotifyModule, BullBoardModule],
		providers: [
			TasksService,
			{ provide: "BullQueue_task-queue", useValue: mockBullQueue },
			{ provide: PrismaService, useValue: mockPrismaService },
		], // Provide the mock here
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)

		.compile();
}

//GenresModule
export async function createGenresTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [PrismaModule],
		providers: [
			GenresService,
			{ provide: PrismaService, useValue: mockPrismaService },
		],
		controllers: [GenresController],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)

		.compile();
}

//SongsModule
export async function createSongsTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [AuthModule],
		providers: [
			SongsService,
			{ provide: PrismaService, useValue: mockPrismaService },
		],
		controllers: [SongsController],
		exports: [SongsService],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)

		.compile();
}

//AutoModerationModule
export async function createAutoModerationTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		providers: [AutoModerationService],
		exports: [AutoModerationService],
	}).compile();
}

//RecommendationsModule
export async function createRecommendationsTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [PrismaModule],
		providers: [
			RecommendationsService,
			{ provide: PrismaService, useValue: mockPrismaService },
		],
		exports: [RecommendationsService],
	})
		.overrideProvider(PrismaService)
		.useValue(mockPrismaService)

		.compile();
}
