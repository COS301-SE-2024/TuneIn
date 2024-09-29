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
					playlist_id: null,
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
					playlist_id: null,
				},
			];
			jest.spyOn(mockPrismaService.room, "findMany").mockResolvedValue(rooms);
			const result = await service.getRandomRooms(2);

			expect(result).toEqual(rooms);
			expect(mockPrismaService.room.findMany).toHaveBeenCalledTimes(1);
		});

		it("should return an empty array if no rooms found", async () => {
			jest.spyOn(mockPrismaService.room, "findMany").mockResolvedValue([]);

			const result = await service.getRandomRooms(2);

			expect(result).toEqual([]);
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
					playlist_id: null,
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
					playlist_id: null,
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
				playlist_id: null,
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
				playlist_id: null,
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
				playlist_id: null,
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
				playlist_id: null,
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
				playlist_id: null,
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
		it("should return an empty array if the user is not following anyone", async () => {
			jest.spyOn(mockPrismaService.follows, "findMany").mockResolvedValue([]);

			const result = await service.getUserFollowing("user1");

			expect(result).toEqual([]);
			expect(mockPrismaService.follows.findMany).toHaveBeenCalledWith({
				where: { follower: "user1" },
			});
		});

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
	});
	describe("getRelationshipStatus", () => {
		it('should return "friend" if the users are friends', async () => {
			jest.spyOn(service, "isFollowing").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFollowing").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(true);
			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);

			const result = await service.getRelationshipStatus(
				"userID",
				"accountFriendId",
			);
			expect(result).toBe("friend");
		});

		it('should return "pending" if there is a pending friend request', async () => {
			jest.spyOn(service, "isFollowing").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFollowing").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(true);

			const result = await service.getRelationshipStatus(
				"userID",
				"accountFriendId",
			);
			expect(result).toBe("pending");
		});

		it('should return "mutual" if both users are following each other', async () => {
			jest.spyOn(service, "isFollowing").mockResolvedValueOnce(true);
			jest.spyOn(service, "isFollowing").mockResolvedValueOnce(true);
			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);

			const result = await service.getRelationshipStatus(
				"userID",
				"accountFriendId",
			);
			expect(result).toBe("mutual");
		});

		it('should return "following" if the user is following the accountFriendId', async () => {
			jest.spyOn(service, "isFollowing").mockResolvedValueOnce(true);
			jest.spyOn(service, "isFollowing").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);

			const result = await service.getRelationshipStatus(
				"userID",
				"accountFriendId",
			);
			expect(result).toBe("following");
		});

		it('should return "follower" if the accountFriendId is following the user', async () => {
			jest.spyOn(service, "isFollowing").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFollowing").mockResolvedValueOnce(true);
			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);

			const result = await service.getRelationshipStatus(
				"userID",
				"accountFriendId",
			);
			expect(result).toBe("follower");
		});

		it('should return "none" if there is no relationship', async () => {
			jest.spyOn(service, "isFollowing").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFollowing").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);
			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);

			const result = await service.getRelationshipStatus(
				"userID",
				"accountFriendId",
			);
			expect(result).toBe("none");
		});
	});
	describe("isMutualFollow", () => {
		it("should return false if no follows are found", async () => {
			jest
				.spyOn(mockPrismaService.follows, "findMany")
				.mockResolvedValueOnce([]);

			const result = await service.isMutualFollow(
				"userID",
				"accountFollowedId",
			);
			expect(result).toBe(false);
		});

		it("should return false if only one follow is found", async () => {
			jest
				.spyOn(mockPrismaService.follows, "findMany")
				.mockResolvedValueOnce([
					{ follower: "userID", followee: "accountFollowedId" },
				]);

			const result = await service.isMutualFollow(
				"userID",
				"accountFollowedId",
			);
			expect(result).toBe(false);
		});

		it("should throw an error if more than two follows are found", async () => {
			jest.spyOn(mockPrismaService.follows, "findMany").mockResolvedValueOnce([
				{ follower: "userID", followee: "accountFollowedId" },
				{ follower: "accountFollowedId", followee: "userID" },
				{ follower: "userID", followee: "accountFollowedId" },
			]);

			await expect(
				service.isMutualFollow("userID", "accountFollowedId"),
			).rejects.toThrow("More than two follows found.");
		});

		it("should return true if mutual follows are found", async () => {
			jest.spyOn(mockPrismaService.follows, "findMany").mockResolvedValueOnce([
				{ follower: "userID", followee: "accountFollowedId" },
				{ follower: "accountFollowedId", followee: "userID" },
			]);

			const result = await service.isMutualFollow(
				"userID",
				"accountFollowedId",
			);
			expect(result).toBe(true);
		});
	});
	describe("getPendingRequests", () => {
		it("should return an array of pending requests if found", async () => {
			const mockPendingRequests = [
				{ friend1: "userID", friend2: "friendID1", is_pending: true },
				{ friend1: "userID", friend2: "friendID2", is_pending: true },
			];
			jest
				.spyOn(mockPrismaService.friends, "findMany")
				.mockResolvedValueOnce(mockPendingRequests);

			const result = await service.getPendingRequests("userID");
			expect(result).toEqual(mockPendingRequests);
		});

		it("should return an empty array if the result is an empty array", async () => {
			jest
				.spyOn(mockPrismaService.friends, "findMany")
				.mockResolvedValueOnce([]);

			const result = await service.getPendingRequests("userID");
			expect(result).toEqual([]);
		});
	});
	describe("isFollowing", () => {
		it("should return false if no follows are found", async () => {
			jest
				.spyOn(mockPrismaService.follows, "findMany")
				.mockResolvedValueOnce([]);

			const result = await service.isFollowing("userID", "accountFollowedId");
			expect(result).toBe(false);
		});

		it("should return false if the follow array is null", async () => {
			jest
				.spyOn(mockPrismaService.follows, "findMany")
				.mockResolvedValueOnce(null);

			const result = await service.isFollowing("userID", "accountFollowedId");
			expect(result).toBe(false);
		});

		it("should throw an error if more than one follow is found", async () => {
			jest.spyOn(mockPrismaService.follows, "findMany").mockResolvedValueOnce([
				{ follower: "userID", followee: "accountFollowedId" },
				{ follower: "userID", followee: "accountFollowedId" },
			]);

			await expect(
				service.isFollowing("userID", "accountFollowedId"),
			).rejects.toThrow("More than one follow found.");
		});

		it("should return true if exactly one follow is found", async () => {
			jest
				.spyOn(mockPrismaService.follows, "findMany")
				.mockResolvedValueOnce([
					{ follower: "userID", followee: "accountFollowedId" },
				]);

			const result = await service.isFollowing("userID", "accountFollowedId");
			expect(result).toBe(true);
		});
	});
	describe("getFriendRequests", () => {
		it("should return an array of friend requests if found", async () => {
			const mockFriendRequests = [
				{ friend1: "friendID1", friend2: "userID", is_pending: true },
				{ friend1: "friendID2", friend2: "userID", is_pending: true },
			];
			jest
				.spyOn(mockPrismaService.friends, "findMany")
				.mockResolvedValueOnce(mockFriendRequests);

			const result = await service.getFriendRequests("userID");
			expect(result).toEqual(mockFriendRequests);
		});

		it("should return an empty array if the result is an empty array", async () => {
			jest
				.spyOn(mockPrismaService.friends, "findMany")
				.mockResolvedValueOnce([]);

			const result = await service.getFriendRequests("userID");
			expect(result).toEqual([]);
		});
	});
	describe("getPotentialFriends", () => {
		it("should return an empty array if there are no mutual followers", async () => {
			jest.spyOn(mockPrismaService.follows, "findMany").mockResolvedValueOnce([
				{
					follower: "userID",
					followee: "userA",
					follows_id: "followsID",
					date_followed: new Date(),
				},
				{
					follower: "userA",
					followee: "userID",
					follows_id: "followsID",
					date_followed: new Date(),
				},
			]);

			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);

			const result = await service.getPotentialFriends("userID");
			expect(result).toEqual([]);
		});

		it("should return potential friends if mutual followers are found and they are not friends or pending", async () => {
			jest.spyOn(mockPrismaService.follows, "findMany").mockResolvedValueOnce([
				{
					follower: "userID",
					followee: "userA",
					follows_id: "followsID",
					date_followed: new Date(),
				},
				{
					follower: "userA",
					followee: "userID",
					follows_id: "followsID",
					date_followed: new Date(),
				},
			]);

			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);
			jest.spyOn(mockPrismaService.users, "findUnique").mockResolvedValueOnce({
				user_id: "userA",
			});

			const result = await service.getPotentialFriends("userID");
			expect(result).toEqual([
				{
					user_id: "userA",
				},
			]);
		});

		it("should not include users who are already friends or pending", async () => {
			jest.spyOn(mockPrismaService.follows, "findMany").mockResolvedValueOnce([
				{ follower: "userID", followee: "userA" },
				{ follower: "userA", followee: "userID" },
			]);

			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(true);

			const result = await service.getPotentialFriends("userID");
			expect(result).toEqual([]);
		});

		it("should handle multiple mutual followers correctly", async () => {
			jest.spyOn(mockPrismaService.follows, "findMany").mockResolvedValueOnce([
				{ follower: "userID", followee: "userA" },
				{ follower: "userA", followee: "userID" },
				{ follower: "userID", followee: "userB" },
				{ follower: "userB", followee: "userID" },
			]);

			jest.spyOn(service, "isFriendsOrPending").mockResolvedValueOnce(false);
			jest
				.spyOn(mockPrismaService.users, "findUnique")
				.mockImplementation((params) => {
					if (params.where.user_id === "userA") {
						return Promise.resolve({ user_id: "userA" });
					} else if (params.where.user_id === "userB") {
						return Promise.resolve({ user_id: "userB" });
					}
					return Promise.resolve(null);
				});

			const result = await service.getPotentialFriends("userID");
			expect(result).toEqual([{ user_id: "userA" }, { user_id: "userB" }]);
		});
	});
	describe("getUserFriends", () => {
		it("should return an array of user friends", async () => {
			const mockUserID = "user-1";
			const mockFriends: PrismaTypes.friends[] = [
				{
					friend1: mockUserID,
					friend2: "user-2",
					is_pending: false,
				} as unknown as PrismaTypes.friends,
				{
					friend1: "user-3",
					friend2: mockUserID,
					is_pending: false,
				} as unknown as PrismaTypes.friends,
			];
			const mockUsers: PrismaTypes.users[] = [
				{ user_id: "user-2", full_name: "User 2" } as PrismaTypes.users,
				{ user_id: "user-3", full_name: "User 3" } as PrismaTypes.users,
			];

			jest
				.spyOn(mockPrismaService.friends, "findMany")
				.mockResolvedValueOnce(mockFriends);
			jest
				.spyOn(mockPrismaService.users, "findMany")
				.mockResolvedValueOnce(mockUsers);

			const result = await service.getUserFriends(mockUserID);

			expect(result).toEqual(mockUsers);
			expect(mockPrismaService.friends.findMany).toHaveBeenCalledWith({
				where: {
					OR: [
						{ friend1: mockUserID, is_pending: false },
						{ friend2: mockUserID, is_pending: false },
					],
					is_pending: false,
				},
			});
			expect(mockPrismaService.users.findMany).toHaveBeenCalledWith({
				where: { user_id: { in: ["user-2", "user-3"] } },
			});
		});

		it("should return an empty array if no friends are found", async () => {
			const mockUserID = "user-1";

			jest
				.spyOn(mockPrismaService.friends, "findMany")
				.mockResolvedValueOnce([]);

			await expect(service.getUserFriends(mockUserID)).resolves.toEqual([]);
		});

		it("should throw an error if no users are found", async () => {
			const mockUserID = "user-1";
			const mockFriends: PrismaTypes.friends[] = [
				{
					friend1: mockUserID,
					friend2: "user-2",
					is_pending: false,
				} as unknown as PrismaTypes.friends,
				{
					friend1: "user-3",
					friend2: mockUserID,
					is_pending: false,
				} as unknown as PrismaTypes.friends,
			];

			jest
				.spyOn(mockPrismaService.friends, "findMany")
				.mockResolvedValueOnce(mockFriends);
			jest
				.spyOn(mockPrismaService.users, "findMany")
				.mockResolvedValueOnce(null);

			await expect(service.getUserFriends(mockUserID)).rejects.toThrow(
				"No friends found.",
			);
		});
	});
});
