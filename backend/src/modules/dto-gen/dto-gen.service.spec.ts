import { TestingModule } from "@nestjs/testing";
import { DtoGenService } from "./dto-gen.service";
import { createDtoGenTestingModule } from "../../../jest_mocking/module-mocking";
import { mockPrismaService } from "../../../jest_mocking/service-mocking";
import * as PrismaTypes from "@prisma/client";

describe("DtoGenService", () => {
	let service: DtoGenService;

	beforeEach(async () => {
		const module: TestingModule = await createDtoGenTestingModule();
		service = module.get<DtoGenService>(DtoGenService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	/*
	describe("generateUserDto", () => {
		it("should generate a UserDto object from a valid user ID", async () => {
			// Arrange
			const userID = "123e4567-e89b-12d3-a456-426614174000";
			const fully_qualify = true;

			// Mock for PrismaTypes.users
			const mockUser: PrismaTypes.users = {
				user_id: userID,
				full_name: "John Doe",
				email: "john.doe@example.com",
				preferences: JSON.stringify({
					fav_genres: ["rock", "pop"],
					fav_songs: [
						{ songId: "song1", title: "Song One" },
						{ songId: "song2", title: "Song Two" },
					],
				}),
				external_links: JSON.stringify({
					data: ["http://link1.com", "http://link2.com"],
				}),
				activity: JSON.stringify({
					recent_rooms: ["room1", "room2"],
				}),
				username: "",
				bio: null,
				profile_picture: null,
			};
			const mockUsers: PrismaTypes.users[] = [
				mockUser,
				{
					user_id: "user2",
					full_name: "Jane Smith",
					email: "jane.smith@example.com",
					preferences: JSON.stringify({
						fav_genres: ["jazz", "blues"],
						fav_songs: [
							{ songId: "song3", title: "Song Three" },
							{ songId: "song4", title: "Song Four" },
						],
					}),
					external_links: JSON.stringify({
						data: ["http://link3.com", "http://link4.com"],
						count: 0,
					}),
					activity: JSON.stringify({
						recent_rooms: ["room3", "room4"],
					}),
					username: "",
					bio: null,
					profile_picture: null,
				},
			];

			// Mock for PrismaTypes.follows
			const mockFollows: PrismaTypes.follows[] = [
				{
					follower: "user1",
					followee: "user2",
					date_followed: new Date(),
					follows_id: "",
				},
				{
					follower: "user2",
					followee: "user1",
					date_followed: new Date(),
					follows_id: "",
				},
			];

			// Mock for PrismaTypes.room
			const mockRooms: PrismaTypes.room[] = [
				{
					room_id: "room1",
					name: "Room One",
					description: "This is room one",
					room_creator: "",
					playlist_photo: null,
					date_created: new Date(),
					nsfw: false,
					is_temporary: null,
					room_language: null,
					explicit: null,
					tags: [],
				},
				{
					room_id: "room2",
					name: "Room Two",
					description: "This is room two",
					room_creator: "",
					playlist_photo: null,
					date_created: new Date(),
					nsfw: false,
					is_temporary: null,
					room_language: null,
					explicit: null,
					tags: [],
				},
			];

			// Mock for PrismaTypes.public_room
			const mockPublicRooms: PrismaTypes.public_room[] = [{ room_id: "room1" }];

			// Mock for PrismaTypes.private_room
			const mockPrivateRooms: PrismaTypes.private_room[] = [
				{
					room_id: "room2",
					is_listed: false,
				},
			];
			jest
				.spyOn(mockPrismaService.users, "findUnique")
				.mockResolvedValue(mockUser);
			jest
				.spyOn(mockPrismaService.users, "findMany")
				.mockResolvedValue(mockUsers);
			jest.spyOn(mockPrismaService.bookmark, "findMany").mockResolvedValue([]);

			// Act
			const result = await service.generateUserDto(userID, fully_qualify);

			// Assert
			expect(result).toBeDefined();
			expect(result).toHaveProperty("userID", userID);
			expect(result).toHaveProperty("profile_name");
			expect(result).toHaveProperty("username");
			expect(result).toHaveProperty("profile_picture_url");
			expect(result).toHaveProperty("followers");
			expect(result).toHaveProperty("following");
			expect(result).toHaveProperty("links");
			expect(result).toHaveProperty("bio");
			expect(result).toHaveProperty("current_song");
			expect(result).toHaveProperty("fav_genres");
			expect(result).toHaveProperty("fav_songs");
			expect(result).toHaveProperty("fav_rooms");
			expect(result).toHaveProperty("recent_rooms");
		});

		it("should throw an error if the user ID does not exist", async () => {
			// Arrange
			const userID = "nonexistentUser";
			const fully_qualify = true;
			jest.spyOn(mockPrismaService.users, "findUnique").mockResolvedValue(null);

			// Act and Assert
			await expect(
				service.generateUserDto(userID, fully_qualify),
			).rejects.toThrow("User with id " + userID + " does not exist");
		});
	});
	*/
});
