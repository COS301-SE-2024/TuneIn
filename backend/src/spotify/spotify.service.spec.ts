import { TestingModule } from "@nestjs/testing";
import { SpotifyService } from "./spotify.service";
import { createSpotifyTestingModule } from "../../jest_mocking/module-mocking";

describe("SpotifyService", () => {
	let service: SpotifyService;

	beforeEach(async () => {
		const module: TestingModule = await createSpotifyTestingModule();
		service = module.get<SpotifyService>(SpotifyService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
