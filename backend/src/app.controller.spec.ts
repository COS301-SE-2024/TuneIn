import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./../prisma/prisma.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./auth/auth.module";
import { RoomsModule } from "./modules/rooms/rooms.module";
import { DtoGenModule } from "./modules/dto-gen/dto-gen.module";
import { DbUtilsModule } from "./modules/db-utils/db-utils.module";
import { ChatModule } from "./chat/chat.module";
import { S3Module } from "./s3/s3.module";
import { SpotifyModule } from "./spotify/spotify.module";
import { HttpModule } from "@nestjs/axios";
import { TasksModule } from "./tasks/tasks.module";
import { BullConfigModule } from "./bull-config/bull-config.module";
import { BullBoardModule } from "./bull-board/bull-board.module";
import { memoryStorage } from "multer";

describe("AppController", () => {
	let appController: AppController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
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
				ChatModule,
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

		appController = app.get<AppController>(AppController);
	});

	describe("root", () => {
		it('should return "Hello World!"', () => {
			expect(appController.getHello()).toBe("Hello World!");
		});
	});
});
