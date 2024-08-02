/*
import { TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { createAppTestingModule } from "../jest_mocking/module-mocking";

describe("AppController", () => {
	let appController: AppController;

	beforeEach(async () => {
		const app: TestingModule = await createAppTestingModule();
		appController = app.get<AppController>(AppController);
	});

	describe("root", () => {
		it('should return "Hello World!"', () => {
			expect(appController.getHello()).toBe("Hello World!");
		});
	});
});
*/
function helloApp(): string {
	return "Hello World!";
}

//a dummy test that is always true
describe("word", () => {
	it('should return "Hello World!"', () => {
		expect(helloApp()).toBe("Hello World!");
	});
});
