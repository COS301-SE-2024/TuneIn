import { Test, TestingModule } from "@nestjs/testing";
import { RecommenderController } from "./recommender.controller";
import { RecommenderService } from "./recommender.service";

describe("RecommenderController", () => {
	let controller: RecommenderController;
	let service: RecommenderService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RecommenderController],
			providers: [
				{
					provide: RecommenderService,
					useValue: {
						getTopPlaylists: jest.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<RecommenderController>(RecommenderController);
		service = module.get<RecommenderService>(RecommenderService);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	it("should return playlist recommendations", async () => {
		const mockPlaylists = [
			{ playlist: "playlist1", score: 0.9 },
			{ playlist: "playlist2", score: 0.8 },
		];
		jest.spyOn(service, "getTopPlaylists").mockReturnValue(mockPlaylists);

		const result = await controller.getPlaylistRecommendations(2);
		expect(result).toEqual(mockPlaylists);
		expect(service.getTopPlaylists).toHaveBeenCalledWith(2);
	});
});
