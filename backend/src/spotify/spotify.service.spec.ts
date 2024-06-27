import { Test, TestingModule } from "@nestjs/testing";
import { SpotifyService } from "./spotify.service";
import { ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { PrismaModule } from "./../../prisma/prisma.module";
import { DbUtilsModule } from "../modules/db-utils/db-utils.module";

describe("SpotifyService", () => {
	let service: SpotifyService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [HttpModule, PrismaModule, DbUtilsModule],
			providers: [SpotifyService, ConfigService],
		}).compile();

		service = module.get<SpotifyService>(SpotifyService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
