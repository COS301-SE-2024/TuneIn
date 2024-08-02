import { TestingModule } from "@nestjs/testing";
import { LiveGateway } from "./live.gateway";
import { createLiveTestingModule } from "../../jest_mocking/module-mocking";

describe("LiveGateway", () => {
	let gateway: LiveGateway;

	beforeEach(async () => {
		const module: TestingModule = await createLiveTestingModule();
		gateway = module.get<LiveGateway>(LiveGateway);
	});

	it("should be defined", () => {
		expect(gateway).toBeDefined();
	});
});
