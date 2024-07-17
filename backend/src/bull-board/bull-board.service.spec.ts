import { TestingModule } from "@nestjs/testing";
import { BullBoardService } from "./bull-board.service";
import { createBullBoardTestingModule } from "../../jest_mocking/module-mocking";

describe("BullBoardService", () => {
	let service: BullBoardService;

	beforeEach(async () => {
		const module: TestingModule = await createBullBoardTestingModule();
		service = module.get<BullBoardService>(BullBoardService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
