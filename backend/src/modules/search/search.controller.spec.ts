import { TestingModule } from "@nestjs/testing";
import { SearchController } from "./search.controller";
import { createSearchTestingModule } from "../../../jest_mocking/module-mocking";

describe("SearchController", () => {
	let controller: SearchController;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		controller = module.get<SearchController>(SearchController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
