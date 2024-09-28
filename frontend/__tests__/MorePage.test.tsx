import { render } from "@testing-library/react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../app/services/AuthManagement";
import * as StorageService from "../app/services/StorageService";
import { useLocalSearchParams } from "expo-router";
import MorePage from "../app/screens/profile/MorePage";
import { useState } from "react";
import { Player } from "../app/PlayerContext";

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

const mockUsers = [
	{
		id: "id",
		profile_picture_url: "picture",
		profile_name: "John",
		username: "johndoe",
		followers: [],
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

const PlayerContextProviderMock = ({ children, value }) => {
	const [userData, setUserData] = useState(value.userData);

	const mockValue = {
		...value,
		userData,
		setUserData,
	};

	return <Player.Provider value={mockValue}>{children}</Player.Provider>;
};

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

	it("it renders users", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			type: "user",
			items: JSON.stringify(mockUsers),
			title: "Followers",
		});

		const mockProfileData = {
			profile_name: "John Doe",
			username: "johndoe",
			profile_picture_url:
				"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-18T14:52:53.386Z-image.jpeg",
			followers: { count: 10 },
			following: { count: 20 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: {
				count: 5,
				data: [
					{
						title: "Scherzo No. 3 in C-Sharp Minor, Op. 39",
						artists: ["Frédéric Chopin", "Arthur Rubinstein"],
						cover: null,
						duration: 200,
						spotify_id: "5AnNbtnz54r94cd2alxg5I",
						start_time: null,
					},
				],
			},
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockPlayerContextValue = {
			userData: mockProfileData,
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};

		const { getByText, getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<MorePage />
			</PlayerContextProviderMock>,
		);

		expect(getByText("Followers")).toBeTruthy();
		expect(getByText("johndoe")).toBeTruthy();
	});

	it("it renders songs", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			type: "song",
			items: JSON.stringify(mockSongs),
			title: "Favorite Songs",
		});

		const { getByText } = render(<MorePage />);

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
});
