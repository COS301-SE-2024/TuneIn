import { Test, TestingModule } from "@nestjs/testing";
import { TasksService } from "./tasks.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { SpotifyModule } from "../spotify/spotify.module";
import { BullBoardModule } from "../bull-board/bull-board.module";

describe("TasksService", () => {
	let service: TasksService;

	beforeEach(async () => {
		// Mock of BullQueue_task-queue
		const mockBullQueue = {
			// Mock methods and properties as needed by BullBoardService
		};

		const module: TestingModule = await Test.createTestingModule({
			imports: [PrismaModule, SpotifyModule, BullBoardModule],
			providers: [
				TasksService,
				{ provide: "BullQueue_task-queue", useValue: mockBullQueue },
			], // Provide the mock here
		}).compile();

		service = module.get<TasksService>(TasksService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
