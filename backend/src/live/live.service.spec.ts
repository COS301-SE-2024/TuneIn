import { TestingModule } from "@nestjs/testing";
import { LiveService } from "./live.service";
import { createLiveTestingModule } from "../../jest_mocking/module-mocking";

describe("LiveService", () => {
	let service: LiveService;

	beforeEach(async () => {
		const module: TestingModule = await createLiveTestingModule();
		service = module.get<LiveService>(LiveService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
