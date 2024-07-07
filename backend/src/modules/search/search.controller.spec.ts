import { Test, TestingModule } from "@nestjs/testing";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { PrismaService } from "../../../prisma/prisma.service";
import { AuthService } from "../../auth/auth.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";

import { mockPrismaService, mockConfigService } from "../../../jest-mocking";
import { ConfigService } from "@nestjs/config";

describe("SearchController", () => {
	let controller: SearchController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [PrismaModule],
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

		controller = module.get<SearchController>(SearchController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
