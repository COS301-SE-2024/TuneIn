import React, { useState } from "react";
import { render, waitFor, act, fireEvent } from "@testing-library/react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../app/services/AuthManagement";
import * as StorageService from "../app/services/StorageService";
import { useLocalSearchParams } from "expo-router";
import MorePage from "../app/screens/profile/MorePage";
import { Animated } from "react-native";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
	getItem: jest.fn(),
}));

// Mock axios GET request
jest.mock("axios");
jest.mock("../app/services/AuthManagement", () => ({
	__esModule: true,
	default: {
		getToken: jest.fn(), // Mock getToken method
	},
}));

jest.mock("../app/services/StorageService", () => ({
	__esModule: true,
	getItem: jest.fn(),
}));

jest.mock("expo-router", () => {
	const actualModule = jest.requireActual("expo-router");
	return {
		...actualModule,
		useNavigation: jest.fn(),
		useLocalSearchParams: jest.fn(),
	};
});

const mockRooms = [
	{
		id: "2df818b9-876e-463a-b3cd-ed78e62b0966",
		backgroundImage:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-07-26T02:48:10.776Z-testing-room.jpeg",
		name: "Testing ROOM",
		language: "English",
		songName: null,
		artistName: null,
		description: "This is my first room. Please be kind to me",
		userID: "711c5238-3081-7008-9055-510a6bebc7e9",
		userProfile:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
		username: "8xbbie",
		roomSize: 50,
		tags: [],
		mine: false,
		isNsfw: false,
		isExplicit: false,
	},
	{
		id: "5f9e828e-8957-4554-9a98-cefc880c42ee",
		backgroundImage:
			"https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=600",
		name: "Test 2",
		language: "English",
		songName: null,
		artistName: null,
		description: "Another test",
		userID: "7cb2ba85-5e6a-4dbe-89f9-215534a0170e",
		userProfile:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
		username: "Solo",
		roomSize: 50,
		tags: [],
		mine: false,
		isNsfw: false,
		isExplicit: false,
	},
	{
		id: "12cee178-cb1f-484a-a062-cd3510e0feab",
		backgroundImage:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-11T22:36:07.574Z-demo-3.jpeg",
		name: " Demo 3 Room",
		language: "English",
		songName: null,
		artistName: null,
		description: "This room has no description.",
		userID: "a510bf81-4a1d-4baa-8306-c96c3d5abd44",
		userProfile:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-09-05T20:02:10.267Z-image.jpeg",
		username: "31m4u6u2ysdzjzqgn4wmpdbz2pmq",
		roomSize: 50,
		tags: ["jazz"],
		mine: false,
		isNsfw: true,
		isExplicit: false,
	},
	{
		id: "9aaff1d1-c1f2-4422-80e5-71a66d5225f2",
		backgroundImage:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-12T13:20:50.913Z-free.jpeg",
		name: "Free",
		language: "English",
		songName: null,
		artistName: null,
		description: "This room has no description.",
		userID: "db893b11-0a3f-443e-a113-40c2b7ab6ccc",
		userProfile:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
		username: "Nin",
		roomSize: 50,
		tags: [],
		mine: false,
		isNsfw: false,
		isExplicit: false,
	},
	{
		id: "66bb6bf7-25be-45af-bc38-7e7e258797b8",
		backgroundImage: "https://ik.imagekit.io/ikmedia/backlit.jpg",
		name: "chill vibes",
		language: "English",
		songName: null,
		artistName: null,
		description:
			"A room for relaxing and enjoying soothing music. Join us to unwind and chill with your favorite tunes.",
		userID: "01ece2d8-e091-7023-c1f2-d3399faa7071",
		userProfile:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
		username: "farmer 345",
		roomSize: 50,
		tags: ["explicit"],
		mine: false,
		isNsfw: false,
		isExplicit: true,
	},
	{
		id: "900dd6f1-440a-4272-a215-cf00ef78a9cf",
		backgroundImage: "https://ik.imagekit.io/ikmedia/backlit.jpg",
		name: "Energetic Beats",
		language: "English",
		songName: null,
		artistName: null,
		description:
			" Get energized with the latest upbeat tracks! Join us for high-energy vibes and exciting beats to keep you moving.",
		userID: "01ece2d8-e091-7023-c1f2-d3399faa7071",
		userProfile:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
		username: "farmer 345",
		roomSize: 50,
		tags: ["dance", "electronic", "upbeat"],
		mine: false,
		isNsfw: false,
		isExplicit: false,
	},
	{
		id: "e71ddd8a-67d2-40e6-a5c8-539d51e0ca8a",
		backgroundImage:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-06-23T13:22:36.163Z-over-cooked .jpeg",
		name: "Top Shot",
		language: "English",
		songName: null,
		artistName: null,
		description: "its chai",
		userID: "01ece2d8-e091-7023-c1f2-d3399faa7071",
		userProfile:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
		username: "farmer 345",
		roomSize: 50,
		tags: [],
		mine: false,
		isNsfw: false,
		isExplicit: true,
	},
	{
		id: "b9b4aebd-36cd-40bb-b329-f394fdefa0f5",
		backgroundImage:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-11T04:46:34.382Z-more-m's.jpeg",
		name: "More M's",
		language: "English",
		songName: null,
		artistName: null,
		description: "We only talk about those M's",
		userID: "711c5238-3081-7008-9055-510a6bebc7e9",
		userProfile:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
		username: "8xbbie",
		roomSize: 50,
		tags: [],
		mine: false,
		isNsfw: true,
		isExplicit: false,
	},
	{
		id: "3abae5ed-7de7-4f4f-833c-07de8a117479",
		backgroundImage:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-11T22:55:31.445Z-marvel.jpeg",
		name: "Marvel",
		language: "English",
		songName: null,
		artistName: null,
		description: "This room has no description.",
		userID: "db893b11-0a3f-443e-a113-40c2b7ab6ccc",
		userProfile:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
		username: "Nin",
		roomSize: 50,
		tags: [],
		mine: false,
		isNsfw: false,
		isExplicit: false,
	},
	{
		id: "3abae5ed-77e7-4f4f-833c-07de8a117479",
		backgroundImage:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-11T22:55:31.445Z-marvel.jpeg",
		name: "tenth",
		language: "English",
		songName: null,
		artistName: null,
		description: "This room has no description.",
		userID: "db893b11-0a3f-443e-a113-40c2b7ab6ccc",
		userProfile:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
		username: "Nin",
		roomSize: 50,
		tags: [],
		mine: false,
		isNsfw: false,
		isExplicit: false,
	},
	{
		id: "3abae5ed-78e7-4f4f-833c-07de8a117479",
		backgroundImage:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-11T22:55:31.445Z-marvel.jpeg",
		name: "tenth",
		language: "English",
		songName: null,
		artistName: null,
		description: "This room has no description.",
		userID: "db893b11-0a3f-443e-a113-40c2b7ab6ccc",
		userProfile:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
		username: "Nin",
		roomSize: 50,
		tags: [],
		mine: false,
		isNsfw: false,
		isExplicit: false,
	},
	{
		id: "3abae5ed-7de9-4f4f-833c-07de8a117479",
		backgroundImage:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-11T22:55:31.445Z-marvel.jpeg",
		name: "eleventh",
		language: "English",
		songName: null,
		artistName: null,
		description: "This room has no description.",
		userID: "db893b11-0a3f-443e-a113-40c2b7ab6ccc",
		userProfile:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
		username: "Nin",
		roomSize: 50,
		tags: [],
		mine: false,
		isNsfw: false,
		isExplicit: false,
	},
];

