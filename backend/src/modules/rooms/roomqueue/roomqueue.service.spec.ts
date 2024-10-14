import { TestingModule } from "@nestjs/testing";
import { RoomQueueService } from "./roomqueue.service";
import { createRoomQueueTestingModule } from "../../../../jest_mocking/module-mocking";

describe("RoomQueueService", () => {
	let service: RoomQueueService;

	beforeEach(async () => {
		const module: TestingModule = await createRoomQueueTestingModule();
		service = module.get<RoomQueueService>(RoomQueueService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
