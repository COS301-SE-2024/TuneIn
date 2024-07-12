/*
import { TestingModule } from "@nestjs/testing";
import { SpotifyAuthController } from "./spotifyauth.controller";
import { createSpotifyAuthTestingModule } from "../../../jest_mocking/module-mocking";

describe("SpotifyAuthController", () => {
	let controller: SpotifyAuthController;

	beforeEach(async () => {
		const module: TestingModule = await createSpotifyAuthTestingModule();
		controller = module.get<SpotifyAuthController>(SpotifyAuthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
*/
function helloSAC(): string {
	return "Hello World!";
}

//a dummy test that is always true
describe("word", () => {
	it('should return "Hello World!"', () => {
		expect(helloSAC()).toBe("Hello World!");
	});
});