const mockSongs = [
	{
		songID: "8b20cb14-82af-4730-bad4-028ddb163333",
		title: "Tell Your World",
		artists: ["livetune", "Hatsune Miku"],
		cover: "https://i.scdn.co/image/ab67616d0000b2739ebc45791dad84d03a71c0e0",
		spotify_id: "6kBNaF6seD0JqFl4aBJ55e",
		duration: 254,
		start_time: null,
	},
	{
		songID: "b86756bf-7b06-412a-a5b1-33e1e0cbefcc",
		title: "ヒビカセ",
		artists: ["Reol"],
		cover: "https://i.scdn.co/image/ab67616d0000b27348cbdef454b5636ee5ebeb34",
		spotify_id: "0H1iMm1pO61srixV0rGYRe",
		duration: 250,
		start_time: null,
	},
	{
		songID: "74eceac4-7eac-48ae-ab60-9b5556dc3403",
		title: "Dramaturgy",
		artists: ["Eve"],
		cover: "https://i.scdn.co/image/ab67616d0000b2739794fc0e54d795a65d732967",
		spotify_id: "72uSoNIf7eScfGZFQjNHrR",
		duration: 238,
		start_time: null,
	},
];

jest.useFakeTimers();

describe("ProfileScreen", () => {
	beforeEach(() => {
		// Clear mocks and set initial states
		jest.clearAllMocks();
		(AsyncStorage.getItem as jest.Mock).mockClear();
		(axios.get as jest.Mock).mockClear();
		(auth.getToken as jest.Mock).mockReturnValue("token");
		(StorageService.getItem as jest.Mock).mockResolvedValue([]);
	});

	it("it renders rooms", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			type: "room",
			items: JSON.stringify(mockRooms),
			title: "Recent Rooms",
		});

		const { getByText, getByTestId } = render(<MorePage />);

		expect(getByText("Recent Rooms")).toBeTruthy();
		expect(getByText("Testing ROOM")).toBeTruthy();
		expect(getByTestId("prev-button")).toBeTruthy();
		expect(getByTestId("next-button")).toBeTruthy();
	});

	it("it renders songs", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			type: "song",
			items: JSON.stringify(mockSongs),
			title: "Favorite Songs",
		});

		const { getByText, getByTestId } = render(<MorePage />);

		expect(getByText("Favorite Songs")).toBeTruthy();
		expect(getByText("Dramaturgy")).toBeTruthy();
	});

	it("it renders nothing", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			type: "",
			items: JSON.stringify(mockSongs),
			title: "Favorite Songs",
		});

		const { queryByText } = render(<MorePage />);

		expect(queryByText("Dramaturgy")).toBeNull();

	});

	it("it paginates", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			type: "room",
			items: JSON.stringify(mockRooms),
			title: "Recent Rooms",
		});

		const { getByTestId, getByText } = render(<MorePage />);

		const nextBtn = getByTestId("next-button");
		fireEvent.press(nextBtn);
		expect(getByText("eleventh")).toBeTruthy();

		const prevBtn = getByTestId("prev-button");
		fireEvent.press(prevBtn);
		expect(getByText("Testing ROOM")).toBeTruthy();
	});
});
