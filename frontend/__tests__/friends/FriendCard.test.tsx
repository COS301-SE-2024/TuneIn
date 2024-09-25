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

	it("handles 'Unfriend' button press", () => {
		const handleMock = jest.fn();

		render(
			<FriendCard
				profilePicture={mockFriend.profile_picture_url || ""}
				username={mockFriend.username}
				friend={mockFriend}
				user={user}
				cardType="friend"
				handle={handleMock} // Mock the handle function
			/>,
		);

		// Simulate pressing the "Unfriend" button
		const unfriendButton = screen.getByTestId("unfriend-button");
		fireEvent.press(unfriendButton);

		// Check that the handle function was called with the correct friend
		expect(handleMock).toHaveBeenCalledWith(mockFriend);
	});

	it("renders 'Follow' button for 'follower' card type", () => {
		render(
			<FriendCard
				profilePicture={mockFriend.profile_picture_url || ""}
				username={mockFriend.username}
				friend={mockFriend}
				user={user}
				cardType="follower"
				handle={jest.fn()} // Mock the handle function
			/>,
		);

		// Check if the 'Follow' button is rendered
		const followButton = screen.getByTestId("follow-button");
		expect(followButton).toBeTruthy();
	});

	it("renders 'Unfollow' button for 'following' card type", () => {
		render(
			<FriendCard
				profilePicture={mockFriend.profile_picture_url || ""}
				username={mockFriend.username}
				friend={mockFriend}
				user={user}
				cardType="following"
				handle={jest.fn()} // Mock the handle function
			/>,
		);

		// Check if the 'Unfollow' button is rendered
		const unfollowButton = screen.getByTestId("unfollow-button");
		expect(unfollowButton).toBeTruthy();
	});

	it("renders 'Add Friend' button for 'mutual' card type", () => {
		render(
			<FriendCard
				profilePicture={mockFriend.profile_picture_url || ""}
				username={mockFriend.username}
				friend={mockFriend}
				user={user}
				cardType="mutual"
				handle={jest.fn()} // Mock the handle function
			/>,
		);

		// Check if the 'Add Friend' button is rendered
		const addFriendButton = screen.getByTestId("add-friend-button");
		expect(addFriendButton).toBeTruthy();
	});

	it("renders 'Pending...' text for 'friend-follow' card type", () => {
		render(
			<FriendCard
				profilePicture={mockFriend.profile_picture_url || ""}
				username={mockFriend.username}
				friend={mockFriend}
				user={user}
				cardType="friend-follow"
				handle={jest.fn()} // Mock the handle function
			/>,
		);

		// Check if the 'Pending...' text is rendered
		const pendingText = screen.getByText("Pending...");
		expect(pendingText).toBeTruthy();
	});
});
