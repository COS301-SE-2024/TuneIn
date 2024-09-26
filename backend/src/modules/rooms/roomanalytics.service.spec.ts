import { Test, TestingModule } from "@nestjs/testing";
import { RoomAnalyticsService } from "../../modules/rooms/roomanalytics.service";
import { PrismaService } from "../../../prisma/prisma.service";
import * as PrismaTypes from "@prisma/client";
import { addHours, startOfDay, subHours, isBefore } from "date-fns";
import { RoomAnalyticsParticipationDto } from "./dto/roomanalytics.dto";

describe("RoomAnalyticsService", () => {
	let service: RoomAnalyticsService;
	let prismaService: PrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RoomAnalyticsService, PrismaService],
		}).compile();

		service = module.get<RoomAnalyticsService>(RoomAnalyticsService);
		prismaService = module.get<PrismaService>(PrismaService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getRoomJoinAnalytics", () => {
		it("should return room join analytics", async () => {
			const mockRoomID = "roomID1";
			const mockUserActivityPerDay = [
				{ day: new Date("2023-01-01"), count: 5 },
				{ day: new Date("2023-01-02"), count: 10 },
			];
			const mockUniqueUserActivityPerDay = [
				{ day: new Date("2023-01-01"), count: 3 },
				{ day: new Date("2023-01-02"), count: 7 },
			];
			const mockRoom = {
				room_id: mockRoomID,
				date_created: new Date("2023-01-01"),
			} as PrismaTypes.room;

			jest.spyOn(prismaService, "$queryRaw").mockImplementation((query) => {
				const queryString = (query as unknown as string).toString();
				if (queryString.match(/COUNT\("user_id"\)/)) {
					return Promise.resolve(
						mockUserActivityPerDay,
					) as unknown as PrismaTypes.PrismaPromise<any>;
				} else if (queryString.match(/COUNT\(DISTINCT "user_id"\)/)) {
					return Promise.resolve(
						mockUniqueUserActivityPerDay,
					) as unknown as PrismaTypes.PrismaPromise<any>;
				}
				return Promise.resolve([]) as unknown as PrismaTypes.PrismaPromise<any>;
			});

			jest.spyOn(prismaService.room, "findUnique").mockResolvedValue(mockRoom);

			const result = await service.getRoomJoinAnalytics(mockRoomID);

			const today = addHours(startOfDay(new Date()), 2);
			const allDays = [];
			let day = subHours(today, 24 * 7);
			while (isBefore(day, today)) {
				allDays.push(day);
				day = addHours(day, 24);
			}

			const expectedResult = {
				per_day: {
					total_joins: allDays.map((d) => ({ day: d, count: 0 })),
					unique_joins: allDays.map((d) => ({ day: d, count: 0 })),
				},
				all_time: {
					total_joins: 15,
					unique_joins: 10,
				},
			};

			expect(result).toEqual(expectedResult);
		});

		it("should return empty analytics if no user activity is found", async () => {
			const mockRoomID = "roomID1";

			jest
				.spyOn(prismaService, "$queryRaw")
				.mockResolvedValue([] as unknown as PrismaTypes.PrismaPromise<any>);
			jest.spyOn(prismaService.room, "findUnique").mockResolvedValue(null);

			const result = await service.getRoomJoinAnalytics(mockRoomID);

			expect(result).toEqual({
				per_day: {
					total_joins: [],
					unique_joins: [],
				},
				all_time: {
					total_joins: 0,
					unique_joins: 0,
				},
			});
		});
	});
	describe("getRoomSessionAnalytics", () => {
		it("should return room session analytics with per_day array containing 7 or fewer objects", async () => {
			const mockRoomID = "roomID1";
			const mockSessionDurations = [
				{
					day: new Date("2023-01-01"),
					avg_duration: 300,
					min_duration: 100,
					max_duration: 500,
				},
				{
					day: new Date("2023-01-02"),
					avg_duration: 400,
					min_duration: 200,
					max_duration: 600,
				},
			];
			const mockRoom = {
				room_id: mockRoomID,
				date_created: new Date("2023-01-01"),
			} as PrismaTypes.room;

			jest.spyOn(prismaService, "$queryRaw").mockImplementation(() => {
				return Promise.resolve(
					mockSessionDurations,
				) as unknown as PrismaTypes.PrismaPromise<any>;
			});

			jest.spyOn(prismaService.room, "findUnique").mockResolvedValue(mockRoom);

			const result = await service.getRoomSessionAnalytics(mockRoomID);

			// Check that the per_day array contains 7 or fewer objects
			expect(result.per_day.length).toBeLessThanOrEqual(7);
		});

		it("should return empty session data if no session durations are found", async () => {
			const mockRoomID = "roomID1";

			jest
				.spyOn(prismaService, "$queryRaw")
				.mockResolvedValue([] as unknown as PrismaTypes.PrismaPromise<any>);
			jest.spyOn(prismaService.room, "findUnique").mockResolvedValue(null);

			const result = await service.getRoomSessionAnalytics(mockRoomID);

			expect(result).toEqual({
				all_time: {
					avg_duration: 0,
					min_duration: 0,
					max_duration: 0,
				},
				per_day: [],
			});
		});
	});
	describe("getHourlyParticipantAnalytics", () => {
		it("should return hourly participant analytics with correct array size", async () => {
			const mockRoomID = "roomID1";
			const mockUserActivityPerHour = [
				{ hour: new Date("2023-01-01T01:00:00Z"), count: 5 },
				{ hour: new Date("2023-01-01T02:00:00Z"), count: 10 },
			];
			const mockRoom = {
				room_id: mockRoomID,
				date_created: new Date("2023-01-01T00:00:00Z"),
			} as PrismaTypes.room;

			jest.spyOn(prismaService, "$queryRaw").mockImplementation(() => {
				return Promise.resolve(
					mockUserActivityPerHour,
				) as unknown as PrismaTypes.PrismaPromise<any>;
			});

			jest.spyOn(prismaService.room, "findUnique").mockResolvedValue(mockRoom);

			const result = await service.getHourlyParticipantAnalytics(mockRoomID);

			// Check that the array size is correct
			expect(result.length).toBeGreaterThan(0);
			expect(result.length).toBeLessThanOrEqual(27);
		});

		it("should return empty array if no user activity is found", async () => {
			const mockRoomID = "roomID1";

			jest
				.spyOn(prismaService, "$queryRaw")
				.mockResolvedValue([] as unknown as PrismaTypes.PrismaPromise<any>);
			jest.spyOn(prismaService.room, "findUnique").mockResolvedValue(null);

			const result = await service.getHourlyParticipantAnalytics(mockRoomID);

			expect(result).toEqual([]);
		});

		it("should handle room creation date correctly and return correct array size", async () => {
			const mockRoomID = "roomID1";
			const mockUserActivityPerHour = [
				{ hour: new Date("2023-01-01T01:00:00Z"), count: 5 },
				{ hour: new Date("2023-01-01T02:00:00Z"), count: 10 },
			];
			const mockRoom = {
				room_id: mockRoomID,
				date_created: new Date("2023-01-01T00:00:00Z"),
			} as PrismaTypes.room;

			jest.spyOn(prismaService, "$queryRaw").mockImplementation(() => {
				return Promise.resolve(
					mockUserActivityPerHour,
				) as unknown as PrismaTypes.PrismaPromise<any>;
			});

			jest.spyOn(prismaService.room, "findUnique").mockResolvedValue(mockRoom);

			const result = await service.getHourlyParticipantAnalytics(mockRoomID);

			// Check that the array size is correct
			expect(result.length).toBeGreaterThan(0);
			expect(result.length).toBeLessThanOrEqual(27);
		});
	});
	describe("getRoomParticipationAnalytics", () => {
		it("should return room participation analytics", async () => {
			const mockRoomID = "roomID1";
			const mockUserID = "userID1";

			const mockJoins = {
				all_time: { total_joins: 15, unique_joins: 10 },
				per_day: [],
			};
			const mockSessionData = {
				all_time: { avg_duration: 300, min_duration: 100, max_duration: 500 },
				per_day: [],
			};
			const mockParticipantsPerHour = [
				{ instance: new Date("2023-01-01T01:00:00Z"), count: 5 },
				{ instance: new Date("2023-01-01T02:00:00Z"), count: 10 },
			];
			const mockRoomPreviews = 0;
			const mockReturnVisits: {
				expected_return_count: number;
				probability_of_return: number;
			} = {
				expected_return_count: 0,
				probability_of_return: 0,
			};

			jest
				.spyOn(service, "getRoomJoinAnalytics")
				.mockResolvedValue(
					mockJoins as unknown as RoomAnalyticsParticipationDto["joins"],
				);
			jest
				.spyOn(service, "getRoomSessionAnalytics")
				.mockResolvedValue(mockSessionData);
			jest
				.spyOn(service, "getHourlyParticipantAnalytics")
				.mockResolvedValue(mockParticipantsPerHour);
			jest
				.spyOn(service, "getRoomPreviews")
				.mockResolvedValue(mockRoomPreviews);
			jest
				.spyOn(service, "getReturnVisitsAnalytics")
				.mockResolvedValue(mockReturnVisits);

			const result = await service.getRoomParticipationAnalytics(
				mockRoomID,
				mockUserID,
			);

			const expectedResult = {
				joins: mockJoins,
				session_data: mockSessionData,
				participants_per_hour: mockParticipantsPerHour,
				room_previews: mockRoomPreviews,
				return_visits: mockReturnVisits,
			};

			expect(result).toEqual(expectedResult);
		});

		it("should handle no data available", async () => {
			const mockRoomID = "roomID1";
			const mockUserID = "userID1";

			const mockJoins = {
				all_time: { total_joins: 0, unique_joins: 0 },
				per_day: [],
			};
			const mockSessionData = {
				all_time: { avg_duration: 0, min_duration: 0, max_duration: 0 },
				per_day: [],
			};
			const mockParticipantsPerHour: any[] = [];
			const mockRoomPreviews = 0;
			const mockReturnVisits: {
				expected_return_count: number;
				probability_of_return: number;
			} = {
				expected_return_count: 0,
				probability_of_return: 0,
			};

			jest
				.spyOn(service, "getRoomJoinAnalytics")
				.mockResolvedValue(
					mockJoins as unknown as RoomAnalyticsParticipationDto["joins"],
				);
			jest
				.spyOn(service, "getRoomSessionAnalytics")
				.mockResolvedValue(mockSessionData);
			jest
				.spyOn(service, "getHourlyParticipantAnalytics")
				.mockResolvedValue(mockParticipantsPerHour);
			jest
				.spyOn(service, "getRoomPreviews")
				.mockResolvedValue(mockRoomPreviews);
			jest
				.spyOn(service, "getReturnVisitsAnalytics")
				.mockResolvedValue(mockReturnVisits);

			const result = await service.getRoomParticipationAnalytics(
				mockRoomID,
				mockUserID,
			);

			const expectedResult = {
				joins: mockJoins,
				session_data: mockSessionData,
				participants_per_hour: mockParticipantsPerHour,
				room_previews: mockRoomPreviews,
				return_visits: mockReturnVisits,
			};

			expect(result).toEqual(expectedResult);
		});
	});
});
