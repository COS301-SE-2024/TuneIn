import { TestingModule } from "@nestjs/testing";
import { MyLogger } from "./logger.service";
import { createAppTestingModule } from "jest_mocking/module-mocking";

describe("LoggerService", () => {
	let service: MyLogger;

	beforeEach(async () => {
		const module: TestingModule = await createAppTestingModule();
		service = module.get<MyLogger>(MyLogger);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
