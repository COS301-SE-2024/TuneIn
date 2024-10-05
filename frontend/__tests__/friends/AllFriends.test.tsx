import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import AllFriends from "../../app/screens/followers/AllFriends";
import FriendServices from "../../app/services/FriendServices";
import { Friend } from "../../app/models/friend"; // Import the Friend type

// Explicitly mock the service methods
jest.mock("../../app/services/FriendServices", () => ({
	getFriends: jest.fn(),
	getFriendRequests: jest.fn(),
	getPotentialFriends: jest.fn(),
	getPendingRequests: jest.fn(),
}));

describe("AllFriends", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders correctly with friends and requests", async () => {
		// Mock the service responses
		const friendsData: Friend[] = [
			{
				username: "john_doe",
				profile_picture_url: "url",
				friend_id: "1",
			},
		];
		const requestsData: Friend[] = [
			{
				username: "jane_doe",
				profile_picture_url: "url",
				friend_id: "2",
			},
		];
		const potentialFriendsData: Friend[] = [];
		const pendingRequestsData: Friend[] = [];

		// Use mockResolvedValueOnce on each service method
		(FriendServices.getFriends as jest.Mock).mockResolvedValueOnce(friendsData);
		(FriendServices.getFriendRequests as jest.Mock).mockResolvedValueOnce(
			requestsData,
		);
		(FriendServices.getPotentialFriends as jest.Mock).mockResolvedValueOnce(
			potentialFriendsData,
		);
		(FriendServices.getPendingRequests as jest.Mock).mockResolvedValueOnce(
			pendingRequestsData,
		);

		const { getByText, getByPlaceholderText } = render(<AllFriends />);

		// Expect the search bar to be rendered
		expect(getByPlaceholderText("Search...")).toBeTruthy();

		// Wait for the lists to be populated with mock data
		await waitFor(() => {
			expect(getByText("Friends")).toBeTruthy();
			expect(getByText("john_doe")).toBeTruthy();
			expect(getByText("Friend Requests")).toBeTruthy();
			expect(getByText("jane_doe")).toBeTruthy();
		});
	});

	it("shows a message when no friends are found", async () => {
		// Mock empty responses
		(FriendServices.getFriends as jest.Mock).mockResolvedValueOnce([]);
		(FriendServices.getFriendRequests as jest.Mock).mockResolvedValueOnce([]);
		(FriendServices.getPotentialFriends as jest.Mock).mockResolvedValueOnce([]);
		(FriendServices.getPendingRequests as jest.Mock).mockResolvedValueOnce([]);

		const { getByText } = render(<AllFriends />);

		// Wait for the lists to be populated
		await waitFor(() => {
			expect(getByText("You have no friends.")).toBeTruthy();
			expect(getByText("No friend requests found.")).toBeTruthy();
		});
	});

	it("displays an error message if fetching friends fails", async () => {
		// Mock an error response
		(FriendServices.getFriends as jest.Mock).mockRejectedValueOnce(
			new Error("Failed to fetch friends"),
		);

		const { getByText } = render(<AllFriends />);

		// Wait for the error message to appear
		await waitFor(() => {
			expect(getByText("Failed to load friends.")).toBeTruthy();
		});
	});
});
