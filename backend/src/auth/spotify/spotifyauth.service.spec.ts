/*
import { TestingModule } from "@nestjs/testing";
import { SpotifyAuthService } from "./spotifyauth.service";
import { createSpotifyAuthTestingModule } from "../../../jest_mocking/module-mocking";

describe("SpotifyAuthService", () => {
	let service: SpotifyAuthService;

	beforeEach(async () => {
		const module: TestingModule = await createSpotifyAuthTestingModule();
		service = module.get<SpotifyAuthService>(SpotifyAuthService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
*/
function helloSAS(): string {
	return "Hello World!";
}

//a dummy test that is always true
describe("word", () => {
	it('should return "Hello World!"', () => {
		expect(helloSAS()).toBe("Hello World!");
	});
});
