import { TestingModule } from "@nestjs/testing";
import { GenresController } from "./genres.controller";
import { createGenresTestingModule } from "../../../jest_mocking/module-mocking";

describe("GenresController", () => {
	let controller: GenresController;

	beforeEach(async () => {
		const module: TestingModule = await createGenresTestingModule();
		controller = module.get<GenresController>(GenresController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
