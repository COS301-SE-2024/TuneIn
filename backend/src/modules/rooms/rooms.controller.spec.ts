import { TestingModule } from "@nestjs/testing";
import { RoomsController } from "./rooms.controller";
import { createRoomsTestingModule } from "../../../jest_mocking/module-mocking";

describe("RoomsController", () => {
	let controller: RoomsController;

	beforeEach(async () => {
		const module: TestingModule = await createRoomsTestingModule();
		controller = module.get<RoomsController>(RoomsController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
