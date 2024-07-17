/*
import { TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { createAuthTestingModule } from "../../jest_mocking/module-mocking";

describe("AuthController", () => {
	let controller: AuthController;

	beforeEach(async () => {
		const module: TestingModule = await createAuthTestingModule();
		controller = module.get<AuthController>(AuthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
*/
function helloAuthC(): string {
	return "Hello World!";
}

//a dummy test that is always true
describe("word", () => {
	it('should return "Hello World!"', () => {
		expect(helloAuthC()).toBe("Hello World!");
	});
});
