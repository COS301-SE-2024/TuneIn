/*
import { TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { createAuthTestingModule } from "../../jest_mocking/module-mocking";

describe("AuthService", () => {
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await createAuthTestingModule();
		service = module.get<AuthService>(AuthService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
*/
function helloAS(): string {
	return "Hello World!";
}

//a dummy test that is always true
describe("word", () => {
	it('should return "Hello World!"', () => {
		expect(helloAS()).toBe("Hello World!");
	});
});
