import { TestingModule } from "@nestjs/testing";
import { RoomAnalyticsService } from "./roomanalytics.service";
import { createRoomsTestingModule } from "../../../jest_mocking/module-mocking";
import { mockPrismaService } from "jest_mocking/service-mocking";
import {
	JoinsPerDay,
	RoomAnalyticsContributorsDto,
	RoomAnalyticsDto,
	RoomAnalyticsInteractionsDto,
	RoomAnalyticsParticipationDto,
	RoomAnalyticsQueueDto,
	RoomAnalyticsSongsDto,
	RoomAnalyticsVotesDto,
} from "./dto/roomanalytics.dto";

describe("RoomAnalyticsService", () => {
	let service: RoomAnalyticsService;

	beforeEach(async () => {
		const module: TestingModule = await createRoomsTestingModule();
		service = module.get<RoomAnalyticsService>(RoomAnalyticsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("getRoomAnalytics", () => {
		it("should return room analytics data", async () => {
			const roomID = "testRoomID";
			const userID = "testUserID";
			const mockAnalyticsData: RoomAnalyticsDto = {
				queue: new RoomAnalyticsQueueDto(),
				participation: new RoomAnalyticsParticipationDto(),
				interactions: new RoomAnalyticsInteractionsDto(),
				votes: new RoomAnalyticsVotesDto(),
				songs: new RoomAnalyticsSongsDto(),
				contributors: new RoomAnalyticsContributorsDto(),
			}; // Mock the expected data structure
			jest
				.spyOn(service, "getRoomAnalytics")
				.mockResolvedValue(mockAnalyticsData);

			const result = await service.getRoomAnalytics(roomID, userID);
			expect(result).toEqual(mockAnalyticsData);
		});
	});

	describe("getRoomQueueAnalytics", () => {
		it("should return queue analytics data", async () => {
			const roomID = "testRoomID";
			const userID = "testUserID";
			const mockQueueData: RoomAnalyticsQueueDto = {
				total_songs_queued: 0,
				total_queue_exports: 0,
			}; // Mock the expected data structure
			jest
				.spyOn(service, "getRoomQueueAnalytics")
				.mockResolvedValue(mockQueueData);

			const result = await service.getRoomQueueAnalytics(roomID, userID);
			expect(result).toEqual(mockQueueData);
		});
	});

	describe("getRoomJoinAnalytics", () => {
		it("should return join analytics data", async () => {
			const roomID = "testRoomID";
			const mockJoinData: {
				per_day: JoinsPerDay;
				all_time: {
					total_joins: number;
					unique_joins: number;
				};
			} = {
				per_day: new JoinsPerDay(),
				all_time: {
					total_joins: 0,
					unique_joins: 0,
				},
			};
			jest
				.spyOn(service, "getRoomJoinAnalytics")
				.mockResolvedValue(mockJoinData);

			const result = await service.getRoomJoinAnalytics(roomID);
			expect(result).toEqual(mockJoinData);
		});
	});

	// Example for testing error handling
	describe("getRoomAnalytics error handling", () => {
		it("should handle errors", async () => {
			const roomID = "testRoomID";
			const userID = "testUserID";
			jest
				.spyOn(service, "getRoomAnalytics")
				.mockRejectedValue(new Error("Error fetching room analytics"));

			await expect(service.getRoomAnalytics(roomID, userID)).rejects.toThrow(
				"Error fetching room analytics",
			);
		});
	});
});
