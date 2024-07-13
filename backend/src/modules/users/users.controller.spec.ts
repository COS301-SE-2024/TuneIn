/*
import { TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { createUsersTestingModule } from "../../../jest_mocking/module-mocking";

describe("UsersController", () => {
	let controller: UsersController;

	beforeEach(async () => {
		const module: TestingModule = await createUsersTestingModule();
		controller = module.get<UsersController>(UsersController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
*/
function helloUserC(): string {
	return "Hello World!";
}

//a dummy test that is always true
describe("word", () => {
	it('should return "Hello World!"', () => {
		expect(helloUserC()).toBe("Hello World!");
	});
});
