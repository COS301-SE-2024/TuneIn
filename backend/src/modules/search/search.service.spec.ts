import { Test, TestingModule } from "@nestjs/testing";
import { SearchService } from "./search.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { mockPrismaService, mockConfigService } from "../../../jest-mocking";
import { SearchController } from "./search.controller";
import { PrismaService } from "prisma/prisma.service";
import { AuthService } from "src/auth/auth.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";

/*
@Module({
	imports: [PrismaModule, ConfigModule.forRoot({ isGlobal: true })],
	controllers: [SearchController],
	providers: [
		SearchService,
		PrismaService,
		ConfigService,
		AuthService,
		DtoGenService,
		DbUtilsService,
	],
	exports: [SearchService],
})
*/

describe("SearchService", () => {
	let service: SearchService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
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

		service = module.get<SearchService>(SearchService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
