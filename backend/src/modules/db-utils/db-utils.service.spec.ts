import { TestingModule } from "@nestjs/testing";
import { DbUtilsService } from "./db-utils.service";
import { createDbUtilsTestingModule } from "../../../jest_mocking/module-mocking";

describe("DbUtilsService", () => {
	let service: DbUtilsService;

	beforeEach(async () => {
		const module: TestingModule = await createDbUtilsTestingModule();
		service = module.get<DbUtilsService>(DbUtilsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
