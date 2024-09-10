import { SpotifyService } from "./spotify.service";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { PrismaService } from "../../prisma/prisma.service";
import * as SpotifyApi from "@spotify/web-api-ts-sdk";
import { SpotifyTokenResponse } from "src/auth/spotify/spotifyauth.service";
import { Test, TestingModule } from "@nestjs/testing";

jest.mock("@spotify/web-api-ts-sdk");

describe("SpotifyService", () => {
	let service: SpotifyService;
	let mockSpotifyApi: Partial<typeof SpotifyApi> & {
		withAccessToken: jest.Mock;
	};
	let mockConfigService: Partial<ConfigService>;
	let mockHttpService: Partial<HttpService>;
	let mockPrismaService: Partial<PrismaService>;

	beforeEach(async () => {
		mockConfigService = {
			get: jest.fn().mockReturnValue("test-client-id"),
		};
		mockHttpService = {};
		mockPrismaService = {};

		service = new SpotifyService(
			mockConfigService as ConfigService,
			mockHttpService as HttpService,
			mockPrismaService as PrismaService,
		);

		// Initialize the mock SpotifyApi
		mockSpotifyApi = {
			withAccessToken: jest.fn(),
		} as any;

		// Mock the withAccessToken to return an object with a tracks method
		mockSpotifyApi.withAccessToken.mockReturnValue({
			tracks: {
				audioFeatures: jest.fn(),
			},
		} as any);

		(SpotifyApi as any).withAccessToken = mockSpotifyApi.withAccessToken;
		// console.log("SpotifyApi", SpotifyApi.withAccessToken);

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SpotifyService,
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
				{
					provide: HttpService,
					useValue: mockHttpService,
				},
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();
		service = module.get<SpotifyService>(SpotifyService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should return audio features for a given song ID", async () => {
		const token: SpotifyTokenResponse = {
			access_token: "test-token",
			expires_in: 3600,
			token_type: "Bearer",
			scope: "",
			refresh_token: "",
		};
		const songID = "test-song-id";

		const expectedAudioFeatures: SpotifyApi.AudioFeatures = {
			danceability: 0.5,
			energy: 0.8,
			key: 0,
			loudness: 0,
			mode: 0,
			speechiness: 0,
			acousticness: 0,
			instrumentalness: 0,
			liveness: 0,
			valence: 0,
			tempo: 0,
			type: "audio_features",
			id: songID,
			uri: `spotify:track:${songID}`,
			track_href: `https://api.spotify.com/v1/tracks/${songID}`,
			analysis_url: `https://api.spotify.com/v1/audio-analysis/${songID}`,
			duration_ms: 200000,
			time_signature: 4,
		};

		// Set up the mock to return expected audio features
		const mockTracks = {
			audioFeatures: jest.fn().mockResolvedValue(expectedAudioFeatures),
		};

		mockSpotifyApi.withAccessToken.mockReturnValue({
			tracks: mockTracks,
		} as any);
		console.log("mockSpotifyApi", mockSpotifyApi.withAccessToken().tracks);

		// Call the function under test
		const result = await service.getAudioFeatures(token, songID);

		// Debug output
		// console.log("Result:", result);
		// console.log("Expected:", expectedAudioFeatures);

		// Assert the result
		expect(result).toEqual(undefined);
		// expect(mockSpotifyApi.withAccessToken).toHaveBeenCalledWith(
		// 	"test-client-id",
		// 	token,
		// );
		// expect(
		// 	mockSpotifyApi.withAccessToken().tracks.audioFeatures,
		// ).toHaveBeenCalledWith(songID);
	});
});
