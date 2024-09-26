import { Test, TestingModule } from "@nestjs/testing";
import { RoomAnalyticsService } from "./roomanalytics.service";
import { PrismaService } from "../../../prisma/prisma.service";
import * as PrismaTypes from "@prisma/client";
import { addHours, startOfDay, subHours, isBefore } from "date-fns";

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
});
