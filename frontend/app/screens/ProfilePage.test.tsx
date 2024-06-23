import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileScreen from "./ProfilePage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
	getItem: jest.fn(),
}));

// Mock axios GET request
jest.mock("axios");

describe("ProfileScreen", () => {
	beforeEach(() => {
		// Clear mocks and set initial states
		jest.clearAllMocks();
		(AsyncStorage.getItem as jest.Mock).mockClear();
		(axios.get as jest.Mock).mockClear();
	});

	it("renders loading indicator initially", async () => {
		const { getByTestId } = render(<ProfileScreen />);

		const loadingIndicator = getByTestId("loading-indicator");
		expect(loadingIndicator).toBeTruthy();
	});

	it("fetches profile data and renders profile information", async () => {
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
				data: [{ type: "example", links: "https://example.com" }],
			},
			fav_genres: { data: [] },
			fav_songs: { data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		};
		(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProfileData });

		// Render the ProfileScreen component
		const { getByText, getByTestId } = render(<ProfileScreen />);

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
				expect(getByTestId("fav-songs")).toBeTruthy();
				// expect(getByTestId("fav-rooms")).toBeTruthy();
				// expect(getByTestId("recent-rooms")).toBeTruthy();
				// expect(getByTestId("links")).toBeFalsy();
			});
		});
	});

	describe("renderLinks function", () => {
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
					data: [
						{ type: "example", links: "https://example.com/link1" },
						{ type: "example", links: "https://example.com/link2" },
						{ type: "example", links: "https://example.com/link3" },
					],
				},
				fav_genres: { data: [] },
				fav_songs: { data: [] },
				fav_rooms: { count: 0, data: [] },
				recent_rooms: { count: 0, data: [] },
			};
			(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProfileData });

			// Render the ProfileScreen component
			const { getByText } = render(<ProfileScreen />);

			// Wait for async operations to complete
			await act(async () => {
				await waitFor(() => {
					// Assert profile information is rendered
					const firstLinkText = getByText(
						"https://example.com/link1 and 2 more links",
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
					data: [{ type: "example", links: "https://example.com/single-link" }],
				},
				fav_genres: { data: [] },
				fav_songs: { data: [] },
				fav_rooms: { count: 0, data: [] },
				recent_rooms: { count: 0, data: [] },
			};
			(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProfileData });

			// Render the ProfileScreen component
			const { getByText } = render(<ProfileScreen />);

			// Wait for async operations to complete
			await act(async () => {
				await waitFor(() => {
					const singleLinkText = getByText("https://example.com/single-link");
					expect(singleLinkText).toBeTruthy();
				});
			});
		});

		it("does not render any links when count is zero", () => {
			const profileData = {
				links: {
					count: 0,
					data: [],
				},
			};

			const { queryByTestId } = render(
				<ProfileScreen profileData={profileData} />,
			);

			// Assert that the links container is not rendered
			const linksContainer = queryByTestId("links");
			expect(linksContainer).toBeNull();
		});
	});
});
