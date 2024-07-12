import { Test, TestingModule } from "@nestjs/testing";
import { SpotifyAuthService } from "./spotifyauth.service";

import { HttpModule } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { PrismaModule } from "../../../prisma/prisma.module";
import { PrismaService } from "../../../prisma/prisma.service";
import { DbUtilsModule } from "../../modules/db-utils/db-utils.module";
import { SpotifyModule } from "../../spotify/spotify.module";
import { TasksModule } from "../../tasks/tasks.module";
import { mockConfigService, mockPrismaService } from "../../../jest-mocking";
import { AuthService } from "../auth.service";
import { AuthModule } from "../auth.module";

describe("SpotifyAuthService", () => {
	let service: SpotifyAuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
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

		service = module.get<SpotifyAuthService>(SpotifyAuthService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
