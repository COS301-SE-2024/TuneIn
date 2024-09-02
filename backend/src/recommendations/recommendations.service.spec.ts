import { TestingModule } from "@nestjs/testing";
import { RecommendationsService } from "./recommendations.service";
import { createRecommendationsTestingModule } from "../../jest_mocking/module-mocking";

describe("RecommendationsService", () => {
	let service: RecommendationsService;

	beforeEach(async () => {
		const module: TestingModule = await createRecommendationsTestingModule();
		service = module.get<RecommendationsService>(RecommendationsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
