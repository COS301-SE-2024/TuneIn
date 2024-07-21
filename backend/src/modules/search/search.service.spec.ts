import { TestingModule } from "@nestjs/testing";
import { SearchService } from "./search.service";
import { createSearchTestingModule } from "../../../jest_mocking/module-mocking";
import { prismaMock } from '../../../singleton'
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { UserDto } from "../users/dto/user.dto";

jest.mock("../db-utils/db-utils.service");
jest.mock("../dto-gen/dto-gen.service");

describe("searchUsers function", () => {
	let service: SearchService;
	let dbUtils: DbUtilsService;
	let dtoGen: DtoGenService;
	const userMock = [
		{
		  user_id: '01ece2d8-e091-7023-c1f2-d3399faa7071',
		  username: 'farmer 345',
		  bio: 'Music enthusiast who loves exploring new tunes across various genres. Always on the lookout for fresh beats and hidden gems!',
		  profile_picture: 'https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-06-23T13:23:20.848Z-image.jpeg',
		  activity: { recent_rooms: [Array] },
		  preferences: { fav_genres: [Array], fav_songs: [Array] },
		  full_name: 'Farmer23',
		  external_links: { data: [Array] },
		  email: 'farmer345.jk@gmail.com',
		  distance: 4
		}
	  ];

	const uDtoMock = [
		{
		  "profile_name": "Farmer23",
		  "userID": "01ece2d8-e091-7023-c1f2-d3399faa7071",
		  "username": "farmer 345",
		  "profile_picture_url": "https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-06-23T13:23:20.848Z-image.jpeg",
		  "followers": {
			"count": 2,
			"data": []
		  },
		  "following": {
			"count": 1,
			"data": []
		  },
		  "links": {
			"count": 2,
			"data": [
			  {
				"type": "instagram",
				"links": "instagram.com/farmer"
			  },
			  {
				"type": "tiktok",
				"links": "tiktok.com/farmer"
			  }
			]
		  },
		  "bio": "Music enthusiast who loves exploring new tunes across various genres. Always on the lookout for fresh beats and hidden gems!",
		  "current_song": {
			"title": "",
			"artists": [],
			"cover": "",
			"start_time": "2024-07-21T15:18:16.126Z"
		  },
		  "fav_genres": {
			"count": 2,
			"data": [
			  "Rock",
			  "Indie"
			]
		  },
		  "fav_songs": {
			"count": 1,
			"data": [
			  {
				"title": "Faster",
				"artists": "Good Kid",
				"cover": "https://store.goodkidofficial.com/cdn/shop/products/GoodKidAlbumCover.jpg?v=1528948601",
				"start_time": ""
			  }
			]
		  },
		  "fav_rooms": {
			"count": 0,
			"data": []
		  },
		  "recent_rooms": {
			"count": 0,
			"data": []
		  }
		}
	  ];

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
