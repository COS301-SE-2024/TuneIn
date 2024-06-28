import { Test, TestingModule } from "@nestjs/testing";
import { DtoGenService } from "./dto-gen.service";

import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DbUtilsService } from "../db-utils/db-utils.service";

import { mockPrismaService } from "../../../jest-mocking";

describe("DtoGenService", () => {
	let service: DtoGenService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [PrismaModule],
			providers: [
				{ provide: PrismaService, useValue: mockPrismaService },
				DtoGenService,
				DbUtilsService,
			],
			exports: [DtoGenService],
		}).compile();

		service = module.get<DtoGenService>(DtoGenService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
