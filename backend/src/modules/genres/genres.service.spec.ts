import { TestingModule } from "@nestjs/testing";
import { GenresService } from "./genres.service";
import { createGenresTestingModule } from "../../../jest_mocking/module-mocking"

describe("GenresService", () => {
	let service: GenresService;

	beforeEach(async () => {
		const module: TestingModule = await createGenresTestingModule();
		service = module.get<GenresService>(GenresService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
