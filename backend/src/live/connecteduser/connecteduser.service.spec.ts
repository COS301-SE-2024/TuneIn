import { TestingModule } from "@nestjs/testing";
import { ConnectedUsersService } from "./connecteduser.service";
import { createConnectedUsersTestingModule } from "../../../jest_mocking/module-mocking";

describe("ConnectedUsersService", () => {
	let service: ConnectedUsersService;

	beforeEach(async () => {
		const module: TestingModule = await createConnectedUsersTestingModule();
		service = module.get<ConnectedUsersService>(ConnectedUsersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
