import React from "react";
import FriendCard from "../../app/components/FriendCard";
import { Friend } from "../../app/models/friend"; // Adjust the import path as needed
import { render, screen, fireEvent } from "@testing-library/react-native";
import { router } from "expo-router"; // Import router to mock navigation

jest.mock("expo-router", () => ({
	router: {
		push: jest.fn(), // Mock the push function for navigation
	},
}));

const mockFriend: Friend = {
	profile_picture_url: "https://example.com/profile.jpg",
	username: "Test User",
	friend_id: "123", // Add any additional fields required by your Friend interface
	relationship: "friend",
};

describe("FriendCard", () => {
	const user = "testUser";

	it("renders correctly with given props", () => {
		render(
			<FriendCard
				profilePicture={mockFriend.profile_picture_url || ""}
				username={mockFriend.username}
				friend={mockFriend}
				user={user}
				cardType="friend"
				handle={jest.fn()} // Mock the handle function
			/>,
		);

		// Check if the profile picture image is rendered
		const image = screen.getByTestId("friend-card-image");
		expect(image.props.source).toEqual({ uri: mockFriend.profile_picture_url });

		// Check if the username text is rendered
		const usernameText = screen.getByText(mockFriend.username);
		expect(usernameText).not.toBeNull();
	});

	it("navigates to the correct link when pressed", () => {
		render(
			<FriendCard
				profilePicture={mockFriend.profile_picture_url || ""}
				username={mockFriend.username}
				friend={mockFriend}
				user={user}
				cardType="friend"
				handle={jest.fn()} // Mock the handle function
			/>,
		);

		// Simulate pressing the TouchableOpacity for navigation
		const linkElement = screen.getByTestId("friend-card-link");
		fireEvent.press(linkElement);

		// Check that router.push was called with the correct arguments
		expect(router.push).toHaveBeenCalledWith(
			`/screens/profile/ProfilePage?friend=${JSON.stringify(
				mockFriend,
			)}&user=${user}`,
		);
	});
});
