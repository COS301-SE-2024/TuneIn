import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import FriendRequestCard from "../../app/components/FriendRequestCard"; // Adjust the path accordingly
import { Friend } from "../../app/models/friend"; // Adjust the path accordingly
import { colors } from "../../app/styles/colors";

const mockFriend: Friend = {
	profile_picture_url: "https://example.com/profile.jpg",
	username: "Test User",
	friend_id: "123", // Add any additional fields required by your Friend interface
	relationship: "friend",
};
const handleRequestMock = jest.fn();

describe("FriendRequestCard Component", () => {
	it("renders correctly", () => {
		const { getByTestId, getByText } = render(
			<FriendRequestCard
				profilePicture="https://example.com/profile.jpg"
				username={mockFriend.username}
				friend={mockFriend}
				handleRequest={handleRequestMock}
			/>,
		);

		expect(getByTestId("friend-request-card-container")).toBeTruthy();
		expect(getByTestId("friend-request-card-image")).toBeTruthy();
		expect(getByTestId("friend-request-card-username").props.children).toBe(
			mockFriend.username,
		);
		expect(getByTestId("accept-button")).toBeTruthy();
		expect(getByTestId("reject-button")).toBeTruthy();
	});

	it("handles accept button press", async () => {
		const { getByTestId } = render(
			<FriendRequestCard
				profilePicture="https://example.com/profile.jpg"
				username={mockFriend.username}
				friend={mockFriend}
				handleRequest={handleRequestMock}
			/>,
		);

		const acceptButton = getByTestId("accept-button");
		fireEvent.press(acceptButton);

		// Wait for the handleRequestMock to be called
		await waitFor(() => {
			expect(handleRequestMock).toHaveBeenCalledWith(mockFriend, true);
		});
	});

	it("handles reject button press", async () => {
		const { getByTestId } = render(
			<FriendRequestCard
				profilePicture="https://example.com/profile.jpg"
				username={mockFriend.username}
				friend={mockFriend}
				handleRequest={handleRequestMock}
			/>,
		);

		const rejectButton = getByTestId("reject-button");
		fireEvent.press(rejectButton);

		// Wait for the handleRequestMock to be called
		await waitFor(() => {
			expect(handleRequestMock).toHaveBeenCalledWith(mockFriend, false);
		});
	});

	it("changes button styles when pressed", async () => {
		const { getByTestId } = render(
			<FriendRequestCard
				profilePicture="https://example.com/profile.jpg"
				username={mockFriend.username}
				friend={mockFriend}
				handleRequest={handleRequestMock}
			/>,
		);

		const acceptButton = getByTestId("accept-button");
		fireEvent.press(acceptButton);

		// Check if accept button has correct styles after press
		expect(acceptButton.props.style).toEqual(
			expect.objectContaining({
				backgroundColor: colors.primary,
				borderColor: colors.primary,
			}),
		);

		const rejectButton = getByTestId("reject-button");
		fireEvent.press(rejectButton);

		// Check if reject button has correct styles after press
		expect(rejectButton.props.style).toEqual(
			expect.objectContaining({
				backgroundColor: "black",
				borderColor: "black",
			}),
		);
	});
});
