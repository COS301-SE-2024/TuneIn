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
	mockRecommendationsService,
} from "../../../jest_mocking/service-mocking";
import { RoomDto } from "../rooms/dto/room.dto";
import {
	GenresWithCount,
	LinksWithCount,
	RoomsData,
	SongInfosWithCount,
	UserDto,
	UserFriendship,
} from "./dto/user.dto";
import { SongInfoDto } from "../rooms/dto/songinfo.dto";
import { HttpException } from "@nestjs/common";
import { UpdateUserDto } from "./dto/updateuser.dto";
import { createUsersUpdateTestingModule } from "../../../jest_mocking/module-mocking";
import * as PrismaTypes from "@prisma/client";
import { RecommendationsService } from "../../../src/recommendations/recommendations.service";

const mockUserDto: UserDto = {
	profile_name: "Testing",
	userID: "812cd228-0031-70f9-4b63-e95752e43dad",
	username: "test",
	profile_picture_url:
		"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-18T14:52:53.386Z-image.jpeg",
	followers: {
		count: 0,
		data: [],
	},
	following: {
		count: 0,
		data: [],
	},
	links: {
		count: 2,
		data: {
			instagram: [
				"instagram.com/general_epoch",
				"instagram.com/adventurous_epoch",
			],
		},
	},
	bio: "",
	current_song: {
		songID: "",
		title: "",
		artists: [],
		cover: "",
		spotify_id: "",
		duration: 0,
		start_time: new Date("2024-09-04T05:05:06.064Z"),
	},
	fav_genres: {
		count: 0,
		data: [],
	},
	fav_songs: {
		count: 0,
		data: [],
	},
	fav_rooms: {
		count: 0,
		data: [],
	},
	recent_rooms: {
		count: 0,
		data: [],
	},
};

