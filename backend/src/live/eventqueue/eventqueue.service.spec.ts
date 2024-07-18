import { TestingModule } from "@nestjs/testing";
import { EventQueueService } from "./eventqueue.service";
import { createLiveTestingModule } from "jest_mocking/module-mocking";

describe("EventQueueService", () => {
	let service: EventQueueService;

	beforeEach(async () => {
		const module: TestingModule = await createLiveTestingModule();
		service = module.get<EventQueueService>(EventQueueService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
