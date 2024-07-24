import { TestingModule } from "@nestjs/testing";
import { SearchService } from "./search.service";
import { createSearchTestingModule } from "../../../jest_mocking/module-mocking";
import { prismaMock } from "../../../singleton";
// import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { UserDto } from "../users/dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";
// import { SearchHistoryDto } from "./dto/searchhistorydto";

jest.mock("../db-utils/db-utils.service");
jest.mock("../dto-gen/dto-gen.service");

const userMock = [
	{
		user_id: "01ece2d8-e091-7023-c1f2-d3399faa7071",
		username: "farmer 345",
		bio: "Music enthusiast who loves exploring new tunes across various genres. Always on the lookout for fresh beats and hidden gems!",
		profile_picture:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-06-23T13:23:20.848Z-image.jpeg",
		activity: { recent_rooms: [Array] },
		preferences: { fav_genres: [Array], fav_songs: [Array] },
		full_name: "Farmer23",
		external_links: { data: [Array] },
		email: "farmer345.jk@gmail.com",
		distance: 4,
	},
];
const uDtoMock = [
	{
		profile_name: "Farmer23",
		userID: "01ece2d8-e091-7023-c1f2-d3399faa7071",
		username: "farmer 345",
		profile_picture_url:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-06-23T13:23:20.848Z-image.jpeg",
		followers: {
			count: 2,
			data: [],
		},
		following: {
			count: 1,
			data: [],
		},
		links: {
			count: 2,
			data: [
				{
					type: "instagram",
					links: "instagram.com/farmer",
				},
				{
					type: "tiktok",
					links: "tiktok.com/farmer",
				},
			],
		},
		bio: "Music enthusiast who loves exploring new tunes across various genres. Always on the lookout for fresh beats and hidden gems!",
		current_song: {
			title: "",
			artists: [],
			cover: "",
			start_time: "2024-07-21T15:18:16.126Z",
		},
		fav_genres: {
			count: 2,
			data: ["Rock", "Indie"],
		},
		fav_songs: {
			count: 1,
			data: [
				{
					title: "Faster",
					artists: "Good Kid",
					cover:
						"https://store.goodkidofficial.com/cdn/shop/products/GoodKidAlbumCover.jpg?v=1528948601",
					start_time: "",
				},
			],
		},
		fav_rooms: {
			count: 0,
			data: [],
		},
		recent_rooms: {
			count: 0,
			data: [],
		},
	},
];
const roomMock = [
	{
		room_id: "66bb6bf7-25be-45af-bc38-7e7e258797b8",
		name: "chill vibes",
		description:
			"A room for relaxing and enjoying soothing music. Join us to unwind and chill with your favorite tunes.",
		username: "farmer 345",
		distance: 6,
	},
];
const rDtoMock = [
	{
		creator: {
			profile_name: "Farmer23",
			userID: "01ece2d8-e091-7023-c1f2-d3399faa7071",
			username: "farmer 345",
			profile_picture_url:
				"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-06-23T13:23:20.848Z-image.jpeg",
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
			bio: "Music enthusiast who loves exploring new tunes across various genres. Always on the lookout for fresh beats and hidden gems!",
			current_song: {
				title: "",
				artists: [],
				cover: "",
				start_time: "2024-07-22T10:18:22.486Z",
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
		},
		roomID: "66bb6bf7-25be-45af-bc38-7e7e258797b8",
		participant_count: 0,
		room_name: "chill vibes",
		description:
			"A room for relaxing and enjoying soothing music. Join us to unwind and chill with your favorite tunes.",
		is_temporary: false,
		is_private: false,
		is_scheduled: false,
		start_date: "2024-07-22T10:18:22.486Z",
		end_date: "2024-07-22T10:18:22.486Z",
		language: "English",
		has_explicit_content: true,
		has_nsfw_content: false,
		room_image: "https://ik.imagekit.io/ikmedia/backlit.jpg",
		current_song: {
			title: "",
			artists: [],
			cover: "",
			start_time: "2024-07-22T10:18:22.486Z",
		},
		tags: ["explicit"],
	},
];

// const uHistMock = [
// 	{
// 		search_id: "4be25870-05c1-4623-8cb5-a912a6ae0030",
// 		user_id: "012c4238-e071-7031-cb6c-30881378722f",
// 		search_term: "Abyss",
// 		timestamp: "2024-07-19T09:03:19.651Z",
// 		url: "/rooms/8f928675-5c95-497a-b8a7-917064cdb462",
// 	},
// ];

// const uHistDtoMock = [
// 	{
// 		search_term: "Abyss",
// 		search_time: "2024-07-19T09:03:19.651Z",
// 		url: "/rooms/8f928675-5c95-497a-b8a7-917064cdb462",
// 	},
// ];

describe("searchUsers function", () => {
	let service: SearchService;
	let dtoGen: DtoGenService;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
		dtoGen = module.get<DtoGenService>(DtoGenService);
	});

	it("should return an empty UserDto array when query returns an empty array", async () => {
		prismaMock.$queryRaw.mockResolvedValue([]);

		const result = await service.searchUsers("testing");

		expect(result).toMatchObject([new UserDto()]);
	});

	it("should return a UserDto array when query returns an array", async () => {
		prismaMock.$queryRaw.mockResolvedValue(userMock);
		(dtoGen.generateMultipleUserDto as jest.Mock).mockReturnValueOnce(uDtoMock);

		const result = await service.searchUsers("testing");

		expect(result).toMatchObject(uDtoMock);
	});
});

