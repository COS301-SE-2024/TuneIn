import { TestingModule } from "@nestjs/testing";
import { SearchService } from "./search.service";
import { createSearchTestingModule } from "../../../jest_mocking/module-mocking";

describe("SearchService", () => {
	let service: SearchService;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
