import React, { useState } from "react";
import { render, waitFor, act, fireEvent } from "@testing-library/react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../app/services/AuthManagement";
import * as StorageService from "../app/services/StorageService";
import ProfileScreen from "../app/screens/profile/ProfilePage";
import { useLocalSearchParams } from "expo-router";
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

const mockCurrRoomData = {
		creator: {
			profile_name: "Jaden Moodley",
			userID: "id",
			username: "Jaden",
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
				data: [
					{
						type: "Instagram",
						links: "instagram.com/adventurous_epoch",
					},
					{
						type: "Instagram",
						links: "instagram.com/general_epoch",
					},
				],
			},
			bio: "Humanity is a boon",
			current_song: {
				title: "",
				artists: [],
				cover: "",
				start_time: "2024-08-25T10:15:02.532Z",
			},
			fav_genres: {
				count: 4,
				data: ["j-pop", "rock", "jazz", "metal"],
			},
			fav_songs: {
				count: 2,
				data: [
					{
						title: "Faster",
						artists: "Good Kid",
						cover:
							"https://store.goodkidofficial.com/cdn/shop/products/GoodKidAlbumCover.jpg?v=1528948601",
						start_time: "",
					},
					{
						title: "Bohemian Rhapsody",
						artists: "Queen",
						cover:
							"https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png",
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
		roomID: "8f928675-5c95-497a-b8a7-917064cdb462",
		participant_count: 0,
		room_name: "Abyssal Paradise",
		description: "Submerge yourself in solace",
		is_temporary: false,
		is_private: true,
		is_scheduled: false,
		start_date: "2024-08-25T10:15:02.406Z",
		end_date: "2024-08-25T10:15:02.406Z",
		language: "English",
		has_explicit_content: false,
		has_nsfw_content: false,
		room_image:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-10T18%3A23%3A52.849Z-testing.jpeg",
		current_song: {
			title: "",
			artists: [],
			cover: "",
			start_time: "2024-08-25T10:15:02.406Z",
		},
		tags: [],
};

const mockRoomData = [
	{
		creator: {
			profile_name: "Nin",
			userID: "db893b11-0a3f-443e-a113-40c2b7ab6ccc",
			username: "Nin",
			profile_picture_url:
				"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
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
			bio: "Her for vibes",
			current_song: {
				songID: "",
				title: "",
				artists: [],
				cover: "",
				spotify_id: "",
				duration: 0,
				start_time: "2024-09-06T10:57:29.676Z",
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
		roomID: "3abae5ed-7de7-4f4f-833c-07de8a117479",
		participant_count: 0,
		room_name: "Marvel",
		description: "This room has no description.",
		is_temporary: false,
		is_private: false,
		is_scheduled: false,
		start_date: "2024-09-06T10:57:29.677Z",
		end_date: "2024-09-06T10:57:29.677Z",
		language: "English",
		has_explicit_content: false,
		has_nsfw_content: false,
		room_image:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-11T22%3A55%3A31.445Z-marvel.jpeg",
		tags: [],
		childrenRoomIDs: [],
	},
	{
		creator: {
			profile_name: "Jaden Moodley",
			userID: "012c4238-e071-7031-cb6c-30881378722f",
			username: "jadenm",
			profile_picture_url:
				"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-09-05T15:34:24.912Z-image.jpeg",
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
			bio: "Hello there stranger",
			current_song: {
				songID: "",
				title: "",
				artists: [],
				cover: "",
				spotify_id: "",
				duration: 0,
				start_time: "2024-09-06T10:57:29.676Z",
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
		roomID: "8f928675-5c95-497a-b8a7-917064cdb462",
		participant_count: 0,
		room_name: "Abyssal Paradise",
		description: "Submerge yourself in solace",
		is_temporary: false,
		is_private: false,
		is_scheduled: false,
		start_date: "2024-09-06T10:57:29.677Z",
		end_date: "2024-09-06T10:57:29.677Z",
		language: "English",
		has_explicit_content: false,
		has_nsfw_content: false,
		room_image:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-10T18%3A23%3A52.849Z-testing.jpeg",
		tags: [],
		childrenRoomIDs: [],
	},
	{
		creator: {
			profile_name: "Thabiso Matau",
			userID: "711c5238-3081-7008-9055-510a6bebc7e9",
			username: "8xbbie",
			profile_picture_url:
				"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg",
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
			bio: "Pure OPIUM🔥",
			current_song: {
				songID: "",
				title: "",
				artists: [],
				cover: "",
				spotify_id: "",
				duration: 0,
				start_time: "2024-09-06T10:57:29.676Z",
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
		roomID: "b9b4aebd-36cd-40bb-b329-f394fdefa0f5",
		participant_count: 0,
		room_name: "More M's",
		description: "We only talk about those M's (type shiiii)",
		is_temporary: false,
		is_private: false,
		is_scheduled: false,
		start_date: "2024-09-06T10:57:29.677Z",
		end_date: "2024-09-06T10:57:29.677Z",
		language: "English",
		has_explicit_content: true,
		has_nsfw_content: false,
		room_image:
			"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-09-06T08%3A57%3A28.273Z-more-m%27s.jpeg",
		tags: [],
		childrenRoomIDs: [],
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

describe("ProfileScreen", () => {
	beforeEach(() => {
		// Clear mocks and set initial states
		jest.clearAllMocks();
		(AsyncStorage.getItem as jest.Mock).mockClear();
		(axios.get as jest.Mock).mockClear();
		(auth.getToken as jest.Mock).mockReturnValue("token");
		(StorageService.getItem as jest.Mock).mockResolvedValue([]);
	});

	it("renders loading indicator initially", async () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			friend: JSON.stringify({ profilePicture: "", username: "l" }),
		});

		const mockPlayerContextValue = {
			userData: {
				profile_name: "John Doe",
				username: "johndoe",
				profile_picture_url:
					"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-18T14:52:53.386Z-image.jpeg",
				followers: { count: 10 },
				following: { count: 20 },
				bio: "Mock bio",
				links: {
					count: 1,
					data: [{ type: "example", links: "https://example.com" }],
				},
				fav_genres: { count: 1, data: [] },
				fav_songs: {
					count: 1,
					data: [
						{
							title: "Scherzo No. 3 in C-Sharp Minor, Op. 39",
							artists: ["Frédéric Chopin", "Arthur Rubinstein"],
							cover: null,
							spotify_id: "5AnNbtnz54r94cd2alxg5I",
							start_time: null,
						},
					],
				},
				fav_rooms: { count: 0, data: [] },
				recent_rooms: { count: 0, data: [] },
			},
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};

		const { getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		await waitFor(() => {
			const loadingIndicator = getByTestId("loading-indicator");
			expect(loadingIndicator).toBeTruthy();
		});
	});

	it("throws player context error", async () => {
		const renderProfileScreen = () => render(<ProfileScreen />);

		// Check that the error is thrown
		expect(renderProfileScreen).toThrow(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	});

	it("fetches profile data and renders profile information", async () => {
		// Mock AsyncStorage.getItem to return a token
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

		// Mock axios.get to return mock profile data
		const mockProfileData = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "johndoe",
			followers: { count: 0 },
			following: { count: 0 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockPlayerContextValue = {
			userData: mockProfileData,
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};
		(axios.get as jest.Mock).mockResolvedValue({ data: mockRoomData });
		(useLocalSearchParams as jest.Mock).mockReturnValue({});

		// Render the ProfileScreen component
		const { getByText, getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		// Wait for async operations to complete
		await act(async () => {
			await waitFor(() => {
				// Assert profile information is rendered
				expect(getByText("John Doe")).toBeTruthy();
				expect(getByText("@johndoe")).toBeTruthy();
				expect(getByText("Followers")).toBeTruthy();
				expect(getByText("Following")).toBeTruthy();
				expect(getByText("Mock bio")).toBeTruthy();
				expect(getByText("https://example.com")).toBeTruthy(); // Assuming link is rendered as text

				expect(getByTestId("profile-pic")).toBeTruthy();
				expect(getByTestId("bio")).toBeTruthy();
				expect(getByTestId("genres")).toBeTruthy();
				// expect(getByTestId("fav-songs")).toBeTruthy();
				// expect(getByTestId("fav-rooms")).toBeTruthy();
				// expect(getByTestId("recent-rooms")).toBeTruthy();
				// expect(getByTestId("links")).toBeFalsy();
			});
		});

		// console.log(
		// 	"1st axios.get was called:",
		// 	(axios.get as jest.Mock).mock.calls.length,
		// 	"times",
		// );
	});

	it("fetches profile data and renders songs", async () => {
		// Mock AsyncStorage.getItem to return a token
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

		// Mock axios.get to return mock profile data
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
		(axios.get as jest.Mock).mockResolvedValue({ data: mockRoomData });
		(useLocalSearchParams as jest.Mock).mockReturnValue({});

		// Render the ProfileScreen component
		const { getByText, getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		// Wait for async operations to complete
		await act(async () => {
			await waitFor(() => {
				// Assert profile information is rendered
				expect(getByText("John Doe")).toBeTruthy();
				expect(getByText("@johndoe")).toBeTruthy();
				expect(getByText("Followers")).toBeTruthy();
				expect(getByText("Following")).toBeTruthy();
				expect(getByText("Mock bio")).toBeTruthy();
				expect(getByText("https://example.com")).toBeTruthy(); // Assuming link is rendered as text
				expect(getByText("More")).toBeTruthy();
				expect(getByText("3:20")).toBeTruthy();

				expect(getByTestId("profile-pic")).toBeTruthy();
				expect(getByTestId("bio")).toBeTruthy();
				expect(getByTestId("genres")).toBeTruthy();
				expect(getByTestId("fav-songs")).toBeTruthy();
				// expect(getByTestId("fav-rooms")).toBeTruthy();
				// expect(getByTestId("recent-rooms")).toBeTruthy();
				// expect(getByTestId("links")).toBeFalsy();
			});
		});
	});

	it("fetches profile data and renders fav_rooms", async () => {
		// Mock AsyncStorage.getItem to return a token
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

		// Mock axios.get to return mock profile data
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
				count: 0,
				data: [],
			},
			fav_rooms: {
				count: 11,
				data: [
					{
						creator: "id",
						roomID: "b9b4aebd-36cd-40bb-b329-f394fdefa0f5",
						participant_count: 0,
						room_name: "More M's",
						description: "We only talk about those M's",
						is_temporary: false,
						is_private: false,
						is_scheduled: false,
						start_date: "2024-09-02T16:35:22.185Z",
						end_date: "2024-09-02T16:35:22.185Z",
						language: "English",
						has_explicit_content: false,
						has_nsfw_content: true,
						room_image:
							"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-11T04%3A46%3A34.382Z-more-m%27s.jpeg",
					},
					{
						creator: "id",
						roomID: "b9b4aebd-36cd-40bb-b329-f394fdefa0f5",
						participant_count: 0,
						room_name: "More M's",
						description: "We only talk about those M's",
						is_temporary: false,
						is_private: false,
						is_scheduled: false,
						start_date: "2024-09-02T16:35:22.185Z",
						end_date: "2024-09-02T16:35:22.185Z",
						language: "English",
						has_explicit_content: false,
						has_nsfw_content: true,
						room_image:
							"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-11T04%3A46%3A34.382Z-more-m%27s.jpeg",
					},
				],
			},
			recent_rooms: { count: 0, data: [] },
		};

		const mockPlayerContextValue = {
			userData: mockProfileData,
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};
		(axios.get as jest.Mock).mockResolvedValue({ data: mockRoomData });
		(useLocalSearchParams as jest.Mock).mockReturnValue({});

		// Render the ProfileScreen component
		const { getByText, getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		// Wait for async operations to complete
		await act(async () => {
			await waitFor(() => {
				// Assert profile information is rendered
				expect(getByText("John Doe")).toBeTruthy();
				expect(getByText("@johndoe")).toBeTruthy();
				expect(getByText("Followers")).toBeTruthy();
				expect(getByText("Following")).toBeTruthy();
				expect(getByText("Mock bio")).toBeTruthy();
				expect(getByText("https://example.com")).toBeTruthy(); // Assuming link is rendered as text
				expect(getByText("More")).toBeTruthy();

				expect(getByTestId("profile-pic")).toBeTruthy();
				expect(getByTestId("bio")).toBeTruthy();
				expect(getByTestId("genres")).toBeTruthy();
				// expect(getByTestId("fav-songs")).toBeTruthy();
				expect(getByTestId("fav-rooms")).toBeTruthy();
				// expect(getByTestId("recent-rooms")).toBeTruthy();
				// expect(getByTestId("links")).toBeFalsy();
			});
		});
	});

	it("fetches profile data and renders recent_rooms", async () => {
		// Mock AsyncStorage.getItem to return a token
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

		// Mock axios.get to return mock profile data
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
				count: 0,
				data: [],
			},
			fav_rooms: { count: 0, data: [] },
			recent_rooms: {
				count: 11,
				data: [
					{
						creator: "id",
						roomID: "b9b4aebd-36cd-40bb-b329-f394fdefa0f5",
						participant_count: 0,
						room_name: "More M's",
						description: "We only talk about those M's",
						is_temporary: false,
						is_private: false,
						is_scheduled: false,
						start_date: "2024-09-02T16:35:22.185Z",
						end_date: "2024-09-02T16:35:22.185Z",
						language: "English",
						has_explicit_content: false,
						has_nsfw_content: true,
						room_image:
							"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-11T04%3A46%3A34.382Z-more-m%27s.jpeg",
					},
					{
						creator: "id",
						roomID: "b9b4aebd-36cd-40bb-b329-f394fdefa0f5",
						participant_count: 0,
						room_name: "More M's",
						description: "We only talk about those M's",
						is_temporary: false,
						is_private: false,
						is_scheduled: false,
						start_date: "2024-09-02T16:35:22.185Z",
						end_date: "2024-09-02T16:35:22.185Z",
						language: "English",
						has_explicit_content: false,
						has_nsfw_content: true,
						room_image:
							"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-11T04%3A46%3A34.382Z-more-m%27s.jpeg",
					},
				],
			},
		};

		const mockPlayerContextValue = {
			userData: mockProfileData,
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};
		(axios.get as jest.Mock).mockResolvedValue({ data: mockRoomData });
		(useLocalSearchParams as jest.Mock).mockReturnValue({});

		// Render the ProfileScreen component
		const { getByText, getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		// Wait for async operations to complete
		await act(async () => {
			await waitFor(() => {
				// Assert profile information is rendered
				expect(getByText("John Doe")).toBeTruthy();
				expect(getByText("@johndoe")).toBeTruthy();
				expect(getByText("Followers")).toBeTruthy();
				expect(getByText("Following")).toBeTruthy();
				expect(getByText("Mock bio")).toBeTruthy();
				expect(getByText("https://example.com")).toBeTruthy(); // Assuming link is rendered as text
				expect(getByText("More")).toBeTruthy();

				expect(getByTestId("profile-pic")).toBeTruthy();
				expect(getByTestId("bio")).toBeTruthy();
				expect(getByTestId("genres")).toBeTruthy();
				// expect(getByTestId("fav-songs")).toBeTruthy();
				// expect(getByTestId("fav-rooms")).toBeTruthy();
				expect(getByTestId("recent-rooms")).toBeTruthy();
				// expect(getByTestId("links")).toBeFalsy();
			});
		});
	});

	it("fetches profile data and renders profile information if user data is null", async () => {
		// Mock AsyncStorage.getItem to return a token
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

		// Mock axios.get to return mock profile data
		const mockProfileData = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "johndoe",
			followers: { count: 0 },
			following: { count: 0 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockPlayerContextValue = {
			userData: null,
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};
		(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProfileData });
		(axios.get as jest.Mock).mockResolvedValue({ data: mockRoomData });
		(useLocalSearchParams as jest.Mock).mockReturnValue({});

		// Render the ProfileScreen component
		const { getByText, getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		// console.log(
		// 	"2nd axios.get was called:",
		// 	(axios.get as jest.Mock).mock.calls.length,
		// 	"times",
		// );
		// Wait for async operations to complete
		await act(async () => {
			await waitFor(() => {
				// Assert profile information is rendered
				expect(getByText("John Doe")).toBeTruthy();
				expect(getByText("@johndoe")).toBeTruthy();
				expect(getByText("Followers")).toBeTruthy();
				expect(getByText("Following")).toBeTruthy();
				expect(getByText("Mock bio")).toBeTruthy();
				expect(getByText("https://example.com")).toBeTruthy(); // Assuming link is rendered as text

				expect(getByTestId("profile-pic")).toBeTruthy();
				expect(getByTestId("bio")).toBeTruthy();
				expect(getByTestId("genres")).toBeTruthy();
				// expect(getByTestId("fav-songs")).toBeTruthy();
				// expect(getByTestId("fav-rooms")).toBeTruthy();
				// expect(getByTestId("recent-rooms")).toBeTruthy();
				// expect(getByTestId("links")).toBeFalsy();
			});
		});
	});

	it("fetches profile data for other page where there is no current room", async () => {
		// Mock AsyncStorage.getItem to return a token
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

		// Mock axios.get to return mock profile data
		const mockProfileData = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "johndoe",
			followers: { count: 1, data: [{ username: "Jaden" }] },
			following: { count: 0 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockProfileData2 = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "Jaden",
			followers: { count: 0 },
			following: { count: 1, data: [{ username: "johndoe" }] },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockPlayerContextValue = {
			userData: mockProfileData2,
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};

		(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProfileData });
		(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockRoomData });
		(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockRoomData });

		(axios.get as jest.Mock).mockRejectedValueOnce({
			response: {
				status: 404,
				data: {
					message: "User is not in a room",
				},
			},
		});
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			friend: JSON.stringify({ profilePicture: "", username: "l" }),
			user: "Jaden",
		});

		// Render the ProfileScreen component
		const { getByText, getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		// Wait for async operations to complete
		await act(async () => {
			await waitFor(() => {
				// Assert profile information is rendered
				expect(getByText("John Doe")).toBeTruthy();
				expect(getByText("@johndoe")).toBeTruthy();
				expect(getByText("Followers")).toBeTruthy();
				expect(getByText("Following")).toBeTruthy();
				expect(getByText("Mock bio")).toBeTruthy();
				expect(getByText("https://example.com")).toBeTruthy(); // Assuming link is rendered as text
				expect(getByText("Unfollow")).toBeTruthy();

				expect(getByTestId("profile-pic")).toBeTruthy();
				expect(getByTestId("bio")).toBeTruthy();
				expect(getByTestId("genres")).toBeTruthy();
				// expect(getByTestId("fav-songs")).toBeTruthy();
				// expect(getByTestId("fav-rooms")).toBeTruthy();
				// expect(getByTestId("recent-rooms")).toBeTruthy();
				// expect(getByTestId("links")).toBeFalsy();
			});
		});
	});

	it("fetches profile data for other page where there are cached rooms owned by user", async () => {
		// Mock AsyncStorage.getItem to return a token
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");
		(StorageService.getItem as jest.Mock).mockResolvedValueOnce(
			'[{"profile_picture_url":"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg","username":"theoriginalles@gmail.com"},{"profile_picture_url":"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/IMG_20230913_153948_541.jpg","username":"Solo"}]',
		);

		// Mock axios.get to return mock profile data
		const mockProfileData = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "johndoe",
			followers: { count: 1, data: [{ username: "Jaden" }] },
			following: { count: 0 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockProfileData2 = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "Jaden",
			followers: { count: 0 },
			following: { count: 1, data: [{ username: "johndoe" }] },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockPlayerContextValue = {
			userData: mockProfileData2,
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};

		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: mockProfileData })
			.mockResolvedValueOnce({ data: mockRoomData })
			.mockResolvedValueOnce({ data: mockRoomData })
			.mockResolvedValue({ data: mockCurrRoomData });
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			friend: JSON.stringify({ profilePicture: "", username: "l" }),
			user: "Jaden",
		});

		// Render the ProfileScreen component
		const { getByText, getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		// Wait for async operations to complete
		await act(async () => {
			await waitFor(() => {
				// Assert profile information is rendered
				expect(getByText("John Doe")).toBeTruthy();
				expect(getByText("@johndoe")).toBeTruthy();
				expect(getByText("Followers")).toBeTruthy();
				expect(getByText("Following")).toBeTruthy();
				expect(getByText("Mock bio")).toBeTruthy();
				expect(getByText("https://example.com")).toBeTruthy(); // Assuming link is rendered as text
				expect(getByText("Unfollow")).toBeTruthy();

				expect(getByTestId("profile-pic")).toBeTruthy();
				expect(getByTestId("bio")).toBeTruthy();
				expect(getByTestId("genres")).toBeTruthy();
				// expect(getByTestId("fav-songs")).toBeTruthy();
				// expect(getByTestId("fav-rooms")).toBeTruthy();
				// expect(getByTestId("recent-rooms")).toBeTruthy();
				// expect(getByTestId("links")).toBeFalsy();
			});
		});
	});

	it("fetches profile data for other page where user is already following person", async () => {
		// Mock AsyncStorage.getItem to return a token
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

		// Mock axios.get to return mock profile data
		const mockProfileData = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "johndoe",
			followers: { count: 1, data: [{ username: "Jaden" }] },
			following: { count: 0 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockProfileData2 = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "Jaden",
			followers: { count: 0 },
			following: { count: 1, data: [{ username: "johndoe" }] },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockPlayerContextValue = {
			userData: mockProfileData2,
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};

		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: mockProfileData })
			.mockResolvedValueOnce({ data: mockRoomData })
			.mockResolvedValueOnce({ data: mockRoomData })
			.mockResolvedValueOnce({ data: mockCurrRoomData });
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			friend: JSON.stringify({ profilePicture: "", username: "l" }),
			user: "Jaden",
		});

		// Render the ProfileScreen component
		const { getByText, getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		// Wait for async operations to complete
		await act(async () => {
			await waitFor(() => {
				// Assert profile information is rendered
				expect(getByText("John Doe")).toBeTruthy();
				expect(getByText("@johndoe")).toBeTruthy();
				expect(getByText("Followers")).toBeTruthy();
				expect(getByText("Following")).toBeTruthy();
				expect(getByText("Mock bio")).toBeTruthy();
				expect(getByText("https://example.com")).toBeTruthy(); // Assuming link is rendered as text
				expect(getByText("Unfollow")).toBeTruthy();

				expect(getByTestId("profile-pic")).toBeTruthy();
				expect(getByTestId("bio")).toBeTruthy();
				expect(getByTestId("genres")).toBeTruthy();
				// expect(getByTestId("fav-songs")).toBeTruthy();
				// expect(getByTestId("fav-rooms")).toBeTruthy();
				// expect(getByTestId("recent-rooms")).toBeTruthy();
				// expect(getByTestId("links")).toBeFalsy();
			});
		});
	});

	it("fetches profile data for other page where user is not following person", async () => {
		// Mock AsyncStorage.getItem to return a token
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

		// Mock axios.get to return mock profile data
		const mockProfileData = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "johndoe",
			followers: { count: 10, data: [] },
			following: { count: 20 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockProfileData2 = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "Jaden",
			followers: { count: 0 },
			following: { count: 0 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockPlayerContextValue = {
			userData: mockProfileData2,
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};

		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: mockProfileData })
			.mockResolvedValueOnce({ data: mockRoomData })
			.mockResolvedValueOnce({ data: mockRoomData })
			.mockResolvedValueOnce({ data: mockCurrRoomData });
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			friend: JSON.stringify({ profilePicture: "", username: "l" }),
			user: "Jaden",
		});

		// Render the ProfileScreen component
		const { getByText, getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		// Wait for async operations to complete
		await act(async () => {
			await waitFor(() => {
				// Assert profile information is rendered
				expect(getByText("John Doe")).toBeTruthy();
				expect(getByText("@johndoe")).toBeTruthy();
				expect(getByText("Followers")).toBeTruthy();
				expect(getByText("Following")).toBeTruthy();
				expect(getByText("Mock bio")).toBeTruthy();
				expect(getByText("https://example.com")).toBeTruthy(); // Assuming link is rendered as text
				expect(getByText("Follow")).toBeTruthy();

				expect(getByTestId("profile-pic")).toBeTruthy();
				expect(getByTestId("bio")).toBeTruthy();
				expect(getByTestId("genres")).toBeTruthy();
				// expect(getByTestId("fav-songs")).toBeTruthy();
				// expect(getByTestId("fav-rooms")).toBeTruthy();
				// expect(getByTestId("recent-rooms")).toBeTruthy();
				// expect(getByTestId("links")).toBeFalsy();
			});
		});
	});

	it("handles a unfollow request", async () => {
		// Mock AsyncStorage.getItem to return a token
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

		// Mock axios.get to return mock profile data
		const mockProfileData = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "johndoe",
			followers: { count: 10, data: [{ username: "Jaden" }] },
			following: { count: 20 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: [{ type: "example", links: "https://example.com" }],
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockProfileData2 = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "Jaden",
			followers: { count: 10 },
			following: { count: 20, data: [{ username: "johndoe" }] },
			bio: "Mock bio",
			links: {
				count: 1,
				data: [{ type: "example", links: "https://example.com" }],
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockPlayerContextValue = {
			userData: mockProfileData2,
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};

		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: mockProfileData })
			.mockResolvedValueOnce({ data: mockRoomData })
			.mockResolvedValueOnce({ data: mockRoomData })
			.mockResolvedValueOnce({ data: mockCurrRoomData });
		(axios.post as jest.Mock).mockResolvedValue(true);
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			friend: JSON.stringify({ profilePicture: "", username: "l" }),
			user: "Jaden",
		});

		// Render the ProfileScreen component
		const { getByText, getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		// Wait for async operations to complete
		await act(async () => {
			await waitFor(async () => {
				const touchableOpacity = getByTestId("follow-button");
				fireEvent.press(touchableOpacity);

				await waitFor(() => {
					expect(getByText("Follow")).toBeTruthy();
				});
			});
		});
	});

	it("handles a follow request", async () => {
		// Mock AsyncStorage.getItem to return a token
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

		// Mock axios.get to return mock profile data
		const mockProfileData = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "johndoe",
			followers: { count: 10, data: [] },
			following: { count: 20 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: [{ type: "example", links: "https://example.com" }],
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockProfileData2 = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "Jaden",
			followers: { count: 0 },
			following: { count: 0 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: [{ type: "example", links: "https://example.com" }],
			},
			fav_genres: { count: 1, data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};

		const mockPlayerContextValue = {
			userData: mockProfileData2,
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};

		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: mockProfileData })
			.mockResolvedValueOnce({ data: mockRoomData })
			.mockResolvedValueOnce({ data: mockRoomData })
			.mockResolvedValueOnce({ data: mockCurrRoomData });
		(axios.post as jest.Mock).mockResolvedValue(true);
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			friend: JSON.stringify({ profilePicture: "", username: "l" }),
			user: "Jaden",
		});

		// Render the ProfileScreen component
		const { getByText, getByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		// Wait for async operations to complete
		await act(async () => {
			await waitFor(async () => {
				const touchableOpacity = getByTestId("follow-button");
				fireEvent.press(touchableOpacity);

				await waitFor(() => {
					expect(getByText("Unfollow")).toBeTruthy();
				});
			});
		});
	});

	describe("renderLinks function", () => {
		beforeEach(() => {
			// Clear mocks and set initial states
			jest.clearAllMocks();
			(AsyncStorage.getItem as jest.Mock).mockClear();
			(axios.get as jest.Mock).mockClear();
		});

		it("renders multiple links correctly", async () => {
			// Mock AsyncStorage.getItem to return a token
			(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

			// Mock axios.get to return mock profile data
			const mockProfileData = {
				profile_picture_url: "https://example.com/profile-pic.jpg",
				profile_name: "John Doe",
				username: "johndoe",
				followers: { count: 10 },
				following: { count: 20 },
				bio: "Mock bio",
				links: {
					count: 3,
					data: {
						other: ["https://example.com"],
						instagram: [
							"http://instagram.com/test",
							"https://instagram.com/testing",
						],
					},
				},
				fav_genres: { data: [] },
				fav_songs: { data: [] },
				fav_rooms: { count: 0, data: [] },
				recent_rooms: { count: 0, data: [] },
			};

			const mockPlayerContextValue = {
				userData: mockProfileData,
				setUserData: jest.fn(),
				currentRoom: "Room 1",
			};

			(axios.get as jest.Mock).mockResolvedValue({ data: mockRoomData });
			(useLocalSearchParams as jest.Mock).mockReturnValue({});

			// Render the ProfileScreen component
			const { getByText } = render(
				<PlayerContextProviderMock value={mockPlayerContextValue}>
					<ProfileScreen />
				</PlayerContextProviderMock>,
			);

			// Wait for async operations to complete
			await act(async () => {
				await waitFor(() => {
					// Assert profile information is rendered
					const firstLinkText = getByText(
						"https://example.com and 2 more links",
					);
					expect(firstLinkText).toBeTruthy();
				});
			});
		});

		it("renders single link correctly", async () => {
			// Mock AsyncStorage.getItem to return a token
			(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

			// Mock axios.get to return mock profile data
			const mockProfileData = {
				profile_picture_url: "https://example.com/profile-pic.jpg",
				profile_name: "John Doe",
				username: "johndoe",
				followers: { count: 10 },
				following: { count: 20 },
				bio: "Mock bio",
				links: {
					count: 1,
					data: { other: ["https://example.com"] },
				},
				fav_genres: { data: [] },
				fav_songs: { data: [] },
				fav_rooms: { count: 0, data: [] },
				recent_rooms: { count: 0, data: [] },
			};

			const mockPlayerContextValue = {
				userData: mockProfileData,
				setUserData: jest.fn(),
				currentRoom: "Room 1",
			};

			(useLocalSearchParams as jest.Mock).mockReturnValue({});
			(axios.get as jest.Mock)
				.mockResolvedValue({ data: mockProfileData })
				.mockResolvedValueOnce({ data: mockRoomData })
				.mockResolvedValueOnce({ data: mockRoomData })
				.mockResolvedValueOnce({ data: mockCurrRoomData });

			// Render the ProfileScreen component
			const { getByText } = render(
				<PlayerContextProviderMock value={mockPlayerContextValue}>
					<ProfileScreen />
				</PlayerContextProviderMock>,
			);

			// Wait for async operations to complete
			await act(async () => {
				await waitFor(() => {
					const singleLinkText = getByText("https://example.com");
					expect(singleLinkText).toBeTruthy();
				});
			});
		});

		it("does not render any links when count is zero", () => {
			const mockProfileData = {
				profile_picture_url: "https://example.com/profile-pic.jpg",
				profile_name: "John Doe",
				username: "johndoe",
				followers: { count: 0 },
				following: { count: 0 },
				bio: "Mock bio",
				links: {
					count: 0,
					data: [],
				},
				fav_genres: { count: 1, data: [] },
				fav_songs: { data: [] },
				fav_rooms: { count: 0, data: [] },
				recent_rooms: { count: 0, data: [] },
			};
			(useLocalSearchParams as jest.Mock).mockReturnValue({});

			const mockPlayerContextValue = {
				userData: mockProfileData,
				setUserData: jest.fn(),
				currentRoom: "Room 1",
			};

			const { queryByTestId } = render(
				<PlayerContextProviderMock value={mockPlayerContextValue}>
					<ProfileScreen />
				</PlayerContextProviderMock>,
			);

			// Assert that the links container is not rendered
			const linksContainer = queryByTestId("links");
			expect(linksContainer).toBeNull();
		});
	});

	describe("renderFavRooms function", () => {
		it("renders favorite rooms when count is greater than zero", async () => {
			(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");
			const mockProfileData = {
				profile_picture_url: "https://example.com/profile-pic.jpg",
				profile_name: "John Doe",
				username: "johndoe",
				followers: { count: 10 },
				following: { count: 20 },
				bio: "Mock bio",
				links: {
					count: 1,
					data: [{ type: "example", links: "https://example.com/single-link" }],
				},
				fav_genres: { data: [] },
				fav_songs: { data: [] },
				fav_rooms: {
					count: 2,
					data: [
						{
							creator: {
								profile_name: "Jaden Moodley",
								userID: "012c4238-e071-7031-cb6c-30881378722f",
								username: "Jaden",
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
									data: [
										{
											type: "Instagram",
											links: "instagram.com/adventurous_epoch",
										},
										{
											type: "Instagram",
											links: "instagram.com/general_epoch",
										},
									],
								},
								bio: "Humanity is a boon",
								current_song: {
									title: "",
									artists: [],
									cover: "",
									start_time: "2024-08-25T10:15:02.532Z",
								},
								fav_genres: {
									count: 4,
									data: ["j-pop", "rock", "jazz", "metal"],
								},
								fav_songs: {
									count: 2,
									data: [
										{
											title: "Faster",
											artists: "Good Kid",
											cover:
												"https://store.goodkidofficial.com/cdn/shop/products/GoodKidAlbumCover.jpg?v=1528948601",
											start_time: "",
										},
										{
											title: "Bohemian Rhapsody",
											artists: "Queen",
											cover:
												"https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png",
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
							roomID: "8f928675-5c95-497a-b8a7-917064cdb462",
							participant_count: 0,
							room_name: "Room 1",
							description: "Submerge yourself in solace",
							is_temporary: false,
							is_private: true,
							is_scheduled: false,
							start_date: "2024-08-25T10:15:02.406Z",
							end_date: "2024-08-25T10:15:02.406Z",
							language: "English",
							has_explicit_content: false,
							has_nsfw_content: false,
							room_image:
								"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-10T18%3A23%3A52.849Z-testing.jpeg",
							current_song: {
								title: "",
								artists: [],
								cover: "",
								start_time: "2024-08-25T10:15:02.406Z",
							},
							tags: [],
						},
						{
							creator: {
								profile_name: "Jaden Moodley",
								userID: "012c4238-e071-7031-cb6c-30881378722f",
								username: "Jaden",
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
									data: [
										{
											type: "Instagram",
											links: "instagram.com/adventurous_epoch",
										},
										{
											type: "Instagram",
											links: "instagram.com/general_epoch",
										},
									],
								},
								bio: "Humanity is a boon",
								current_song: {
									title: "",
									artists: [],
									cover: "",
									start_time: "2024-08-25T10:15:02.532Z",
								},
								fav_genres: {
									count: 4,
									data: ["j-pop", "rock", "jazz", "metal"],
								},
								fav_songs: {
									count: 2,
									data: [
										{
											title: "Faster",
											artists: "Good Kid",
											cover:
												"https://store.goodkidofficial.com/cdn/shop/products/GoodKidAlbumCover.jpg?v=1528948601",
											start_time: "",
										},
										{
											title: "Bohemian Rhapsody",
											artists: "Queen",
											cover:
												"https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png",
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
							roomID: "8f928675-5c95-497a-b8a7-917064cdb462",
							participant_count: 0,
							room_name: "Room 2",
							description: "Submerge yourself in solace",
							is_temporary: false,
							is_private: true,
							is_scheduled: false,
							start_date: "2024-08-25T10:15:02.406Z",
							end_date: "2024-08-25T10:15:02.406Z",
							language: "English",
							has_explicit_content: false,
							has_nsfw_content: false,
							room_image:
								"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-10T18%3A23%3A52.849Z-testing.jpeg",
							current_song: {
								title: "",
								artists: [],
								cover: "",
								start_time: "2024-08-25T10:15:02.406Z",
							},
							tags: [],
						},
					],
				},
				recent_rooms: { count: 0, data: [] },
			};

			const mockPlayerContextValue = {
				userData: mockProfileData,
				setUserData: jest.fn(),
				currentRoom: "Room 1",
			};

			(axios.get as jest.Mock)
				.mockResolvedValue({ data: mockProfileData })
				.mockResolvedValueOnce({ data: mockRoomData })
				.mockResolvedValueOnce({ data: mockRoomData })
				.mockResolvedValueOnce({ data: mockCurrRoomData });
			(useLocalSearchParams as jest.Mock).mockReturnValue({});

			// Render the ProfileScreen component
			const { getByText, getByTestId } = render(
				<PlayerContextProviderMock value={mockPlayerContextValue}>
					<ProfileScreen />
				</PlayerContextProviderMock>,
			);

			// Assert that the title "Favorite Rooms" is rendered
			await act(async () => {
				await waitFor(() => {
					const titleElement = getByText("Favorite Rooms");
					expect(titleElement).toBeTruthy();

					// Assert that room cards are rendered for each room in profileData
					const room1Name = getByText("Marvel");
					expect(room1Name).toBeTruthy();

					const room2Name = getByText("Abyssal Paradise");
					expect(room2Name).toBeTruthy();

					// Assert the presence of the testID on the container view
					// const favRoomsContainer = getByTestId("fav-rooms");
					// expect(favRoomsContainer).toBeTruthy();
				});
			});
		});

		it("does not render favorite rooms when count is zero", () => {
			const mockProfileData = {
				profile_picture_url: "https://example.com/profile-pic.jpg",
				profile_name: "John Doe",
				username: "johndoe",
				followers: { count: 0 },
				following: { count: 0 },
				bio: "Mock bio",
				links: {
					count: 0,
					data: [],
				},
				fav_genres: { count: 1, data: [] },
				fav_songs: { data: [] },
				fav_rooms: { count: 0, data: [] },
				recent_rooms: { count: 0, data: [] },
			};
			(useLocalSearchParams as jest.Mock).mockReturnValue({});

			const mockPlayerContextValue = {
				userData: mockProfileData,
				setUserData: jest.fn(),
				currentRoom: "Room 1",
			};

			// Render the ProfileScreen component
			const { queryByText, queryByTestId } = render(
				<PlayerContextProviderMock value={mockPlayerContextValue}>
					<ProfileScreen />
				</PlayerContextProviderMock>,
			);

			// Assert that the title "Favorite Rooms" is not rendered
			const titleElement = queryByText("Favorite Rooms");
			expect(titleElement).toBeFalsy;

			// Assert that no room cards are rendered
			const room1Name = queryByText("Room 1");
			expect(room1Name).toBeFalsy;

			const room2Name = queryByText("Room 2");
			expect(room2Name).toBeFalsy;

			// Assert the absence of the testID on the container view
			// const favRoomsContainer = queryByTestId("fav-rooms");
			// expect(favRoomsContainer).toBeNull();
		});
	});

	describe("renderRecentRooms function", () => {
		it("renders recent rooms when count is greater than zero", async () => {
			(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");
			const mockProfileData = {
				profile_picture_url: "https://example.com/profile-pic.jpg",
				profile_name: "John Doe",
				username: "johndoe",
				followers: { count: 10 },
				following: { count: 20 },
				bio: "Mock bio",
				links: {
					count: 0,
					data: [],
				},
				fav_genres: { data: [] },
				fav_songs: { data: [] },
				fav_rooms: {
					count: 0,
					data: [],
				},
				recent_rooms: {
					count: 2,
					data: [
						{
							creator: {
								profile_name: "Jaden Moodley",
								userID: "012c4238-e071-7031-cb6c-30881378722f",
								username: "Jaden",
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
									data: [
										{
											type: "Instagram",
											links: "instagram.com/adventurous_epoch",
										},
										{
											type: "Instagram",
											links: "instagram.com/general_epoch",
										},
									],
								},
								bio: "Humanity is a boon",
								current_song: {
									title: "",
									artists: [],
									cover: "",
									start_time: "2024-08-25T10:15:02.532Z",
								},
								fav_genres: {
									count: 4,
									data: ["j-pop", "rock", "jazz", "metal"],
								},
								fav_songs: {
									count: 2,
									data: [
										{
											title: "Faster",
											artists: "Good Kid",
											cover:
												"https://store.goodkidofficial.com/cdn/shop/products/GoodKidAlbumCover.jpg?v=1528948601",
											start_time: "",
										},
										{
											title: "Bohemian Rhapsody",
											artists: "Queen",
											cover:
												"https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png",
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
							roomID: "8f928675-5c95-497a-b8a7-917064cdb462",
							participant_count: 0,
							room_name: "Room 1",
							description: "Submerge yourself in solace",
							is_temporary: false,
							is_private: true,
							is_scheduled: false,
							start_date: "2024-08-25T10:15:02.406Z",
							end_date: "2024-08-25T10:15:02.406Z",
							language: "English",
							has_explicit_content: false,
							has_nsfw_content: false,
							room_image:
								"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-10T18%3A23%3A52.849Z-testing.jpeg",
							current_song: {
								title: "",
								artists: [],
								cover: "",
								start_time: "2024-08-25T10:15:02.406Z",
							},
							tags: [],
						},
						{
							creator: {
								profile_name: "Jaden Moodley",
								userID: "012c4238-e071-7031-cb6c-30881378722f",
								username: "Jaden",
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
									data: [
										{
											type: "Instagram",
											links: "instagram.com/adventurous_epoch",
										},
										{
											type: "Instagram",
											links: "instagram.com/general_epoch",
										},
									],
								},
								bio: "Humanity is a boon",
								current_song: {
									title: "",
									artists: [],
									cover: "",
									start_time: "2024-08-25T10:15:02.532Z",
								},
								fav_genres: {
									count: 4,
									data: ["j-pop", "rock", "jazz", "metal"],
								},
								fav_songs: {
									count: 2,
									data: [
										{
											title: "Faster",
											artists: "Good Kid",
											cover:
												"https://store.goodkidofficial.com/cdn/shop/products/GoodKidAlbumCover.jpg?v=1528948601",
											start_time: "",
										},
										{
											title: "Bohemian Rhapsody",
											artists: "Queen",
											cover:
												"https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png",
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
							roomID: "8f928675-5c95-497a-b8a7-917064cdb462",
							participant_count: 0,
							room_name: "Room 2",
							description: "Submerge yourself in solace",
							is_temporary: false,
							is_private: true,
							is_scheduled: false,
							start_date: "2024-08-25T10:15:02.406Z",
							end_date: "2024-08-25T10:15:02.406Z",
							language: "English",
							has_explicit_content: false,
							has_nsfw_content: false,
							room_image:
								"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-08-10T18%3A23%3A52.849Z-testing.jpeg",
							current_song: {
								title: "",
								artists: [],
								cover: "",
								start_time: "2024-08-25T10:15:02.406Z",
							},
							tags: [],
						},
					],
				},
			};

			const mockPlayerContextValue = {
				userData: mockProfileData,
				setUserData: jest.fn(),
				currentRoom: "Room 1",
			};

			(useLocalSearchParams as jest.Mock).mockReturnValue({});
			(axios.get as jest.Mock)
				.mockResolvedValue({ data: mockProfileData })
				.mockResolvedValueOnce({ data: mockRoomData })
				.mockResolvedValueOnce({ data: mockRoomData })
				.mockResolvedValueOnce({ data: mockCurrRoomData });

			// Render the ProfileScreen component
			const { getByText, getByTestId } = render(
				<PlayerContextProviderMock value={mockPlayerContextValue}>
					<ProfileScreen />
				</PlayerContextProviderMock>,
			);

			// Assert that the title "Recent Rooms" is rendered
			await act(async () => {
				await waitFor(() => {
					const titleElement = getByText("Recent Rooms");
					expect(titleElement).toBeTruthy();

					// Assert that room cards are rendered for each room in profileData
					const room1Name = getByText("Marvel");
					expect(room1Name).toBeTruthy();

					const room2Name = getByText("Abyssal Paradise");
					expect(room2Name).toBeTruthy();

					// Assert the presence of the testID on the container view
					// const favRoomsContainer = getByTestId("recent-rooms");
					// expect(favRoomsContainer).toBeTruthy();
				});
			});
		});

		it("does not render recent rooms when count is zero", () => {
			const mockProfileData = {
				profile_picture_url: "https://example.com/profile-pic.jpg",
				profile_name: "John Doe",
				username: "johndoe",
				followers: { count: 0 },
				following: { count: 0 },
				bio: "Mock bio",
				links: {
					count: 0,
					data: [],
				},
				fav_genres: { count: 1, data: [] },
				fav_songs: { data: [] },
				fav_rooms: { count: 0, data: [] },
				recent_rooms: { count: 0, data: [] },
			};
			const mockPlayerContextValue = {
				userData: mockProfileData,
				setUserData: jest.fn(),
				currentRoom: "Room 1",
			};

			(useLocalSearchParams as jest.Mock).mockReturnValue({});

			const { queryByText, queryByTestId } = render(
				<PlayerContextProviderMock value={mockPlayerContextValue}>
					<ProfileScreen />
				</PlayerContextProviderMock>,
			);

			const titleElement = queryByText("Recent Rooms");
			expect(titleElement).toBeFalsy;

			// Assert that no room cards are rendered
			const room1Name = queryByText("Room 1");
			expect(room1Name).toBeFalsy;

			const room2Name = queryByText("Room 2");
			expect(room2Name).toBeFalsy;

			// Assert the absence of the testID on the container view
			// const favRoomsContainer = queryByTestId("fav-rooms");
			// expect(favRoomsContainer).toBeNull();
		});
	});

	it("should toggle LinkBottomSheet visibility", async () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue("mock-token");
		const mockProfileData = {
			profile_picture_url: "https://example.com/profile-pic.jpg",
			profile_name: "John Doe",
			username: "johndoe",
			followers: { count: 10 },
			following: { count: 20 },
			bio: "Mock bio",
			links: {
				count: 1,
				data: { other: ["https://example.com"] },
			},
			fav_genres: { data: [] },
			fav_songs: { data: [] },
			fav_rooms: {
				count: 0,
				data: [],
			},
			recent_rooms: {
				count: 0,
				data: [],
			},
		};

		const mockPlayerContextValue = {
			userData: mockProfileData,
			setUserData: jest.fn(),
			currentRoom: "Room 1",
		};

		(useLocalSearchParams as jest.Mock).mockReturnValue({});
		(axios.get as jest.Mock)
			.mockResolvedValue({ data: mockProfileData })
			.mockResolvedValueOnce({ data: mockRoomData })
			.mockResolvedValueOnce({ data: mockRoomData })
			.mockResolvedValueOnce({ data: mockCurrRoomData });
		const { getByTestId, queryByTestId, getByText } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<ProfileScreen />
			</PlayerContextProviderMock>,
		);

		// Wait for async operations to complete and profile data to be rendered
		await waitFor(() => expect(getByText("John Doe")).toBeTruthy());
		expect(queryByTestId("link-bottom-sheet")).toBeNull();

		await act(async () => {
			const touchableOpacity = getByTestId("links-touchable");
			fireEvent.press(touchableOpacity);

			await waitFor(() => {
				// Check if LinkBottomSheet is visible
				expect(getByTestId("link-bottom-sheet")).toBeTruthy();
			});
		});
	});
});
