import { Test, TestingModule } from "@nestjs/testing";
import { RecommendationsService } from "./recommendations.service";

describe("RecommendationsService", () => {
	let service: RecommendationsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RecommendationsService],
		}).compile();

		service = module.get<RecommendationsService>(RecommendationsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should set playlists correctly", () => {
		const playlists = {
			playlist1: [
				{
					danceability: 0.8,
					energy: 0.7,
					key: 5,
					loudness: -5,
					mode: 1,
					speechiness: 0.05,
					acousticness: 0.1,
					instrumentalness: 0.0,
					liveness: 0.1,
					valence: 0.9,
					tempo: 120,
				},
			],
		};
		service.setPlaylists(playlists);
		expect(service["playlists"]).toEqual(playlists);
	});

	it("should set mock songs correctly", () => {
		const mockSongs = [
			{
				danceability: 0.8,
				energy: 0.7,
				key: 5,
				loudness: -5,
				mode: 1,
				speechiness: 0.05,
				acousticness: 0.1,
				instrumentalness: 0.0,
				liveness: 0.1,
				valence: 0.9,
				tempo: 120,
			},
		];
		service.setMockSongs(mockSongs);
		expect(service["mockSongs"]).toEqual(mockSongs);
	});

	it("should calculate playlist similarity scores correctly", () => {
		const playlists = {
			playlist1: [
				{
					danceability: 0.8,
					energy: 0.7,
					key: 5,
					loudness: -5,
					mode: 1,
					speechiness: 0.05,
					acousticness: 0.1,
					instrumentalness: 0.0,
					liveness: 0.1,
					valence: 0.9,
					tempo: 120,
				},
			],
		};
		const mockSongs = [
			{
				danceability: 0.8,
				energy: 0.7,
				key: 5,
				loudness: -5,
				mode: 1,
				speechiness: 0.05,
				acousticness: 0.1,
				instrumentalness: 0.0,
				liveness: 0.1,
				valence: 0.9,
				tempo: 120,
			},
		];
		service.setPlaylists(playlists);
		service.setMockSongs(mockSongs);
		const scores = service.getPlaylistSimilarityScores();
		expect(scores["playlist1"]).toBeCloseTo(1, 5);
	});

	it("should get top playlists correctly", () => {
		const playlists = {
			playlist1: [
				{
					danceability: 0.8,
					energy: 0.7,
					key: 5,
					loudness: -5,
					mode: 1,
					speechiness: 0.05,
					acousticness: 0.1,
					instrumentalness: 0.0,
					liveness: 0.1,
					valence: 0.9,
					tempo: 120,
				},
			],
			playlist2: [
				{
					danceability: 0.5,
					energy: 0.6,
					key: 4,
					loudness: -6,
					mode: 0,
					speechiness: 0.04,
					acousticness: 0.2,
					instrumentalness: 0.1,
					liveness: 0.2,
					valence: 0.8,
					tempo: 110,
				},
			],
		};
		const mockSongs = [
			{
				danceability: 0.8,
				energy: 0.7,
				key: 5,
				loudness: -5,
				mode: 1,
				speechiness: 0.05,
				acousticness: 0.1,
				instrumentalness: 0.0,
				liveness: 0.1,
				valence: 0.9,
				tempo: 120,
			},
		];
		service.setPlaylists(playlists);
		service.setMockSongs(mockSongs);
		const topPlaylists = service.getTopPlaylists(1);
		expect(topPlaylists.length).toBe(1);
		expect(topPlaylists[0]?.playlist).toBe("playlist1");
	});
});
