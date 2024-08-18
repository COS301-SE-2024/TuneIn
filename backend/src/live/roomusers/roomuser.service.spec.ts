import { TestingModule } from "@nestjs/testing";
import { RoomUsersService } from "./roomuser.service";
import { createRoomUsersTestingModule } from "../../../jest_mocking/module-mocking";

describe("RoomUsersService", () => {
	let service: RoomUsersService;

	beforeEach(async () => {
		const module: TestingModule = await createRoomUsersTestingModule();
		service = module.get<RoomUsersService>(RoomUsersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
