import { TestingModule } from "@nestjs/testing";
import { SearchService } from "./search.service";
import { createSearchTestingModule } from "../../../jest_mocking/module-mocking";
import { prismaMock } from '../../../singleton'
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { UserDto } from "../users/dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";

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

describe("searchRooms function", () => {
	let service: SearchService;
	let dbUtils: DbUtilsService;
	let dtoGen: DtoGenService;
	const roomMock = [
		{
		  room_id: '66bb6bf7-25be-45af-bc38-7e7e258797b8',
		  name: 'chill vibes',
		  description: 'A room for relaxing and enjoying soothing music. Join us to unwind and chill with your favorite tunes.',
		  username: 'farmer 345',
		  distance: 6
		}
	  ];

	const rDtoMock = [
		{
		  "creator": {
			"profile_name": "Farmer23",
			"userID": "01ece2d8-e091-7023-c1f2-d3399faa7071",
			"username": "farmer 345",
			"profile_picture_url": "https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-06-23T13:23:20.848Z-image.jpeg",
			"followers": {
			  "count": 0,
			  "data": []
			},
			"following": {
			  "count": 0,
			  "data": []
			},
			"links": {
			  "count": 0,
			  "data": []
			},
			"bio": "Music enthusiast who loves exploring new tunes across various genres. Always on the lookout for fresh beats and hidden gems!",
			"current_song": {
			  "title": "",
			  "artists": [],
			  "cover": "",
			  "start_time": "2024-07-22T10:18:22.486Z"
			},
			"fav_genres": {
			  "count": 0,
			  "data": []
			},
			"fav_songs": {
			  "count": 0,
			  "data": []
			},
			"fav_rooms": {
			  "count": 0,
			  "data": []
			},
			"recent_rooms": {
			  "count": 0,
			  "data": []
			}
		  },
		  "roomID": "66bb6bf7-25be-45af-bc38-7e7e258797b8",
		  "participant_count": 0,
		  "room_name": "chill vibes",
		  "description": "A room for relaxing and enjoying soothing music. Join us to unwind and chill with your favorite tunes.",
		  "is_temporary": false,
		  "is_private": false,
		  "is_scheduled": false,
		  "start_date": "2024-07-22T10:18:22.486Z",
		  "end_date": "2024-07-22T10:18:22.486Z",
		  "language": "English",
		  "has_explicit_content": true,
		  "has_nsfw_content": false,
		  "room_image": "https://ik.imagekit.io/ikmedia/backlit.jpg",
		  "current_song": {
			"title": "",
			"artists": [],
			"cover": "",
			"start_time": "2024-07-22T10:18:22.486Z"
		  },
		  "tags": [
			"explicit"
		  ]
		}
	  ];

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
		dtoGen = module.get<DtoGenService>(DtoGenService);
	});

	it("should return an empty RoomDto array when query returns an empty array", async () => {
		prismaMock.$queryRaw.mockResolvedValue([]);

		const result = await service.searchRooms({q:"testing"});

		expect(result).toMatchObject([new RoomDto()]);
	});

	it("should return a RoomDto array when query returns an array", async () => {
		prismaMock.$queryRaw.mockResolvedValue(roomMock);
		(dtoGen.generateMultipleRoomDto as jest.Mock).mockReturnValueOnce(rDtoMock);

		const result = await service.searchRooms({q:"testing"});

		expect(result).toMatchObject(rDtoMock);
	});
});

describe("combinedSearch function", () => {
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
	const roomMock = [
		{
		  room_id: '66bb6bf7-25be-45af-bc38-7e7e258797b8',
		  name: 'chill vibes',
		  description: 'A room for relaxing and enjoying soothing music. Join us to unwind and chill with your favorite tunes.',
		  username: 'farmer 345',
		  distance: 6
		}
	  ];
	const rDtoMock = [
		{
		  "creator": {
			"profile_name": "Farmer23",
			"userID": "01ece2d8-e091-7023-c1f2-d3399faa7071",
			"username": "farmer 345",
			"profile_picture_url": "https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-06-23T13:23:20.848Z-image.jpeg",
			"followers": {
			  "count": 0,
			  "data": []
			},
			"following": {
			  "count": 0,
			  "data": []
			},
			"links": {
			  "count": 0,
			  "data": []
			},
			"bio": "Music enthusiast who loves exploring new tunes across various genres. Always on the lookout for fresh beats and hidden gems!",
			"current_song": {
			  "title": "",
			  "artists": [],
			  "cover": "",
			  "start_time": "2024-07-22T10:18:22.486Z"
			},
			"fav_genres": {
			  "count": 0,
			  "data": []
			},
			"fav_songs": {
			  "count": 0,
			  "data": []
			},
			"fav_rooms": {
			  "count": 0,
			  "data": []
			},
			"recent_rooms": {
			  "count": 0,
			  "data": []
			}
		  },
		  "roomID": "66bb6bf7-25be-45af-bc38-7e7e258797b8",
		  "participant_count": 0,
		  "room_name": "chill vibes",
		  "description": "A room for relaxing and enjoying soothing music. Join us to unwind and chill with your favorite tunes.",
		  "is_temporary": false,
		  "is_private": false,
		  "is_scheduled": false,
		  "start_date": "2024-07-22T10:18:22.486Z",
		  "end_date": "2024-07-22T10:18:22.486Z",
		  "language": "English",
		  "has_explicit_content": true,
		  "has_nsfw_content": false,
		  "room_image": "https://ik.imagekit.io/ikmedia/backlit.jpg",
		  "current_song": {
			"title": "",
			"artists": [],
			"cover": "",
			"start_time": "2024-07-22T10:18:22.486Z"
		  },
		  "tags": [
			"explicit"
		  ]
		}
	  ];

	beforeEach(async () => {
		const module: TestingModule = await createSearchTestingModule();
		service = module.get<SearchService>(SearchService);
		dtoGen = module.get<DtoGenService>(DtoGenService);
	});

	it("should return an empty combined search array when query returns an empty array", async () => {
		prismaMock.$queryRaw.mockResolvedValue({rooms: [], users: [],});

		const result = await service.searchRooms({q:"testing"});

		expect(result).toMatchObject([new RoomDto()]);
	});

	it("should return a combined search array when query returns an array", async () => {
		prismaMock.$queryRaw.mockResolvedValue(roomMock);
		const searchRoomMock = jest.spyOn(service, 'searchRooms').mockResolvedValueOnce(rDtoMock as unknown as RoomDto[]);
		const searchUsersMock = jest.spyOn(service, 'searchUsers').mockResolvedValueOnce(uDtoMock as unknown as UserDto[]);

		const result = await service.combinedSearch({q:"testing"});

		expect(result).toMatchObject({rooms: rDtoMock, users: uDtoMock,});
		searchRoomMock.mockRestore();
		searchUsersMock.mockRestore();
	});
});
