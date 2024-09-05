import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { ConfigService } from "@nestjs/config";
import { mockPrismaService } from "../../../jest_mocking/service-mocking";

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
					useValue: {
						userExists: jest.fn(),
						isFollowing: jest.fn(),
					},
				},
				{
					provide: DtoGenService,
					useValue: {
						// Mock DtoGenService methods if needed
					},
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
});
