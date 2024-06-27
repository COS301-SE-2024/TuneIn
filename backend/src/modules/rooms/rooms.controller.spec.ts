import { Test, TestingModule } from "@nestjs/testing";
import { RoomsController } from "./rooms.controller";
import { PrismaService } from "./../../../prisma/prisma.service";

describe("RoomsController", () => {
	let controller: RoomsController;

	beforeEach(async () => {
		const mockPrismaService = {
			// mock properties and methods as needed
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [RoomsController],
			providers: [{ provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		controller = module.get<RoomsController>(RoomsController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
