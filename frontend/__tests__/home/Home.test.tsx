import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import Home from "../../app/screens/Home";
import { useAPI } from "../../app/APIContext";
import * as StorageService from "../../app/services/StorageService";
import AuthManagement from "../../app/services/AuthManagement";
import axios from "axios";
import TestWrapper from "../../src/testUtils/TestWrapper"; // Adjust the import path as needed

// Mock necessary modules and components
jest.mock("expo-router", () => ({
	useRouter: jest.fn().mockReturnValue({
		navigate: jest.fn(),
	}),
}));

jest.mock("../../app/components/rooms/RoomCardWidget", () => "RoomCardWidget");
jest.mock("../../app/components/AppCarousel", () => "AppCarousel");
jest.mock("../../app/components/FriendsGrid", () => "FriendsGrid");
jest.mock("../../app/components/home/miniplayer", () => "Miniplayer");
jest.mock("../../app/components/NavBar", () => "NavBar");
jest.mock("../../app/components/TopNavBar", () => "TopNavBar");
jest.mock("../../app/services/StorageService", () => ({
	getItem: jest.fn(),
	setItem: jest.fn(),
}));
jest.mock("../../app/services/AuthManagement", () => ({
	__esModule: true,
	default: {
		getToken: jest.fn().mockResolvedValue("fake-token"),
	},
}));
jest.mock("../../app/services/Utils", () => ({
	API_BASE_URL: "http://api.example.com",
}));
jest.mock("axios");

// Mock the APIContext module
jest.mock("../../app/APIContext", () => ({
	useAPI: jest.fn(),
}));

describe("Home", () => {
	const mockUser = { username: "testUser" };
	const mockFriends = [
		{ profile_picture_url: "http://example.com/pic.jpg", username: "friend1" },
	];
	const mockRooms = [
		{
			roomID: "1",
			room_name: "Room 1",
			room_image: null,
			description: "",
			creator: { userID: "user1" },
		},
		{
			roomID: "2",
			room_name: "Room 2",
			room_image: null,
			description: "",
			creator: { userID: "user2" },
		},
	];

	beforeEach(() => {
		// Mock the implementation of useAPI
		(useAPI as jest.Mock).mockReturnValue({
			users: {
				getProfile: jest.fn().mockResolvedValue({ data: mockUser }),
			},
			authenticated: true,
		});
		(StorageService.getItem as jest.Mock).mockImplementation((key: string) => {
			if (key === "cachedRecents")
				return Promise.resolve(JSON.stringify(mockRooms));
			if (key === "cachedPicks")
				return Promise.resolve(JSON.stringify(mockRooms));
			if (key === "cachedMyRooms")
				return Promise.resolve(JSON.stringify(mockRooms));
			if (key === "cachedFriends")
				return Promise.resolve(JSON.stringify(mockFriends));
			return Promise.resolve(null);
		});
		(StorageService.setItem as jest.Mock).mockResolvedValue(undefined);
		(AuthManagement.getToken as jest.Mock).mockResolvedValue("fake-token");
		(axios.get as jest.Mock).mockImplementation((url: string) => {
			if (url.includes("/users/rooms"))
				return Promise.resolve({ data: mockRooms });
			if (url.includes("/users/friends"))
				return Promise.resolve({ data: mockFriends });
			return Promise.reject(new Error("Not Found"));
		});
	});

	const renderWithProvider = (ui: React.ReactElement) =>
		render(ui, { wrapper: TestWrapper });

	it("renders correctly and shows loading indicator initially", () => {
		const { getByText, getByTestId } = renderWithProvider(<Home />);

		expect(getByText("Recent Rooms")).toBeTruthy();
		expect(getByTestId("loading-indicator")).toBeTruthy();
	});
});
