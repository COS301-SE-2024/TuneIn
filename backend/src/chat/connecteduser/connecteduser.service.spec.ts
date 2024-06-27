import { Test, TestingModule } from "@nestjs/testing";
import { ConnectedUsersService } from "./connecteduser.service";

describe("ConnectedUsersService", () => {
	let service: ConnectedUsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ConnectedUsersService],
		}).compile();

		service = module.get<ConnectedUsersService>(ConnectedUsersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
