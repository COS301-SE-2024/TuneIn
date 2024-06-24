import { Test, TestingModule } from "@nestjs/testing";
import { DtoGenService } from "./dto-gen.service";

describe("DtoGenService", () => {
	let service: DtoGenService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [DtoGenService],
		}).compile();

		service = module.get<DtoGenService>(DtoGenService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
