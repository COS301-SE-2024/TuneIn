import { TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { createUsersTestingModule } from "../../../jest_mocking/module-mocking";

describe("UsersService", () => {
	let service: UsersService;

	beforeEach(async () => {
		const module: TestingModule = await createUsersTestingModule();
		service = module.get<UsersService>(UsersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
