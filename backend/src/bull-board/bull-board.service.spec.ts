import { Test, TestingModule } from "@nestjs/testing";
import { BullBoardService } from "./bull-board.service";

describe("BullBoardService", () => {
	let service: BullBoardService;

	beforeEach(async () => {
		// Mock of BullQueue_task-queue
		const mockBullQueue = {
			// Mock methods and properties as needed by BullBoardService
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BullBoardService,
				{ provide: "BullQueue_task-queue", useValue: mockBullQueue }, // Provide the mock here
			],
		}).compile();

		service = module.get<BullBoardService>(BullBoardService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
