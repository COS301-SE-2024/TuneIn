import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { ConfigService } from "@nestjs/config";
import {
	mockPrismaService,
	mockDtoGenService,
	mockDbUtilsService,
} from "../../../jest_mocking/service-mocking";
import { RoomDto } from "../rooms/dto/room.dto";
import {
	GenresWithCount,
	RoomsData,
	SongInfosWithCount,
	UserDto,
	UserFriendship,
} from "./dto/user.dto";
import { SongInfoDto } from "../rooms/dto/songinfo.dto";

describe("UsersService follow function", () => {
	let usersService: UsersService;
	let prismaService: PrismaService;
	let dbUtilsService: DbUtilsService;
	let dtoGenService: DtoGenService;
	let configService: ConfigService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
				{
					provide: DbUtilsService,
					useValue: mockDbUtilsService,
				},
				{
					provide: DtoGenService,
					useValue: mockDtoGenService,
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn().mockImplementation((key: string) => {
							if (key === "SALT") {
								return "mockSalt";
							}
							return null;
						}),
					},
				},
			],
		}).compile();

		usersService = module.get<UsersService>(UsersService);
		prismaService = module.get<PrismaService>(PrismaService);
		dbUtilsService = module.get<DbUtilsService>(DbUtilsService);
		dtoGenService = module.get<DtoGenService>(DtoGenService);
		configService = module.get<ConfigService>(ConfigService);
	});
	describe("followUser", () => {
		it("should be defined", () => {
			expect(usersService).toBeDefined();
		});

		it("should throw an error if the user does not exist", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValueOnce(false);

			await expect(
				usersService.followUser("selfID", "usernameToFollow"),
			).rejects.toThrow("User with id: (selfID) does not exist");
		});

		it("should throw an error if the followee does not exist", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValueOnce(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue(null);

			await expect(
				usersService.followUser("selfID", "usernameToFollow"),
			).rejects.toThrow("User (usernameToFollow) does not exist");
		});

		it("should throw an error if trying to follow oneself", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValueOnce(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "selfID",
				username: "selfUsername",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			});

			await expect(usersService.followUser("selfID", "selfID")).rejects.toThrow(
				"You cannot follow yourself",
			);
		});

		it("should return true if already following the user", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValueOnce(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "followeeID",
				username: "followeeUsername",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			});
			jest.spyOn(dbUtilsService, "isFollowing").mockResolvedValueOnce(true);

			const result = await usersService.followUser("selfID", "followeeID");
			expect(result).toBe(true);
		});

		it("should return true if successfully followed the user", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValueOnce(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "followeeID",
				username: "followeeUsername",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			});
			jest.spyOn(dbUtilsService, "isFollowing").mockResolvedValueOnce(false);
			jest.spyOn(prismaService.follows, "create").mockResolvedValue({
				follower: "selfID",
				followee: "followeeID",
				follows_id: "followsID",
				date_followed: new Date(),
			});

			const result = await usersService.followUser("selfID", "followeeID");
			expect(result).toBe(true);
		});

		it("should throw an error if failed to follow the user", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValueOnce(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "followeeID",
				username: "followeeUsername",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			});
			jest.spyOn(dbUtilsService, "isFollowing").mockResolvedValueOnce(false);
			jest
				.spyOn(prismaService.follows, "create")
				.mockRejectedValue(new Error("DB Error"));

			await expect(
				usersService.followUser("selfID", "followeeID"),
			).rejects.toThrow("Failed to follow user with id: (followeeID)");
		});
	});
	describe("unfollowUser", () => {
		it("should be defined", () => {
			expect(usersService).toBeDefined();
		});

		it("should throw an error if the user does not exist", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValueOnce(false);

			await expect(
				usersService.unfollowUser("selfID", "usernameToUnfollow"),
			).rejects.toThrow("User with id: (selfID) does not exist");
		});

		it("should throw an error if the followee does not exist", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValueOnce(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue(null);

			await expect(
				usersService.unfollowUser("selfID", "usernameToUnfollow"),
			).rejects.toThrow("User (usernameToUnfollow) does not exist");
		});

		it("should throw an error if trying to unfollow oneself", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValueOnce(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "selfID",
				username: "selfUsername",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			});

			await expect(
				usersService.unfollowUser("selfID", "selfID"),
			).rejects.toThrow("You cannot unfollow yourself");
		});

		it("should return true if not following the user", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValueOnce(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "followeeID",
				username: "followeeUsername",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			});
			jest.spyOn(dbUtilsService, "isFollowing").mockResolvedValueOnce(false);

			const result = await usersService.unfollowUser("selfID", "followeeID");
			expect(result).toBe(true);
		});

		it("should return true if successfully unfollowed the user", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValueOnce(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "followeeID",
				username: "followeeUsername",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			});
			jest.spyOn(dbUtilsService, "isFollowing").mockResolvedValueOnce(true);
			jest.spyOn(prismaService.follows, "findFirst").mockResolvedValue({
				follows_id: "followID",
				follower: "selfID",
				followee: "followeeID",
				date_followed: new Date(),
			});
			jest.spyOn(prismaService.follows, "delete").mockResolvedValue({
				follows_id: "followID",
				follower: "selfID",
				followee: "followeeID",
				date_followed: new Date(),
			});

			const result = await usersService.unfollowUser("selfID", "followeeID");
			expect(result).toBe(true);
		});

		it("should throw an error if failed to unfollow the user", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValueOnce(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "followeeID",
				username: "followeeUsername",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			});
			jest.spyOn(dbUtilsService, "isFollowing").mockResolvedValueOnce(true);
			jest.spyOn(prismaService.follows, "findFirst").mockResolvedValue({
				follows_id: "followID",
				follower: "selfID",
				followee: "followeeID",
				date_followed: new Date(),
			});
			jest
				.spyOn(prismaService.follows, "delete")
				.mockRejectedValue(new Error("DB Error"));

			await expect(
				usersService.unfollowUser("selfID", "followeeID"),
			).rejects.toThrow("Failed to unfollow user with id: (followeeID)");
		});
	});
	describe("getUserRooms", () => {
		it("should be defined", () => {
			expect(usersService).toBeDefined();
		});

		it("should throw an error if the user does not exist", async () => {
			jest.spyOn(prismaService.users, "findUnique").mockResolvedValueOnce(null);

			await expect(usersService.getUserRooms("userID")).rejects.toThrow(
				"User does not exist",
			);
		});

		it("should return an empty array if no rooms are found", async () => {
			jest.spyOn(prismaService.users, "findUnique").mockResolvedValueOnce({
				user_id: "userID",
				username: "username",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			});
			jest.spyOn(prismaService.room, "findMany").mockResolvedValueOnce([]);
			jest
				.spyOn(dtoGenService, "generateMultipleRoomDto")
				.mockResolvedValueOnce([]);
			const result = await usersService.getUserRooms("userID");
			expect(result).toEqual([]);
		});

		it("should return RoomDto array if rooms are found and generateMultipleRoomDto succeeds", async () => {
			jest.spyOn(prismaService.users, "findUnique").mockResolvedValueOnce({
				user_id: "userID",
				username: "username",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			});
			jest.spyOn(prismaService.room, "findMany").mockResolvedValueOnce([
				{
					room_id: "roomID1",
					room_creator: "userID",
					name: "Room 1",
					playlist_photo: null,
					description: "Description 1",
					is_temporary: false,
					room_language: "English",
					explicit: false,
					date_created: new Date(),
					nsfw: false,
					tags: [],
				},
				{
					room_id: "roomID2",
					room_creator: "userID",
					name: "Room 2",
					playlist_photo: null,
					description: "Description 2",
					is_temporary: false,
					room_language: "English",
					explicit: false,
					date_created: new Date(),
					nsfw: false,
					tags: [],
				},
			]);
			const mockRoomDtos: RoomDto[] = [
				{
					creator: new UserDto(),
					roomID: "roomID1",
					participant_count: 0,
					room_name: "Room 1",
					description: "Description 1",
					is_temporary: false,
					is_private: false,
					is_scheduled: false,
					language: "English",
					has_explicit_content: false,
					has_nsfw_content: false,
					room_image: "",
					tags: [],
					childrenRoomIDs: [],
				},
				{
					creator: new UserDto(),
					roomID: "roomID2",
					participant_count: 0,
					room_name: "Room 2",
					description: "Description 2",
					is_temporary: false,
					is_private: false,
					is_scheduled: false,
					language: "English",
					has_explicit_content: false,
					has_nsfw_content: false,
					room_image: "",
					tags: [],
					childrenRoomIDs: [],
				},
			];
			jest
				.spyOn(dtoGenService, "generateMultipleRoomDto")
				.mockResolvedValueOnce(mockRoomDtos);

			const result = await usersService.getUserRooms("userID");
			expect(result).toEqual(mockRoomDtos);
		});
	});
	describe("getFriendRequests", () => {
		it("should be defined", () => {
			expect(usersService).toBeDefined();
		});

		it("should return an empty array if no friend requests are found", async () => {
			jest
				.spyOn(dbUtilsService, "getFriendRequests")
				.mockResolvedValueOnce(null);

			const result = await usersService.getFriendRequests("userID");
			expect(result).toEqual([]);
		});

		it("should return UserDto array if friend requests are found and generateMultipleUserDto succeeds", async () => {
			jest.spyOn(dbUtilsService, "getFriendRequests").mockResolvedValueOnce([
				{
					friend_id: "friendID1",
					friend1: "friendID1",
					friend2: "userID",
					is_pending: true,
					is_close_friend: false,
					date_friended: new Date(),
					date_requested: new Date(),
				},
			]);
			const mockUserDtos: UserDto[] = [
				{
					profile_name: "username",
					userID: "friendID1",
					username: "username",
					profile_picture_url: "",
					followers: {
						count: 0,
						data: [],
					},
					following: {
						count: 0,
						data: [],
					},
					links: {
						count: 0,
						data: [],
					},
					bio: "",
					current_song: new SongInfoDto(),
					current_room_id: "",
					fav_genres: new GenresWithCount(),
					fav_songs: new SongInfosWithCount(),
					fav_rooms: new RoomsData(),
					recent_rooms: new RoomsData(),
					friendship: new UserFriendship(),
					relationship: "pending",
				},
			];
			jest
				.spyOn(dtoGenService, "generateMultipleUserDto")
				.mockResolvedValueOnce(mockUserDtos);

			const result = await usersService.getFriendRequests("userID");
			expect(result).toEqual(mockUserDtos);
		});
	});
});
