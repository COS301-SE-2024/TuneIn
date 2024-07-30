import { TestingModule } from "@nestjs/testing";
import { SongsController } from "./songs.controller";
import { createSongsTestingModule } from "../../../jest_mocking/module-mocking";

describe("SongsController", () => {
	let controller: SongsController;

	beforeEach(async () => {
		const module: TestingModule = await createSongsTestingModule();
		controller = module.get<SongsController>(SongsController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
