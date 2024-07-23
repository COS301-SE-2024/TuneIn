import React from "react";
import { render, waitFor, act, fireEvent } from "@testing-library/react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../app/services/AuthManagement";
import ProfileScreen from "../app/screens/profile/ProfilePage";

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

describe("ProfileScreen", () => {
	beforeEach(() => {
		// Clear mocks and set initial states
		jest.clearAllMocks();
		(AsyncStorage.getItem as jest.Mock).mockClear();
		(axios.get as jest.Mock).mockClear();
		(auth.getToken as jest.Mock).mockReturnValue("token"); // Mock the token for the test
	});

	it("renders loading indicator initially", async () => {
		const { getByTestId } = render(<ProfileScreen />);

		const loadingIndicator = getByTestId("loading-indicator");
		expect(loadingIndicator).toBeTruthy();
	});

	// it("fetches profile data and renders profile information", async () => {
	// 	// Mock AsyncStorage.getItem to return a token
	// 	(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

	// 	// Mock axios.get to return mock profile data
	// 	const mockProfileData = {
	// 		profile_picture_url: "https://example.com/profile-pic.jpg",
	// 		profile_name: "John Doe",
	// 		username: "johndoe",
	// 		followers: { count: 10 },
	// 		following: { count: 20 },
	// 		bio: "Mock bio",
	// 		links: {
	// 			count: 1,
	// 			data: [{ type: "example", links: "https://example.com" }],
	// 		},
	// 		fav_genres: { data: [] },
	// 		fav_songs: { data: [] },
	// 		fav_rooms: { count: 0, data: [] },
	// 		recent_rooms: { count: 0, data: [] },
	// 	};
	// 	(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProfileData });

	// 	// Render the ProfileScreen component
	// 	const { getByText, getByTestId } = render(<ProfileScreen />);

	// 	// Wait for async operations to complete
	// 	await act(async () => {
	// 		await waitFor(() => {
	// 			// Assert profile information is rendered
	// 			expect(getByText("John Doe")).toBeTruthy();
	// 			expect(getByText("@johndoe")).toBeTruthy();
	// 			expect(getByText("Followers")).toBeTruthy();
	// 			expect(getByText("Following")).toBeTruthy();
	// 			expect(getByText("Mock bio")).toBeTruthy();
	// 			expect(getByText("https://example.com")).toBeTruthy(); // Assuming link is rendered as text

	// 			expect(getByTestId("profile-pic")).toBeTruthy();
	// 			expect(getByTestId("bio")).toBeTruthy();
	// 			expect(getByTestId("genres")).toBeTruthy();
	// 			expect(getByTestId("fav-songs")).toBeTruthy();
	// 			// expect(getByTestId("fav-rooms")).toBeTruthy();
	// 			// expect(getByTestId("recent-rooms")).toBeTruthy();
	// 			// expect(getByTestId("links")).toBeFalsy();
	// 		});
	// 	});
	// });

	// describe("renderLinks function", () => {
	// 	beforeEach(() => {
	// 		// Clear mocks and set initial states
	// 		jest.clearAllMocks();
	// 		(AsyncStorage.getItem as jest.Mock).mockClear();
	// 		(axios.get as jest.Mock).mockClear();
	// 	});

	// 	it("renders multiple links correctly", async () => {
	// 		// Mock AsyncStorage.getItem to return a token
	// 		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

	// 		// Mock axios.get to return mock profile data
	// 		const mockProfileData = {
	// 			profile_picture_url: "https://example.com/profile-pic.jpg",
	// 			profile_name: "John Doe",
	// 			username: "johndoe",
	// 			followers: { count: 10 },
	// 			following: { count: 20 },
	// 			bio: "Mock bio",
	// 			links: {
	// 				count: 3,
	// 				data: [
	// 					{ type: "example", links: "https://example.com/link1" },
	// 					{ type: "example", links: "https://example.com/link2" },
	// 					{ type: "example", links: "https://example.com/link3" },
	// 				],
	// 			},
	// 			fav_genres: { data: [] },
	// 			fav_songs: { data: [] },
	// 			fav_rooms: { count: 0, data: [] },
	// 			recent_rooms: { count: 0, data: [] },
	// 		};
	// 		(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProfileData });

	// 		// Render the ProfileScreen component
	// 		const { getByText } = render(<ProfileScreen />);

	// 		// Wait for async operations to complete
	// 		await act(async () => {
	// 			await waitFor(() => {
	// 				// Assert profile information is rendered
	// 				const firstLinkText = getByText(
	// 					"https://example.com/link1 and 2 more links",
	// 				);
	// 				expect(firstLinkText).toBeTruthy();
	// 			});
	// 		});
	// 	});

	// 	it("renders single link correctly", async () => {
	// 		// Mock AsyncStorage.getItem to return a token
	// 		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");

	// 		// Mock axios.get to return mock profile data
	// 		const mockProfileData = {
	// 			profile_picture_url: "https://example.com/profile-pic.jpg",
	// 			profile_name: "John Doe",
	// 			username: "johndoe",
	// 			followers: { count: 10 },
	// 			following: { count: 20 },
	// 			bio: "Mock bio",
	// 			links: {
	// 				count: 1,
	// 				data: [{ type: "example", links: "https://example.com/single-link" }],
	// 			},
	// 			fav_genres: { data: [] },
	// 			fav_songs: { data: [] },
	// 			fav_rooms: { count: 0, data: [] },
	// 			recent_rooms: { count: 0, data: [] },
	// 		};
	// 		(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProfileData });

	// 		// Render the ProfileScreen component
	// 		const { getByText } = render(<ProfileScreen />);

	// 		// Wait for async operations to complete
	// 		await act(async () => {
	// 			await waitFor(() => {
	// 				const singleLinkText = getByText("https://example.com/single-link");
	// 				expect(singleLinkText).toBeTruthy();
	// 			});
	// 		});
	// 	});

	// 	it("does not render any links when count is zero", () => {
	// 		const profileData = {
	// 			links: {
	// 				count: 0,
	// 				data: [],
	// 			},
	// 		};

	// 		const { queryByTestId } = render(
	// 			<ProfileScreen profileData={profileData} />,
	// 		);

	// 		// Assert that the links container is not rendered
	// 		const linksContainer = queryByTestId("links");
	// 		expect(linksContainer).toBeNull();
	// 	});
	// });

	// describe("renderFavRooms function", () => {
	// 	it("renders favorite rooms when count is greater than zero", async () => {
	// 		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");
	// 		const mockProfileData = {
	// 			profile_picture_url: "https://example.com/profile-pic.jpg",
	// 			profile_name: "John Doe",
	// 			username: "johndoe",
	// 			followers: { count: 10 },
	// 			following: { count: 20 },
	// 			bio: "Mock bio",
	// 			links: {
	// 				count: 1,
	// 				data: [{ type: "example", links: "https://example.com/single-link" }],
	// 			},
	// 			fav_genres: { data: [] },
	// 			fav_songs: { data: [] },
	// 			fav_rooms: {
	// 				count: 2,
	// 				data: [
	// 					{
	// 						roomId: 1,
	// 						room_name: "Room 1",
	// 						current_song: { title: "Song 1", artists: "Artist 1" },
	// 						creator: { username: "user1" },
	// 					},
	// 					{
	// 						roomId: 2,
	// 						room_name: "Room 2",
	// 						current_song: { title: "Song 2", artists: "Artist 2" },
	// 						creator: { username: "user2" },
	// 					},
	// 				],
	// 			},
	// 			recent_rooms: { count: 0, data: [] },
	// 		};

	// 		(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProfileData });

	// 		// Render the ProfileScreen component
	// 		const { getByText, getByTestId } = render(<ProfileScreen />);

	// 		// Assert that the title "Favorite Rooms" is rendered
	// 		await act(async () => {
	// 			await waitFor(() => {
	// 				const titleElement = getByText("Favorite Rooms");
	// 				expect(titleElement).toBeTruthy();

	// 				// Assert that room cards are rendered for each room in profileData
	// 				const room1Name = getByText("Room 1");
	// 				expect(room1Name).toBeTruthy();

	// 				const room2Name = getByText("Room 2");
	// 				expect(room2Name).toBeTruthy();

	// 				// Assert the presence of the testID on the container view
	// 				const favRoomsContainer = getByTestId("fav-rooms");
	// 				expect(favRoomsContainer).toBeTruthy();
	// 			});
	// 		});
	// 	});

	// 	it("does not render favorite rooms when count is zero", () => {
	// 		const profileData = {
	// 			fav_rooms: {
	// 				count: 0,
	// 				data: [],
	// 			},
	// 		};

	// 		const { queryByText, queryByTestId } = render(
	// 			<ProfileScreen profileData={profileData} />,
	// 		);

	// 		// Assert that the title "Favorite Rooms" is not rendered
	// 		const titleElement = queryByText("Favorite Rooms");
	// 		expect(titleElement).toBeNull();

	// 		// Assert that no room cards are rendered
	// 		const room1Name = queryByText("Room 1");
	// 		expect(room1Name).toBeNull();

	// 		const room2Name = queryByText("Room 2");
	// 		expect(room2Name).toBeNull();

	// 		// Assert the absence of the testID on the container view
	// 		const favRoomsContainer = queryByTestId("fav-rooms");
	// 		expect(favRoomsContainer).toBeNull();
	// 	});
	// });

	// describe("renderRecentRooms function", () => {
	// 	it("renders recent rooms when count is greater than zero", async () => {
	// 		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");
	// 		const mockProfileData = {
	// 			profile_picture_url: "https://example.com/profile-pic.jpg",
	// 			profile_name: "John Doe",
	// 			username: "johndoe",
	// 			followers: { count: 10 },
	// 			following: { count: 20 },
	// 			bio: "Mock bio",
	// 			links: {
	// 				count: 0,
	// 				data: [],
	// 			},
	// 			fav_genres: { data: [] },
	// 			fav_songs: { data: [] },
	// 			fav_rooms: {
	// 				count: 0,
	// 				data: [],
	// 			},
	// 			recent_rooms: {
	// 				count: 2,
	// 				data: [
	// 					{
	// 						roomId: 1,
	// 						room_name: "Room 1",
	// 						current_song: { title: "Song 1", artists: "Artist 1" },
	// 						creator: { username: "user1" },
	// 					},
	// 					{
	// 						roomId: 2,
	// 						room_name: "Room 2",
	// 						current_song: { title: "Song 2", artists: "Artist 2" },
	// 						creator: { username: "user2" },
	// 					},
	// 				],
	// 			},
	// 		};

	// 		(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProfileData });

	// 		// Render the ProfileScreen component
	// 		const { getByText, getByTestId } = render(<ProfileScreen />);

	// 		// Assert that the title "Recent Rooms" is rendered
	// 		await act(async () => {
	// 			await waitFor(() => {
	// 				const titleElement = getByText("Recently Visited");
	// 				expect(titleElement).toBeTruthy();

	// 				// Assert that room cards are rendered for each room in profileData
	// 				const room1Name = getByText("Room 1");
	// 				expect(room1Name).toBeTruthy();

	// 				const room2Name = getByText("Room 2");
	// 				expect(room2Name).toBeTruthy();

	// 				// Assert the presence of the testID on the container view
	// 				const favRoomsContainer = getByTestId("recent-rooms");
	// 				expect(favRoomsContainer).toBeTruthy();
	// 			});
	// 		});
	// 	});

	// 	it("does not render recent rooms when count is zero", () => {
	// 		const profileData = {
	// 			recent_rooms: {
	// 				count: 0,
	// 				data: [],
	// 			},
	// 		};

	// 		const { queryByText, queryByTestId } = render(
	// 			<ProfileScreen profileData={profileData} />,
	// 		);

	// 		// Assert that the title "Favorite Rooms" is not rendered
	// 		const titleElement = queryByText("Favorite Rooms");
	// 		expect(titleElement).toBeNull();

	// 		// Assert that no room cards are rendered
	// 		const room1Name = queryByText("Room 1");
	// 		expect(room1Name).toBeNull();

	// 		const room2Name = queryByText("Room 2");
	// 		expect(room2Name).toBeNull();

	// 		// Assert the absence of the testID on the container view
	// 		const favRoomsContainer = queryByTestId("fav-rooms");
	// 		expect(favRoomsContainer).toBeNull();
	// 	});
	// });

	// it("should toggle LinkBottomSheet visibility", async () => {
	// 	(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mock-token");
	// 	const mockProfileData = {
	// 		profile_picture_url: "https://example.com/profile-pic.jpg",
	// 		profile_name: "John Doe",
	// 		username: "johndoe",
	// 		followers: { count: 10 },
	// 		following: { count: 20 },
	// 		bio: "Mock bio",
	// 		links: {
	// 			count: 1,
	// 			data: [{ links: "https://example.com" }],
	// 		},
	// 		fav_genres: { data: [] },
	// 		fav_songs: { data: [] },
	// 		fav_rooms: {
	// 			count: 0,
	// 			data: [],
	// 		},
	// 		recent_rooms: {
	// 			count: 2,
	// 			data: [
	// 				{
	// 					roomId: 1,
	// 					room_name: "Room 1",
	// 					current_song: { title: "Song 1", artists: "Artist 1" },
	// 					creator: { username: "user1" },
	// 				},
	// 				{
	// 					roomId: 2,
	// 					room_name: "Room 2",
	// 					current_song: { title: "Song 2", artists: "Artist 2" },
	// 					creator: { username: "user2" },
	// 				},
	// 			],
	// 		},
	// 	};

	// 	(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProfileData });
	// 	const { getByTestId, queryByTestId, getByText } = render(<ProfileScreen />);

	// 	// Wait for async operations to complete and profile data to be rendered
	// 	await waitFor(() => expect(getByText("John Doe")).toBeTruthy());
	// 	expect(queryByTestId("link-bottom-sheet")).toBeNull();

	// 	await act(async () => {
	// 		const touchableOpacity = getByTestId("links-touchable");
	// 		fireEvent.press(touchableOpacity);

	// 		await waitFor(() => {
	// 			// Check if LinkBottomSheet is visible
	// 			expect(getByTestId("link-bottom-sheet")).toBeTruthy();
	// 		});
	// 	});
	// });
});
