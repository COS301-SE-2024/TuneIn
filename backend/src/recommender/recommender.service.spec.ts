import { Test, TestingModule } from "@nestjs/testing";
import { RecommenderService } from "./recommender.service";

describe("RecommenderService", () => {
	let service: RecommenderService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RecommenderService],
		}).compile();

		service = module.get<RecommenderService>(RecommenderService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
