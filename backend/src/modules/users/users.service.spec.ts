import { TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { createUsersUpdateTestingModule } from "../../../jest_mocking/module-mocking";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { UserDto } from "../users/dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";
// import { MockContext, Context, createMockContext } from "../../../context";
import { PrismaService } from "prisma/prisma.service";
import { UpdateUserDto } from "./dto/updateuser.dto";

const mockUserDto: UserDto = {
	profile_name: "Testing",
	userID: "812cd228-0031-70f9-4b63-e95752e43dad",
	username: "Test",
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
	let prisma: PrismaService;

	beforeEach(async () => {
		const module: TestingModule = await createUsersUpdateTestingModule();
		service = module.get<UsersService>(UsersService);
		dtoGen = module.get<DtoGenService>(DtoGenService);
	});

	afterEach(async () => {
		await service.updateProfile(mockUserDto.userID, mockUserDto);
	});

	it("updates profile", async () => {
		// mockCtx.prisma.$queryRaw.mockResolvedValue([]);
		const mockUpdate: UpdateUserDto = {
			profile_name: "Tester",
			userID: "812cd228-0031-70f9-4b63-e95752e43dad",
			username: "Testing",
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
						start_time: null,
					},
				],
			},
		};

		await service.updateProfile(mockUserDto.userID, mockUpdate);
		const result = await dtoGen.generateUserDto(mockUserDto.userID);

		expect(result.profile_name).toBe("Tester");
		expect(result.username).toBe("Testing");
		expect(result.links.data).toEqual({
			instagram: ["instagram.com", "instagram.com/adventurous_epoch"],
		});
		expect(result.fav_genres.data).toEqual(["j-pop"]);
		expect(result.fav_songs.data[0]?.title).toBe("STYX HELIX");
	});
});
