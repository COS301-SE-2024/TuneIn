import { TestingModule } from "@nestjs/testing";
import { DmUsersService } from "./dmusers.service";
import { createDMUsersTestingModule } from "../../../jest_mocking/module-mocking";

describe("DmUsersService", () => {
	let service: DmUsersService;

	beforeEach(async () => {
		const module: TestingModule = await createDMUsersTestingModule();
		service = module.get<DmUsersService>(DmUsersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
