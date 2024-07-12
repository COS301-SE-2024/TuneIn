import { Test, TestingModule } from "@nestjs/testing";
import { SpotifyAuthController } from "./spotifyauth.controller";

import { HttpModule } from "@nestjs/axios";
import { SpotifyAuthService } from "./spotifyauth.service";
import { ConfigService } from "@nestjs/config";
import { PrismaModule } from "../../../prisma/prisma.module";
import { PrismaService } from "../../../prisma/prisma.service";
import { DbUtilsModule } from "../../modules/db-utils/db-utils.module";
import { SpotifyModule } from "../../spotify/spotify.module";
import { TasksModule } from "../../tasks/tasks.module";
import { mockConfigService, mockPrismaService } from "../../../jest-mocking";
import { AuthService } from "../auth.service";
import { AuthModule } from "../auth.module";

describe("SpotifyAuthController", () => {
	let controller: SpotifyAuthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
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

		controller = module.get<SpotifyAuthController>(SpotifyAuthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
