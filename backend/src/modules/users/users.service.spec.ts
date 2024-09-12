import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { createUsersUpdateTestingModule } from "../../../jest_mocking/module-mocking";
import { mockUsersService } from "../../../jest_mocking/service-mocking";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { UserDto } from "../users/dto/user.dto";
// import { RoomDto } from "../rooms/dto/room.dto";
// import { PrismaService } from "prisma/prisma.service";
import { UpdateUserDto } from "./dto/updateuser.dto";
import * as PrismaTypes from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { RecommendationsService } from "../../../src/recommendations/recommendations.service";
import { ConfigService } from "@nestjs/config";

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
	let service: UsersService;
	let prisma: PrismaService;
	let dbUtils: DbUtilsService;
	let dtogen: DtoGenService;
	const userService = mockUsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				PrismaService,
				DbUtilsService,
				DtoGenService,
				RecommendationsService,
				ConfigService,
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
		prisma = module.get<PrismaService>(PrismaService);
		dbUtils = module.get<DbUtilsService>(DbUtilsService);
		dtogen = module.get<DtoGenService>(DtoGenService);
	});

	it("should throw an error if user does not exist", async () => {
		jest.spyOn(prisma.users, "findUnique").mockResolvedValue(null);

		await expect(
			service.getRecommendedUsers("nonexistentUserID"),
		).rejects.toThrow("User does not exist");
	});

	it("should return recommendations if user exists but has no friends", async () => {
		const mockUser = { user_id: "userID" } as PrismaTypes.users;
		jest.spyOn(prisma.users, "findUnique").mockResolvedValue(mockUser);
		jest.spyOn(prisma.users, "findMany").mockResolvedValue([mockUser]);
		jest.spyOn(dbUtils, "getUserFollowing").mockResolvedValue(null);
		jest.spyOn(userService, "calculateMutualFriends").mockResolvedValue(0);
		jest.spyOn(userService, "calculatePopularity").mockResolvedValue(0);
		jest.spyOn(userService, "calculateActivity").mockResolvedValue(0);
		jest.spyOn(userService, "calculateGenreSimilarity").mockResolvedValue(0);
		jest.spyOn(dtogen, "generateMultipleUserDto").mockResolvedValue([]);

		const result = await service.getRecommendedUsers("userID");
		expect(result).toEqual([]);
	});

	it("should return recommendations if user exists and has friends", async () => {
		const mockUser = { user_id: "userID" } as PrismaTypes.users;
		const mockFriend = { user_id: "friendID" } as PrismaTypes.users;
		jest.spyOn(prisma.users, "findUnique").mockResolvedValue(mockUser);
		jest
			.spyOn(prisma.users, "findMany")
			.mockResolvedValue([mockUser, mockFriend]);
		jest.spyOn(dbUtils, "getUserFollowing").mockResolvedValue([mockFriend]);
		jest.spyOn(userService, "calculateMutualFriends").mockResolvedValue(1);
		jest.spyOn(userService, "calculatePopularity").mockResolvedValue(1);
		jest.spyOn(userService, "calculateActivity").mockResolvedValue(1);
		jest.spyOn(userService, "calculateGenreSimilarity").mockResolvedValue(1);
		jest.spyOn(dtogen, "generateMultipleUserDto").mockResolvedValue([]);

		const result = await service.getRecommendedUsers("userID");
		expect(result).toEqual([]);
	});

	it("should return top 5 recommendations if user exists, has friends, and recommendations are generated", async () => {
		const mockUser = { user_id: "userID" } as PrismaTypes.users;
		const mockFriend = { user_id: "friendID" } as PrismaTypes.users;
		const mockRecommendedUser = {
			user_id: "recommendedUserID",
		} as PrismaTypes.users;
		jest.spyOn(prisma.users, "findUnique").mockResolvedValue(mockUser);
		jest
			.spyOn(prisma.users, "findMany")
			.mockResolvedValue([mockUser, mockFriend, mockRecommendedUser]);
		jest.spyOn(dbUtils, "getUserFollowing").mockResolvedValue([mockFriend]);
		jest.spyOn(userService, "calculateMutualFriends").mockResolvedValue(1);
		jest.spyOn(userService, "calculatePopularity").mockResolvedValue(1);
		jest.spyOn(userService, "calculateActivity").mockResolvedValue(1);
		jest.spyOn(userService, "calculateGenreSimilarity").mockResolvedValue(1);
		jest
			.spyOn(dtogen, "generateMultipleUserDto")
			.mockResolvedValue([
				{ user_id: "recommendedUserID" } as unknown as UserDto,
			]);

		const result = await service.getRecommendedUsers("userID");
		expect(result).toEqual([
			{ user_id: "recommendedUserID" } as unknown as UserDto,
		]);
	});
});
