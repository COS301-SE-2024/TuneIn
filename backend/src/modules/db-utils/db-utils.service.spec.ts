import { Test, TestingModule } from "@nestjs/testing";
import { DbUtilsService } from "./db-utils.service";

describe("DbUtilsService", () => {
	let service: DbUtilsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [DbUtilsService],
		}).compile();

		service = module.get<DbUtilsService>(DbUtilsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
