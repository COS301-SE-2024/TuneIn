import { TestingModule } from "@nestjs/testing";
import { RoomsService } from "./rooms.service"; // Adjust import based on file structure
import { createRoomsTestingModule } from "../../../jest_mocking/module-mocking";

describe("RoomsService", () => {
	let service: RoomsService;

	beforeEach(async () => {
		const module: TestingModule = await createRoomsTestingModule();
		service = module.get<RoomsService>(RoomsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
