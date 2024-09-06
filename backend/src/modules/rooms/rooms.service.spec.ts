import { TestingModule } from "@nestjs/testing";
import { RoomsService } from "./rooms.service"; // Adjust import based on file structure
import { createRoomsTestingModule } from "../../../jest_mocking/module-mocking";
import { DbUtilsService } from "../db-utils/db-utils.service";
import {
	mockConfigService,
	mockPrismaService,
} from "../../../jest_mocking/service-mocking";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { HttpException, HttpStatus } from "@nestjs/common";
import { UserDto } from "../users/dto/user.dto";
import { RoomDto } from "./dto/room.dto";

describe("RoomsService", () => {
	let service: RoomsService;
	let dbUtils: DbUtilsService;
	let dtogen: DtoGenService;

	beforeEach(async () => {
		jest.resetAllMocks();
		const module: TestingModule = await createRoomsTestingModule();
		service = module.get<RoomsService>(RoomsService);
		dbUtils = module.get<DbUtilsService>(DbUtilsService);
		dtogen = module.get<DtoGenService>(DtoGenService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("updateRoomInfo", () => {
		it("should update room information and return the updated room", async () => {
			// Arrange
			const userID = "user123";
			const user: UserDto = {
				userID: userID,
				profile_name: "",
				username: "",
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
					data: {},
				},
				bio: "",
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
			const roomID = "room123";
			const updateRoomDto = {
				room_name: "New Room Name",
				description: "New Room Description",
				room_image: "new-room-image.jpg",
				has_explicit_content: true,
				language: "English",
			};
			jest.spyOn(mockConfigService, "get").mockReturnValue("test-salt");
			const userExistsMock = jest
				.spyOn(dbUtils, "userExists")
				.mockResolvedValue(true);
			const roomExistsMock = jest
				.spyOn(dbUtils, "roomExists")
				.mockResolvedValue(true);
			const findFirstMock = jest
				.spyOn(mockPrismaService.room, "findFirst")
				.mockResolvedValue({
					room_id: roomID,
					room_creator: userID,
					name: "Old Room Name",
					description: "Old Room Description",
					playlist_photo: "old-room-image.jpg",
					explicit: false,
					nsfw: false,
					room_language: "Spanish",
				});
			const updateMock = jest
				.spyOn(mockPrismaService.room, "update")
				.mockResolvedValue({
					room_id: roomID,
					name: updateRoomDto.room_name,
					description: updateRoomDto.description,
					playlist_photo: updateRoomDto.room_image,
					explicit: updateRoomDto.has_explicit_content,
					nsfw: updateRoomDto.has_explicit_content,
					room_language: updateRoomDto.language,
				});
			const generateRoomDtoFromRoomMock = jest
				.spyOn(dtogen, "generateRoomDtoFromRoom")
				.mockResolvedValueOnce({
					roomID: roomID,
					creator: user,
					room_name: updateRoomDto.room_name,
					description: updateRoomDto.description,
					room_image: updateRoomDto.room_image,
					has_explicit_content: updateRoomDto.has_explicit_content,
					has_nsfw_content: updateRoomDto.has_explicit_content,
					language: updateRoomDto.language,
					participant_count: 0,
					is_private: false,

					is_scheduled: false,
					is_temporary: false,
					tags: [],
					childrenRoomIDs: [],
				});

			// Act
			const result = await service.updateRoomInfo(
				userID,
				roomID,
				updateRoomDto,
			);

			// Assert
			expect(userExistsMock).toHaveBeenCalledWith(userID);
			expect(findFirstMock).toHaveBeenCalledWith({
				where: {
					room_id: roomID,
				},
			});
			expect(updateMock).toHaveBeenCalledWith({
				where: {
					room_id: roomID,
				},
				data: {
					room_id: roomID,
					name: updateRoomDto.room_name,
					description: updateRoomDto.description,
					playlist_photo: updateRoomDto.room_image,
					explicit: updateRoomDto.has_explicit_content,
					nsfw: updateRoomDto.has_explicit_content,
					room_language: updateRoomDto.language,
				},
			});
			expect(generateRoomDtoFromRoomMock).toHaveBeenCalledWith({
				room_id: roomID,
				name: updateRoomDto.room_name,
				description: updateRoomDto.description,
				playlist_photo: updateRoomDto.room_image,
				explicit: updateRoomDto.has_explicit_content,
				nsfw: updateRoomDto.has_explicit_content,
				room_language: updateRoomDto.language,
			});
			const response: RoomDto = {
				roomID: roomID,
				room_name: updateRoomDto.room_name,
				description: updateRoomDto.description,
				room_image: updateRoomDto.room_image,
				has_explicit_content: updateRoomDto.has_explicit_content,
				has_nsfw_content: updateRoomDto.has_explicit_content,
				language: updateRoomDto.language,
				creator: {
					bio: "",
					fav_genres: {
						count: 0,
						data: [],
					},
					fav_rooms: {
						count: 0,
						data: [],
					},
					fav_songs: {
						count: 0,
						data: [],
					},
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
						data: {},
					},
					profile_name: "",
					profile_picture_url: "",
					recent_rooms: {
						count: 0,
						data: [],
					},
					userID: "user123",
					username: "",
				},
				participant_count: 0,
				is_temporary: false,
				is_private: false,
				is_scheduled: false,
				tags: [],
				childrenRoomIDs: [],
			};
			expect(result).toEqual(response);
		});

		it("should throw an error if the user does not exist", async () => {
			// Arrange
			const userID = "user123";
			const roomID = "room123";
			const updateRoomDto = {
				room_name: "New Room Name",
				description: "New Room Description",
				room_image: "new-room-image.jpg",
				has_explicit_content: true,
				language: "English",
			};

			const userExistsMock = jest
				.spyOn(dbUtils, "userExists")
				.mockResolvedValue(false);

			// Act and Assert
			await expect(
				service.updateRoomInfo(userID, roomID, updateRoomDto),
			).rejects.toThrow(
				new HttpException("User does not exist", HttpStatus.NOT_FOUND),
			);
			expect(userExistsMock).toHaveBeenCalledWith(userID);
		});

		it("should throw an error if the room does not exist", async () => {
			// Arrange
			const userID = "user123";
			const roomID = "room123";
			const updateRoomDto = {
				room_name: "New Room Name",
				description: "New Room Description",
				room_image: "new-room-image.jpg",
				has_explicit_content: true,
				language: "English",
			};

			const userExistsMock = jest
				.spyOn(dbUtils, "userExists")
				.mockResolvedValue(true);
			const roomExistsMock = jest
				.spyOn(dbUtils, "roomExists")
				.mockResolvedValue(false);

			// Act and Assert
			await expect(
				service.updateRoomInfo(userID, roomID, updateRoomDto),
			).rejects.toThrow(
				new HttpException("Room does not exist", HttpStatus.NOT_FOUND),
			);
			expect(userExistsMock).toHaveBeenCalledWith(userID);
		});

		it("should throw an error if the user is not the owner of the room", async () => {
			// Arrange
			const userID = "user123";
			const roomID = "room123";
			const updateRoomDto = {
				room_name: "New Room Name",
				description: "New Room Description",
				room_image: "new-room-image.jpg",
				has_explicit_content: true,
				language: "English",
			};

			const userExistsMock = jest
				.spyOn(dbUtils, "userExists")
				.mockResolvedValue(true);
			const roomExistsMock = jest
				.spyOn(dbUtils, "roomExists")
				.mockResolvedValue(true);
			const findFirstMock = jest
				.spyOn(mockPrismaService.room, "findFirst")
				.mockResolvedValue({
					room_id: roomID,
					room_creator: "otherUser",
					name: "Old Room Name",
					description: "Old Room Description",
					playlist_photo: "old-room-image.jpg",
					explicit: false,
					nsfw: false,
					room_language: "Spanish",
				});

			// Act and Assert
			await expect(
				service.updateRoomInfo(userID, roomID, updateRoomDto),
			).rejects.toThrow(
				new HttpException(
					"User is not the owner of the room",
					HttpStatus.FORBIDDEN,
				),
			);
			expect(userExistsMock).toHaveBeenCalledWith(userID);
			expect(findFirstMock).toHaveBeenCalledWith({
				where: {
					room_id: roomID,
				},
			});
		});
	});
});
