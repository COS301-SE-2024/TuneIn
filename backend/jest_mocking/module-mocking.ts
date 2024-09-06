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
import { Module } from "@nestjs/common";

const tmpSecret: string | null = mockConfigService.get("JWT_SECRET_KEY");
if (!tmpSecret || tmpSecret === null) {
	throw new Error("Mock JWT_SECRET_KEY is not defined");
}
const JWT_SECRET_KEY: string = tmpSecret;

@Module({
	providers: [
		{
			provide: ConfigService,
			useValue: mockConfigService,
		},
	],
	exports: [ConfigService],
})
class MockConfigModule {}

@Module({
	providers: [
		{
			provide: PrismaService,
			useValue: mockPrismaService,
		},
	],
	exports: [PrismaService],
})
class MockPrismaModule {}

//AppModule
export async function createAppTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		controllers: [AppController],
		providers: [AppService, MyLogger],
		imports: [
			MockConfigModule,
			MockPrismaModule,
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
	}).compile();
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
			MockConfigModule,
			MockPrismaModule,
			SpotifyModule,
			SpotifyAuthModule,
		],
		controllers: [AuthController],
		providers: [
			AuthService,
			{ provide: UsersService, useValue: mockUsersService },
		],
	}).compile();
}

//SpotifyAuthModule
export async function createSpotifyAuthTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		controllers: [SpotifyAuthController],

		imports: [
			HttpModule,
			MockConfigModule,
			MockPrismaModule,
			DbUtilsModule,
			SpotifyModule,
			TasksModule,
			AuthModule,
		],
		providers: [AuthService, SpotifyAuthService],
		exports: [SpotifyAuthService],
	}).compile();
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
		providers: [LiveGateway, EventQueueService, LiveService],
		imports: [
			RoomUsersModule,
			DmUsersModule,
			DbUtilsModule,
			DtoGenModule,
			RoomsModule,
			UsersModule,
			AutoModerationModule,
			MockConfigModule,
			MockPrismaModule,
		],
		exports: [RoomUsersModule, DmUsersModule, LiveGateway],
	}).compile();
}

//RoomUsersModule
export async function createRoomUsersTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [
			DtoGenModule,
			DbUtilsModule,
			AutoModerationModule,
			MockPrismaModule,
		],
		providers: [RoomUsersService],
		exports: [RoomUsersService],
	}).compile();
}

//DmUsersModule
export async function createDMUsersTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [
			DtoGenModule,
			DbUtilsModule,
			UsersModule,
			AutoModerationModule,
			MockPrismaModule,
		],
		providers: [DmUsersService],
		exports: [DmUsersService],
	}).compile();
}

//DbUtilsModule
export async function createDbUtilsTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [MockConfigModule, MockPrismaModule],
		providers: [DbUtilsService],
		exports: [DbUtilsService],
	}).compile();
}

//DtoGenModule
export async function createDtoGenTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [DbUtilsModule, MockConfigModule, MockPrismaModule],
		providers: [DtoGenService],
	}).compile();
}

//RoomsModule
export async function createRoomsTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [
			MockPrismaModule,
			DtoGenModule,
			DbUtilsModule,
			AuthModule,
			RecommendationsModule,
			MockConfigModule,
		],
		controllers: [RoomsController],
		providers: [RoomsService, RoomAnalyticsService],
		exports: [RoomsService, RoomAnalyticsService],
	}).compile();
}

//SearchModule
export async function createSearchTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [MockConfigModule, MockPrismaModule],
		controllers: [SearchController],
		providers: [SearchService, AuthService, DtoGenService, DbUtilsService],
		exports: [SearchService],
	}).compile();
}

//UsersModule
export async function createUsersTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [RecommendationsModule, MockConfigModule, MockPrismaModule],
		providers: [UsersService, DtoGenService, DbUtilsService, AuthService],
	}).compile();
}

export async function createUsersUpdateTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [PrismaModule],
		providers: [
			UsersService,
			PrismaService,
			DtoGenService,
			DbUtilsService,
			AuthService,
			RecommendationsService,
			{ provide: ConfigService, useValue: mockConfigService }, // Provide the mockConfigService
		],
	}).compile();
}

//S3Module
export async function createS3TestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [MockConfigModule, MockPrismaModule],
		providers: [S3Service],
	}).compile();
}

//SpotifyModule
export async function createSpotifyTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [HttpModule, DbUtilsModule, MockConfigModule, MockPrismaModule],
		providers: [SpotifyService],
	}).compile();
}

//TasksModule
export async function createTasksTestingModule(): Promise<TestingModule> {
	// Mock of BullQueue_task-queue
	const mockBullQueue = {
		// Mock methods and properties as needed by BullBoardService
	};

	return await Test.createTestingModule({
		imports: [SpotifyModule, BullBoardModule, MockPrismaModule],
		providers: [
			TasksService,
			{ provide: "BullQueue_task-queue", useValue: mockBullQueue },
		], // Provide the mock here
	}).compile();
}

//GenresModule
export async function createGenresTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [MockPrismaModule],
		providers: [GenresService],
		controllers: [GenresController],
	}).compile();
}

//SongsModule
export async function createSongsTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [AuthModule, MockPrismaModule],
		providers: [SongsService],
		controllers: [SongsController],
		exports: [SongsService],
	}).compile();
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
		imports: [MockPrismaModule],
		providers: [RecommendationsService],
		exports: [RecommendationsService],
	}).compile();
}
