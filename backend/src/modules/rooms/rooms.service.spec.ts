import { Test, TestingModule } from "@nestjs/testing";
import { RoomsService } from "./rooms.service";
import { PrismaService } from "./../../../prisma/prisma.service";

describe("RoomsService", () => {
	let service: RoomsService;

	beforeEach(async () => {
		const mockPrismaService = {
			// mock properties and methods as needed
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RoomsService,
				{ provide: PrismaService, useValue: mockPrismaService },
			],
		}).compile();

		service = module.get<RoomsService>(RoomsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
