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
			links: { count: 1, data: [{ links: "https://example.com" }] },
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
			});
		});

		// Additional assertions can be added based on your UI components and structure
	});
});
