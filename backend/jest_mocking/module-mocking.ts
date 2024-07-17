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
import { ConnectedUsersService } from "../src/live/connecteduser/connecteduser.service";
import { ConnectedUsersModule } from "../src/live/connecteduser/connecteduser.module";
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
//import { TasksProcessor } from "src/tasks/tasks.processor";
import { TasksService } from "../src/tasks/tasks.service";

const tmpSecret: string | null = mockConfigService.get("JWT_SECRET_KEY");
if (!tmpSecret || tmpSecret === null) {
	throw new Error("Mock JWT_SECRET_KEY is not defined");
}
const JWT_SECRET_KEY: string = tmpSecret;

//AppModule
export async function createAppTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		controllers: [AppController],
		providers: [AppService],
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
			ConfigModule.forRoot(), // Ensure ConfigModule is imported to access environment variables
			PrismaModule,
			SpotifyModule,
			SpotifyAuthModule,
		],
		controllers: [AuthController],
		providers: [
			AuthService,
			{ provide: ConfigService, useValue: mockConfigService },
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
			PrismaModule,
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
		providers: [
			LiveGateway,
			{ provide: ConfigService, useValue: mockConfigService },
			{ provide: PrismaService, useValue: mockPrismaService },
		],
		imports: [ConnectedUsersModule, DbUtilsModule, DtoGenModule, RoomsModule],
	}).compile();
}

//ConnectedUsersModule
export async function createConnectedUsersTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [PrismaModule],
		providers: [
			{ provide: PrismaService, useValue: mockPrismaService },
			DtoGenService,
			DbUtilsService,
			ConnectedUsersService,
		],
	}).compile();
}

//DbUtilsModule
export async function createDbUtilsTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		providers: [
			DbUtilsService,
			{ provide: PrismaService, useValue: mockPrismaService },
		],
	}).compile();
}

//DtoGenModule
export async function createDtoGenTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [PrismaModule],
		providers: [
			{ provide: PrismaService, useValue: mockPrismaService },
			DtoGenService,
		],
	}).compile();
}

//RoomsModule
export async function createRoomsTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		controllers: [RoomsController],
		imports: [PrismaModule],
		providers: [
			RoomsService,
			{ provide: PrismaService, useValue: mockPrismaService },
			{ provide: ConfigService, useValue: mockConfigService },
			DtoGenService,
			DbUtilsService,
			AuthService,
		],
	}).compile();
}

//SearchModule
export async function createSearchTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [PrismaModule, ConfigModule.forRoot({ isGlobal: true })],
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
	}).compile();
}

//UsersModule
export async function createUsersTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [PrismaModule],
		providers: [
			UsersService,
			{ provide: PrismaService, useValue: mockPrismaService },
			DtoGenService,
			DbUtilsService,
			AuthService,
			{ provide: ConfigService, useValue: mockConfigService }, // Provide the mockConfigService
		],
	}).compile();
}

//S3Module
export async function createS3TestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [ConfigModule],
		providers: [
			S3Service,
			{ provide: ConfigService, useValue: mockConfigService },
		],
	}).compile();
}

//SpotifyModule
export async function createSpotifyTestingModule(): Promise<TestingModule> {
	return await Test.createTestingModule({
		imports: [HttpModule, PrismaModule, DbUtilsModule],
		providers: [SpotifyService, ConfigService],
	}).compile();
}

//TasksModule
export async function createTasksTestingModule(): Promise<TestingModule> {
	// Mock of BullQueue_task-queue
	const mockBullQueue = {
		// Mock methods and properties as needed by BullBoardService
	};

	return await Test.createTestingModule({
		imports: [PrismaModule, SpotifyModule, BullBoardModule],
		providers: [
			TasksService,
			{ provide: "BullQueue_task-queue", useValue: mockBullQueue },
		], // Provide the mock here
	}).compile();
}