describe("searchRooms function", () => {
	let service: SearchService;
	let dtoGen: DtoGenService;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
		dtoGen = module.get<DtoGenService>(DtoGenService);
	});

	it("should return an empty RoomDto array when query returns an empty array", async () => {
		prismaMock.$queryRaw.mockResolvedValue([]);

		const result = await service.searchRooms({ q: "testing" });

		expect(result).toMatchObject([new RoomDto()]);
	});

	it("should return a RoomDto array when query returns an array", async () => {
		prismaMock.$queryRaw.mockResolvedValue(roomMock);
		(dtoGen.generateMultipleRoomDto as jest.Mock).mockReturnValueOnce(rDtoMock);

		const result = await service.searchRooms({ q: "testing" });

		expect(result).toMatchObject(rDtoMock);
	});
});

describe("combinedSearch function", () => {
	let service: SearchService;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
	});

	it("should return an empty combined search array when query returns an empty array", async () => {
		prismaMock.$queryRaw.mockResolvedValue({ rooms: [], users: [] });

		const result = await service.searchRooms({ q: "testing" });

		expect(result).toMatchObject([new RoomDto()]);
	});

	it("should return a combined search array when query returns an array", async () => {
		const searchRoomMock = jest
			.spyOn(service, "searchRooms")
			.mockResolvedValueOnce(rDtoMock as unknown as RoomDto[]);
		const searchUsersMock = jest
			.spyOn(service, "searchUsers")
			.mockResolvedValueOnce(uDtoMock as unknown as UserDto[]);

		const result = await service.combinedSearch({ q: "testing" });

		expect(result).toMatchObject({ rooms: rDtoMock, users: uDtoMock });
		searchRoomMock.mockRestore();
		searchUsersMock.mockRestore();
	});
});

