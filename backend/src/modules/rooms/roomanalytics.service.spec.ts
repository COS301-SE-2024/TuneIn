import { TestingModule } from "@nestjs/testing";
import { RoomAnalyticsService } from "./roomanalytics.service";
import { createRoomsTestingModule } from "../../../jest_mocking/module-mocking";

describe("RoomAnalyticsService", () => {
	let service: RoomAnalyticsService;

	beforeEach(async () => {
		const module: TestingModule = await createRoomsTestingModule();
		service = module.get<RoomAnalyticsService>(RoomAnalyticsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
