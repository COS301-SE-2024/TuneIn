import React from "react";
import FriendsGrid from "../../app/components/FriendsGrid";
import { Friend } from "../../app/models/friend";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";

// Mock the useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("FriendsGrid", () => {
	const mockNavigate = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ navigate: mockNavigate });
	});

	const mockFriends: Friend[] = [
		{
			friend_id: "1",
			username: "JohnDoe",
			profile_picture_url: "https://example.com/johndoe.jpg",
		},
		{
			friend_id: "2",
			username: "JaneDoe",
			profile_picture_url: "https://example.com/janedoe.jpg",
		},
	];

	it("renders the friends and followers in the grid", () => {
		const { getByText, getAllByTestId } = render(
			<FriendsGrid friends={mockFriends} username="testuser" />,
		);

		// Check that the friends and followers are rendered
		expect(getByText("JohnDoe")).toBeTruthy();
		expect(getByText("JaneDoe")).toBeTruthy();

		// Check that the profile images are rendered (assume the testId is applied to Image for simplicity)
		const profileImages = getAllByTestId("profile-image");
		expect(profileImages).toHaveLength(2); // Two friends
	});

	it("navigates to profile page when a friend is clicked", () => {
		const { getByText } = render(
			<FriendsGrid friends={mockFriends} username="testuser" />,
		);

		// Simulate clicking on the first friend (JohnDoe)
		fireEvent.press(getByText("JohnDoe"));

		// Expect navigation to have been called with the correct params
		expect(mockNavigate).toHaveBeenCalledWith({
			pathname: "/screens/profile/ProfilePage",
			params: { friend: JSON.stringify(mockFriends[0]), user: "testuser" },
		});
	});

	it("navigates to followers list when the + button is clicked", () => {
		const { getByText } = render(
			<FriendsGrid friends={mockFriends} username="testuser" />,
		);

		// Simulate clicking the + button
		fireEvent.press(getByText("+"));

		// Expect navigation to the followers list
		expect(mockNavigate).toHaveBeenCalledWith({
			pathname: "/screens/followers/FollowerStack",
			params: { username: "testuser" },
		});
	});

	it("navigates to search page when there are no friends or followers", () => {
		const { getByText } = render(
			<FriendsGrid friends={[]} username="testuser" />,
		);

		// Simulate clicking the + button
		fireEvent.press(getByText("+"));

		// Expect navigation to the search page
		expect(mockNavigate).toHaveBeenCalledWith("/screens/(tabs)/Search");
	});
});
