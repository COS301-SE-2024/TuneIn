import { Test, TestingModule } from "@nestjs/testing";
import { DbUtilsService } from "./db-utils.service";
import { PrismaService } from "./../../../prisma/prisma.service";
import { mockPrismaService } from "../../../jest-mocking";

describe("DbUtilsService", () => {
	let service: DbUtilsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DbUtilsService,
				{ provide: PrismaService, useValue: mockPrismaService },
			],
		}).compile();

		service = module.get<DbUtilsService>(DbUtilsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