describe("advancedUserSearchQueryBuilder function", () => {
	let service: SearchService;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
	});

	it("builds a query with all search params", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue([]);

		const result = await service.advancedUserSearchQueryBuilder({
			q: "testing",
			creator_username: "test",
			creator_name: "t",
			following: 0,
			followers: 2,
		});

		console.log("Test result: " + result);
		const normalizeWhitespace = (str: any) => str.replace(/\s+/g, " ").trim();

		expect(normalizeWhitespace(result)).toBe(
			normalizeWhitespace(`SELECT user_id, LEAST(levenshtein(full_name, 'testing'), levenshtein(username, 'test'), levenshtein(full_name, 't')) AS distance, COALESCE(f1.num_followers, 0) AS num_followers, COALESCE(f2.num_following, 0) AS num_following FROM users LEFT JOIN (
			SELECT followee, COUNT(*) AS num_followers
			FROM follows
			GROUP BY followee
	) f1 ON f1.followee = users.user_id LEFT JOIN (
			SELECT follower, COUNT(*) AS num_following
			FROM follows
			GROUP BY follower
	) f2 ON f2.follower = users.user_id WHERE similarity(username, 'testing') > 0.2 AND similarity(full_name, 'testing') > 0.2 GROUP BY users.user_id, f1.num_followers, f2.num_following HAVING COALESCE(f1.num_followers, 0) >= 2 
	AND COALESCE(f2.num_following, 0) >= 0;
	`),
		);
	});

	it("it should build with just q", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue([]);

		const result = await service.advancedUserSearchQueryBuilder({
			q: "testing",
		});

		const normalizeWhitespace = (str: any) => str.replace(/\s+/g, " ").trim();

		expect(normalizeWhitespace(result)).toBe(
			normalizeWhitespace(
				`SELECT user_id, LEAST(levenshtein(username, 'testing'), levenshtein(full_name, 'testing')) AS distance FROM users WHERE similarity(username, 'testing') > 0.2 AND similarity(full_name, 'testing') > 0.2`,
			),
		);
	});

	it("it should build with q and username", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue([]);

		const result = await service.advancedUserSearchQueryBuilder({
			q: "testing",
			creator_username: "test",
		});

		const normalizeWhitespace = (str: any) => str.replace(/\s+/g, " ").trim();

		expect(normalizeWhitespace(result)).toBe(
			normalizeWhitespace(
				`SELECT user_id, LEAST(levenshtein(full_name, 'testing'), levenshtein(username, 'test')) AS distance FROM users WHERE similarity(username, 'testing') > 0.2 AND similarity(full_name, 'testing') > 0.2`,
			),
		);
	});

	it("it should build with q and full_name", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue([]);

		const result = await service.advancedUserSearchQueryBuilder({
			q: "testing",
			creator_name: "t",
		});

		const normalizeWhitespace = (str: any) => str.replace(/\s+/g, " ").trim();

		expect(normalizeWhitespace(result)).toBe(
			normalizeWhitespace(
				`SELECT user_id, LEAST(levenshtein(full_name, 'testing'), levenshtein(full_name, 't')) AS distance FROM users WHERE similarity(username, 'testing') > 0.2 AND similarity(full_name, 'testing') > 0.2`,
			),
		);
	});

	it("it should build with q and followers", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue([]);

		const result = await service.advancedUserSearchQueryBuilder({
			q: "testing",
			creator_name: "t",
		});

		const normalizeWhitespace = (str: any) => str.replace(/\s+/g, " ").trim();

		expect(normalizeWhitespace(result)).toBe(
			normalizeWhitespace(
				`SELECT user_id, LEAST(levenshtein(full_name, 'testing'), levenshtein(full_name, 't')) AS distance FROM users WHERE similarity(username, 'testing') > 0.2 AND similarity(full_name, 'testing') > 0.2`,
			),
		);
	});

	it("it should build with q and following", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue([]);

		const result = await service.advancedUserSearchQueryBuilder({
			q: "testing",
			following: 0,
		});

		const normalizeWhitespace = (str: any) => str.replace(/\s+/g, " ").trim();

		expect(normalizeWhitespace(result)).toBe(
			normalizeWhitespace(`SELECT user_id, LEAST(levenshtein(username, 'testing'), levenshtein(full_name, 'testing')) AS distance, COALESCE(f1.num_followers, 0) AS num_followers FROM users LEFT JOIN (
				SELECT followee, COUNT(*) AS num_followers
				FROM follows
				GROUP BY followee
		) f1 ON f1.followee = users.user_id WHERE similarity(username, 'testing') > 0.2 AND similarity(full_name, 'testing') > 0.2 GROUP BY users.user_id, f1.num_followers HAVING COALESCE(f1.num_followers, 0) >= 0;`),
		);
	});

	it("it should build with q and followers", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue([]);

		const result = await service.advancedUserSearchQueryBuilder({
			q: "testing",
			followers: 2,
		});

		const normalizeWhitespace = (str: any) => str.replace(/\s+/g, " ").trim();

		expect(normalizeWhitespace(result)).toBe(
			normalizeWhitespace(`SELECT user_id, LEAST(levenshtein(username, 'testing'), levenshtein(full_name, 'testing')) AS distance, COALESCE(f2.num_following, 0) AS num_following FROM users LEFT JOIN (
				SELECT follower, COUNT(*) AS num_following
				FROM follows
				GROUP BY follower
		) f2 ON f2.follower = users.user_id WHERE similarity(username, 'testing') > 0.2 AND similarity(full_name, 'testing') > 0.2 GROUP BY users.user_id, f2.num_following HAVING COALESCE(f2.num_following, 0) >= 2;`),
		);
	});
});