describe("UsersService", () => {
	let usersService: UsersService;
	let prismaService: PrismaService;
	let dbUtilsService: DbUtilsService;
	let dtoGenService: DtoGenService;

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
					provide: RecommendationsService,
					useValue: mockRecommendationsService,
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
				.spyOn(dbUtilsService, "isFriendsOrPending")
				.mockResolvedValueOnce(false);
			jest
				.spyOn(prismaService.follows, "create")
				.mockRejectedValue(new Error("DB Error"));

			await expect(
				usersService.followUser("selfID", "followeeID"),
			).rejects.toThrow("Failed to follow user with id: (followeeID)");
		});
	});
	describe("getRoomsFromFriends", () => {
		it("should return rooms from all friends", async () => {
			// Arrange
			const userID = "user123";
			const friends = [{ user_id: "friend1" }, { user_id: "friend2" }];
			const friendRooms1 = [{ room_id: "room1" }];
			const friendRooms2 = [{ room_id: "room2" }];

			jest
				.spyOn(dbUtilsService, "getUserFriends")
				.mockResolvedValue(friends as unknown as PrismaTypes.users[]);
			jest
				.spyOn(usersService, "getUserRooms")
				.mockResolvedValueOnce(friendRooms1 as unknown as RoomDto[])
				.mockResolvedValueOnce(friendRooms2 as unknown as RoomDto[]);

			// Act
			const result = await usersService.getRoomsFromFriends(userID);

			// Assert
			expect(result).toEqual([...friendRooms1, ...friendRooms2]);
		});

		it("should throw an error if user has no friends", async () => {
			// Arrange
			const userID = "user123";

			jest.spyOn(dbUtilsService, "getUserFriends").mockResolvedValue(null);

			// Act & Assert
			await expect(usersService.getRoomsFromFriends(userID)).rejects.toThrow(
				"User has no friends",
			);
		});

		it("should handle friends with no rooms", async () => {
			// Arrange
			const userID = "user123";
			const friends = [{ user_id: "friend1" }];

			jest
				.spyOn(dbUtilsService, "getUserFriends")
				.mockResolvedValue(friends as unknown as PrismaTypes.users[]);
			jest.spyOn(usersService, "getUserRooms").mockResolvedValue([]);

			// Act
			const result = await usersService.getRoomsFromFriends(userID);

			// Assert
			expect(result).toEqual([]);
		});
	});

	describe("getRoomsFromFollowing", () => {
		it("should return rooms from all followed users", async () => {
			// Arrange
			const userID = "user123";
			const following = [{ user_id: "follow1" }, { user_id: "follow2" }];
			const followRooms1 = [{ room_id: "room1" }];
			const followRooms2 = [{ room_id: "room2" }];

			jest
				.spyOn(dbUtilsService, "getUserFollowing")
				.mockResolvedValue(following as unknown as PrismaTypes.users[]);
			jest
				.spyOn(usersService, "getUserRooms")
				.mockResolvedValueOnce(followRooms1 as unknown as RoomDto[])
				.mockResolvedValueOnce(followRooms2 as unknown as RoomDto[]);

			// Act
			const result = await usersService.getRoomsFromFollowing(userID);

			// Assert
			expect(result).toEqual([...followRooms1, ...followRooms2]);
		});

		it("should handle followed users with no rooms", async () => {
			// Arrange
			const userID = "user123";
			const following = [{ user_id: "follow1" }];

			jest
				.spyOn(dbUtilsService, "getUserFollowing")
				.mockResolvedValue(following as unknown as PrismaTypes.users[]);
			jest.spyOn(usersService, "getUserRooms").mockResolvedValue([]);

			// Act
			const result = await usersService.getRoomsFromFollowing(userID);

			// Assert
			expect(result).toEqual([]);
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
			jest
				.spyOn(dbUtilsService, "isFriendsOrPending")
				.mockResolvedValueOnce(false);
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
					playlist_id: null,
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
					playlist_id: null,
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
			jest.spyOn(dbUtilsService, "getFriendRequests").mockResolvedValueOnce([]);

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
					links: new LinksWithCount(),
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
	describe("getPotentialFriends", () => {
		it("should be defined", () => {
			expect(usersService).toBeDefined();
		});

		it("should return an empty array if no potential friends are found", async () => {
			jest
				.spyOn(dbUtilsService, "getPotentialFriends")
				.mockResolvedValueOnce([]);

			const result = await usersService.getPotentialFriends("userID");
			expect(result).toEqual([]);
		});

		it("should return UserDto array if potential friends are found and generateMultipleUserDto succeeds", async () => {
			jest.spyOn(dbUtilsService, "getPotentialFriends").mockResolvedValueOnce([
				{
					user_id: "userID",
					username: "username",
					bio: null,
					profile_picture: null,
					activity: {},
					preferences: {},
					full_name: null,
					external_links: {},
					email: null,
				},
			]);
			const mockUserDtos: UserDto[] = [
				{
					profile_name: "username",
					userID: "userID",
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
					links: new LinksWithCount(),
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

			const result = await usersService.getPotentialFriends("userID");
			expect(result).toEqual(mockUserDtos);
		});
	});
	describe("getRecommendedRooms", () => {
		it("should return random rooms if the user has no favorite songs", async () => {
			const mockRooms = [{ room_id: "1" }, { room_id: "2" }];
			const mockRoomSongs = [
				{ audio_features: "feature1" },
				{ audio_features: "feature2" },
			];
			const mockRoomDtos = [{ id: "1" }, { id: "2" }];

			jest
				.spyOn(prismaService.room, "findMany")
				.mockResolvedValue(mockRooms as any);
			jest
				.spyOn(dbUtilsService, "getRoomSongs")
				.mockResolvedValue(mockRoomSongs as any);
			jest.spyOn(dbUtilsService, "getUserFavoriteSongs").mockResolvedValue([]);
			jest
				.spyOn(dtoGenService, "generateMultipleRoomDto")
				.mockResolvedValue(mockRoomDtos as any);
			jest
				.spyOn(mockRecommendationsService, "getTopPlaylists")
				.mockReturnValue([]);

			const result = await usersService.getRecommendedRooms("user1");
			expect(result).toEqual(mockRoomDtos);
		});

		it("should return recommended rooms if the user has favorite songs", async () => {
			const mockRooms = [{ room_id: "1" }, { room_id: "2" }];
			const mockRoomSongs = [
				{ audio_features: "feature1" },
				{ audio_features: "feature2" },
			];
			const mockFavoriteSongs = [{ audio_features: "feature1" }];
			const mockRecommendedRooms = [{ playlist: "1" }];
			const mockRoomDtos = [{ id: "1" }];

			jest
				.spyOn(prismaService.room, "findMany")
				.mockResolvedValue(mockRooms as any);
			jest
				.spyOn(dbUtilsService, "getRoomSongs")
				.mockResolvedValue(mockRoomSongs as any);
			jest
				.spyOn(dbUtilsService, "getUserFavoriteSongs")
				.mockResolvedValue(mockFavoriteSongs as any);
			jest
				.spyOn(mockRecommendationsService, "getTopPlaylists")
				.mockReturnValue(mockRecommendedRooms as any);
			jest
				.spyOn(dtoGenService, "generateMultipleRoomDto")
				.mockResolvedValue(mockRoomDtos as any);

			const result = await usersService.getRecommendedRooms("user1");
			expect(result).toEqual(mockRoomDtos);
		});
	});
	describe("getUserFriends", () => {
		it('should return a list of friends with relationship set to "friend"', async () => {
			const mockFriends = [
				{ friend1: "user1", friend2: "user2", is_pending: false },
				{ friend1: "user3", friend2: "user1", is_pending: false },
			];
			const mockUserDtos = [
				{ id: "user2", relationship: "friend" },
				{ id: "user3", relationship: "friend" },
			];

			jest
				.spyOn(prismaService.friends, "findMany")
				.mockResolvedValue(mockFriends as any);
			jest
				.spyOn(dtoGenService, "generateMultipleUserDto")
				.mockResolvedValue(mockUserDtos as any);

			const result = await usersService.getUserFriends("user1");
			expect(result).toEqual(mockUserDtos);
		});
	});
	describe("rejectFriendRequest", () => {
		it("should return true when a friend request is successfully rejected", async () => {
			const mockUsers = [
				{
					user_id: "user1",
					username: "username",
					bio: null,
					profile_picture: null,
					activity: {},
					preferences: {},
					full_name: null,
					external_links: {},
					email: null,
				},
				{
					user_id: "rejectedUsername",
					username: "rejectedUsername",
					bio: null,
					profile_picture: null,
					activity: {},
					preferences: {},
					full_name: null,
					external_links: {},
					email: null,
				},
				{
					user_id: "friend1",
					username: "friend1",
					bio: null,
					profile_picture: null,
					activity: {},
					preferences: {},
					full_name: null,
					external_links: {},
					email: null,
				},
			];
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValue(true);
			jest
				.spyOn(prismaService.users, "findFirst")
				.mockResolvedValue(mockUsers[2] as any);
			jest
				.spyOn(prismaService.friends, "deleteMany")
				.mockResolvedValue({ count: 1 });

			const result = await usersService.rejectFriendRequest(
				"user1",
				"rejectedUsername",
			);
			expect(result).toBe(true);
		});

		it("should throw an error if the user does not exist", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValue(false);

			await expect(
				usersService.rejectFriendRequest("user1", "rejectedUsername"),
			).rejects.toThrow(HttpException);
		});

		it("should throw an error if the friend does not exist", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValue(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue(null);

			await expect(
				usersService.rejectFriendRequest("user1", "rejectedUsername"),
			).rejects.toThrow(HttpException);
		});

		it("should throw an error if the user tries to reject themselves", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValue(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "user1",
				username: "username",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			} as any);
			await expect(
				usersService.rejectFriendRequest("user1", "rejectedUsername"),
			).rejects.toThrow(HttpException);
		});

		it("should throw an error if no pending friend request is found", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValue(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "friend1",
				username: "username",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			});
			jest
				.spyOn(prismaService.friends, "deleteMany")
				.mockResolvedValue({ count: 0 });

			await expect(
				usersService.rejectFriendRequest("user1", "rejectedUsername"),
			).rejects.toThrow(HttpException);
		});
	});
	describe("acceptFriendRequest", () => {
		it("should return true when a friend request is successfully accepted", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValue(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "friend1",
				username: "username",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			} as any);
			jest
				.spyOn(prismaService.friends, "updateMany")
				.mockResolvedValue({ count: 1 });

			const result = await usersService.acceptFriendRequest(
				"user1",
				"friendUsername",
			);
			expect(result).toBe(true);
		});

		it("should throw an error if the user does not exist", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValue(false);

			await expect(
				usersService.acceptFriendRequest("user1", "friendUsername"),
			).rejects.toThrow(HttpException);
		});

		it("should throw an error if the friend does not exist", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValue(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue(null);

			await expect(
				usersService.acceptFriendRequest("user1", "friendUsername"),
			).rejects.toThrow(Error);
		});

		it("should throw an error if the user tries to accept themselves", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValue(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "user1",
				username: "username",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			} as any);

			await expect(
				usersService.acceptFriendRequest("user1", "friendUsername"),
			).rejects.toThrow(HttpException);
		});

		it("should throw an error if no pending friend request is found", async () => {
			jest.spyOn(dbUtilsService, "userExists").mockResolvedValue(true);
			jest.spyOn(prismaService.users, "findFirst").mockResolvedValue({
				user_id: "userID",
				username: "username",
				bio: null,
				profile_picture: null,
				activity: {},
				preferences: {},
				full_name: null,
				external_links: {},
				email: null,
			} as any);
			jest
				.spyOn(prismaService.friends, "updateMany")
				.mockResolvedValue({ count: 0 });

			await expect(
				usersService.acceptFriendRequest("user1", "friendUsername"),
			).rejects.toThrow(HttpException);
		});
	});
	describe("UsersService Update Functionality", () => {
		let service: UsersService;
		let dtoGen: DtoGenService;

		beforeEach(async () => {
			const module: TestingModule = await createUsersUpdateTestingModule();
			service = module.get<UsersService>(UsersService);
			dtoGen = module.get<DtoGenService>(DtoGenService);
		});

		afterEach(async () => {
			await service.updateProfile(mockUserDto.userID, mockUserDto);
		}, 50000);

		it("updates profile", async () => {
			const mockUpdate: UpdateUserDto = {
				profile_name: "Tester",
				userID: "812cd228-0031-70f9-4b63-e95752e43dad",
				username: "testing",
				profile_picture_url:
					"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-18T14:52:53.386Z-image.jpeg",
				links: {
					count: 2,
					data: {
						instagram: ["instagram.com", "instagram.com/adventurous_epoch"],
					},
				},
				bio: "",
				fav_genres: {
					count: 1,
					data: ["j-pop"],
				},
				fav_songs: {
					count: 1,
					data: [
						{
							songID: "token",
							title: "STYX HELIX",
							artists: ["MYTH & ROID"],
							cover:
								"https://i.scdn.co/image/ab67616d0000b273bf97b2acaf967bb8ee7aa2f6",
							spotify_id: "2tcSz3bcJqriPg9vetvJLs",
							duration: 289,
						},
					],
				},
			};

			await service.updateProfile(mockUserDto.userID, mockUpdate);
			const result = await dtoGen.generateUserDto(mockUserDto.userID);

			expect(result.profile_name).toBe("Tester");
			expect(result.username).toBe("testing");
			expect(result.links.data).toEqual({
				instagram: ["instagram.com", "instagram.com/adventurous_epoch"],
			});
			expect(result.fav_genres.data).toEqual(["j-pop"]);
			expect(result.fav_songs.data[0]?.title).toBe("STYX HELIX");
		}, 50000);
	});

	describe("UsersService", () => {
		it("should throw an error if user does not exist", async () => {
			jest.spyOn(prismaService.users, "findUnique").mockResolvedValue(null);

			await expect(
				usersService.getRecommendedUsers("nonexistentUserID"),
			).rejects.toThrow("User does not exist");
		});

		it("should return recommendations if user exists but has no friends", async () => {
			const mockUser = { user_id: "userID" } as PrismaTypes.users;
			jest.spyOn(prismaService.users, "findUnique").mockResolvedValue(mockUser);
			jest.spyOn(prismaService.users, "findMany").mockResolvedValue([mockUser]);
			jest.spyOn(dbUtilsService, "getUserFollowing").mockResolvedValue([]);
			jest.spyOn(usersService, "calculateMutualFriends").mockResolvedValue(0);
			jest.spyOn(usersService, "calculatePopularity").mockResolvedValue(0);
			jest.spyOn(usersService, "calculateActivity").mockResolvedValue(0);
			jest.spyOn(usersService, "calculateGenreSimilarity").mockResolvedValue(0);
			jest
				.spyOn(dtoGenService, "generateMultipleUserDto")
				.mockResolvedValue([]);

			const result = await usersService.getRecommendedUsers("userID");
			expect(result).toEqual([]);
		});

		it("should return recommendations if user exists and has friends", async () => {
			const mockUser = { user_id: "userID" } as PrismaTypes.users;
			const mockFriend = { user_id: "friendID" } as PrismaTypes.users;
			jest.spyOn(prismaService.users, "findUnique").mockResolvedValue(mockUser);
			jest
				.spyOn(prismaService.users, "findMany")
				.mockResolvedValue([mockUser, mockFriend]);
			jest
				.spyOn(dbUtilsService, "getUserFollowing")
				.mockResolvedValue([mockFriend]);
			jest.spyOn(usersService, "calculateMutualFriends").mockResolvedValue(1);
			jest.spyOn(usersService, "calculatePopularity").mockResolvedValue(1);
			jest.spyOn(usersService, "calculateActivity").mockResolvedValue(1);
			jest.spyOn(usersService, "calculateGenreSimilarity").mockResolvedValue(1);
			jest
				.spyOn(dtoGenService, "generateMultipleUserDto")
				.mockResolvedValue([]);

			const result = await usersService.getRecommendedUsers("userID");
			expect(result).toEqual([]);
		});

		it("should return top 5 recommendations if user exists, has friends, and recommendations are generated", async () => {
			const mockUser = { user_id: "userID" } as PrismaTypes.users;
			const mockFriend = { user_id: "friendID" } as PrismaTypes.users;
			const mockRecommendedUser = {
				user_id: "recommendedUserID",
			} as PrismaTypes.users;
			jest.spyOn(prismaService.users, "findUnique").mockResolvedValue(mockUser);
			jest
				.spyOn(prismaService.users, "findMany")
				.mockResolvedValue([mockUser, mockFriend, mockRecommendedUser]);
			jest
				.spyOn(dbUtilsService, "getUserFollowing")
				.mockResolvedValue([mockFriend]);
			jest.spyOn(usersService, "calculateMutualFriends").mockResolvedValue(1);
			jest.spyOn(usersService, "calculatePopularity").mockResolvedValue(1);
			jest.spyOn(usersService, "calculateActivity").mockResolvedValue(1);
			jest.spyOn(usersService, "calculateGenreSimilarity").mockResolvedValue(1);
			jest
				.spyOn(dtoGenService, "generateMultipleUserDto")
				.mockResolvedValue([
					{ user_id: "recommendedUserID" } as unknown as UserDto,
				]);

			const result = await usersService.getRecommendedUsers("userID");
			expect(result).toEqual([
				{ user_id: "recommendedUserID" } as unknown as UserDto,
			]);
		});
	});
	describe("calculateGenreSimilarity", () => {
		it("should return genre similarity percentage between two users", async () => {
			const mockUserID1 = "userID1";
			const mockUserID2 = "userID2";
			const mockGenresUser1: PrismaTypes.favorite_genres[] = [
				{
					favorite_id: "favorite_id1",
					user_id: mockUserID1,
					genre_id: "genre1",
				},
				{
					favorite_id: "favorite_id2",
					user_id: mockUserID1,
					genre_id: "genre2",
				},
			];
			const mockGenresUser2: PrismaTypes.favorite_genres[] = [
				{
					favorite_id: "favorite_id3",
					user_id: mockUserID2,
					genre_id: "genre2",
				},
				{
					favorite_id: "favorite_id4",
					user_id: mockUserID2,
					genre_id: "genre3",
				},
			];

			jest
				.spyOn(prismaService.favorite_genres, "findMany")
				.mockResolvedValueOnce(mockGenresUser1)
				.mockResolvedValueOnce(mockGenresUser2);

			const result = await usersService.calculateGenreSimilarity(
				mockUserID1,
				mockUserID2,
			);

			expect(result).toBe(25); // (1 common genre / (2 + 2) genres) * 100
			expect(prismaService.favorite_genres.findMany).toHaveBeenCalledWith({
				where: { user_id: mockUserID1 },
			});
			expect(prismaService.favorite_genres.findMany).toHaveBeenCalledWith({
				where: { user_id: mockUserID2 },
			});
		});

		it("should return 0 if no common genres are found", async () => {
			const mockUserID1 = "userID1";
			const mockUserID2 = "userID2";
			const mockGenresUser1: PrismaTypes.favorite_genres[] = [
				{
					favorite_id: "favorite_id1",
					user_id: mockUserID1,
					genre_id: "genre1",
				},
			];
			const mockGenresUser2: PrismaTypes.favorite_genres[] = [
				{
					favorite_id: "favorite_id2",
					user_id: mockUserID2,
					genre_id: "genre2",
				},
			];

			jest
				.spyOn(prismaService.favorite_genres, "findMany")
				.mockResolvedValueOnce(mockGenresUser1)
				.mockResolvedValueOnce(mockGenresUser2);

			const result = await usersService.calculateGenreSimilarity(
				mockUserID1,
				mockUserID2,
			);

			expect(result).toBe(0);
		});
	});
	describe("calculateActivity", () => {
		it("should return the correct activity score", async () => {
			const mockUserID = "userID1";
			const mockRooms: RoomDto[] = [
				{ room_id: "room1" } as unknown as RoomDto,
				{ room_id: "room2" } as unknown as RoomDto,
			];
			const mockFriends: PrismaTypes.users[] = [
				{ user_id: "friend1" } as PrismaTypes.users,
				{ user_id: "friend2" } as PrismaTypes.users,
			];
			const mockBookmarks: RoomDto[] = [
				{ room_id: "bookmark1" } as unknown as RoomDto,
				{ room_id: "bookmark2" } as unknown as RoomDto,
			];
			const mockMessages: PrismaTypes.message[] = [
				{ message_id: "message1" } as PrismaTypes.message,
				{ message_id: "message2" } as PrismaTypes.message,
			];
			const mockRoomMessages: PrismaTypes.room_message[] = [
				{ message_id: "message1" } as PrismaTypes.room_message,
				{ message_id: "message2" } as PrismaTypes.room_message,
			];

			jest.spyOn(usersService, "getUserRooms").mockResolvedValue(mockRooms);
			jest
				.spyOn(dbUtilsService, "getUserFriends")
				.mockResolvedValue(mockFriends);
			jest
				.spyOn(usersService, "getBookmarksById")
				.mockResolvedValue(mockBookmarks);
			jest
				.spyOn(prismaService.message, "findMany")
				.mockResolvedValue(mockMessages);
			jest
				.spyOn(prismaService.room_message, "findMany")
				.mockResolvedValue(mockRoomMessages);

			const result = await usersService.calculateActivity(mockUserID);

			expect(result).toBe(
				mockRooms.length +
					mockFriends.length +
					mockBookmarks.length +
					mockMessages.length +
					mockRoomMessages.length,
			);
		});

		it("should throw an error if no friends are found", async () => {
			const mockUserID = "userID1";

			jest.spyOn(usersService, "getUserRooms").mockResolvedValue([]);
			jest.spyOn(dbUtilsService, "getUserFriends").mockResolvedValue(null);
			jest.spyOn(usersService, "getBookmarksById").mockResolvedValue([]);
			jest.spyOn(prismaService.message, "findMany").mockResolvedValue([]);
			jest.spyOn(prismaService.room_message, "findMany").mockResolvedValue([]);

			await expect(usersService.calculateActivity(mockUserID)).rejects.toThrow(
				"Failed to calculate activity (no friends)",
			);
		});
	});
	describe("calculatePopularity", () => {
		it("should return the correct popularity score", async () => {
			const mockUserID = "userID1";
			const mockFollowers: PrismaTypes.users[] = [
				{ user_id: "follower1" } as PrismaTypes.users,
				{ user_id: "follower2" } as PrismaTypes.users,
			];
			const mockFollowing: PrismaTypes.users[] = [
				{ user_id: "following1" } as PrismaTypes.users,
			];
			const mockUsers: PrismaTypes.users[] = [
				{ user_id: "user1" } as PrismaTypes.users,
				{ user_id: "user2" } as PrismaTypes.users,
				{ user_id: "user3" } as PrismaTypes.users,
			];

			jest
				.spyOn(dbUtilsService, "getUserFollowers")
				.mockResolvedValue(mockFollowers);
			jest
				.spyOn(dbUtilsService, "getUserFollowing")
				.mockResolvedValue(mockFollowing);
			jest.spyOn(prismaService.users, "findMany").mockResolvedValue(mockUsers);

			const result = await usersService.calculatePopularity(mockUserID);

			const expectedPopularity =
				(mockFollowers.length / (mockFollowing.length + 1)) *
				Math.log(mockUsers.length);
			expect(result).toBe(expectedPopularity);
		});
	});
	describe("calculateMutualFriends", () => {
		it("should return the correct number of mutual friends", async () => {
			const mockUserID1 = "userID1";
			const mockUserID2 = "userID2";
			const mockMutualFriends: PrismaTypes.users[] = [
				{ user_id: "friend1" } as PrismaTypes.users,
				{ user_id: "friend2" } as PrismaTypes.users,
			];

			jest
				.spyOn(dbUtilsService, "getMutualFriends")
				.mockResolvedValue(mockMutualFriends);

			const result = await usersService.calculateMutualFriends(
				mockUserID1,
				mockUserID2,
			);

			expect(result).toBe(mockMutualFriends.length);
			expect(dbUtilsService.getMutualFriends).toHaveBeenCalledWith(
				mockUserID1,
				mockUserID2,
			);
		});

		it("should throw an error if mutual friends are not found", async () => {
			const mockUserID1 = "userID1";
			const mockUserID2 = "userID2";

			jest.spyOn(dbUtilsService, "getMutualFriends").mockResolvedValue(null);

			await expect(
				usersService.calculateMutualFriends(mockUserID1, mockUserID2),
			).rejects.toThrow("Failed to calculate mutual friends");
		});
	});
});
