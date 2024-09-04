import { TestingModule } from "@nestjs/testing";
import { DbUtilsService } from "./db-utils.service";
import { createDbUtilsTestingModule } from "../../../jest_mocking/module-mocking";
import * as PrismaTypes from "@prisma/client";
import { mockPrismaService } from "../../../jest_mocking/service-mocking";

describe("DbUtilsService", () => {
	let service: DbUtilsService;

	beforeEach(async () => {
		const module: TestingModule = await createDbUtilsTestingModule();
		service = module.get<DbUtilsService>(DbUtilsService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("getRandomRooms", () => {
		it("should return an array of rooms", async () => {
			const rooms: PrismaTypes.room[] = [
				{
					room_id: "1",
					name: "Room 1",
					room_creator: "",
					playlist_photo: null,
					description: null,
					date_created: new Date(),
					nsfw: false,
					is_temporary: null,
					room_language: null,
					explicit: null,
					tags: [],
				},
				{
					room_id: "2",
					name: "Room 2",
					room_creator: "",
					playlist_photo: null,
					description: null,
					date_created: new Date(),
					nsfw: false,
					is_temporary: null,
					room_language: null,
					explicit: null,
					tags: [],
				},
			];
			jest.spyOn(mockPrismaService.room, "findMany").mockResolvedValue(rooms);
			const result = await service.getRandomRooms(2);

			expect(result).toEqual(rooms);
			expect(mockPrismaService.room.findMany).toHaveBeenCalledTimes(1);
		});

		it("should return null if no rooms found", async () => {
			jest.spyOn(mockPrismaService.room, "findMany").mockResolvedValue(null);

			const result = await service.getRandomRooms(2);

			expect(result).toBeNull();
			expect(mockPrismaService.room.findMany).toHaveBeenCalledTimes(1);
		});

		it("should return all rooms if count is greater than the number of rooms", async () => {
			const rooms: PrismaTypes.room[] = [
				{
					room_id: "1",
					name: "Room 1",
					room_creator: "",
					playlist_photo: null,
					description: null,
					date_created: new Date(),
					nsfw: false,
					is_temporary: null,
					room_language: null,
					explicit: null,
					tags: [],
				},
				{
					room_id: "2",
					name: "Room 2",
					room_creator: "",
					playlist_photo: null,
					description: null,
					date_created: new Date(),
					nsfw: false,
					is_temporary: null,
					room_language: null,
					explicit: null,
					tags: [],
				},
			];
			jest.spyOn(mockPrismaService.room, "findMany").mockResolvedValue(rooms);

			const result = await service.getRandomRooms(3);

			expect(result).toEqual(rooms);
			expect(mockPrismaService.room.findMany).toHaveBeenCalledTimes(1);
		});
	});

	describe("isRoomPublic", () => {
		it("should return true if the room is public", async () => {
			const room: PrismaTypes.room = {
				room_id: "1",
				name: "Room 1",
				room_creator: "",
				playlist_photo: null,
				description: null,
				date_created: new Date(),
				nsfw: false,
				is_temporary: null,
				room_language: null,
				explicit: null,
				tags: [],
			};
			const publicRoom: PrismaTypes.public_room = { room_id: "1" };
			jest.spyOn(mockPrismaService.room, "findUnique").mockResolvedValue(room);
			jest
				.spyOn(mockPrismaService.public_room, "findUnique")
				.mockResolvedValue(publicRoom);

			const result = await service.isRoomPublic("1");

			expect(result).toBe(true);
			expect(mockPrismaService.room.findUnique).toHaveBeenCalledTimes(1);
			expect(mockPrismaService.public_room.findUnique).toHaveBeenCalledTimes(1);
		});

		it("should return false if the room is not public", async () => {
			const room: PrismaTypes.room = {
				room_id: "1",
				name: "Room 1",
				room_creator: "",
				playlist_photo: null,
				description: null,
				date_created: new Date(),
				nsfw: false,
				is_temporary: null,
				room_language: null,
				explicit: null,
				tags: [],
			};
			jest.spyOn(mockPrismaService.room, "findUnique").mockResolvedValue(room);
			jest
				.spyOn(mockPrismaService.public_room, "findUnique")
				.mockResolvedValue(null);

			const result = await service.isRoomPublic("1");

			expect(result).toBe(false);
			expect(mockPrismaService.room.findUnique).toHaveBeenCalledTimes(1);
			expect(mockPrismaService.public_room.findUnique).toHaveBeenCalledTimes(1);
		});

		it("should throw an error if the room does not exist", async () => {
			jest.spyOn(mockPrismaService.room, "findUnique").mockResolvedValue(null);

			await expect(service.isRoomPublic("1")).rejects.toThrowError(
				"Room not found. Probably doesn't exist.",
			);
			expect(mockPrismaService.room.findUnique).toHaveBeenCalledTimes(1);
			expect(mockPrismaService.public_room.findUnique).not.toHaveBeenCalled();
		});
	});

	describe("isRoomPrivate", () => {
		it("should return true if the room is private", async () => {
			const room: PrismaTypes.room = {
				room_id: "1",
				name: "Room 1",
				room_creator: "",
				playlist_photo: null,
				description: null,
				date_created: new Date(),
				nsfw: false,
				is_temporary: null,
				room_language: null,
				explicit: null,
				tags: [],
			};
			const privateRoom: PrismaTypes.private_room = {
				room_id: "1",
				is_listed: false,
			};
			jest.spyOn(mockPrismaService.room, "findUnique").mockResolvedValue(room);
			jest
				.spyOn(mockPrismaService.private_room, "findUnique")
				.mockResolvedValue(privateRoom);

			const result = await service.isRoomPrivate("1");

			expect(result).toBe(true);
			expect(mockPrismaService.room.findUnique).toHaveBeenCalledTimes(1);
			expect(mockPrismaService.private_room.findUnique).toHaveBeenCalledTimes(
				1,
			);
		});

		it("should return false if the room is not private", async () => {
			const room: PrismaTypes.room = {
				room_id: "1",
				name: "Room 1",
				room_creator: "",
				playlist_photo: null,
				description: null,
				date_created: new Date(),
				nsfw: false,
				is_temporary: null,
				room_language: null,
				explicit: null,
				tags: [],
			};
			jest.spyOn(mockPrismaService.room, "findUnique").mockResolvedValue(room);
			jest
				.spyOn(mockPrismaService.private_room, "findUnique")
				.mockResolvedValue(null);

			const result = await service.isRoomPrivate("1");

			expect(result).toBe(false);
			expect(mockPrismaService.room.findUnique).toHaveBeenCalledTimes(1);
			expect(mockPrismaService.private_room.findUnique).toHaveBeenCalledTimes(
				1,
			);
		});

		it("should throw an error if the room does not exist", async () => {
			jest.spyOn(mockPrismaService.room, "findUnique").mockResolvedValue(null);

			await expect(service.isRoomPrivate("1")).rejects.toThrowError(
				"Room not found. Probably doesn't exist.",
			);
			expect(mockPrismaService.room.findUnique).toHaveBeenCalledTimes(1);
			expect(mockPrismaService.private_room.findUnique).not.toHaveBeenCalled();
		});
	});

	describe("roomExists", () => {
		it("should return true if the room exists", async () => {
			const room: PrismaTypes.room = {
				room_id: "1",
				name: "Room 1",
				room_creator: "",
				playlist_photo: null,
				description: null,
				date_created: new Date(),
				nsfw: false,
				is_temporary: null,
				room_language: null,
				explicit: null,
				tags: [],
			};
			jest.spyOn(mockPrismaService.room, "findUnique").mockResolvedValue(room);

			const result = await service.roomExists("1");

			expect(result).toBe(true);
			expect(mockPrismaService.room.findUnique).toHaveBeenCalledTimes(1);
		});

		it("should return false if the room does not exist", async () => {
			jest.spyOn(mockPrismaService.room, "findUnique").mockResolvedValue(null);

			const result = await service.roomExists("1");

			expect(result).toBe(false);
			expect(mockPrismaService.room.findUnique).toHaveBeenCalledTimes(1);
		});
	});

	describe("getUserFollowing", () => {
		it("should return an array of users that the specified user is following", async () => {
			const follows: PrismaTypes.follows[] = [
				{
					follower: "user1",
					followee: "user2",
					date_followed: new Date(),
					follows_id: "",
				},
				{
					follower: "user1",
					followee: "user3",
					date_followed: new Date(),
					follows_id: "",
				},
			];
			const users: PrismaTypes.users[] = [
				{
					user_id: "user2",
					full_name: "User 2",
					email: "user2@example.com",
					username: "",
					bio: null,
					profile_picture: null,
					activity: null,
					preferences: null,
					external_links: null,
				},
				{
					user_id: "user3",
					full_name: "User 3",
					email: "user3@example.com",
					username: "",
					bio: null,
					profile_picture: null,
					activity: null,
					preferences: null,
					external_links: null,
				},
			];
			jest
				.spyOn(mockPrismaService.follows, "findMany")
				.mockResolvedValue(follows);
			jest.spyOn(mockPrismaService.users, "findMany").mockResolvedValue(users);

			const result = await service.getUserFollowing("user1");

			expect(result).toEqual(users);
			expect(mockPrismaService.follows.findMany).toHaveBeenCalledWith({
				where: { follower: "user1" },
			});
			expect(mockPrismaService.users.findMany).toHaveBeenCalledWith({
				where: { user_id: { in: ["user2", "user3"] } },
			});
		});

		it("should return null if the user is not following anyone", async () => {
			jest.spyOn(mockPrismaService.follows, "findMany").mockResolvedValue(null);

			const result = await service.getUserFollowing("user1");

			expect(result).toBeNull();
			expect(mockPrismaService.follows.findMany).toHaveBeenCalledWith({
				where: { follower: "user1" },
			});
		});
	});
});