describe("advancedRoomsSearchQueryBuilder function", () => {
	let service: SearchService;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
	});

	it("it should build with all params", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue([]);

		const result = await service.advancedRoomSearchQueryBuilder({
			q: "testing",
			creator_username: "test",
			creator_name: "t",
			participant_count: 3,
			description: "desc",
			is_temp: false,
			is_priv: false,
			is_scheduled: false,
			start_date: "2024-06-15 09:00:00",
			end_date: "2024-06-15 09:00:00",
			lang: "Language",
			explicit: false,
			nsfw: false,
			tags: "1,2,3",
		});

		const normalizeWhitespace = (str: any) => str.replace(/\s+/g, " ").trim();

		expect(normalizeWhitespace(result)).toBe(
			normalizeWhitespace(`SELECT room.*, LEAST(levenshtein(name, 'testing'), levenshtein(username, 'test'), levenshtein(full_name, 't')) AS distance, levenshtein(description, 'Get energized') AS desc_distance FROM room INNER JOIN users ON room_creator = user_id LEFT JOIN scheduled_room on room.room_id = scheduled_room.room_id LEFT JOIN private_room on room.room_id = private_room.room_id INNER JOIN participate ON room.room_id = participate.room_id WHERE (similarity(name, 'testing') > 0.2 OR similarity(username, 'test') > 0.2 OR similarity(full_name, 't') > 0.2 ) AND levenshtein(description, 'desc') < 100 AND is_temporary = false AND scheduled_date IS NULL AND is_listed IS NULL AND scheduled_date AT TIME ZONE 'UTC' = '2024-06-15 09:00:00' AND room_language = 'Language' AND explicit = false AND nsfw = false AND (tags @> ARRAY['1'] OR tags @> ARRAY['2'] OR tags @> ARRAY['3']) GROUP BY room.room_id, users.username, users.full_name
			HAVING COUNT(participate.room_id) >= 3 ORDER BY distance ASC LIMIT 10`),
		);
	});

	it("it should build with just q", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue([]);

		const result = await service.advancedRoomSearchQueryBuilder({
			q: "testing",
		});
		const normalizeWhitespace = (str: any) => str.replace(/\s+/g, " ").trim();

		expect(normalizeWhitespace(result)).toBe(
			normalizeWhitespace(
				`SELECT room.*, levenshtein(name, 'testing') AS distance FROM room INNER JOIN users ON room_creator = user_id WHERE (similarity(name, 'testing') > 0.2 ) ORDER BY distance ASC LIMIT 10`,
			),
		);
	});
});

describe("advancedSearchUsers function", () => {
	let service: SearchService;
	let dtoGen: DtoGenService;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
		dtoGen = module.get<DtoGenService>(DtoGenService);
	});

	it("should return an empty UserDto array when query returns an empty array", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue([]);
		const mock = jest
			.spyOn(service, "advancedUserSearchQueryBuilder")
			.mockReturnValueOnce(`Select * FROM users`);

		const result = await service.advancedSearchUsers({ q: "testing" });

		expect(result).toMatchObject([new UserDto()]);
		mock.mockRestore();
	});

	it("should return a UserDto array when query returns an array", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue(userMock);
		const mock = jest
			.spyOn(service, "advancedUserSearchQueryBuilder")
			.mockReturnValueOnce(`Select * FROM users`);

		(dtoGen.generateMultipleUserDto as jest.Mock).mockReturnValueOnce(uDtoMock);

		const result = await service.advancedSearchUsers({ q: "testing" });

		expect(result).toMatchObject(uDtoMock);
		mock.mockRestore();
	});
});

describe("advancedSearchRooms function", () => {
	let service: SearchService;
	let dtoGen: DtoGenService;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
		dtoGen = module.get<DtoGenService>(DtoGenService);
	});

	it("should return an empty RoomDto array when query returns an empty array", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue([]);
		const mock = jest
			.spyOn(service, "advancedUserSearchQueryBuilder")
			.mockReturnValueOnce(`Select * FROM rooms`);

		const result = await service.advancedSearchRooms({ q: "testing" });

		expect(result).toMatchObject([new RoomDto()]);
		mock.mockRestore();
	});

	it("should return a RoomDto array when query returns an array", async () => {
		prismaMock.$queryRawUnsafe.mockResolvedValue(roomMock);
		(dtoGen.generateMultipleRoomDto as jest.Mock).mockReturnValueOnce(rDtoMock);
		const mock = jest
			.spyOn(service, "advancedUserSearchQueryBuilder")
			.mockReturnValueOnce(`Select * FROM rooms`);

		const result = await service.advancedSearchRooms({ q: "testing" });

		expect(result).toMatchObject(rDtoMock);
		mock.mockRestore();
	});
});

describe("searchRoomsHistory function", () => {
	let service: SearchService;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
	});

	it("should return an empty SearchHistoryDto array when query returns an empty array", async () => {
		prismaMock.$queryRaw.mockResolvedValueOnce([]);

		const result = await service.searchRoomsHistory("mockID");

		expect(result).toMatchObject([]);
	});

	// it("should return a SearchHistoryDto array when query returns an array", async () => {
	// 	prismaMock.$queryRaw.mockResolvedValueOnce(uHistMock);

	// 	const result = await service.searchRoomsHistory('mockId');

	// 	expect(result).toMatchObject(uHistDtoMock);
	// });
});

describe("searchUsersHistory function", () => {
	let service: SearchService;

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
	});

	it("should return an empty SearchHistoryDto array when query returns an empty array", async () => {
		prismaMock.$queryRaw.mockResolvedValueOnce([]);

		const result = await service.searchUsersHistory("mockID");

		expect(result).toMatchObject([]);
	});
});
