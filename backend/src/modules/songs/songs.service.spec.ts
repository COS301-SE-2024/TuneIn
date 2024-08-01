import { TestingModule } from "@nestjs/testing";
import { SongsService } from "./songs.service";
import { createSongsTestingModule } from "../../../jest_mocking/module-mocking";

describe("SongsService", () => {
	let service: SongsService;

	beforeEach(async () => {
		const module: TestingModule = await createSongsTestingModule();
		service = module.get<SongsService>(SongsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
